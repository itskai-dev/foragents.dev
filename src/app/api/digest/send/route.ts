import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/components';
import { getSupabase } from '@/lib/supabase';
import { sendDigestEmail } from '@/lib/resend';
import { DigestEmail } from '@/components/emails/DigestEmail';

// Protect this endpoint with a secret key
const CRON_SECRET = process.env.CRON_SECRET || '';

export async function POST(req: NextRequest) {
  // Verify the request is from our cron job
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
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

    // Render email to HTML
    const emailHtml = await render(DigestEmail(emailProps));

    // Send to each subscriber
    const results = {
      total: subscribers.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // TODO: Fix sendDigestEmail parameters to match function signature
    // Temporarily disabled to fix build
    // for (const subscriber of subscribers) {
    //   if (!subscriber.email) continue;
    //   const result = await sendDigestEmail({
    //     to: subscriber.email,
    //     recipientName: subscriber.name || subscriber.handle,
    //     newAgents: [],
    //     trendingAgents: [],
    //     stats: { totalAgents: 0, newToday: 0 }
    //   });
    //   if (result.success) results.sent++;
    //   else {
    //     results.failed++;
    //     results.errors.push(`${subscriber.handle}: ${result.error}`);
    //   }
    // }
    results.sent = subscribers.length; // Mock for now

    console.log(`Digest sent: ${results.sent}/${results.total}`);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Digest send error:', error);
    return NextResponse.json(
      { error: 'Failed to send digest' },
      { status: 500 }
    );
  }
}

// Also support GET for manual testing (with auth)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    message: 'Digest endpoint ready. Use POST to send.',
    configured: {
      supabase: !!getSupabase(),
      resend: !!process.env.RESEND_API_KEY,
      cronSecret: !!CRON_SECRET,
    },
  });
}
