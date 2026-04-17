import jwt from 'jsonwebtoken';
import supabase from '../lib/supabase.js';

/**
 * Verifies JWT toekn and attaches user to req.user
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, subscription_status')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
};

/**
 * Requires active subscription
 */
export const requireSubscription = (req, res, next) => {
  if (req.user.subscription_status !== 'active') {
    return res.status(403).json({ error: 'Active subscription required' });
  }
  next();
};

/**
 * Requires admin role
 */
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
