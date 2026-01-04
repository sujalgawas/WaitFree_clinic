import firebase_admin
from flask import Flask, jsonify, request
from flask_cors import CORS
from firebase_admin import credentials, initialize_app, firestore, auth
import json
import re
from urllib.parse import unquote
from firebase_admin import storage
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import json
import stripe
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

cred = credentials.Certificate("./serviceAccountKey.json")
#initialize_app(cred)

firebase_admin.initialize_app(cred, {
    'storageBucket': 'waitfreeclinic.firebasestorage.app'  # Replace with your bucket URL
})

bucket = storage.bucket()

db = firestore.client()

app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",  # If using Vite
            "http://127.0.0.1:5173"   # If using Vite
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# --- Helper Function for Name ---
def get_username_from_email(email):
    return email.split('@')[0] if email else "User"

# Helper function 
def token_to_uid(token):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

# Set your secret key from environment variables for security
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# ==================== PRICING PLANS CONFIGURATION ====================
PRICING_PLANS = {
    'basic': {
        'name': 'Basic',
        'monthly': {
            'price': 999,
            'original_price': 1199,
            'stripe_price_id': os.getenv('STRIPE_BASIC_MONTHLY_PRICE_ID', ''),
        },
        'yearly': {
            'price': 9999,
            'original_price': 11999,
            'stripe_price_id': os.getenv('STRIPE_BASIC_YEARLY_PRICE_ID', ''),
        },
        'features': [
            'Account setup on WaitFree Clinic Platform',
            'Basic patient management',
            'AI-assisted appointment scheduling',
            'Patient search for your profile',
            'Email support for doctors',
            'Basic analytics dashboard'
        ]
    },
    'premium': {
        'name': 'Premium',
        'monthly': {
            'price': 1999,
            'original_price': 2399,
            'stripe_price_id': os.getenv('STRIPE_PREMIUM_MONTHLY_PRICE_ID', ''),
        },
        'yearly': {
            'price': 19999,
            'original_price': 23999,
            'stripe_price_id': os.getenv('STRIPE_PREMIUM_YEARLY_PRICE_ID', ''),
        },
        'features': [
            'Everything in Basic',
            'Advanced AI diagnostics assistance',
            'Real-time patient location tracking',
            'Waiting time estimation & queue management',
            'Integrated telemedicine tools',
            'Priority patient notifications',
            'Customizable doctor profile for patient search',
            '24/7 chat support for doctors',
            'Enhanced analytics with patient insights'
        ]
    },
    'pro': {
        'name': 'Pro',
        'monthly': {
            'price': 2999,
            'original_price': 3599,
            'stripe_price_id': os.getenv('STRIPE_PRO_MONTHLY_PRICE_ID', ''),
        },
        'yearly': {
            'price': 29999,
            'original_price': 35999,
            'stripe_price_id': os.getenv('STRIPE_PRO_YEARLY_PRICE_ID', ''),
        },
        'features': [
            'Everything in Premium',
            'Full AI-powered clinic automation',
            'Predictive health analytics for patients',
            'Zero-waiting-time virtual queues',
            'Multi-location clinic management',
            'Dedicated health coach integration',
            'Exclusive research access & data insights',
            'Family plan management for patients',
            'Emergency response protocols',
            'White-label customization'
        ]
    }
}

# ==================== GET PRICING PLANS ====================
@app.route('/get-pricing-plans', methods=['GET'])
def get_pricing_plans():
    """Return all available pricing plans with their details"""
    try:
        return jsonify({
            "success": True,
            "plans": PRICING_PLANS
        }), 200
    except Exception as e:
        print(f"Error fetching pricing plans: {e}")
        return jsonify({"error": "Failed to fetch pricing plans"}), 500

# ==================== CREATE STRIPE CHECKOUT SESSION ====================
@app.route('/create-checkout-session', methods=['POST', 'OPTIONS'])
def create_checkout_session():
    # Handle the browser's preflight check
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200
    try:
        data = request.get_json()
        token = data.get('token')
        plan_type = data.get('plan_type')
        billing_cycle = data.get('billing_cycle')
        
        print(f"📝 Received request - Plan: {plan_type}, Cycle: {billing_cycle}")
        
        # Verify doctor authentication
        doctor_uid = token_to_uid(token)
        if not doctor_uid:
            print("❌ Unauthorized - Invalid token")
            return jsonify({"success": False, "message": "Unauthorized"}), 401
        
        print(f"✅ Doctor authenticated: {doctor_uid}")
        
        # Validate plan and billing cycle
        if plan_type not in PRICING_PLANS:
            print(f"❌ Invalid plan type: {plan_type}")
            return jsonify({"success": False, "message": "Invalid plan type"}), 400
        
        if billing_cycle not in ['monthly', 'yearly']:
            print(f"❌ Invalid billing cycle: {billing_cycle}")
            return jsonify({"success": False, "message": "Invalid billing cycle"}), 400
        
        # Get plan details
        plan = PRICING_PLANS[plan_type]
        price_details = plan[billing_cycle]
        stripe_price_id = price_details['stripe_price_id']
        
        # Check if Stripe is configured
        if not stripe.api_key or stripe.api_key == '':
            print("❌ Stripe API key not configured")
            return jsonify({
                "success": False, 
                "message": "Payment system not configured. Please contact support."
            }), 500
        
        if not stripe_price_id or stripe_price_id == '':
            print(f"❌ Stripe price ID not configured for {plan_type} {billing_cycle}")
            return jsonify({
                "success": False,
                "message": f"Pricing not configured for {plan_type} plan. Please contact support."
            }), 500
        
        print(f"💳 Using Stripe Price ID: {stripe_price_id}")
        
        # Get doctor details from both users and doctors collections
        doctor_email = None
        doctor_name = None
        
        # Try to get email from users collection first
        try:
            user_doc = db.collection('users').document(doctor_uid).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                doctor_email = user_data.get('email')
                print(f"📧 Email from users collection: {doctor_email}")
        except Exception as e:
            print(f"⚠️ Error fetching from users collection: {e}")
        
        # Get doctor details from doctors collection
        try:
            doctor_doc = db.collection('doctors').document(doctor_uid).get()
            if doctor_doc.exists:
                doctor_data = doctor_doc.to_dict()
                doctor_name = doctor_data.get('full_name', 'Doctor')
                # If email not found in users, try doctors collection
                if not doctor_email:
                    doctor_email = doctor_data.get('email')
                print(f"👤 Doctor name: {doctor_name}")
        except Exception as e:
            print(f"⚠️ Error fetching from doctors collection: {e}")
            doctor_data = {}
        
        # Fallback email if still not found
        if not doctor_email:
            doctor_email = f"doctor_{doctor_uid}@waitfreeclinic.com"
            print(f"⚠️ Using fallback email: {doctor_email}")
        
        # Create or retrieve Stripe customer
        customer_id = None
        try:
            # Check if doctor already has a Stripe customer ID
            if doctor_doc.exists:
                customer_id = doctor_data.get('stripe_customer_id')
                print(f"🔍 Existing customer ID: {customer_id}")
            
            # Create new customer if doesn't exist
            if not customer_id:
                print("🆕 Creating new Stripe customer...")
                customer = stripe.Customer.create(
                    email=doctor_email,
                    name=doctor_name,
                    metadata={
                        'doctor_uid': doctor_uid,
                        'user_type': 'doctor'
                    }
                )
                customer_id = customer.id
                print(f"✅ Created customer: {customer_id}")
                
                # Save customer ID to doctor profile
                db.collection('doctors').document(doctor_uid).set({
                    'stripe_customer_id': customer_id,
                    'email': doctor_email  # Save email if missing
                }, merge=True)
        
        except Exception as customer_error:
            print(f"❌ Error creating/retrieving customer: {customer_error}")
            import traceback
            traceback.print_exc()
            return jsonify({
                "success": False,
                "message": "Failed to process customer information"
            }), 500
        
        # Create Checkout Session
        try:
            print("🛒 Creating checkout session...")
            
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            
            checkout_session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card'],
                line_items=[
                    {
                        'price': stripe_price_id,
                        'quantity': 1,
                    },
                ],
                mode='subscription',
                success_url=f"{frontend_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{frontend_url}/pricing?canceled=true",
                metadata={
                    'doctor_uid': doctor_uid,
                    'plan_type': plan_type,
                    'billing_cycle': billing_cycle
                },
                subscription_data={
                    'metadata': {
                        'doctor_uid': doctor_uid,
                        'plan_type': plan_type,
                        'billing_cycle': billing_cycle
                    },
                    'trial_period_days': 14
                }
            )
            
            print(f"✅ Checkout session created: {checkout_session.id}")
            print(f"🔗 Checkout URL: {checkout_session.url}")
            
            return jsonify({
                "success": True,
                "checkout_url": checkout_session.url,
                "session_id": checkout_session.id
            }), 200
        
        except stripe.error.StripeError as stripe_error:
            print(f"❌ Stripe error: {stripe_error}")
            return jsonify({
                "success": False,
                "message": f"Payment system error: {str(stripe_error)}"
            }), 500
        except Exception as checkout_error:
            print(f"❌ Error creating checkout session: {checkout_error}")
            import traceback
            traceback.print_exc()
            return jsonify({
                "success": False,
                "message": "Failed to create checkout session"
            }), 500
    
    except Exception as e:
        print(f"❌ Error in create_checkout_session: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": "An unexpected error occurred"
        }), 500

