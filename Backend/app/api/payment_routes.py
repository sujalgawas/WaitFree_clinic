import os
import stripe
import traceback
from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from app.services.auth_service import token_to_uid
from app.services.payment_service import (
    PRICING_PLANS, handle_checkout_completed, handle_subscription_created,
    handle_subscription_updated, handle_subscription_deleted,
    handle_payment_succeeded, handle_payment_failed
)
from app.db.firebase import get_db

payment_bp = Blueprint('payment', __name__)


@payment_bp.route('/get-pricing-plans', methods=['GET'])
def get_pricing_plans():
    try:
        return jsonify({"success": True, "plans": PRICING_PLANS}), 200
    except Exception as e:
        print(f"Error fetching pricing plans: {e}")
        return jsonify({"error": "Failed to fetch pricing plans"}), 500


@payment_bp.route('/create-checkout-session', methods=['POST', 'OPTIONS'])
def create_checkout_session():
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200

    try:
        data = request.get_json()
        token = data.get('token')
        plan_type = data.get('plan_type')
        billing_cycle = data.get('billing_cycle')

        print(f"📝 Received request - Plan: {plan_type}, Cycle: {billing_cycle}")

        doctor_uid = token_to_uid(token)
        if not doctor_uid:
            print("❌ Unauthorized - Invalid token")
            return jsonify({"success": False, "message": "Unauthorized"}), 401

        print(f"✅ Doctor authenticated: {doctor_uid}")

        if plan_type not in PRICING_PLANS:
            print(f"❌ Invalid plan type: {plan_type}")
            return jsonify({"success": False, "message": "Invalid plan type"}), 400

        if billing_cycle not in ['monthly', 'yearly']:
            print(f"❌ Invalid billing cycle: {billing_cycle}")
            return jsonify({"success": False, "message": "Invalid billing cycle"}), 400

        plan = PRICING_PLANS[plan_type]
        price_details = plan[billing_cycle]
        stripe_price_id = price_details['stripe_price_id']

        if not stripe.api_key or stripe.api_key == '':
            print("❌ Stripe API key not configured")
            return jsonify({"success": False, "message": "Payment system not configured. Please contact support."}), 500

        if not stripe_price_id or stripe_price_id == '':
            print(f"❌ Stripe price ID not configured for {plan_type} {billing_cycle}")
            return jsonify({"success": False, "message": f"Pricing not configured for {plan_type} plan. Please contact support."}), 500

        print(f"💳 Using Stripe Price ID: {stripe_price_id}")

        db = get_db()
        doctor_email = None
        doctor_name = None
        doctor_data = {}
        doctor_doc = None

        try:
            user_doc = db.collection('users').document(doctor_uid).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                doctor_email = user_data.get('email')
                print(f"📧 Email from users collection: {doctor_email}")
        except Exception as e:
            print(f"⚠️ Error fetching from users collection: {e}")

        try:
            doctor_doc = db.collection('doctors').document(doctor_uid).get()
            if doctor_doc.exists:
                doctor_data = doctor_doc.to_dict()
                doctor_name = doctor_data.get('full_name', 'Doctor')
                if not doctor_email:
                    doctor_email = doctor_data.get('email')
                print(f"👤 Doctor name: {doctor_name}")
        except Exception as e:
            print(f"⚠️ Error fetching from doctors collection: {e}")

        if not doctor_email:
            doctor_email = f"doctor_{doctor_uid}@waitfreeclinic.com"
            print(f"⚠️ Using fallback email: {doctor_email}")

        customer_id = None
        try:
            if doctor_doc and doctor_doc.exists:
                customer_id = doctor_data.get('stripe_customer_id')
                print(f"🔍 Existing customer ID: {customer_id}")

            if not customer_id:
                print("🆕 Creating new Stripe customer...")
                customer = stripe.Customer.create(
                    email=doctor_email,
                    name=doctor_name,
                    metadata={'doctor_uid': doctor_uid, 'user_type': 'doctor'}
                )
                customer_id = customer.id
                print(f"✅ Created customer: {customer_id}")

                db.collection('doctors').document(doctor_uid).set({
                    'stripe_customer_id': customer_id,
                    'email': doctor_email
                }, merge=True)

        except Exception as customer_error:
            print(f"❌ Error creating/retrieving customer: {customer_error}")
            traceback.print_exc()
            return jsonify({"success": False, "message": "Failed to process customer information"}), 500

        try:
            print("🛒 Creating checkout session...")
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')

            checkout_session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card'],
                line_items=[{'price': stripe_price_id, 'quantity': 1}],
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
            return jsonify({"success": False, "message": f"Payment system error: {str(stripe_error)}"}), 500
        except Exception as checkout_error:
            print(f"❌ Error creating checkout session: {checkout_error}")
            traceback.print_exc()
            return jsonify({"success": False, "message": "Failed to create checkout session"}), 500

    except Exception as e:
        print(f"❌ Error in create_checkout_session: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": "An unexpected error occurred"}), 500


