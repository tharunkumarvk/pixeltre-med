from django.urls import path, include
from django.contrib import admin
from hospital import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', views.register, name='register'),
    path('api/login/', views.login_user, name='login'),
    path('api/logout/', views.logout_user, name='logout'),
    path('api/profile/', views.profile, name='profile'),
    path('api/records/upload/', views.upload_record, name='upload_record'),
    path('api/records/<int:record_id>/share/', views.share_record, name='share_record'),
    path('api/records/<int:record_id>/delete/', views.delete_record, name='delete_record'),
    path('api/records/', views.list_records, name='list_records'),
    path('api/records/<int:record_id>/generate-link/', views.generate_share_link, name='generate_share_link'),
    path('api/share/<uuid:token>/', views.view_shared_record, name='view_shared_record'),
    path('api/reminders/', views.create_reminder, name='create_reminder'),
    path('api/packages/', views.list_packages, name='list_packages'),
    path('api/doctors/', views.list_doctors, name='list_doctors'),
    path('api/csrf/', views.get_csrf_token, name='get_csrf_token'),  # Added
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)