# ==================== STRIPE WEBHOOK ====================
@app.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook events for subscription management"""
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        print(f"Invalid payload: {e}")
        return jsonify({"error": "Invalid payload"}), 400
    except stripe.error.SignatureVerificationError as e:
        print(f"Invalid signature: {e}")
        return jsonify({"error": "Invalid signature"}), 400
    
    # Handle different event types
    event_type = event['type']
    print(f"📨 Webhook received: {event_type}")
    
    try:
        if event_type == 'checkout.session.completed':
            session = event['data']['object']
            handle_checkout_completed(session)
        
        elif event_type == 'customer.subscription.created':
            subscription = event['data']['object']
            handle_subscription_created(subscription)
        
        elif event_type == 'customer.subscription.updated':
            subscription = event['data']['object']
            handle_subscription_updated(subscription)
        
        elif event_type == 'customer.subscription.deleted':
            subscription = event['data']['object']
            handle_subscription_deleted(subscription)
        
        elif event_type == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            handle_payment_succeeded(invoice)
        
        elif event_type == 'invoice.payment_failed':
            invoice = event['data']['object']
            handle_payment_failed(invoice)
        
        return jsonify({"success": True}), 200
    
    except Exception as e:
        print(f"Webhook handling error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Webhook processing failed"}), 500


# ==================== WEBHOOK HANDLERS ====================
def handle_checkout_completed(session):
    """Handle successful checkout completion"""
    doctor_uid = session['metadata'].get('doctor_uid')
    plan_type = session['metadata'].get('plan_type')
    billing_cycle = session['metadata'].get('billing_cycle')
    subscription_id = session.get('subscription')
    
    if doctor_uid:
        # Update doctor's subscription info
        subscription_data = {
            'subscription': {
                'stripe_subscription_id': subscription_id,
                'plan_type': plan_type,
                'billing_cycle': billing_cycle,
                'status': 'trialing',  # Initially on trial
                'trial_end': datetime.now() + timedelta(days=14),
                'created_at': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            },
            'is_subscribed': True
        }
        
        db.collection('doctors').document(doctor_uid).set(subscription_data, merge=True)
        print(f"✅ Subscription created for doctor {doctor_uid}")


def handle_subscription_created(subscription):
    """Handle subscription creation"""
    doctor_uid = subscription['metadata'].get('doctor_uid')
    
    if doctor_uid:
        subscription_data = {
            'subscription': {
                'stripe_subscription_id': subscription['id'],
                'status': subscription['status'],
                'current_period_start': datetime.fromtimestamp(subscription['current_period_start']).isoformat(),
                'current_period_end': datetime.fromtimestamp(subscription['current_period_end']).isoformat(),
                'last_updated': datetime.now().isoformat()
            }
        }
        
        db.collection('doctors').document(doctor_uid).set(subscription_data, merge=True)
        print(f"✅ Subscription updated for doctor {doctor_uid}")


def handle_subscription_updated(subscription):
    """Handle subscription updates (upgrades, downgrades, cancellations)"""
    customer_id = subscription.get('customer')
    
    # Find doctor by customer_id
    doctors_ref = db.collection('doctors')
    query = doctors_ref.where('stripe_customer_id', '==', customer_id).limit(1)
    results = query.stream()
    
    for doc in results:
        doctor_uid = doc.id
        subscription_data = {
            'subscription': {
                'status': subscription['status'],
                'current_period_start': datetime.fromtimestamp(subscription['current_period_start']).isoformat(),
                'current_period_end': datetime.fromtimestamp(subscription['current_period_end']).isoformat(),
                'cancel_at_period_end': subscription.get('cancel_at_period_end', False),
                'last_updated': datetime.now().isoformat()
            }
        }
        
        db.collection('doctors').document(doctor_uid).set(subscription_data, merge=True)
        print(f"✅ Subscription updated for doctor {doctor_uid}")
        break


def handle_subscription_deleted(subscription):
    """Handle subscription cancellation"""
    customer_id = subscription.get('customer')
    
    # Find doctor by customer_id
    doctors_ref = db.collection('doctors')
    query = doctors_ref.where('stripe_customer_id', '==', customer_id).limit(1)
    results = query.stream()
    
    for doc in results:
        doctor_uid = doc.id
        subscription_data = {
            'subscription': {
                'status': 'canceled',
                'canceled_at': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            },
            'is_subscribed': False
        }
        
        db.collection('doctors').document(doctor_uid).set(subscription_data, merge=True)
        print(f"✅ Subscription canceled for doctor {doctor_uid}")
        break


def handle_payment_succeeded(invoice):
    """Handle successful payment"""
    customer_id = invoice.get('customer')
    subscription_id = invoice.get('subscription')
    
    # Find doctor by customer_id
    doctors_ref = db.collection('doctors')
    query = doctors_ref.where('stripe_customer_id', '==', customer_id).limit(1)
    results = query.stream()
    
    for doc in results:
        doctor_uid = doc.id
        
        # Log payment in payment_history subcollection
        payment_data = {
            'invoice_id': invoice['id'],
            'subscription_id': subscription_id,
            'amount_paid': invoice['amount_paid'],
            'currency': invoice['currency'],
            'status': 'paid',
            'paid_at': datetime.fromtimestamp(invoice.get('status_transitions', {}).get('paid_at', 0)).isoformat() if invoice.get('status_transitions', {}).get('paid_at') else datetime.now().isoformat(),
            'invoice_pdf': invoice.get('invoice_pdf'),
            'created_at': datetime.now().isoformat()
        }
        
        db.collection('doctors').document(doctor_uid).collection('payment_history').add(payment_data)
        print(f"✅ Payment recorded for doctor {doctor_uid}")
        break


def handle_payment_failed(invoice):
    """Handle failed payment"""
    customer_id = invoice.get('customer')
    
    # Find doctor by customer_id
    doctors_ref = db.collection('doctors')
    query = doctors_ref.where('stripe_customer_id', '==', customer_id).limit(1)
    results = query.stream()
    
    for doc in results:
        doctor_uid = doc.id
        
        # Update subscription status
        subscription_data = {
            'subscription': {
                'payment_status': 'failed',
                'last_payment_error': invoice.get('last_payment_error', {}).get('message', 'Payment failed'),
                'last_updated': datetime.now().isoformat()
            }
        }
        
        db.collection('doctors').document(doctor_uid).set(subscription_data, merge=True)
        
        # Log failed payment
        payment_data = {
            'invoice_id': invoice['id'],
            'status': 'failed',
            'error_message': invoice.get('last_payment_error', {}).get('message', 'Payment failed'),
            'attempted_at': datetime.now().isoformat()
        }
        
        db.collection('doctors').document(doctor_uid).collection('payment_history').add(payment_data)
        print(f"❌ Payment failed for doctor {doctor_uid}")
        break


# ==================== GET SUBSCRIPTION STATUS ====================
@app.route('/get-subscription-status', methods=['POST'])
def get_subscription_status():
    """
    Get current subscription status for a doctor
    """
    try:
        data = request.get_json()
        token = data.get('token')
        
        # Verify doctor
        doctor_uid = token_to_uid(token)
        if not doctor_uid:
            return jsonify({"message": "Unauthorized"}), 401
        
        # Get subscription details
        doctor_doc = db.collection('doctors').document(doctor_uid).get()
        
        if doctor_doc.exists:
            doctor_data = doctor_doc.to_dict()
            subscription = doctor_data.get('subscription', {})
            
            return jsonify({
                "success": True,
                "subscription": subscription,
                "is_subscribed": doctor_data.get('is_subscribed', False)
            }), 200
        else:
            return jsonify({
                "success": True,
                "subscription": None,
                "is_subscribed": False
            }), 200
    
    except Exception as e:
        print(f"Error fetching subscription status: {e}")
        return jsonify({"error": "Failed to fetch subscription status"}), 500


# ==================== CANCEL SUBSCRIPTION ====================
@app.route('/cancel-subscription', methods=['POST'])
def cancel_subscription():
    """
    Cancel a doctor's subscription
    """
    try:
        data = request.get_json()
        token = data.get('token')
        cancel_immediately = data.get('cancel_immediately', False)
        
        # Verify doctor
        doctor_uid = token_to_uid(token)
        if not doctor_uid:
            return jsonify({"message": "Unauthorized"}), 401
        
        # Get doctor's subscription
        doctor_doc = db.collection('doctors').document(doctor_uid).get()
        
        if not doctor_doc.exists:
            return jsonify({"message": "Doctor not found"}), 404
        
        doctor_data = doctor_doc.to_dict()
        subscription_id = doctor_data.get('subscription', {}).get('stripe_subscription_id')
        
        if not subscription_id:
            return jsonify({"message": "No active subscription found"}), 404
        
        # Cancel in Stripe
        try:
            if cancel_immediately:
                stripe.Subscription.delete(subscription_id)
            else:
                stripe.Subscription.modify(
                    subscription_id,
                    cancel_at_period_end=True
                )
            
            return jsonify({
                "success": True,
                "message": "Subscription cancelled successfully"
            }), 200
        
        except Exception as stripe_error:
            print(f"Stripe cancellation error: {stripe_error}")
            return jsonify({"message": "Failed to cancel subscription"}), 500
    
    except Exception as e:
        print(f"Error cancelling subscription: {e}")
        return jsonify({"error": "Failed to cancel subscription"}), 500


# ==================== GET PAYMENT HISTORY ====================
@app.route('/get-payment-history', methods=['POST'])
def get_payment_history():
    """
    Get payment history for a doctor
    """
    try:
        data = request.get_json()
        token = data.get('token')
        
        # Verify doctor
        doctor_uid = token_to_uid(token)
        if not doctor_uid:
            return jsonify({"message": "Unauthorized"}), 401
        
        # Get payment history
        payments_ref = db.collection('doctors').document(doctor_uid).collection('payment_history')
        query = payments_ref.order_by('created_at', direction=firestore.Query.DESCENDING)
        results = query.stream()
        
        payment_history = []
        for doc in results:
            payment = doc.to_dict()
            payment['id'] = doc.id
            payment_history.append(payment)
        
        return jsonify({
            "success": True,
            "payment_history": payment_history
        }), 200
    
    except Exception as e:
        print(f"Error fetching payment history: {e}")
        return jsonify({"error": "Failed to fetch payment history"}), 500

# ==================== DIRECT EMAIL SENDING FUNCTION ====================
def send_email_direct(to_email, subject, html_body, text_body=None):
    """
    Send email directly using Gmail SMTP (without Firebase Extension)
    Uses credentials from Firebase SMTP settings
    """
    smtp_username = "sujalgawas18@gmail.com"
    smtp_password = os.getenv('SMTP_PASSWORD', 'YOUR_APP_PASSWORD')  # Add to .env or hardcode
    
    # If no .env, hardcode your app password here temporarily
    if smtp_password == 'YOUR_APP_PASSWORD':
        smtp_password = "your-16-char-app-password"  # Replace with actual password
    
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = smtp_username
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add text version (fallback)
        if text_body:
            text_part = MIMEText(text_body, 'plain')
            msg.attach(text_part)
        
        # Add HTML version
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)
        
        # Connect and send
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


# ==================== SEND EMAIL FROM FIRESTORE TEMPLATE ====================
def send_email_from_firebase_template(template_name, to_email, template_data):
    """
    Fetch email template from Firestore and send email directly via SMTP
    """
    try:
        # Fetch template from Firestore
        template_doc = db.collection('email_templates').document(template_name).get()
        
        if not template_doc.exists:
            print(f"❌ Template not found: {template_name}")
            return False
        
        template = template_doc.to_dict()
        
        # Get subject, text, and html
        subject = template.get('subject', 'WaitFree Clinic')
        text = template.get('text', '')
        html = template.get('html', '')
        
        # Replace template variables {{variable}}
        for key, value in template_data.items():
            subject = subject.replace(f'{{{{{key}}}}}', str(value))
            text = text.replace(f'{{{{{key}}}}}', str(value))
            html = html.replace(f'{{{{{key}}}}}', str(value))
        
        # Send email directly using SMTP
        return send_email_direct(to_email, subject, html, text)
    
    except Exception as e:
        print(f"❌ Error sending template email: {e}")
        import traceback
        traceback.print_exc()
        return False


# ==================== CONTACT US ENDPOINT ====================
@app.route('/contact-us', methods=['POST'])
def contact_us():
    """
    Handle contact form submissions
    Store in Firestore and send emails directly via SMTP
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'userType', 'subject', 'message']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                "success": False,
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        # Extract form data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        user_type = data.get('userType', 'patient')
        subject = data.get('subject', '')
        message = data.get('message', '').strip()
        
        # Basic email validation
        if '@' not in email or '.' not in email:
            return jsonify({
                "success": False,
                "message": "Invalid email address"
            }), 400
        
        print(f"📝 Contact form received from: {name} ({email})")
        
        # Prepare contact data
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
        
        # Save to Firestore
        try:
            contact_ref = db.collection('contact_submissions').document()
            contact_ref.set(contact_data)
            contact_id = contact_ref.id
            
            print(f"✅ Contact form saved: {contact_id}")
        except Exception as db_error:
            print(f"❌ Firestore Error: {db_error}")
            return jsonify({
                "success": False,
                "message": "Failed to save your message. Please try again."
            }), 500
        
        # Send emails directly using SMTP
        email_success = True
        try:
            # Email to admin using template
            admin_sent = send_email_from_firebase_template(
                'contact_notification',
                'sujalgawas18@gmail.com',  # Your admin email
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
            
            # Confirmation email to user using template
            user_sent = send_email_from_firebase_template(
                'contact_confirmation',
                email,
                {
                    'name': name,
                    'subject': subject
                }
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
        
        # Return success even if email fails (form is saved)
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
        return jsonify({
            "success": False,
            "message": "An error occurred. Please try again later."
        }), 500


# ==================== ADMIN ENDPOINTS FOR CONTACT MANAGEMENT ====================

@app.route('/admin/get-contact-submissions', methods=['POST'])
def get_contact_submissions():
    """
    Get all contact form submissions (Admin only)
    """
    try:
        data = request.get_json()
        token = data.get('token')
        
        # Verify admin
        uid = token_to_uid(token)
        if not uid:
            return jsonify({"success": False, "message": "Unauthorized"}), 401
        
        # Check if user is admin
        user_doc = db.collection('doctors').document(uid).get()
        if not user_doc.exists:
            return jsonify({"success": False, "message": "Access denied"}), 403
        
        # Get query parameters
        status = data.get('status', 'all')
        limit_count = data.get('limit', 50)
        
        # Query contact submissions
        query = db.collection('contact_submissions')
        
        if status == 'unread':
            query = query.where('read', '==', False)
        elif status == 'replied':
            query = query.where('replied', '==', True)
        
        query = query.order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit_count)
        
        results = query.stream()
        
        submissions = []
        for doc in results:
            submission = doc.to_dict()
            submission['id'] = doc.id
            
            # Convert timestamp to string
            if 'created_at' in submission and submission['created_at']:
                submission['created_at'] = submission['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            
            submissions.append(submission)
        
        return jsonify({
            "success": True,
            "submissions": submissions,
            "count": len(submissions)
        }), 200
    
    except Exception as e:
        print(f"❌ Error getting submissions: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to fetch submissions"
        }), 500


@app.route('/admin/mark-contact-read', methods=['POST'])
def mark_contact_read():
    """
    Mark a contact submission as read (Admin only)
    """
    try:
        data = request.get_json()
        token = data.get('token')
        contact_id = data.get('contact_id')
        
        # Verify admin
        uid = token_to_uid(token)
        if not uid:
            return jsonify({"success": False, "message": "Unauthorized"}), 401
        
        if not contact_id:
            return jsonify({"success": False, "message": "Contact ID required"}), 400
        
        # Update the contact submission
        db.collection('contact_submissions').document(contact_id).update({
            'read': True,
            'read_at': firestore.SERVER_TIMESTAMP,
            'read_by': uid
        })
        
        return jsonify({
            "success": True,
            "message": "Marked as read"
        }), 200
    
    except Exception as e:
        print(f"❌ Error marking as read: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to update status"
        }), 500


