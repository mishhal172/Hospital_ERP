from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import PrescriptionItem,Bill
from .models import Appointment, Prescription
from .serializers import AppointmentSerializer,BillSerializer
from accounts.models import User, Medicine
from accounts.serializers import DoctorSerializer, MedicineSerializer
from .models import Medicine, Bill, BillItem, Prescription
from django.db.models import Q
from django.utils.dateparse import parse_date

@api_view(["GET", "POST"])
def appointment_list_create(request):
    if request.method == "GET":
        appointments = Appointment.objects.all()
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def department_doctors(request, id):
    doctors = User.objects.filter(role="doctor", department=id)
    serializer = DoctorSerializer(doctors, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_appointments(request):

    appointments = Appointment.objects.filter(
        doctor=request.user,
        status="pending"
    ).order_by("appointment_date", "appointment_time")

    serializer = AppointmentSerializer(
        appointments,
        many=True
    )
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_prescription(request):
    appointment_id = request.data.get('appointment')
    medicines = request.data.get('medicines', [])
    symptoms = request.data.get('symptoms')
    diagnosis = request.data.get('diagnosis')

    if not appointment_id:
        return Response({"error": "appointment is required"}, status=400)

    if not isinstance(medicines, list):
        return Response({"error": "medicines must be a list"}, status=400)

    appointment = get_object_or_404(
        Appointment,
        id=appointment_id,
        status='pending'
    )

    try:
        with transaction.atomic():
            appointment.status = 'completed'
            appointment.save()
            prescription = Prescription.objects.create(
                appointment=appointment,
                patient=appointment.patient,
                doctor=appointment.doctor,
                symptoms=symptoms,
                diagnosis=diagnosis
            )

            for med in medicines:
                if "medicine" not in med or "quantity" not in med:
                    return Response(
                        {"error": "Invalid medicine format"},
                        status=400
                    )
                try:
                    medicine_obj = Medicine.objects.get(id=med["medicine"])
                except Medicine.DoesNotExist:
                    return Response(
                        {"error": "Medicine not found"},
                        status=400
                    )

                PrescriptionItem.objects.create(
                    prescription=prescription,
                    medicine=medicine_obj,
                    quantity=med["quantity"],
                    dosage=med.get("dosage", ""),
                    duration=med.get("duration", "")
                )

        return Response(
            {"message": "Prescription created successfully"},
            status=201
        )

    except Exception as e:
        print("ERROR:", e)
        return Response({"error": str(e)}, status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def doctor_profile(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
    })

@api_view(["GET"])
def medicine_consult(request):
    medicine = Medicine.objects.all()
    serializer = MedicineSerializer(medicine, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consulted_patients_view(request):
    appointments = Appointment.objects.filter(
        doctor=request.user, 
        status='completed'
    ).select_related('patient', 'prescription').prefetch_related('prescription__items__medicine').order_by('-appointment_date', '-appointment_time')
    
    data = []
    for appt in appointments:
        prescription_data = getattr(appt, 'prescription', None)
        prescription_string = "No prescription recorded"
        if prescription_data:
            item_strings = []
            for item in prescription_data.items.all():
                item_strings.append(
                    f"{item.medicine.name} (Dosage: {item.dosage} - For: {item.duration})"
                )
            
            if item_strings:
                prescription_string = ", ".join(item_strings)
        data.append({
            "id": appt.id,
            "name": f"{appt.patient.first_name} {getattr(appt.patient, 'last_name', '')}".strip() or "N/A",
            "prescription_id": f"RX-{prescription_data.id}" if prescription_data else "N/A",
            "date": appt.appointment_date.strftime("%Y-%m-%d"),
            "age": getattr(appt.patient, 'age', 'N/A'),
            "gender": getattr(appt.patient, 'gender', 'N/A'),
            "phone": getattr(appt.patient, 'phone', 'N/A'),
            "address": getattr(appt.patient, 'address', 'N/A'),
            "prescription": prescription_string 
        })
        
    return Response(data)

@api_view(['GET'])
def get_prescription_by_id(request, rx_id):

    try:
        prescription = Prescription.objects.select_related(
            'patient',
            'doctor'
        ).get(
            id=rx_id,
        )

    except Prescription.DoesNotExist:
        return Response(
            {"error": "Prescription not found or already billed"},
            status=404
        )

    medicines_data = []

    for item in prescription.items.select_related("medicine").all():
        medicines_data.append({
            "id": item.medicine.id,
            "name": item.medicine.name,
            "price": float(item.medicine.price),
            "quantity": item.quantity,
            "dosage": item.dosage,
            "duration": item.duration,
        })

    data = {
        "id": prescription.id,
        "patient": f"{prescription.patient.first_name} {prescription.patient.last_name}",
        "phone": prescription.patient.phone,
        "doctor_fee": prescription.doctor.consultation_fee,
        "doctor": prescription.doctor.full_name,
        "symptoms": prescription.symptoms,
        "diagnosis": prescription.diagnosis,
        "medicines": medicines_data,
        "created_at": prescription.created_at,
    }

    return Response(data)
@api_view(["GET"])
def live_medicine_stock(request):
    medicines = Medicine.objects.filter(stock__gt=0).values('id', 'name', 'price', 'stock')
    return Response(medicines)
@api_view(["POST"])
@transaction.atomic
def submit_bill(request):
    prescription_id = request.data.get("prescription_id")
    customer_name = request.data.get("customer_name")
    customer_phone = request.data.get("customer_phone")
    items = request.data.get("medicines")

    if not items:
        return Response({"error": "No medicines provided"}, status=400)

    prescription = None
    doctor_fee = 0.00  
    if prescription_id:
        try:
            prescription = Prescription.objects.select_related('appointment__doctor').get(id=prescription_id)
            
            if hasattr(prescription, 'appointment') and prescription.appointment:
                appt_fee = float(prescription.appointment.doctor_fee or 0)
                if appt_fee > 0:
                    doctor_fee = appt_fee
                elif prescription.appointment.doctor:
                    doctor_fee = float(getattr(prescription.appointment.doctor, 'consultation_fee', 0.00))
                
        except Prescription.DoesNotExist:
            return Response({"error": "Prescription not found"}, status=404)
    if prescription:
        bill = Bill.objects.filter(prescription=prescription).first()
        if not bill:
            bill = Bill.objects.create(
                prescription=prescription,
                customer_name=customer_name,
                customer_phone=customer_phone,
                total_amount=0.00,
                medicine_payment=0.00
            )
    else:
        bill = Bill.objects.create(
            prescription=prescription,
            customer_name=customer_name,
            customer_phone=customer_phone,
            total_amount=0.00,
            medicine_payment=0.00
        )
    medicine_total = 0.00
    bill_items = []
    
    for item in items:
        med_id = item.get("id")
        qty = int(item.get("quantity", 0))

        try:
            med = Medicine.objects.select_for_update().get(id=med_id)
        except Medicine.DoesNotExist:
            return Response({"error": f"Medicine ID {med_id} not found"}, status=404)

        if med.stock < qty:
            return Response({"error": f"{med.name} is out of stock (Available: {med.stock})"}, status=400)

        # Deduct stock
        med.stock -= qty
        med.save()

        item_total = float(med.price) * qty
        medicine_total += item_total

        bill_items.append(BillItem(
            bill=bill,
            medicine=med,
            quantity=qty,
            price=med.price,
            total=item_total
        ))
    BillItem.objects.bulk_create(bill_items)
    bill.medicine_payment = float(bill.medicine_payment or 0) + medicine_total
    bill.total_amount = float(bill.medicine_payment) + doctor_fee
    bill.save()

    if prescription:
        prescription.save()

    formatted_date = bill.created_at.strftime("%d/%m/%Y")
    
    return Response({
        "message": "Bill processed successfully!",
        "medicine_total": medicine_total,
        "date": formatted_date,
        "grand_total": bill.total_amount
    })
@api_view(["GET"])
def all_bills(request):
    bills = Bill.objects.all().prefetch_related('items__medicine').order_by('-created_at')
    from_date = request.query_params.get('from_date')
    to_date = request.query_params.get('to_date')
    if from_date:
        parsed_from = parse_date(from_date)
        if parsed_from:
            bills = bills.filter(created_at__date__gte=parsed_from)
            
    if to_date:
        parsed_to = parse_date(to_date)
        if parsed_to:
            bills = bills.filter(created_at__date__lte=parsed_to)
    latest_15_bills = bills[:15]
    
    serializer = BillSerializer(latest_15_bills, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def all_appointment(request):

    from_date = request.GET.get("from_date")
    to_date = request.GET.get("to_date")

    appointments = Appointment.objects.all()

    if from_date and to_date:
        appointments = appointments.filter(
            appointment_date__range=[from_date, to_date]
        )

    appointments = appointments.order_by('created_at')

    serializer = AppointmentSerializer(
        appointments,
        many=True
    )

    return Response(serializer.data)

@api_view(["POST"])
def reopen_appointment(request, appointment_id):
    try:
        old_appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response(
            {"error": "Appointment not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    raw_fee = request.data.get("doctor_fee")
    if raw_fee is None or raw_fee == "":
        doctor_fee = old_appointment.doctor_fee
    else:
        try:
            doctor_fee = float(raw_fee)
        except ValueError:
            doctor_fee = old_appointment.doctor_fee

    appointment_data = {
        "patient": old_appointment.patient.id,
        "doctor": old_appointment.doctor.id,
        "appointment_date": request.data.get("appointment_date"),
        "appointment_time": request.data.get("appointment_time"),
        "reason": "Reopened Consultation",
        "status": "pending",
        "parent_appointment": old_appointment.id,
        "is_reopened": True,
        "doctor_fee": doctor_fee  
    }

    serializer = AppointmentSerializer(data=appointment_data)

    if serializer.is_valid():
        new_appointment = serializer.save()
        return Response(
            {
                "id": new_appointment.id,
                "message": "Consultation reopened successfully"
            },
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def patient_history(request):

    search = request.GET.get("search", "")

    appointments = Appointment.objects.filter(
        Q(patient__first_name__icontains=search) |
        Q(patient__last_name__icontains=search) |
        Q(patient__phone__icontains=search)
    ).order_by("-appointment_date")

    data = []

    for app in appointments:
        prescription_data = None
        try:
            prescription = app.prescription
            prescription_data = {
                "symptoms": prescription.symptoms,
                "diagnosis": prescription.diagnosis,
                "items": [
                    {
                        "id": item.id,
                        "medicine_name": item.medicine.name,
                        "quantity": item.quantity,
                        "dosage": item.dosage,
                        "duration": item.duration
                    }
                    for item in prescription.items.all()
                ]
            }
        except:
            pass
        data.append({
            "id": app.id,
            "appointment_date": app.appointment_date,
            "appointment_time": app.appointment_time,
            "status": app.status,
            "patient_details": {
                "patient_name":
                f"{app.patient.first_name} {app.patient.last_name}",
                "phone": app.patient.phone,
            },
            "doctor_details": {
                "full_name": app.doctor.full_name
            },
            "prescription": prescription_data
        })
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def appointment_details(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id)
    data = {
        "appointment_id": appointment.id,
        "patient_id": appointment.patient.id,
        "patient_name": f"{appointment.patient.first_name} {appointment.patient.last_name}",
        "doctor_id": appointment.doctor.id,
        "appointment_date": appointment.appointment_date,
        "appointment_time": appointment.appointment_time,
        "status": appointment.status,
        "is_reopened": False,
        "previous_appointment": None,
        "symptoms": appointment.reason,
        "diagnosis": "",
        "medicines": []
    }
    if appointment.parent_appointment:
        data["is_reopened"] = True
        data["previous_appointment"] = appointment.parent_appointment.id
        current_search_appointment = appointment.parent_appointment
        old_prescription = None

        while current_search_appointment is not None:
            try:
                old_prescription = Prescription.objects.get(appointment=current_search_appointment)
                break 
            except Prescription.DoesNotExist:
                current_search_appointment = current_search_appointment.parent_appointment
        if old_prescription:
            data["symptoms"] = old_prescription.symptoms
            data["diagnosis"] = old_prescription.diagnosis
            data["medicines"] = [
                {
                    "id": item.id,
                    "medicine_id": item.medicine.id,
                    "medicine_name": item.medicine.name,
                    "quantity": item.quantity,
                    "dosage": item.dosage,
                    "duration": item.duration,
                }
                for item in old_prescription.items.all()
            ]
    return Response(data)

from django.utils import timezone
from django.db.models import Sum
from patients.models import Patient

@api_view(["GET"])
def dashboard(request):
    today = timezone.now().date()
    patients = Patient.objects.count()
    doctors = User.objects.filter(role="doctor").count()
    staff = User.objects.exclude(role__in=["admin"]).count()
    appointments = Appointment.objects.filter(
        appointment_date=today
    )

    total_appointments = appointments.count()
    completed = appointments.filter(status="completed").count()
    pending = appointments.filter(status="pending").count()
    cancelled = appointments.filter(status="cancelled").count()
    bills = Bill.objects.filter(created_at__date=today)
    docbill=Appointment.objects.filter(created_at__date=today)
    pharmacy_revenue = bills.aggregate(
        total=Sum("medicine_payment")
    )["total"] or 0

    doctor_fee = docbill.aggregate(
        total=Sum("doctor_fee")
    )["total"] or 0

    total_revenue = pharmacy_revenue + doctor_fee
    low_stock = Medicine.objects.filter(
        stock__lte=10,
        stock__gt=0
    ).count()

    out_of_stock = Medicine.objects.filter(
        stock=0
    ).count()
    recent_patients = []
    print("Today:", today)
    print("Appointment count:", Appointment.objects.count())
    print("Today's appointments:", appointments.count())
    return Response({

        "patients": patients,

        "doctors": doctors,

        "staff": staff,

        "pharmacy_revenue": pharmacy_revenue,

        "doctor_fee": doctor_fee,

        "total_revenue": total_revenue,

        "today_appointments": total_appointments,

        "completed": completed,

        "pending": pending,

        "cancelled": cancelled,

        "low_stock": low_stock,

        "out_of_stock": out_of_stock,

        "recent_patients": recent_patients,

    })