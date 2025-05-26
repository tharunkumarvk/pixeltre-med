from django.contrib import admin
from django import forms
from .models import User, Package, Record, Reminder

class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'user_type', 'phone_number', 'is_active')
    list_filter = ('user_type', 'is_active')
    search_fields = ('username', 'email', 'phone_number')
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal Info', {
            'fields': ('email', 'user_type', 'phone_number', 'package')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser')
        }),
    )
    formfield_overrides = {
        User._meta.get_field('user_type'): {'widget': forms.Select()},
    }

admin.site.register(User, UserAdmin)
admin.site.register(Package)
admin.site.register(Record)
admin.site.register(Reminder)