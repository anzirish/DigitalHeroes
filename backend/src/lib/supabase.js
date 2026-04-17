import { createClient } from '@supabase/supabase-js';

/**
 * Create supabase client service
 */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default supabase;