@app.route('/admin/reply-to-contact', methods=['POST'])
def reply_to_contact():
    """
    Send reply to contact form submission using email template and direct SMTP
    """
    try:
        data = request.get_json()
        token = data.get('token')
        contact_id = data.get('contact_id')
        reply_message = data.get('reply_message', '').strip()
        
        # Verify admin
        uid = token_to_uid(token)
        if not uid:
            return jsonify({"success": False, "message": "Unauthorized"}), 401
        
        if not contact_id or not reply_message:
            return jsonify({"success": False, "message": "Contact ID and reply message required"}), 400
        
        # Get the original contact submission
        contact_doc = db.collection('contact_submissions').document(contact_id).get()
        if not contact_doc.exists:
            return jsonify({"success": False, "message": "Contact not found"}), 404
        
        contact_data = contact_doc.to_dict()
        
        # Send reply email using template and direct SMTP
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
            return jsonify({
                "success": False,
                "message": "Failed to send reply email"
            }), 500
        
        # Update contact submission
        db.collection('contact_submissions').document(contact_id).update({
            'replied': True,
            'reply_message': reply_message,
            'replied_at': firestore.SERVER_TIMESTAMP,
            'replied_by': uid,
            'status': 'resolved'
        })
        
        return jsonify({
            "success": True,
            "message": "Reply sent successfully"
        }), 200
    
    except Exception as e:
        print(f"❌ Error in reply_to_contact: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "Failed to send reply"
        }), 500


