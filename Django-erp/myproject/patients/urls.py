from django.urls import path

from .views import (
    patient_list_create
)

urlpatterns = [

    path(
        "patients/",
        patient_list_create
    ),
]
