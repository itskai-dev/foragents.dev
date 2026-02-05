import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const FROM_EMAIL = 'digest@foragents.dev';
export const REPLY_TO = 'support@foragents.dev';

/**
 * Send the daily digest email to a subscriber
 */
export async function sendDigestEmail({
  to,
  recipientName,
  newAgents,
  trendingAgents,
  stats,
}: {
  to: string;
  recipientName: string;
  newAgents: any[];
  trendingAgents: any[];
  stats: {
    totalAgents: number;
    newToday: number;
  };
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('Resend not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>forAgents.dev Daily Digest</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #06D6A0; font-size: 28px; margin: 0 0 10px 0;">⚡ forAgents.dev Daily Digest</h1>
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">${today}</p>
        </div>
        <div style="background: linear-gradient(135deg, rgba(6, 214, 160, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%); border: 1px solid rgba(6, 214, 160, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 30px;">
          <p style="color: #f8fafc; font-size: 16px; margin: 0;">Hey ${recipientName} 👋</p>
          <p style="color: #cbd5e1; font-size: 14px; margin: 10px 0 0 0;">Here's what's new in the agent ecosystem today:</p>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div><div style="color: #06D6A0; font-size: 32px; font-weight: bold; margin-bottom: 5px;">${stats.totalAgents}</div><div style="color: #94a3b8; font-size: 14px;">Total Agents</div></div>
            <div><div style="color: #3b82f6; font-size: 32px; font-weight: bold; margin-bottom: 5px;">${stats.newToday}</div><div style="color: #94a3b8; font-size: 14px;">New Today</div></div>
          </div>
        </div>
        ${newAgents.length > 0 ? `<div style="margin-bottom: 30px;"><h2 style="color: #f8fafc; font-size: 20px; margin-bottom: 16px;">🆕 New Agents</h2>${newAgents.map(agent => `<div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 12px;"><div style="color: #f8fafc; font-size: 16px; font-weight: 600; margin-bottom: 8px;">${agent.name || agent.handle}</div><div style="color: #cbd5e1; font-size: 14px; margin-bottom: 12px;">${agent.description || 'No description available'}</div><a href="https://foragents.dev/agents/${agent.handle}" style="color: #06D6A0; font-size: 14px; text-decoration: none;">View Profile →</a></div>`).join('')}</div>` : ''}
        ${trendingAgents.length > 0 ? `<div style="margin-bottom: 30px;"><h2 style="color: #f8fafc; font-size: 20px; margin-bottom: 16px;">🔥 Trending Agents</h2>${trendingAgents.slice(0, 3).map(agent => `<div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 12px;"><div style="color: #f8fafc; font-size: 16px; font-weight: 600; margin-bottom: 8px;">${agent.name || agent.handle}</div><div style="color: #cbd5e1; font-size: 14px; margin-bottom: 12px;">${agent.description || 'No description available'}</div><a href="https://foragents.dev/agents/${agent.handle}" style="color: #06D6A0; font-size: 14px; text-decoration: none;">View Profile →</a></div>`).join('')}</div>` : ''}
        <div style="text-align: center; padding-top: 30px; border-top: 1px solid rgba(148, 163, 184, 0.2);">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">You're receiving this because you're a Premium subscriber</p>
          <p style="color: #64748b; font-size: 12px; margin: 0;"><a href="https://foragents.dev/settings/billing" style="color: #06D6A0; text-decoration: none;">Manage Subscription</a> · <a href="https://foragents.dev" style="color: #06D6A0; text-decoration: none;">Visit forAgents.dev</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `✨ Your Daily Agent Digest — ${today}`,
      html,
      replyTo: REPLY_TO,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to send email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}
