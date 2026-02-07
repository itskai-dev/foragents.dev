import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/components';
import { checkRateLimit, getClientIp, rateLimitResponse, readTextWithLimit } from '@/lib/requestLimits';
import { requireCronAuth } from '@/lib/server/cron-auth';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { resend, FROM_EMAIL, REPLY_TO } from '@/lib/resend';
import { DigestEmail } from '@/components/emails/DigestEmail';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`digest:send:${ip}`, { windowMs: 60_000, max: 10 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    // Enforce a small body cap even though we don't use the body.
    await readTextWithLimit(req, 2_000);

    const auth = requireCronAuth(req);
    if (!auth.authorized) return auth.response;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get premium subscribers with email
    const { data: subscribers, error: subError } = await supabase
      .from('agents')
      .select('id, handle, email')
      .eq('is_premium', true)
      .not('email', 'is', null);

    if (subError || !subscribers) {
      console.error('Failed to fetch subscribers:', subError);
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    // Get new skills from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: newSkills } = await supabase
      .from('skills')
      .select('name, description, slug')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Get trending agents (by views if we track that, otherwise just recent)
    const { data: trendingAgents } = await supabase
      .from('agents')
      .select('handle, name')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get stats
    const { count: newAgentCount } = await supabase
      .from('agents')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString());

    const { count: totalArticles } = await supabase
      .from('news')
      .select('id', { count: 'exact', head: true });

    // Prepare email content
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const emailProps = {
      skills: newSkills || [],
      trendingAgents: (trendingAgents || []).map((a) => ({
        ...a,
        views: Math.floor(Math.random() * 100) + 10, // Placeholder until we have real analytics
      })),
      stats: {
        newAgents: newAgentCount || 0,
        newSkills: newSkills?.length || 0,
        totalArticles: totalArticles || 0,
      },
      date: today,
    };

    // Render email to HTML (same content for all recipients)
    const emailHtml = await render(DigestEmail(emailProps));

    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Send to each subscriber
    const results = {
      total: subscribers.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    const subject = `🤖 forAgents.dev Daily Digest — ${today}`;

    for (const subscriber of subscribers) {
      if (!subscriber.email) continue;

      try {
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: subscriber.email,
          subject,
          html: emailHtml,
          replyTo: REPLY_TO,
        });

        if (error) {
          results.failed++;
          results.errors.push(`${subscriber.handle}: ${error.message}`);
        } else {
          results.sent++;
        }
      } catch (err) {
        results.failed++;
        results.errors.push(`${subscriber.handle}: Failed to send`);
        console.error('Digest send failed:', err);
      }
    }

    console.log(`Digest sent: ${results.sent}/${results.total}`);

    return NextResponse.json({
      success: results.failed === 0,
      results,
    });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === 'number' ? (err as any).status : 500;
    if (status === 413) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }

    console.error('Digest send error:', err);
    return NextResponse.json({ error: 'Failed to send digest' }, { status: 500 });
  }
}

// Also support GET for manual testing (with auth)
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`digest:send:get:${ip}`, { windowMs: 60_000, max: 30 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  const auth = requireCronAuth(req);
  if (!auth.authorized) return auth.response;

  return NextResponse.json({
    message: 'Digest endpoint ready. Use POST to send.',
    configured: {
      supabaseAdmin: !!getSupabaseAdmin(),
      resend: !!process.env.RESEND_API_KEY,
      cronSecret: !!process.env.CRON_SECRET,
    },
  });
}
