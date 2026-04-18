import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || 'GolfGives <noreply@golfgives.com>';

/**
 * Send subscription confirmation email
 */
export const sendSubscriptionConfirmation = async (user, plan) => {
  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: 'Welcome to GolfGives — Subscription Confirmed',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0f0d;color:#fff;padding:32px;border-radius:16px;">
        <h1 style="color:#22c55e;font-size:24px;margin-bottom:8px;">You're in, ${user.full_name?.split(' ')[0]}! 🎉</h1>
        <p style="color:#9ca3af;">Your <strong style="color:#fff;">${plan}</strong> subscription is now active.</p>
        <p style="color:#9ca3af;">Start entering your Stableford scores and you'll automatically be entered into the next monthly draw.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;margin-top:24px;background:#22c55e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">
          Go to Dashboard
        </a>
        <p style="color:#4b5563;font-size:12px;margin-top:32px;">GolfGives · Play. Win. Give.</p>
      </div>
    `,
  });
};

/**
 * Send draw results to all participants
 */
export const sendDrawResults = async (user, draw, matchType, prizeAmount) => {
  const isWinner = !!matchType;
  const subject = isWinner
    ? `🏆 You won the ${draw.draw_month} draw!`
    : `Draw results are in — ${draw.draw_month}`;

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0f0d;color:#fff;padding:32px;border-radius:16px;">
        ${isWinner ? `
          <h1 style="color:#f59e0b;font-size:24px;margin-bottom:8px;">You're a winner! 🏆</h1>
          <p style="color:#9ca3af;">You matched <strong style="color:#fff;">${matchType}</strong> in the ${draw.draw_month} draw.</p>
          <p style="color:#9ca3af;">Prize amount: <strong style="color:#f59e0b;font-size:20px;">£${Number(prizeAmount).toFixed(2)}</strong></p>
          <p style="color:#9ca3af;">Please upload your score proof to claim your prize.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;margin-top:24px;background:#f59e0b;color:#0a0f0d;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;">
            Claim Prize
          </a>
        ` : `
          <h1 style="color:#22c55e;font-size:24px;margin-bottom:8px;">Draw Results</h1>
          <p style="color:#9ca3af;">The ${draw.draw_month} draw has been completed.</p>
          <p style="color:#9ca3af;">Winning numbers: <strong style="color:#fff;">${draw.winning_numbers?.join(', ')}</strong></p>
          <p style="color:#9ca3af;">Better luck next month! Keep entering your scores.</p>
          <a href="${process.env.FRONTEND_URL}/draws" style="display:inline-block;margin-top:24px;background:#22c55e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">
            View Results
          </a>
        `}
        <p style="color:#4b5563;font-size:12px;margin-top:32px;">GolfGives · Play. Win. Give.</p>
      </div>
    `,
  });
};

/**
 * Send winner payout confirmation
 */
export const sendPayoutConfirmation = async (user, prizeAmount) => {
  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: 'GolfGives — Your prize has been paid!',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0f0d;color:#fff;padding:32px;border-radius:16px;">
        <h1 style="color:#22c55e;font-size:24px;margin-bottom:8px;">Payment sent! 💸</h1>
        <p style="color:#9ca3af;">Your prize of <strong style="color:#f59e0b;">£${Number(prizeAmount).toFixed(2)}</strong> has been processed.</p>
        <p style="color:#9ca3af;">Thank you for playing and giving with GolfGives.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;margin-top:24px;background:#22c55e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">
          View Dashboard
        </a>
        <p style="color:#4b5563;font-size:12px;margin-top:32px;">GolfGives · Play. Win. Give.</p>
      </div>
    `,
  });
};
