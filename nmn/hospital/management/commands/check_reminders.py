from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from hospital.models import Reminder
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Send reminder emails'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        window_start = now - timedelta(minutes=1)
        reminders = Reminder.objects.filter(date__gte=window_start, date__lte=now, notified=False)
        sent_count = 0
        for reminder in reminders:
            try:
                recipient = None
                user_type = None
                # Check doctor's package permission
                if reminder.doctor:
                    if not reminder.doctor.package or not reminder.doctor.package.can_set_reminders:
                        logger.info(f"Skipping reminder {reminder.id}: Doctor's package does not allow reminders.")
                        continue
                    recipient = reminder.doctor.email
                    user_type = "doctor"
                elif reminder.patient:
                    if not reminder.patient.package or not reminder.patient.package.can_set_reminders:
                        logger.info(f"Skipping reminder {reminder.id}: Patient's package does not allow reminders.")
                        continue
                    recipient = reminder.patient.email
                    user_type = "patient"
                else:
                    logger.info(f"Skipping reminder {reminder.id}: No doctor or patient assigned.")
                    continue
                if not recipient:
                    logger.info(f"Skipping reminder {reminder.id}: No recipient email found.")
                    continue
                subject = f"[Pixeltre Medical] Reminder: {reminder.title}"
                message = f"Dear {user_type.capitalize()},\n\nThis is a reminder for: {reminder.title}\nScheduled at: {reminder.date.strftime('%Y-%m-%d %H:%M')}\n\nThank you."

                send_mail(
                    subject=subject,
                    message=message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None) or 'noreply@example.com',
                    recipient_list=[recipient],
                    fail_silently=False,
                )
                reminder.notified = True
                reminder.save()
                sent_count += 1
                logger.info(f"Sent reminder to {recipient}")
            except Exception as e:
                logger.error(f"Failed to send reminder (ID {reminder.id}): {e}")
        self.stdout.write(self.style.SUCCESS(f'Sent {sent_count} reminders'))
        logger.info(f"Total reminders sent: {sent_count}")

