from datetime import datetime
from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from app.services.auth_service import token_to_uid
from app.services.email_service import send_email_direct, send_email_from_firebase_template
from app.crud.contacts_crud import save_contact, get_contacts, get_contact_by_id, update_contact
from app.db.firebase import get_db

contact_bp = Blueprint('contact', __name__)


@contact_bp.route('/contact-us', methods=['POST'])
def contact_us():
    try:
        data = request.get_json()

        required_fields = ['name', 'email', 'userType', 'subject', 'message']
        missing_fields = [field for field in required_fields if not data.get(field)]

        if missing_fields:
            return jsonify({"success": False, "message": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        user_type = data.get('userType', 'patient')
        subject = data.get('subject', '')
        message = data.get('message', '').strip()

        if '@' not in email or '.' not in email:
            return jsonify({"success": False, "message": "Invalid email address"}), 400

        print(f"📝 Contact form received from: {name} ({email})")

        contact_data = {
            'name': name,
            'email': email,
            'phone': phone if phone else None,
            'user_type': user_type,
            'subject': subject,
            'message': message,
            'status': 'new',
            'created_at': firestore.SERVER_TIMESTAMP,
            'read': False,
            'replied': False,
            'ip_address': request.remote_addr
        }

        try:
            contact_id = save_contact(contact_data)
            print(f"✅ Contact form saved: {contact_id}")
        except Exception as db_error:
            print(f"❌ Firestore Error: {db_error}")
            return jsonify({"success": False, "message": "Failed to save your message. Please try again."}), 500

        email_success = True
        try:
            admin_sent = send_email_from_firebase_template(
                'contact_notification',
                'sujalgawas18@gmail.com',
                {
                    'contact_id': contact_id,
                    'name': name,
                    'email': email,
                    'phone': phone if phone else 'Not provided',
                    'user_type': user_type.title(),
                    'subject': subject,
                    'message': message,
                    'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
            )

            user_sent = send_email_from_firebase_template(
                'contact_confirmation',
                email,
                {'name': name, 'subject': subject}
            )

            if admin_sent and user_sent:
                print("✅ Both emails sent successfully")
            elif admin_sent:
                print("⚠️ Admin email sent, but user confirmation failed")
            elif user_sent:
                print("⚠️ User confirmation sent, but admin notification failed")
            else:
                print("⚠️ Both emails failed to send")
                email_success = False

        except Exception as email_error:
            print(f"⚠️ Email sending failed (non-critical): {email_error}")
            email_success = False

        return jsonify({
            "success": True,
            "message": "Thank you for contacting us! We'll respond within 2 hours.",
            "contact_id": contact_id,
            "email_sent": email_success
        }), 200

    except Exception as e:
        print(f"❌ Error in contact_us: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred. Please try again later."}), 500


@contact_bp.route('/admin/get-contact-submissions', methods=['POST'])
def get_contact_submissions():
    try:
        data = request.get_json()
        token = data.get('token')

        uid = token_to_uid(token)
        if not uid:
            return jsonify({"success": False, "message": "Unauthorized"}), 401

        db = get_db()
        user_doc = db.collection('doctors').document(uid).get()
        if not user_doc.exists:
            return jsonify({"success": False, "message": "Access denied"}), 403

        status = data.get('status', 'all')
        limit_count = data.get('limit', 50)

        results = get_contacts(status=status, limit=limit_count)

        submissions = []
        for doc in results:
            submission = doc.to_dict()
            submission['id'] = doc.id
            if 'created_at' in submission and submission['created_at']:
                submission['created_at'] = submission['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            submissions.append(submission)

        return jsonify({"success": True, "submissions": submissions, "count": len(submissions)}), 200

    except Exception as e:
        print(f"❌ Error getting submissions: {e}")
        return jsonify({"success": False, "message": "Failed to fetch submissions"}), 500


@contact_bp.route('/admin/mark-contact-read', methods=['POST'])
def mark_contact_read():
    try:
        data = request.get_json()
        token = data.get('token')
        contact_id = data.get('contact_id')

        uid = token_to_uid(token)
        if not uid:
            return jsonify({"success": False, "message": "Unauthorized"}), 401

        if not contact_id:
            return jsonify({"success": False, "message": "Contact ID required"}), 400

        update_contact(contact_id, {
            'read': True,
            'read_at': firestore.SERVER_TIMESTAMP,
            'read_by': uid
        })

        return jsonify({"success": True, "message": "Marked as read"}), 200

    except Exception as e:
        print(f"❌ Error marking as read: {e}")
        return jsonify({"success": False, "message": "Failed to update status"}), 500


@contact_bp.route('/admin/reply-to-contact', methods=['POST'])
def reply_to_contact():
    try:
        data = request.get_json()
        token = data.get('token')
        contact_id = data.get('contact_id')
        reply_message = data.get('reply_message', '').strip()

        uid = token_to_uid(token)
        if not uid:
            return jsonify({"success": False, "message": "Unauthorized"}), 401

        if not contact_id or not reply_message:
            return jsonify({"success": False, "message": "Contact ID and reply message required"}), 400

        contact_doc = get_contact_by_id(contact_id)
        if not contact_doc:
            return jsonify({"success": False, "message": "Contact not found"}), 404

        contact_data = contact_doc.to_dict()

        email_sent = send_email_from_firebase_template(
            'contact_reply',
            contact_data['email'],
            {
                'name': contact_data['name'],
                'subject': contact_data['subject'],
                'reply_message': reply_message,
                'original_message': contact_data['message']
            }
        )

        if not email_sent:
            return jsonify({"success": False, "message": "Failed to send reply email"}), 500

        update_contact(contact_id, {
            'replied': True,
            'reply_message': reply_message,
            'replied_at': firestore.SERVER_TIMESTAMP,
            'replied_by': uid,
            'status': 'resolved'
        })

        return jsonify({"success": True, "message": "Reply sent successfully"}), 200

    except Exception as e:
        print(f"❌ Error in reply_to_contact: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": "Failed to send reply"}), 500


@contact_bp.route('/test-email', methods=['POST'])
def test_email():
    try:
        data = request.get_json()
        test_email_addr = data.get('email', 'sujalgawas18@gmail.com')

        success = send_email_direct(
            test_email_addr,
            "Test Email from WaitFree Clinic",
            "<h1>Test Email</h1><p>If you receive this, email sending is working!</p>",
            "Test Email - If you receive this, email sending is working!"
        )

        return jsonify({
            "success": success,
            "message": "Test email sent!" if success else "Failed to send test email"
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
