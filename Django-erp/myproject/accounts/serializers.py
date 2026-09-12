from rest_framework import serializers
from .models import User,Department,Medicine

class UserSerializer(serializers.ModelSerializer):
    department = serializers.CharField(
        source="department.name",
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "role",
            "department",
            "hospitaldepartment",
            "profile_image",
            "consultation_fee",
            "experience"
        ]


class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department
        fields = "__all__"

class DoctorSerializer(serializers.ModelSerializer):

    department = serializers.StringRelatedField()

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "department",
            "consultation_fee",
            "phone",
            "email",
            "experience",
            "profile_image"
        ]

class MedicineSerializer(serializers.ModelSerializer):

    class Meta:

        model = Medicine

        fields = '__all__'

