import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.db.firebase import get_db


def send_email_direct(to_email, subject, html_body, text_body=None):
    """Send email directly using Gmail SMTP."""
    smtp_username = "sujalgawas18@gmail.com"
    smtp_password = os.getenv('SMTP_PASSWORD', 'YOUR_APP_PASSWORD')

    if smtp_password == 'YOUR_APP_PASSWORD':
        smtp_password = "your-16-char-app-password"

    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = smtp_username
        msg['To'] = to_email
        msg['Subject'] = subject

        if text_body:
            text_part = MIMEText(text_body, 'plain')
            msg.attach(text_part)

        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)

        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()

        print(f"✅ Email sent directly to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def send_email_from_firebase_template(template_name, to_email, template_data):
    """Fetch email template from Firestore and send via SMTP."""
    try:
        db = get_db()
        template_doc = db.collection('email_templates').document(template_name).get()

        if not template_doc.exists:
            print(f"❌ Template not found: {template_name}")
            return False

        template = template_doc.to_dict()

        subject = template.get('subject', 'WaitFree Clinic')
        text = template.get('text', '')
        html = template.get('html', '')

        for key, value in template_data.items():
            subject = subject.replace(f'{{{{{key}}}}}', str(value))
            text = text.replace(f'{{{{{key}}}}}', str(value))
            html = html.replace(f'{{{{{key}}}}}', str(value))

        return send_email_direct(to_email, subject, html, text)

    except Exception as e:
        print(f"❌ Error sending template email: {e}")
        import traceback
        traceback.print_exc()
        return False
