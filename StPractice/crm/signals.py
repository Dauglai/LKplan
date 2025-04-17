from datetime import datetime

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.utils import timezone

from crm.utils import generate_verification_token
from plan.models import Profile
from crm.models import Contact
from django.core.mail import send_mail
from django.urls import reverse


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


@receiver(post_save, sender=User)
def assign_email_address(sender, instance, **kwargs):
    if sender.email:
        Contact.objects.create(profile=Profile.objects.get(user=instance), type="Почта", data=instance.email, )


@receiver(post_save, sender=Contact)
def send_verification_email(sender, instance, created, **kwargs):
    if created and not instance.is_verified:
        instance.verified_token = generate_verification_token()
        instance.token_created_at = timezone.now()
        instance.save()
        verification_url = reverse('verify-email') + f'?token={instance.verified_token}'
        full_url = f"https://crm.meetuppoint.ru{verification_url}"

        send_mail(
            'Подтверждение email',
            f'Перейдите по ссылке для подтверждения: {full_url}',
            'no-reply@meetuppoint.ru',
            recipient_list=[instance.data],
            fail_silently=False,
        )
