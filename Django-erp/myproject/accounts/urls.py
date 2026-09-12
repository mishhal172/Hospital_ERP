from django.urls import path
from .views import login_view, create_user,all_users,delete_user,all_departments,delete_department,doctor_list,delete_doc
from .views import all_medicine,update_medicine,delete_medicine,update_user
urlpatterns = [
    path('login/', login_view),
    path('create-user/', create_user),
    path("all-users/", all_users),
    path("delete-user/<int:id>/", delete_user),
    path("departments/", all_departments),
    path("delete-department/<int:id>/", delete_department),
    path("doctors/", doctor_list),
    path('delete-doc/<int:id>/',delete_doc),
    path("medicine/",all_medicine),
    path("update-medicine/<int:pk>/",update_medicine),
    path("delete-medicine/<int:pk>/",delete_medicine),
    path('update-user/<int:pk>/',update_user,),
]