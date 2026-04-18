import supabase from '../lib/supabase.js';

/** GET /api/charities */
export const getCharities = async (req, res) => {
  const { search, featured } = req.query;

  let query = supabase
    .from('charities')
    .select('id, name, description, image_url, is_featured, website_url')
    .eq('is_active', true)
    .order('is_featured', { ascending: false });

  if (search) query = query.ilike('name', `%${search}%`);
  if (featured === 'true') query = query.eq('is_featured', true);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

/** GET /api/charities/:id */
export const getCharity = async (req, res) => {
  const { data, error } = await supabase
    .from('charities').select('*').eq('id', req.params.id).eq('is_active', true).single();

  if (error || !data) return res.status(404).json({ error: 'Charity not found' });
  res.json(data);
};

/** PUT /api/charities/select */
export const selectCharity = async (req, res) => {
  const { charity_id, charity_percentage } = req.body;

  if (charity_percentage < 10 || charity_percentage > 100) {
    return res.status(400).json({ error: 'Charity percentage must be between 10 and 100' });
  }

  const { error } = await supabase
    .from('users').update({ charity_id, charity_percentage }).eq('id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Charity updated' });
};
