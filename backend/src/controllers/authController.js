import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import supabase from '../lib/supabase.js';

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/** POST /api/auth/register */
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, full_name, charity_id, charity_percentage = 10 } = req.body;

  try {
    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).single();

    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ email, password_hash, full_name, charity_id: charity_id || null, charity_percentage, role: 'subscriber', subscription_status: 'inactive' })
      .select('id, email, full_name, role, subscription_status')
      .single();

    if (error) throw error;

    res.status(201).json({ token: generateToken(user.id), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/** POST /api/auth/login */
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, password_hash, role, subscription_status')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { password_hash, ...safeUser } = user;
    res.json({ token: generateToken(user.id), user: safeUser });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
};

/** GET /api/auth/me */
export const me = async (req, res) => {
  const { data: user } = await supabase
    .from('users')
    .select('id, email, full_name, role, subscription_status, charity_id, charity_percentage, created_at')
    .eq('id', req.user.id)
    .single();
  res.json(user);
};