@payment_bp.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except ValueError as e:
        print(f"Invalid payload: {e}")
        return jsonify({"error": "Invalid payload"}), 400
    except stripe.error.SignatureVerificationError as e:
        print(f"Invalid signature: {e}")
        return jsonify({"error": "Invalid signature"}), 400

    event_type = event['type']
    print(f"📨 Webhook received: {event_type}")

    try:
        if event_type == 'checkout.session.completed':
            handle_checkout_completed(event['data']['object'])
        elif event_type == 'customer.subscription.created':
            handle_subscription_created(event['data']['object'])
        elif event_type == 'customer.subscription.updated':
            handle_subscription_updated(event['data']['object'])
        elif event_type == 'customer.subscription.deleted':
            handle_subscription_deleted(event['data']['object'])
        elif event_type == 'invoice.payment_succeeded':
            handle_payment_succeeded(event['data']['object'])
        elif event_type == 'invoice.payment_failed':
            handle_payment_failed(event['data']['object'])

        return jsonify({"success": True}), 200

    except Exception as e:
        print(f"Webhook handling error: {e}")
        traceback.print_exc()
        return jsonify({"error": "Webhook processing failed"}), 500


@payment_bp.route('/get-subscription-status', methods=['POST'])
def get_subscription_status():
    try:
        data = request.get_json()
        token = data.get('token')

        doctor_uid = token_to_uid(token)
        if not doctor_uid:
            return jsonify({"message": "Unauthorized"}), 401

        db = get_db()
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


@payment_bp.route('/cancel-subscription', methods=['POST'])
def cancel_subscription():
    try:
        data = request.get_json()
        token = data.get('token')
        cancel_immediately = data.get('cancel_immediately', False)

        doctor_uid = token_to_uid(token)
        if not doctor_uid:
            return jsonify({"message": "Unauthorized"}), 401

        db = get_db()
        doctor_doc = db.collection('doctors').document(doctor_uid).get()

        if not doctor_doc.exists:
            return jsonify({"message": "Doctor not found"}), 404

        doctor_data = doctor_doc.to_dict()
        subscription_id = doctor_data.get('subscription', {}).get('stripe_subscription_id')

        if not subscription_id:
            return jsonify({"message": "No active subscription found"}), 404

        try:
            if cancel_immediately:
                stripe.Subscription.delete(subscription_id)
            else:
                stripe.Subscription.modify(subscription_id, cancel_at_period_end=True)

            return jsonify({"success": True, "message": "Subscription cancelled successfully"}), 200

        except Exception as stripe_error:
            print(f"Stripe cancellation error: {stripe_error}")
            return jsonify({"message": "Failed to cancel subscription"}), 500

    except Exception as e:
        print(f"Error cancelling subscription: {e}")
        return jsonify({"error": "Failed to cancel subscription"}), 500


@payment_bp.route('/get-payment-history', methods=['POST'])
def get_payment_history():
    try:
        data = request.get_json()
        token = data.get('token')

        doctor_uid = token_to_uid(token)
        if not doctor_uid:
            return jsonify({"message": "Unauthorized"}), 401

        db = get_db()
        payments_ref = db.collection('doctors').document(doctor_uid).collection('payment_history')
        query = payments_ref.order_by('created_at', direction=firestore.Query.DESCENDING)
        results = query.stream()

        payment_history = []
        for doc in results:
            payment = doc.to_dict()
            payment['id'] = doc.id
            payment_history.append(payment)

        return jsonify({"success": True, "payment_history": payment_history}), 200

    except Exception as e:
        print(f"Error fetching payment history: {e}")
        return jsonify({"error": "Failed to fetch payment history"}), 500
