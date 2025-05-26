from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from hospital.models import Reminder
from django.utils import timezone

class Command(BaseCommand):
    help = 'Send reminder emails'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        reminders = Reminder.objects.filter(date__lte=now, notified=False)
        for reminder in reminders:
            if reminder.user.user_type == 'doctor' and not reminder.user.package.can_set_reminders:
                continue
            send_mail(
                subject=f'Reminder: {reminder.title}',
                message=f'Your reminder "{reminder.title}" is due.',
                from_email='tharunkumarvk28@gmail.com',  # Replace
                recipient_list=[reminder.user.email],
                fail_silently=True,
            )
            reminder.notified = True
            reminder.save()
        self.stdout.write(self.style.SUCCESS(f'Sent {len(reminders)} reminders'))