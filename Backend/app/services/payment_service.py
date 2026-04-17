import os
import stripe
from datetime import datetime, timedelta
from app.db.firebase import get_db

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

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


def handle_checkout_completed(session):
    """Handle successful checkout completion."""
    doctor_uid = session['metadata'].get('doctor_uid')
    plan_type = session['metadata'].get('plan_type')
    billing_cycle = session['metadata'].get('billing_cycle')
    subscription_id = session.get('subscription')

    if doctor_uid:
        db = get_db()
        subscription_data = {
            'subscription': {
                'stripe_subscription_id': subscription_id,
                'plan_type': plan_type,
                'billing_cycle': billing_cycle,
                'status': 'trialing',
                'trial_end': datetime.now() + timedelta(days=14),
                'created_at': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            },
            'is_subscribed': True
        }
        db.collection('doctors').document(doctor_uid).set(subscription_data, merge=True)
        print(f"✅ Subscription created for doctor {doctor_uid}")


def handle_subscription_created(subscription):
    """Handle subscription creation."""
    doctor_uid = subscription['metadata'].get('doctor_uid')

    if doctor_uid:
        db = get_db()
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
    """Handle subscription updates (upgrades, downgrades, cancellations)."""
    db = get_db()
    customer_id = subscription.get('customer')

    query = db.collection('doctors').where('stripe_customer_id', '==', customer_id).limit(1)
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
    """Handle subscription cancellation."""
    db = get_db()
    customer_id = subscription.get('customer')

    query = db.collection('doctors').where('stripe_customer_id', '==', customer_id).limit(1)
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
    """Handle successful payment."""
    db = get_db()
    customer_id = invoice.get('customer')
    subscription_id = invoice.get('subscription')

    query = db.collection('doctors').where('stripe_customer_id', '==', customer_id).limit(1)
    results = query.stream()

    for doc in results:
        doctor_uid = doc.id
        paid_at_ts = invoice.get('status_transitions', {}).get('paid_at')
        payment_data = {
            'invoice_id': invoice['id'],
            'subscription_id': subscription_id,
            'amount_paid': invoice['amount_paid'],
            'currency': invoice['currency'],
            'status': 'paid',
            'paid_at': datetime.fromtimestamp(paid_at_ts).isoformat() if paid_at_ts else datetime.now().isoformat(),
            'invoice_pdf': invoice.get('invoice_pdf'),
            'created_at': datetime.now().isoformat()
        }
        db.collection('doctors').document(doctor_uid).collection('payment_history').add(payment_data)
        print(f"✅ Payment recorded for doctor {doctor_uid}")
        break


def handle_payment_failed(invoice):
    """Handle failed payment."""
    db = get_db()
    customer_id = invoice.get('customer')

    query = db.collection('doctors').where('stripe_customer_id', '==', customer_id).limit(1)
    results = query.stream()

    for doc in results:
        doctor_uid = doc.id
        subscription_data = {
            'subscription': {
                'payment_status': 'failed',
                'last_payment_error': invoice.get('last_payment_error', {}).get('message', 'Payment failed'),
                'last_updated': datetime.now().isoformat()
            }
        }
        db.collection('doctors').document(doctor_uid).set(subscription_data, merge=True)

        payment_data = {
            'invoice_id': invoice['id'],
            'status': 'failed',
            'error_message': invoice.get('last_payment_error', {}).get('message', 'Payment failed'),
            'attempted_at': datetime.now().isoformat()
        }
        db.collection('doctors').document(doctor_uid).collection('payment_history').add(payment_data)
        print(f"❌ Payment failed for doctor {doctor_uid}")
        break
