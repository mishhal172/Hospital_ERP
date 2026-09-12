from django.urls import path
from .views import appointment_list_create,department_doctors,pending_appointments,create_prescription,doctor_profile
from .views import medicine_consult,consulted_patients_view,submit_bill,get_prescription_by_id,all_bills,live_medicine_stock
from .views import all_appointment,reopen_appointment,patient_history,appointment_details
from .views import dashboard
urlpatterns = [
    path("appointments/",appointment_list_create),
    path("departments/<int:id>/doctors/",department_doctors),
    path("doctor/pending-appointments/",pending_appointments),
    path("prescriptions/create/",create_prescription),
    path("doctor/profile/",doctor_profile),
    path("medicine/consult/",medicine_consult),
    path('consulted-patients/', consulted_patients_view),
    path("prescription/<int:rx_id>/",get_prescription_by_id),
    path("submit-bill/",submit_bill),
    path("all-bills/", all_bills, name="all_bills"),
    path("medicines-list/", live_medicine_stock),
    path("all-appointment/",all_appointment),
    path("appointments/<int:appointment_id>/reopen/",reopen_appointment),
    path("patient-history/",patient_history),
    path("appointments/<int:appointment_id>/details/",appointment_details),
    path("dashboard/",dashboard)
]