# ==================== TEST EMAIL ENDPOINT ====================
@app.route('/test-email', methods=['POST'])
def test_email():
    """
    Test endpoint to verify email sending works
    """
    try:
        data = request.get_json()
        test_email = data.get('email', 'sujalgawas18@gmail.com')
        
        success = send_email_direct(
            test_email,
            "Test Email from WaitFree Clinic",
            "<h1>Test Email</h1><p>If you receive this, email sending is working!</p>",
            "Test Email - If you receive this, email sending is working!"
        )
        
        return jsonify({
            "success": success,
            "message": "Test email sent!" if success else "Failed to send test email"
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/check-profile', methods=['POST'])
def check_profile():
    """Check if user has completed their profile form"""
    try:
        data = request.get_json()
        token = data.get('token')
        user_type = data.get('user_type')
        
        if not token or not user_type:
            return jsonify({"message": "Token and user_type required"}), 400
        
        uid = token_to_uid(token)
        if not uid:
            return jsonify({"message": "Unauthorized - Invalid token"}), 401
        
        # Check the appropriate collection based on user type
        collection_name = 'doctors' if user_type == 'doctor' else 'patients'
        
        try:
            doc = db.collection(collection_name).document(uid).get()
            
            if doc.exists:
                data = doc.to_dict()
                profile_completed = data.get('profile_completed', False)
                
                return jsonify({
                    "profile_completed": profile_completed,
                    "user_type": user_type,
                    "uid": uid
                }), 200
            else:
                # User document doesn't exist - profile not completed
                return jsonify({
                    "profile_completed": False,
                    "user_type": user_type,
                    "uid": uid
                }), 200
                
        except Exception as db_error:
            print(f"❌ Firestore Error: {db_error}")
            return jsonify({"message": "Database error"}), 500
            
    except Exception as e:
        print(f"❌ Error in check_profile: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "An error occurred"}), 500

@app.route('/patient-form', methods=['POST'])
def patient_form():
    try:
        # 1. TOKEN VALIDATION
        token = request.form.get('token')
        if not token:
            return jsonify({"message": "Token is required"}), 400
        
        uid = token_to_uid(token)
        if not uid:
            return jsonify({"message": "Unauthorized - Invalid token"}), 401

        # 2. REQUIRED FIELD VALIDATION
        required_fields = ['full_name', 'date_of_birth', 'gender', 'emergency_name', 'emergency_phone', 'emergency_relation']
        
        missing_fields = [field for field in required_fields if not request.form.get(field)]
        if missing_fields:
            return jsonify({
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # 3. PROFILE IMAGE UPLOAD (Optional)
        profile_file = request.files.get('profile_image')
        profile_url = "default_avatar"  # Default if no image uploaded
        
        if profile_file and profile_file.filename != '':
            print(f"File received: {profile_file.filename}")
            
            # Validate file type
            if not allowed_file(profile_file.filename):
                return jsonify({
                    "message": "Invalid file type. Allowed: PNG, JPG, JPEG"
                }), 400
            
            # Validate file size
            profile_file.seek(0, os.SEEK_END)
            file_size = profile_file.tell()
            profile_file.seek(0)
            
            if file_size > MAX_FILE_SIZE:
                return jsonify({"message": "Profile image size exceeds 5MB limit"}), 400
            
            # Upload to Firebase Storage
            try:
                filename = secure_filename(profile_file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                blob_name = f"patient_profiles/{uid}/{timestamp}_{filename}"
                
                bucket = storage.bucket()
                blob = bucket.blob(blob_name)
                blob.upload_from_file(profile_file, content_type=profile_file.content_type)
                blob.make_public()
                profile_url = blob.public_url
                
                print(f"✅ Profile image uploaded: {blob_name}")
                
            except Exception as upload_error:
                print(f"❌ Firebase Storage Error: {upload_error}")
                return jsonify({"message": "Failed to upload profile image"}), 500

        # 4. EXTRACT AND VALIDATE FORM DATA
        full_name = request.form.get('full_name', '').strip()
        date_of_birth = request.form.get('date_of_birth', '').strip()
        gender = request.form.get('gender', '').strip()
        blood_group = request.form.get('blood_group', '').strip()
        height = request.form.get('height', '').strip()
        weight = request.form.get('weight', '').strip()
        
        # Emergency contact
        emergency_name = request.form.get('emergency_name', '').strip()
        emergency_phone = request.form.get('emergency_phone', '').strip()
        emergency_relation = request.form.get('emergency_relation', '').strip()

        # CRITICAL FIX: Handle allergies and chronic conditions
        # Frontend sends as comma-separated strings, NOT JSON
        allergies_input = request.form.get('allergies_input', '').strip()
        chronic_conditions_input = request.form.get('chronic_conditions_input', '').strip()
        
        # Split by comma and clean up whitespace
        allergies = [a.strip() for a in allergies_input.split(',') if a.strip()] if allergies_input else []
        chronic_conditions = [c.strip() for c in chronic_conditions_input.split(',') if c.strip()] if chronic_conditions_input else []
        
        print(f"Allergies parsed: {allergies}")
        print(f"Chronic conditions parsed: {chronic_conditions}")

        # Validate numeric fields
        height_int = None
        weight_int = None
        
        if height:
            try:
                height_int = int(height)
                if height_int <= 0 or height_int > 300:
                    return jsonify({"message": "Invalid height value"}), 400
            except ValueError:
                return jsonify({"message": "Height must be a number"}), 400
        
        if weight:
            try:
                weight_int = int(weight)
                if weight_int <= 0 or weight_int > 500:
                    return jsonify({"message": "Invalid weight value"}), 400
            except ValueError:
                return jsonify({"message": "Weight must be a number"}), 400

        # Get email from existing user data (if available) or from form
        email = request.form.get('email', '')

        # 5. PREPARE PATIENT DATA
        patient_data = {
            "full_name": full_name,
            "email": email if email else None,
            "profile_completed": True,
            "profile_image": profile_url,
            "created_at": datetime.now().isoformat(),

            "personal_details": {
                "dob": date_of_birth,
                "gender": gender,
                "blood_group": blood_group if blood_group else None,
                "height": height_int,
                "weight": weight_int
            },

            "medical_profile": {
                "allergies": allergies,
                "chronic_conditions": chronic_conditions
            },

            "emergency_contact": {
                "name": emergency_name,
                "phone": emergency_phone,
                "relation": emergency_relation
            }
        }

        # 6. SAVE TO FIRESTORE
        try:
            # Use merge=True to preserve existing data (like email from registration)
            db.collection('patients').document(uid).set(patient_data, merge=True)
            
            print(f"✅ Patient profile saved for UID: {uid}")
            
            return jsonify({
                "message": "Patient profile saved successfully",
                "uid": uid,
                "profile_completed": True
            }), 200

        except Exception as db_error:
            print(f"❌ Firestore Error: {db_error}")
            # Cleanup uploaded image if database save fails
            if profile_url != "default_avatar":
                try:
                    blob.delete()
                    print("🗑️ Cleaned up uploaded file after database error")
                except:
                    pass
            return jsonify({"message": "Failed to save profile to database"}), 500

    except Exception as e:
        print(f"❌ Unexpected Error in patient_form: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "An unexpected error occurred"}), 500

# Helper function to extract coordinates from Google Maps link
def extract_coordinates_from_maps_link(maps_link):
    """
    Extract lat/lng from Google Maps link
    Supports multiple URL formats
    """
    import re
    
    if not maps_link:
        return None
    
    # Try different Google Maps URL patterns
    patterns = [
        r'@(-?\d+\.\d+),(-?\d+\.\d+)',  # @lat,lng format
        r'q=(-?\d+\.\d+),(-?\d+\.\d+)',  # q=lat,lng format
        r'll=(-?\d+\.\d+),(-?\d+\.\d+)', # ll=lat,lng format
        r'/place/[^/]+/@(-?\d+\.\d+),(-?\d+\.\d+)', # /place format
    ]
    
    for pattern in patterns:
        match = re.search(pattern, maps_link)
        if match:
            return {
                'lat': float(match.group(1)),
                'lng': float(match.group(2))
            }
    
    return None


@app.route('/save-clinic-coordinates', methods=['POST'])
def save_clinic_coordinates():
    """
    Save clinic coordinates directly to the doctor's profile
    This is useful when setting up the doctor profile
    """
    data = request.get_json()
    token = data.get('token')
    lat = data.get('lat')
    lng = data.get('lng')
    
    # Verify doctor
    doctor_uid = token_to_uid(token)
    if not doctor_uid:
        return jsonify({"message": "Unauthorized"}), 401
    
    try:
        # Update doctor's clinic location
        db.collection('doctors').document(doctor_uid).set({
            'clinic_details': {
                'location': {
                    'lat': lat,
                    'lng': lng
                }
            }
        }, merge=True)
        
        return jsonify({"message": "Clinic coordinates saved successfully"}), 200
        
    except Exception as e:
        print(f"Error saving coordinates: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/get-appointment-details', methods=['POST'])
def get_appointment_details():
    data = request.get_json()
    token = data.get('token')
    appointment_id = data.get('appointment_id')
    
    # Verify user
    patient_uid = token_to_uid(token)
    if not patient_uid:
        return jsonify({"message": "Unauthorized"}), 401
    
    try:
        # Fetch specific appointment
        appt_doc = db.collection('appointments').document(appointment_id).get()
        
        if not appt_doc.exists:
            return jsonify({"message": "Appointment not found"}), 404
        
        appt_data = appt_doc.to_dict()
        
        # Verify this appointment belongs to the user
        if appt_data.get('patient_uid') != patient_uid:
            return jsonify({"message": "Unauthorized access"}), 403
        
        # Get doctor details for more info
        doctor_uid = appt_data.get('doctor_uid')
        doctor_doc = db.collection('doctors').document(doctor_uid).get()
        
        if doctor_doc.exists:
            doctor_data = doctor_doc.to_dict()
            
            # Extract clinic location from Google Maps link if available
            maps_link = doctor_data.get('clinic_details', {}).get('google_maps_link', '')
            clinic_location = extract_coordinates_from_maps_link(maps_link)
            
            # Enrich appointment data
            appt_data['clinic_location'] = clinic_location
            appt_data['doctor_phone'] = doctor_data.get('clinic_details', {}).get('phone')
            appt_data['doctor_specialization'] = doctor_data.get('specialization')
        
        appt_data['id'] = appt_doc.id
        
        # Convert timestamp if needed
        if 'created_at' in appt_data and appt_data['created_at']:
            appt_data['created_at'] = appt_data['created_at'].strftime('%Y-%m-%d %H:%M')
        
        return jsonify({"appointment": appt_data}), 200
        
    except Exception as e:
        print(f"Error fetching appointment details: {e}")
        return jsonify({"error": str(e)}), 500



def extract_coordinates_from_maps_link(maps_link):
    """
    Extract lat/lng from Google Maps link - Improved version
    Supports multiple URL formats including share links
    """
    if not maps_link:
        return None
    
    # Decode URL-encoded characters
    decoded_link = unquote(maps_link)
    
    # Try different Google Maps URL patterns
    patterns = [
        # Standard format: @lat,lng,zoom
        r'@(-?\d+\.\d+),(-?\d+\.\d+)',
        # Query format: q=lat,lng
        r'q=(-?\d+\.\d+),(-?\d+\.\d+)',
        # LatLng format: ll=lat,lng
        r'll=(-?\d+\.\d+),(-?\d+\.\d+)',
        # Place format with coordinates
        r'/place/[^/]+/@(-?\d+\.\d+),(-?\d+\.\d+)',
        # Direct coordinate format
        r'maps\?.*?(-?\d+\.\d+),(-?\d+\.\d+)',
        # Short URL format after redirect
        r'destination=(-?\d+\.\d+),(-?\d+\.\d+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, decoded_link)
        if match:
            lat = float(match.group(1))
            lng = float(match.group(2))
            
            # Validate coordinates are within valid ranges
            if -90 <= lat <= 90 and -180 <= lng <= 180:
                print(f"Extracted coordinates: {lat}, {lng} from {maps_link}")
                return {
                    'lat': lat,
                    'lng': lng
                }
    
    print(f"Could not extract coordinates from: {maps_link}")
    return None


@app.route('/get-appointment-locations', methods=['POST'])
def get_appointment_locations():
    """
    Get accurate locations for both patient and clinic
    """
    data = request.get_json()
    token = data.get('token')
    doctor_uid = data.get('doctor_uid')
    
    # Verify patient
    patient_uid = token_to_uid(token)
    if not patient_uid:
        return jsonify({"message": "Unauthorized"}), 401
    
    try:
        # Get patient location from patients collection
        patient_doc = db.collection('patients').document(patient_uid).get()
        patient_location = None
        
        if patient_doc.exists:
            patient_data = patient_doc.to_dict()
            last_location = patient_data.get('last_known_location', {})
            
            if last_location and 'lat' in last_location and 'lng' in last_location:
                patient_location = {
                    'lat': last_location['lat'],
                    'lng': last_location['lng'],
                    'address': last_location.get('address', ''),
                    'city': last_location.get('city', '')
                }
                print(f"Patient location found: {patient_location}")
        
        # Get doctor/clinic location from doctors collection
        doctor_doc = db.collection('doctors').document(doctor_uid).get()
        clinic_location = None
        clinic_info = {}
        
        if doctor_doc.exists:
            doctor_data = doctor_doc.to_dict()
            clinic_details = doctor_data.get('clinic_details', {})
            
            print(f"Doctor clinic details: {clinic_details}")
            
            # Get Google Maps link from clinic details
            maps_link = clinic_details.get('google_maps_link', '')
            
            if maps_link:
                print(f"Attempting to extract from maps link: {maps_link}")
                clinic_location = extract_coordinates_from_maps_link(maps_link)
                
                if clinic_location:
                    print(f"Successfully extracted clinic location: {clinic_location}")
                else:
                    print("Failed to extract coordinates from maps link")
            else:
                print("No Google Maps link found in clinic details")
            
            # Prepare clinic info
            clinic_info = {
                'name': clinic_details.get('name', 'Unknown Clinic'),
                'address': clinic_details.get('address', ''),
                'zip_code': clinic_details.get('zip_code', ''),
                'google_maps_link': maps_link
            }
        else:
            print(f"Doctor document not found for UID: {doctor_uid}")
        
        # Return both locations
        return jsonify({
            'success': True,
            'patient_location': patient_location,
            'clinic_location': clinic_location,
            'clinic_info': clinic_info,
            'debug': {
                'doctor_uid': doctor_uid,
                'maps_link': clinic_details.get('google_maps_link', '') if doctor_doc.exists else None
            }
        }), 200
        
    except Exception as e:
        print(f"Error fetching locations: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/test-maps-extraction', methods=['POST'])
def test_maps_extraction():
    """
    Test endpoint to verify coordinate extraction from Google Maps links
    Useful for debugging
    """
    data = request.get_json()
    maps_link = data.get('maps_link')
    
    if not maps_link:
        return jsonify({"error": "No maps_link provided"}), 400
    
    coords = extract_coordinates_from_maps_link(maps_link)
    
    return jsonify({
        'input': maps_link,
        'extracted_coordinates': coords,
        'success': coords is not None
    }), 200

    
@app.route('/get-doctor-schedule', methods=['POST'])
def get_doctor_schedule():
    data = request.get_json()
    token = data.get('token')
    
    # Verify the doctor's UID using your existing token function
    doctor_uid = token_to_uid(token)
    if not doctor_uid:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        appointments_ref = db.collection('appointments')
        
        # Query where doctor_uid matches. 
        # Note: If this fails, check terminal for the Index link!
        query = appointments_ref.where('doctor_uid', '==', doctor_uid).order_by('date').order_by('slot')
        results = query.stream()

        schedule = []
        for doc in results:
            appt = doc.to_dict()
            appt['id'] = doc.id
            schedule.append(appt)

        return jsonify({"schedule": schedule}), 200
    except Exception as e:
        print(f"Schedule Error: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/get-user-appointments', methods=['POST'])
def get_user_appointments():
    data = request.get_json()
    token = data.get('token')
    
    # 1. Verify User
    # Assuming your token_to_uid function is already defined
    patient_uid = token_to_uid(token) 
    if not patient_uid:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        appointments_ref = db.collection('appointments')
        
        # 2. Query Firestore
        # NOTE: If this fails, check your terminal for a link to create a Firestore Index
        query = appointments_ref.where('patient_uid', '==', patient_uid).order_by('created_at', direction=firestore.Query.DESCENDING)
        results = query.stream()

        appointments = []
        for doc in results:
            appt = doc.to_dict()
            appt['id'] = doc.id
            
            # Convert Firestore Timestamp to string for JSON compatibility
            if 'created_at' in appt and appt['created_at']:
                appt['created_at'] = appt['created_at'].strftime('%Y-%m-%d %H:%M')
                
            appointments.append(appt)

        return jsonify({"appointments": appointments}), 200

    except Exception as e:
        print(f"Error fetching appointments: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/latest-location', methods=['POST'])
def latest_location():
    data = request.get_json()
    token = data.get('token')
    
    uid = token_to_uid(token)
    if not uid:
        return jsonify({"message": "UnAuthorized"}), 401
    
    try:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            location = user_doc.to_dict().get("last_known_location")
            return jsonify({
                "message": "location found",
                "location": location
            }), 200
        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "no latest location found"}), 500

@app.route('/get-doctor-profile', methods=['POST'])
def get_doctor_profile():
    data = request.get_json()
    doctor_name = data.get('doctor_name')
    
    if not doctor_name:
        return jsonify({"message": "Doctor name required"}), 400
        
    try:
        # Query by name (make sure you have an index if this gets slow)
        query = db.collection('doctors').where('full_name', '==', doctor_name).limit(1)
        results = query.stream()
        
        doctor_data = None
        for doc in results:
            doctor_data = doc.to_dict()
            doctor_data['uid'] = doc.id
            break
            
        if doctor_data:
            return jsonify({"message": "Found", "doctor": doctor_data}), 200
        else:
            return jsonify({"message": "Not found"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/booking', methods=['POST'])
def booking():
    data = request.get_json()
    
    # 1. Verify Patient (User)
    token = data.get('token')
    patient_uid = token_to_uid(token)
    if not patient_uid:
        return jsonify({"message": "Unauthorized"}), 401

    # 2. Get Data
    doctor_name = data.get('doctorName') # Matches frontend 'doctorName'
    timing = data.get('slot')            # Matches frontend 'slot'
    date = data.get('date')              # Matches frontend 'date'
    
    try:
        # 3. Find Doctor UID from Name
        # In a real app, you should send doctor_uid from frontend directly.
        # But since we are using name, we search for it.
        doctors_ref = db.collection('doctors')
        query = doctors_ref.where('full_name', '==', doctor_name).limit(1)
        results = query.stream()
        
        doctor_uid = None
        doctor_data = {}
        
        for doc in results:
            doctor_uid = doc.id
            doctor_data = doc.to_dict()
            break
            
        if not doctor_uid:
            return jsonify({"message": "Doctor not found"}), 404

        # 4. Create Appointment Object
        appointment_data = {
            "patient_uid": patient_uid,
            "doctor_uid": doctor_uid,
            "doctor_name": doctor_name,
            "clinic_name": doctor_data.get('clinic_details', {}).get('name'),
            "clinic_address": doctor_data.get('clinic_details', {}).get('address'),
            "slot": timing,
            "date": date,
            "status": "confirmed",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        # 5. Save to a dedicated 'appointments' collection
        # This is better than saving inside user docs because it's easier to query
        # "Find all appointments for doctor X" or "for patient Y"
        new_appt_ref = db.collection('appointments').document()
        new_appt_ref.set(appointment_data)
        
        return jsonify({
            "message": "Booking successful",
            "appointment_id": new_appt_ref.id
        }), 200

    except Exception as e:
        print(f"Booking Error: {e}")
        return jsonify({"message": "Booking failed", "error": str(e)}), 500

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    
    location_filter = data.get('location') 
    search_query = data.get('query', '').lower()
    
    city = location_filter.get("city").lower() if location_filter else None
    
    try:
        doctors_ref = db.collection('doctors')
        query_ref = doctors_ref
        
        if city:
            query_ref = query_ref.where('city', '==', city)
            
        results = query_ref.stream()
        
        doctors_list = []
        for doc in results:
            d = doc.to_dict()
            
            name = d.get('full_name', '').lower()
            specialty = d.get('specialization', '').lower()
            
            if search_query in name or search_query in specialty:
                doctors_list.append({
                    "id": doc.id,
                    "name": d.get('full_name'),
                    "specialty": d.get('specialization'),
                    "experience": d.get('personal_details', {}).get('experience_years', 0),
                    "clinic": d.get('clinic_details', {}).get('name'),
                    "fees": d.get('consultation_fee'),
                    "distance": "2.5", # Placeholder or calculate if you have lat/lng
                    "rating": 4.8, # Placeholder or fetch from 'reviews' collection
                    "verified": d.get('is_verified', False),
                    "photo": "👨‍⚕️", # Placeholder emoji or image URL
                    "online": True, # Logic for online status
                    "nextSlot": "10:00 AM", # Logic for next slot
                    "slots": [d.get("availability",{}).get("morning_shift",{}).get("start", "10:00"), d.get("availability",{}).get("evening_shift",{}).get("start", "17:00")]
                })
                
        return jsonify({"results": doctors_list}), 200

    except Exception as e:
        print(f"Search Error: {e}")
        return jsonify({"error": "Search failed"}), 500
    
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/doctor-form', methods=['POST'])
def doctor_form():
    try:
        # 1. TOKEN VALIDATION
        token = request.form.get('token')
        if not token:
            return jsonify({"message": "Token is required"}), 400
        
        uid = token_to_uid(token)
        if not uid:
            return jsonify({"message": "Unauthorized - Invalid token"}), 401

        # 2. REQUIRED FIELD VALIDATION
        required_fields = [
            'full_name', 'specialization', 'reg_number', 'medical_council',
            'reg_year', 'experience_years', 'clinic_name', 'address_line',
            'city', 'zip_code', 'consultation_fee', 'morning_start',
            'morning_end', 'evening_start', 'evening_end', 'days_open'
        ]
        
        missing_fields = [field for field in required_fields if not request.form.get(field)]
        if missing_fields:
            return jsonify({
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # 3. FILE VALIDATION AND UPLOAD
        degree_file = request.files.get('degree_proof')
        degree_url = "pending_upload"
        
        if not degree_file:
            return jsonify({"message": "Degree proof file is required"}), 400
        
        if degree_file.filename == '':
            return jsonify({"message": "No file selected"}), 400
        
        if not allowed_file(degree_file.filename):
            return jsonify({
                "message": "Invalid file type. Allowed: PDF, PNG, JPG, JPEG"
            }), 400
        
        # Check file size
        degree_file.seek(0, os.SEEK_END)
        file_size = degree_file.tell()
        degree_file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({"message": "File size exceeds 5MB limit"}), 400
        
        # Upload to Firebase Storage
        try:
            filename = secure_filename(degree_file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            blob_name = f"doctor_degrees/{uid}/{timestamp}_{filename}"
            
            bucket = storage.bucket()
            blob = bucket.blob(blob_name)
            
            # Upload file
            blob.upload_from_file(
                degree_file,
                content_type=degree_file.content_type
            )
            
            # Make it publicly accessible (optional - adjust based on your security needs)
            blob.make_public()
            degree_url = blob.public_url
            
            print(f"✅ File uploaded successfully: {blob_name}")
            
        except Exception as upload_error:
            print(f"❌ Firebase Storage Error: {upload_error}")
            return jsonify({"message": "Failed to upload degree proof"}), 500

        # 4. EXTRACT AND VALIDATE FORM DATA
        full_name = request.form.get('full_name').strip()
        specialization = request.form.get('specialization').strip()
        reg_number = request.form.get('reg_number').strip()
        medical_council = request.form.get('medical_council').strip()
        reg_year = request.form.get('reg_year').strip()
        experience_years = request.form.get('experience_years').strip()
        
        clinic_name = request.form.get('clinic_name').strip()
        address_line = request.form.get('address_line').strip()
        city = request.form.get('city', '').lower().strip()
        zip_code = request.form.get('zip_code').strip()
        google_maps_link = request.form.get('google_maps_link', '').strip()
        
        consultation_fee = request.form.get('consultation_fee').strip()
        morning_start = request.form.get('morning_start')
        morning_end = request.form.get('morning_end')
        evening_start = request.form.get('evening_start')
        evening_end = request.form.get('evening_end')

        # Parse days_open JSON
        days_open_str = request.form.get('days_open')
        try:
            days_open = json.loads(days_open_str) if days_open_str else {}
        except json.JSONDecodeError:
            return jsonify({"message": "Invalid days_open format"}), 400
        
        # Validate at least one day is selected
        if not any(days_open.values()):
            return jsonify({"message": "Please select at least one working day"}), 400

        # Validate numeric fields
        try:
            reg_year_int = int(reg_year)
            experience_years_int = int(experience_years)
            consultation_fee_int = int(consultation_fee)
            
            if reg_year_int < 1950 or reg_year_int > 2026:
                return jsonify({"message": "Invalid registration year"}), 400
            
            if experience_years_int < 0 or experience_years_int > 70:
                return jsonify({"message": "Invalid experience years"}), 400
            
            if consultation_fee_int < 0:
                return jsonify({"message": "Invalid consultation fee"}), 400
                
        except ValueError:
            return jsonify({"message": "Invalid numeric values provided"}), 400

        # 5. PREPARE DOCTOR DATA
        doctor_data = {
            "full_name": full_name,
            "specialization": specialization,
            "city": city,
            "consultation_fee": consultation_fee_int,
            "is_verified": False,
            "profile_completed": True,
            "created_at": datetime.now().isoformat(),

            "personal_details": {
                "reg_number": reg_number,
                "medical_council": medical_council,
                "reg_year": reg_year_int,
                "degree_proof_url": degree_url,
                "experience_years": experience_years_int
            },
            
            "clinic_details": {
                "name": clinic_name,
                "address": address_line,
                "zip_code": zip_code,
                "google_maps_link": google_maps_link if google_maps_link else None
            },
            
            "availability": {
                "days_open": days_open,
                "morning_shift": {
                    "start": morning_start,
                    "end": morning_end
                },
                "evening_shift": {
                    "start": evening_start,
                    "end": evening_end
                }
            }
        }

        # 6. SAVE TO FIRESTORE
        try:
            db.collection('doctors').document(uid).set(doctor_data)
            
            print(f"✅ Doctor profile saved for UID: {uid}")
            
            return jsonify({
                "message": "Doctor profile saved successfully",
                "uid": uid,
                "profile_completed": True
            }), 200

        except Exception as db_error:
            print(f"❌ Firestore Error: {db_error}")
            # If database save fails, try to delete the uploaded file
            try:
                blob.delete()
                print("🗑️ Cleaned up uploaded file after database error")
            except:
                pass
            return jsonify({"message": "Failed to save profile to database"}), 500

    except Exception as e:
        print(f"❌ Unexpected Error in doctor_form: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "An unexpected error occurred"}), 500

@app.route('/verify-token', methods=['POST'])
def verify_token():
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({"message": "No token provided", "verified": False}), 400

    uid = token_to_uid(token)
    
    if uid:
        return jsonify({
            "message": "Token is valid",
            "verified": True
        }), 200
    else:
        return jsonify({
            "message": "Token is expired or invalid", 
            "verified": False
        }), 401

@app.route('/update-location', methods=['POST'])
def update_location():
    data = request.get_json()
    token = data.get('token')
    
    uid = None
    if token:
        uid = token_to_uid(token)
    
    lat = data.get('lat')
    lng = data.get('lng')
    city = data.get('city', '').lower().strip()
    zip_code = data.get('zip_code')
    address = data.get('formatted_address')
    
    location_data = {
        "last_known_location": {
            "lat": lat,
            "lng": lng,
            "city": city,
            "zip_code": zip_code,
            "address": address,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
    }

    try:
        if uid:
            db.collection('patients').document(uid).set(location_data, merge=True)
            return jsonify({"message": "Location updated for user"}), 200
        else:
            return jsonify({"message": "Location received (Guest)"}), 200

    except Exception as e:
        print(f"Location Update Error: {e}")
        return jsonify({"error": "Failed to update location"}), 500

# --- DOCTOR ROUTES ---
@app.route('/signup-doctor', methods=['POST'])
def signup_doctor():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    phone_number = data.get('phone_number')
    user_type = "doctor"
    
    try:
        user = auth.create_user(
            email=email,
            password=password,
            phone_number=phone_number,
            disabled=False,
        )
        
        # Create user document
        user_data = {
            "email": email,
            "phone_number": phone_number,
            'user': user_type,
            'userName': get_username_from_email(email) # Saving default name
        }
        
        db.collection("users").document(user.uid).set(user_data)
        
        return jsonify({
            "message": "user created successfully",
            "uid": user.uid
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400    

@app.route('/login-doctor', methods=['POST'])
def login_doctor():
    data = request.get_json()
    token = data.get('token')
    
    try:
        decode_token = auth.verify_id_token(token)
        uid = decode_token['uid']
        
        user_doc = db.collection("users").document(uid).get()
        
        if not user_doc.exists:
             return jsonify({"message": "User not found"}), 404

        user_data = user_doc.to_dict()
        user_type = user_data.get("user")
        
        # Extract or generate a userName
        user_name = user_data.get("userName", get_username_from_email(user_data.get("email")))

        if user_type != "doctor":
            return jsonify({
                "message": "Login in on Patient login page",
            }), 403
            
        return jsonify({
            "message": "login successful",
            "token": token,
            "user": user_type,
            "userName": user_name,
            "user_data": user_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- PATIENT ROUTES ---
@app.route('/signup-patient', methods=['POST'])
def signup_patient():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    phone_number = data.get('phone_number')
    user_type = "patient"
    
    try:
        user = auth.create_user(
            email=email,
            password=password,
            phone_number=phone_number,
            disabled=False,
        )
        
        user_data = {
            "email": email,
            "phone_number": phone_number,
            'user': user_type,
            'userName': get_username_from_email(email)
        }

        db.collection("users").document(user.uid).set(user_data)
        
        return jsonify({
            "message": "user created successfully",
            "uid": user.uid
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400    

@app.route('/login-patient', methods=['POST'])
def login_patient():
    data = request.get_json()
    token = data.get('token')
    
    try:
        decode_token = auth.verify_id_token(token)
        uid = decode_token['uid']
        
        user_doc = db.collection("users").document(uid).get()
        
        if not user_doc.exists:
             return jsonify({"message": "User not found"}), 404

        user_data = user_doc.to_dict()
        user_type = user_data.get("user")
        
        # Extract or generate a userName
        user_name = user_data.get("userName", get_username_from_email(user_data.get("email")))

        if user_type != "patient":
            return jsonify({
                "message": "Login in on Doctor login page",
            }), 403
            
        return jsonify({
            "message": "login successful",
            "token": token,
            "user": user_type,
            "userName": user_name,
            "user_data": user_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400 

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the WaitFree Clinic Backend!"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)