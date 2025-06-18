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

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Remove fields for 'can_share', 'can_delete', etc.
        for field in ['can_share', 'can_set_reminders', 'can_delete']:
            if field in form.base_fields:
                del form.base_fields[field]
        return form

admin.site.register(User, UserAdmin)
admin.site.register(Package)
admin.site.register(Record)
admin.site.register(Reminder)