import crypto from 'crypto';
import supabase from '../lib/supabase.js';

/** POST /api/webhooks/razorpay */
export const razorpayWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const { event, payload } = req.body;

  try {
    switch (event) {
      case 'payment.captured': {
        const payment = payload.payment.entity;
        const userId = payment.notes?.user_id;
        const plan = payment.notes?.plan;

        if (userId && plan) {
          const endDate = new Date();
          plan === 'yearly'
            ? endDate.setFullYear(endDate.getFullYear() + 1)
            : endDate.setMonth(endDate.getMonth() + 1);

          await supabase.from('users').update({
            subscription_status: 'active',
            subscription_plan: plan,
            subscription_end_date: endDate.toISOString(),
            razorpay_payment_id: payment.id,
          }).eq('id', userId);
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload.payment.entity;
        const userId = payment.notes?.user_id;
        if (userId) {
          await supabase.from('users').update({ subscription_status: 'inactive' }).eq('id', userId);
        }
        break;
      }

      case 'subscription.cancelled': {
        const sub = payload.subscription.entity;
        const { data: user } = await supabase
          .from('users').select('id').eq('razorpay_payment_id', sub.id).single();

        if (user) {
          await supabase.from('users').update({ subscription_status: 'inactive' }).eq('id', user.id);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
