from rest_framework import serializers
from datetime import datetime
from django.utils import timezone
from .models import Appointment, Patient
from accounts.models import User

class AppointmentSerializer(serializers.ModelSerializer):

    patient = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all()
    )

    doctor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="doctor")
    )

    patient_details = serializers.SerializerMethodField()
    doctor_details = serializers.SerializerMethodField()
    

    class Meta:
        model = Appointment
        fields = "__all__"

    def get_patient_details(self, obj):
        return {
            "id": obj.patient.id,
            "patient_name":
                f"{obj.patient.first_name} {obj.patient.last_name}",
            "age": obj.patient.age,
            "gender": obj.patient.gender,
            "phone": obj.patient.phone,
        }
    def get_doctor_details(self, obj):
        return {
            "id": obj.doctor.id,
            "full_name": obj.doctor.full_name,
            "consultation_fee": float(obj.doctor_fee),
        }

    def validate(self, data):
        doctor = data["doctor"]
        appointment_date = data["appointment_date"]
        appointment_time = data["appointment_time"]

        today = timezone.now().date()
        if appointment_date < today:
            raise serializers.ValidationError(
                "Past dates are not allowed."
            )
        max_month = (today.month % 12) + 1
        max_year = today.year + (1 if today.month == 12 else 0)

        if (
            appointment_date.year > max_year or
            (appointment_date.year == max_year and appointment_date.month > max_month)
        ):
            raise serializers.ValidationError(
                "Appointments can only be booked up to next month."
            )

        appointment_datetime = datetime.combine(
            appointment_date,
            appointment_time
        )

        existing = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date
        )

        for appointment in existing:
            existing_datetime = datetime.combine(
                appointment.appointment_date,
                appointment.appointment_time
            )

            difference = abs(
                (appointment_datetime - existing_datetime).total_seconds()
            )

            if difference < 600:
                raise serializers.ValidationError(
                    {
                        "appointment_time":
                        f"Doctor already has an appointment at "
                        f"{appointment.appointment_time.strftime('%I:%M %p')}. "
                        f"Please choose a time at least 10 minutes away."
                    }
                )

        return data
    
from rest_framework import serializers
from .models import Bill, BillItem

class BillItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)

    class Meta:
        model = BillItem
        fields = ['id', 'medicine_name', 'quantity', 'price', 'total']


class BillSerializer(serializers.ModelSerializer):
    medicines = BillItemSerializer(source='items', many=True, read_only=True)
    doctor_name = serializers.CharField(
        source='prescription.doctor.full_name',
        default="N/A",
        read_only=True
    )
    patient_name = serializers.SerializerMethodField()
    doctor_fee = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = [
            'id',
            'created_at',
            'patient_name',
            'doctor_name',
            'medicines',
            'total_amount',
            'doctor_fee'
        ]

    def get_patient_name(self, obj):
        if obj.customer_name:
            return obj.customer_name

        if obj.prescription and obj.prescription.patient:
            patient = obj.prescription.patient
            return f"{patient.first_name} {patient.last_name}".strip()

        return "N/A"

    def get_doctor_fee(self, obj):
        if obj.prescription and obj.prescription.appointment:
            return obj.prescription.appointment.doctor_fee
        return 0
    
from rest_framework import serializers

class DashboardSerializer(serializers.Serializer):
    patients = serializers.IntegerField()
    doctors = serializers.IntegerField()
    staff = serializers.IntegerField()

    pharmacy_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    doctor_fee = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)

    today_appointments = serializers.IntegerField()
    completed = serializers.IntegerField()
    pending = serializers.IntegerField()
    cancelled = serializers.IntegerField()

    low_stock = serializers.IntegerField()
    out_of_stock = serializers.IntegerField()