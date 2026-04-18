import { validationResult } from 'express-validator';
import supabase from '../lib/supabase.js';

const MAX_SCORES = 5;

/** GET /api/scores */
export const getScores = async (req, res) => {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', req.user.id)
    .order('score_date', { ascending: false })
    .limit(MAX_SCORES);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

/** POST /api/scores */
export const addScore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { score, score_date } = req.body;
  const dateStr = new Date(score_date).toISOString().split('T')[0];

  try {
    // Reject duplicate date
    const { data: existing } = await supabase
      .from('scores').select('id').eq('user_id', req.user.id).eq('score_date', dateStr).single();

    if (existing) {
      return res.status(409).json({ error: 'A score for this date already exists. Edit or delete it instead.' });
    }

    // Rolling window — delete oldest if at max
    const { data: currentScores } = await supabase
      .from('scores').select('id, score_date').eq('user_id', req.user.id).order('score_date', { ascending: true });

    if (currentScores && currentScores.length >= MAX_SCORES) {
      await supabase.from('scores').delete().eq('id', currentScores[0].id);
    }

    const { data, error } = await supabase
      .from('scores')
      .insert({ user_id: req.user.id, score, score_date: dateStr })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** PUT /api/scores/:id */
export const updateScore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { data: existing } = await supabase
    .from('scores').select('id, user_id').eq('id', req.params.id).single();

  if (!existing || existing.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Score not found' });
  }

  const { data, error } = await supabase
    .from('scores').update({ score: req.body.score }).eq('id', req.params.id).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

/** DELETE /api/scores/:id */
export const deleteScore = async (req, res) => {
  const { data: existing } = await supabase
    .from('scores').select('id, user_id').eq('id', req.params.id).single();

  if (!existing || existing.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Score not found' });
  }

  await supabase.from('scores').delete().eq('id', req.params.id);
  res.json({ message: 'Score deleted' });
};
