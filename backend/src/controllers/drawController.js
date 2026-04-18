import supabase from '../lib/supabase.js';

/** GET /api/draws */
export const getDraws = async (_req, res) => {
  const { data, error } = await supabase
    .from('draws')
    .select('id, draw_month, status, winning_numbers, published_at, jackpot_amount')
    .eq('status', 'published')
    .order('draw_month', { ascending: false })
    .limit(12);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

/** GET /api/draws/my/results */
export const getMyResults = async (req, res) => {
  const { data, error } = await supabase
    .from('draw_winners')
    .select('id, match_type, prize_amount, payment_status, proof_url, draws(draw_month, winning_numbers)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

/** GET /api/draws/:id */
export const getDraw = async (req, res) => {
  const { data: draw, error } = await supabase
    .from('draws').select('*').eq('id', req.params.id).single();

  if (error || !draw) return res.status(404).json({ error: 'Draw not found' });

  const { data: winners } = await supabase
    .from('draw_winners')
    .select('id, match_type, prize_amount, payment_status, users(full_name)')
    .eq('draw_id', req.params.id);

  res.json({ ...draw, winners });
};

/** POST /api/draws/:id/upload-proof */
export const uploadProof = async (req, res) => {
  const { proof_url } = req.body;

  const { data: winner } = await supabase
    .from('draw_winners')
    .select('id, user_id, payment_status')
    .eq('draw_id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (!winner) return res.status(404).json({ error: 'No winning entry found' });

  await supabase
    .from('draw_winners')
    .update({ proof_url, payment_status: 'pending_verification' })
    .eq('id', winner.id);

  res.json({ message: 'Proof submitted for review' });
};
