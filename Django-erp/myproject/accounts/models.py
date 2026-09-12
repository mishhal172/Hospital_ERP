from django.db import models
from django.contrib.auth.models import AbstractUser

class Department(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(
        upload_to="departments/"
    )
    details = models.TextField()

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('receptionist', 'Receptionist'),
        ('pharmacist', 'Pharmacist'),
        ('general','General'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='pharmacist'
    )
    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )
    full_name = models.CharField(
        max_length=200
    )
    profile_image = models.ImageField(
        upload_to="profiles/",
        null=True,
        blank=True
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    hospitaldepartment = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )
    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    experience = models.IntegerField(
        default=0,
        null=True,
        blank=True
    )

    def __str__(self):
        return self.full_name

class Medicine(models.Model):

    name = models.CharField(
        max_length=200
    )

    category = models.CharField(
        max_length=100
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    stock = models.PositiveIntegerField()

    description = models.TextField(
        blank=True,
        null=True
    )
    expiry_date=models.DateField(blank=True,null=True)
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    def __str__(self):
        return self.name
