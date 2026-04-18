import Razorpay from 'razorpay';
import crypto from 'crypto';
import supabase from '../lib/supabase.js';
import { sendSubscriptionConfirmation } from '../services/emailService.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Plan amounts
const PLAN_AMOUNTS = {
  monthly: 99900,  // ₹999/month
  yearly: 899900,  // ₹8999/year
};

/** POST /api/subscriptions/create-order */
export const createOrder = async (req, res) => {
  const { plan } = req.body;
  const amount = PLAN_AMOUNTS[plan];
  if (!amount) return res.status(400).json({ error: 'Invalid plan' });

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${req.user.id.slice(0, 8)}_${Date.now().toString().slice(-8)}`,
      notes: { user_id: req.user.id, plan },
    });

    res.json({ order_id: order.id, amount: order.amount, currency: order.currency, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

/** POST /api/subscriptions/verify */
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

  // Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  const endDate = new Date();
  plan === 'yearly'
    ? endDate.setFullYear(endDate.getFullYear() + 1)
    : endDate.setMonth(endDate.getMonth() + 1);

  try {
    await supabase.from('users').update({
      subscription_status: 'active',
      subscription_plan: plan,
      subscription_end_date: endDate.toISOString(),
      razorpay_payment_id,
    }).eq('id', req.user.id);

    await supabase.from('subscriptions').insert({
      user_id: req.user.id,
      razorpay_payment_id,
      razorpay_order_id,
      plan,
      status: 'active',
      started_at: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Subscription activated' });

    // Send confirmation email
    supabase.from('users').select('email, full_name').eq('id', req.user.id).single()
      .then(({ data: u }) => { if (u) sendSubscriptionConfirmation(u, plan).catch(console.error); });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
};

/** POST /api/subscriptions/cancel */
export const cancelSubscription = async (req, res) => {
  await supabase.from('users').update({ subscription_status: 'cancelling' }).eq('id', req.user.id);
  res.json({ message: 'Subscription marked for cancellation at period end' });
};

/** GET /api/subscriptions/status */
export const getStatus = async (req, res) => {
  const { data: user } = await supabase
    .from('users')
    .select('subscription_status, subscription_plan, subscription_end_date')
    .eq('id', req.user.id)
    .single();
  res.json(user);
};
