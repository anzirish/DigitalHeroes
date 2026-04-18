import supabase from '../lib/supabase.js';
import { runDraw } from '../services/drawEngine.js';
import { sendDrawResults, sendPayoutConfirmation } from '../services/emailService.js';

/** GET /api/admin/users */
export const getUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('users')
    .select('id, email, full_name, role, subscription_status, subscription_plan, created_at, charity_id', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (search) query = query.ilike('email', `%${search}%`);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, total: count, page: Number(page), limit: Number(limit) });
};

/** GET /api/admin/users/:id */
export const getUser = async (req, res) => {
  const { data, error } = await supabase
    .from('users').select('*, scores(*)').eq('id', req.params.id).single();

  if (error || !data) return res.status(404).json({ error: 'User not found' });
  res.json(data);
};

/** PUT /api/admin/users/:id */
export const updateUser = async (req, res) => {
  const { full_name, subscription_status, role } = req.body;
  const { data, error } = await supabase
    .from('users').update({ full_name, subscription_status, role })
    .eq('id', req.params.id).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

/** GET /api/admin/draws */
export const getDraws = async (_req, res) => {
  const { data, error } = await supabase
    .from('draws').select('*').order('draw_month', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

/** POST /api/admin/draws */
export const createDraw = async (req, res) => {
  const { draw_month, draw_mode = 'random' } = req.body;
  const { data, error } = await supabase
    .from('draws').insert({ draw_month, draw_mode, status: 'pending' }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

/** POST /api/admin/draws/:id/simulate */
export const simulateDraw = async (req, res) => {
  try {
    const result = await runDraw(req.params.id, req.body.draw_mode || 'random', true);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** POST /api/admin/draws/:id/run */
export const executeDraw = async (req, res) => {
  try {
    const result = await runDraw(req.params.id, req.body.draw_mode || 'random', false);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** POST /api/admin/draws/:id/publish */
export const publishDraw = async (req, res) => {
  const { data, error } = await supabase
    .from('draws')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', req.params.id).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);

  // Send draw result emails to all active subscribers (non-blocking)
  supabase.from('users').select('id, email, full_name').eq('subscription_status', 'active')
    .then(async ({ data: users }) => {
      if (!users) return;
      const { data: winners } = await supabase
        .from('draw_winners').select('user_id, match_type, prize_amount').eq('draw_id', req.params.id);
      const winnerMap = {};
      (winners || []).forEach((w) => { winnerMap[w.user_id] = w; });
      for (const user of users) {
        const win = winnerMap[user.id];
        sendDrawResults(user, data, win?.match_type || null, win?.prize_amount || 0).catch(console.error);
      }
    });
};

/** POST /api/admin/charities */
export const createCharity = async (req, res) => {
  const { name, description, image_url, website_url, is_featured } = req.body;
  const { data, error } = await supabase
    .from('charities').insert({ name, description, image_url, website_url, is_featured, is_active: true }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

/** PUT /api/admin/charities/:id */
export const updateCharity = async (req, res) => {
  const { name, description, image_url, website_url, is_featured, is_active } = req.body;
  const { data, error } = await supabase
    .from('charities').update({ name, description, image_url, website_url, is_featured, is_active })
    .eq('id', req.params.id).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

/** DELETE /api/admin/charities/:id */
export const deleteCharity = async (req, res) => {
  await supabase.from('charities').update({ is_active: false }).eq('id', req.params.id);
  res.json({ message: 'Charity deactivated' });
};

/** GET /api/admin/winners */
export const getWinners = async (req, res) => {
  const { status } = req.query;
  let query = supabase
    .from('draw_winners')
    .select('*, users(full_name, email), draws(draw_month)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('payment_status', status);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

/** PUT /api/admin/winners/:id/verify */
export const verifyWinner = async (req, res) => {
  const status = req.body.action === 'approve' ? 'approved' : 'rejected';
  const { data, error } = await supabase
    .from('draw_winners').update({ payment_status: status })
    .eq('id', req.params.id).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

/** PUT /api/admin/winners/:id/mark-paid */
export const markPaid = async (req, res) => {
  const { data, error } = await supabase
    .from('draw_winners')
    .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*, users(email, full_name)')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);

  // Send payout confirmation email (non-blocking)
  if (data?.users?.email) {
    sendPayoutConfirmation(data.users, data.prize_amount).catch(console.error);
  }
};

/** GET /api/admin/analytics */
export const getAnalytics = async (_req, res) => {
  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: charityTotals },
    { data: drawStats },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabase.from('users').select('charity_id, charity_percentage').eq('subscription_status', 'active'),
    supabase.from('draws').select('id, draw_month, total_pool, status').order('draw_month', { ascending: false }).limit(6),
  ]);

  res.json({ totalUsers, activeSubscribers, charityTotals, drawStats });
};
