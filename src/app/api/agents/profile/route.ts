import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * GET /api/agents/profile?handle=xxx
 * Fetch agent profile with premium config
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle required' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { data: agent, error } = await supabase
      .from('agents')
      .select('id, handle, name, is_premium, premium_config, premium_expires_at')
      .eq('handle', handle.replace('@', ''))
      .single();

    if (error || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: agent.id,
      handle: agent.handle,
      name: agent.name,
      isPremium: agent.is_premium,
      premiumConfig: agent.premium_config || {},
      premiumExpiresAt: agent.premium_expires_at,
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
