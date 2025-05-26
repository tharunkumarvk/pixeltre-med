from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('records/upload/', views.upload_record, name='upload_record'),
    path('records/<int:record_id>/share/', views.share_record, name='share_record'),
    path('records/<int:record_id>/delete/', views.delete_record, name='delete_record'),
    path('records/', views.list_records, name='list_records'),
    path('records/<int:record_id>/generate-link/', views.generate_share_link, name='generate_share_link'),
    path('share/<uuid:token>/', views.view_shared_record, name='view_shared_record'),
    path('reminders/', views.create_reminder, name='create_reminder'),
]