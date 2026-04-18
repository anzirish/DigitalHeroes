import supabase from '../lib/supabase.js';

// Prize pool split across match tiers
const POOL_DISTRIBUTION = { '5-match': 0.40, '4-match': 0.35, '3-match': 0.25 };

// Fixed amount (£5) contributed to prize pool per active subscriber
const PRIZE_CONTRIBUTION_PER_USER = 5;

/**
 * Pick 5 unique random numbers between 1 and 45
 */
const generateRandomNumbers = () => {
  const numbers = new Set();
  while (numbers.size < 5) numbers.add(Math.floor(Math.random() * 45) + 1);
  return Array.from(numbers).sort((a, b) => a - b);
};

/**
 * Pick 5 numbers weighted by least-frequent user scores.
 * Less common scores get higher weight — harder to match = bigger prize.
 */
const generateAlgorithmicNumbers = async () => {
  const { data: scores } = await supabase.from('scores').select('score');
  if (!scores?.length) return generateRandomNumbers();

  // Count how often each score value appears
  const freq = {};
  for (const { score } of scores) freq[score] = (freq[score] || 0) + 1;

  // Build a weighted pool — infrequent scores appear more times
  const maxFreq = Math.max(...Object.values(freq));
  const pool = [];
  for (let i = 1; i <= 45; i++) {
    const weight = maxFreq - (freq[i] || 0) + 1;
    for (let w = 0; w < weight; w++) pool.push(i);
  }

  const numbers = new Set();
  while (numbers.size < 5) numbers.add(pool[Math.floor(Math.random() * pool.length)]);
  return Array.from(numbers).sort((a, b) => a - b);
};

/**
 * Count how many of a user's scores appear in the winning numbers
 */
const countMatches = (userScores, winningNumbers) => {
  const winSet = new Set(winningNumbers);
  return userScores.filter((s) => winSet.has(s)).length;
};

/**
 * Calculate total prize pool = active subscribers × £5 + any jackpot rollover
 */
const calculateTotalPool = async () => {
  const { count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_status', 'active');

  const { data: prevDraw } = await supabase
    .from('draws')
    .select('jackpot_rollover')
    .eq('status', 'published')
    .order('draw_month', { ascending: false })
    .limit(1)
    .single();

  return (count || 0) * PRIZE_CONTRIBUTION_PER_USER + (prevDraw?.jackpot_rollover || 0);
};

/**
 * Run the monthly draw.
 */
export const runDraw = async (drawId, mode = 'random', simulate = false) => {
  // Step 1: Generate winning numbers
  const winningNumbers = mode === 'algorithmic'
    ? await generateAlgorithmicNumbers()
    : generateRandomNumbers();

  // Step 2: Get all active subscribers and their scores
  const { data: users } = await supabase
    .from('users')
    .select('id, scores(score)')
    .eq('subscription_status', 'active');

  // Step 3: Calculate prize pool
  const totalPool = await calculateTotalPool();
  const pools = {
    '5-match': totalPool * POOL_DISTRIBUTION['5-match'],
    '4-match': totalPool * POOL_DISTRIBUTION['4-match'],
    '3-match': totalPool * POOL_DISTRIBUTION['3-match'],
  };

  // Step 4: Find winners by matching scores against winning numbers
  const winners = { '5-match': [], '4-match': [], '3-match': [] };
  for (const user of users || []) {
    const userScores = (user.scores || []).map((s) => s.score);
    const matches = countMatches(userScores, winningNumbers);
    if (matches === 5) winners['5-match'].push(user.id);
    else if (matches === 4) winners['4-match'].push(user.id);
    else if (matches === 3) winners['3-match'].push(user.id);
  }

  // Step 5: Split each tier's pool equally among winners in that tier
  const prizeBreakdown = {};
  for (const [tier, userIds] of Object.entries(winners)) {
    prizeBreakdown[tier] = {
      userIds,
      totalPool: pools[tier],
      perWinner: userIds.length > 0 ? pools[tier] / userIds.length : 0,
    };
  }

  // Jackpot rolls over to next month if nobody matched all 5
  const jackpotRollover = winners['5-match'].length === 0 ? pools['5-match'] : 0;

  // Return preview without saving if simulation mode
  if (simulate) return { winningNumbers, prizeBreakdown, jackpotRollover, totalPool, simulate: true };

  // Step 6: Save results to DB
  await supabase.from('draws').update({
    winning_numbers: winningNumbers,
    status: 'completed',
    total_pool: totalPool,
    jackpot_rollover: jackpotRollover,
    draw_mode: mode,
  }).eq('id', drawId);

  // Step 7: Insert winner records
  const winnerInserts = Object.entries(prizeBreakdown).flatMap(([tier, { userIds, perWinner }]) =>
    userIds.map((userId) => ({
      draw_id: drawId,
      user_id: userId,
      match_type: tier,
      prize_amount: perWinner,
      payment_status: 'pending',
    }))
  );

  if (winnerInserts.length > 0) await supabase.from('draw_winners').insert(winnerInserts);

  return { winningNumbers, prizeBreakdown, jackpotRollover, totalPool };
};
