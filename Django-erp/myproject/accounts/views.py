from rest_framework.response import Response
from django.utils import timezone
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import User,Department,Medicine
from .serializers import UserSerializer,DepartmentSerializer,DoctorSerializer,MedicineSerializer

@api_view(['POST'])
def login_view(request):

    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(
        username=username,
        password=password
    )
    print(username)
    print(password)
    print(user)

    if user is None:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if user.is_superuser:
        user.role = "admin"
        user.save()

    refresh = RefreshToken.for_user(user)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'username': user.username,
        'role': user.role,
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_user(request):
    try:
        role = getattr(request.user, "role", "").lower()
        if role != "admin":
            return Response(
                {"error": "Permission denied"},
                status=403
            )
            
        data = request.data
        department_name = data.get("department")
        department_instance = None
        
        if department_name:
            try:
                department_instance = Department.objects.get(name=department_name)
            except Department.DoesNotExist:
                return Response(
                    {"error": f"Department '{department_name}' does not exist."},
                    status=400
                )
                
        user_role = data.get("role", "").lower()
        consultation_fee = 0
        experience = 0

        if user_role == "doctor":
            consultation_fee = data.get("consultation_fee", 0)
            experience = data.get("experience", 0)
        profile_image_file = request.FILES.get("profile_image", None)

        user = User.objects.create(
            full_name=data.get("full_name"),
            email=data.get("email"),
            username=data.get("email"),
            phone=data.get("phone"),
            role=user_role,
            hospitaldepartment=user_role,
            department=department_instance,
            consultation_fee=consultation_fee,
            experience=experience,
            profile_image=profile_image_file 
        )

        if user.role == "pharmacist":
            user.hospitaldepartment = "pharmacist"
        elif user.role == "doctor":
            user.hospitaldepartment = "doctor"
        elif user.role == "admin":
            user.hospitaldepartment = "manager"
        elif user.role == "receptionist": 
            user.hospitaldepartment = "receptionist"
        else:
            user.hospitaldepartment = "general"

        user.set_password(data.get("password"))
        user.save()

        return Response(
            {"message": "User created successfully"},
            status=201
        )

    except Exception as e:
        print("ERROR:", str(e))
        return Response(
            {"error": str(e)},
            status=500
        )

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import User

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_user(request, pk):
    try:
        requesting_user_role = getattr(request.user, "role", "").lower()
        if requesting_user_role != "admin":
            return Response({"error": "Permission denied."}, status=403)

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Staff member not found."}, status=404)

        data = request.data
        user.full_name = data.get("full_name", user.full_name)
        user.phone = data.get("phone", user.phone)

        if user.role.lower() == "doctor":
            user.experience = data.get("experience", user.experience)
            user.consultation_fee = data.get("consultation_fee", user.consultation_fee)
        if "profile_image" in request.FILES:
            user.profile_image = request.FILES["profile_image"]

        user.save()
        profile_image_url = request.build_absolute_uri(user.profile_image.url) if user.profile_image else None

        return Response({
            "message": "Staff details updated successfully.",
            "profile_image": profile_image_url
        }, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
    

@api_view(["GET"])
def all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(["DELETE"])
def delete_user(request, id):

    try:
        user = User.objects.get(id=id)

    except User.DoesNotExist:

        return Response(
            {"message": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    user.delete()
    return Response(
        {"message": "User deleted successfully"},
        status=status.HTTP_200_OK
    )

@api_view(["GET", "POST"])
def all_departments(request):
    if request.method == "GET":
        departments = Department.objects.all()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(["DELETE"])
def delete_department(request, id):

    try:
        department = Department.objects.get(id=id)
        department.delete()
        return Response(
            {"message": "Department deleted"},
            status=status.HTTP_200_OK
        )
    except Department.DoesNotExist:
        return Response(
            {"error": "Department not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(e)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["GET"])
def doctor_list(request):
    doctors = User.objects.filter(role="doctor")
    serializer = DoctorSerializer(doctors, many=True)
    return Response(serializer.data)

@api_view(["DELETE"])
def delete_doc(request,id):
    try:
        doc=User.objects.get(id=id)
        doc.delete()
        return Response({'message':'Deleted successfully'},status=200)
    except User.DoesNotExist:
        return Response({'error':'Not found'},status=404)

@api_view(["GET", "POST"])
def all_medicine(request):
    today = timezone.now().date()
    Medicine.objects.filter(expiry_date__lte=today).delete()
    if request.method == "GET":
        medicines = Medicine.objects.all()
        serializer = MedicineSerializer(medicines, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = MedicineSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["PUT"])
def update_medicine(request, pk):
    try:
        medicine = Medicine.objects.get(id=pk)
    except Medicine.DoesNotExist:
        return Response(
            {"error": "Medicine not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = MedicineSerializer(
        medicine,
        data=request.data
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["DELETE"])
def delete_medicine(request, pk):
    try:
        medicine = Medicine.objects.get(id=pk)
    except Medicine.DoesNotExist:
        return Response(
            {"error": "Medicine not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    medicine.delete()
    return Response(
        {"message": "Medicine deleted successfully"},
        status=status.HTTP_204_NO_CONTENT
    )