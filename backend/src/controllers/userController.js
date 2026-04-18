import { validationResult } from 'express-validator';
import supabase from '../lib/supabase.js';

/** GET /api/users/dashboard */
export const getDashboard = async (req, res) => {
  const userId = req.user.id;

  const [
    { data: user },
    { data: scores },
    { data: winnings },
    { data: upcomingDraw },
  ] = await Promise.all([
    supabase.from('users')
      .select('id, email, full_name, subscription_status, subscription_plan, subscription_end_date, charity_id, charity_percentage, charities(name, image_url)')
      .eq('id', userId).single(),
    supabase.from('scores')
      .select('*').eq('user_id', userId).order('score_date', { ascending: false }).limit(5),
    supabase.from('draw_winners')
      .select('id, match_type, prize_amount, payment_status, draws(draw_month)')
      .eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('draws')
      .select('id, draw_month, status').eq('status', 'pending')
      .order('draw_month', { ascending: true }).limit(1).single(),
  ]);

  const totalWon = (winnings || [])
    .filter((w) => w.payment_status === 'paid')
    .reduce((sum, w) => sum + (w.prize_amount || 0), 0);

  res.json({ user, scores: scores || [], winnings: winnings || [], totalWon, upcomingDraw });
};

/** PUT /api/users/profile */
export const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { full_name } = req.body;
  const { data, error } = await supabase
    .from('users').update({ full_name }).eq('id', req.user.id)
    .select('id, email, full_name').single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
