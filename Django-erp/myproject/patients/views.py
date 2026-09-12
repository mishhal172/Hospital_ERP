from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Patient
from .serializers import PatientSerializer

@api_view(["GET", "POST"])
def patient_list_create(request):

    if request.method == "GET":

        patients = Patient.objects.all()

        serializer = PatientSerializer(
            patients,
            many=True
        )

        return Response(serializer.data)

    elif request.method == "POST":

        serializer = PatientSerializer(
            data=request.data
        )
        if serializer.is_valid():
            serializer.save() 
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    

