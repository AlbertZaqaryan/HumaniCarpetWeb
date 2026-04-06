from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_order_admin_notification(order):
    try:
        subject = f"New Order #{str(order.id)[:8]} from {order.first_name} {order.last_name}"
        html_message = render_to_string("emails/order_admin.html", {"order": order})
        send_mail(
            subject=subject,
            message=f"New order received from {order.first_name} {order.last_name}. Total: ${order.total}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            html_message=html_message,
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Failed to send admin order notification: {e}")


def send_order_confirmation(order):
    try:
        subject = "Thank you for your order — HumaniCarpet"
        html_message = render_to_string("emails/order_confirmation.html", {
            "order": order,
            "frontend_url": settings.FRONTEND_URL,
        })
        send_mail(
            subject=subject,
            message="Thank you for your order! We will contact you within 24 hours.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.email],
            html_message=html_message,
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Failed to send order confirmation: {e}")


def send_contact_notification(contact):
    try:
        subject = f"New Contact Message: {contact.subject or 'No subject'}"
        send_mail(
            subject=subject,
            message=f"From: {contact.name} ({contact.email})\n\n{contact.message}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Failed to send contact notification: {e}")


def send_custom_design_notification(design):
    try:
        subject = f"New Custom Design Request from {design.name}"
        send_mail(
            subject=subject,
            message=f"Custom design request from {design.name} ({design.email}).\n\n{design.description}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Failed to send custom design notification: {e}")
