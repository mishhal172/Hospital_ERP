from django.contrib import admin
from .models import Appointment,Prescription,PrescriptionItem,Bill,BillItem

admin.site.register(Appointment)
admin.site.register(Prescription)
admin.site.register(PrescriptionItem)
admin.site.register(Bill)
admin.site.register(BillItem)

