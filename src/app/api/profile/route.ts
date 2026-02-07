import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from '@/lib/requestLimits';

const MAX_JSON_BYTES = 30_000;

// GET - Fetch agent profile and premium config
export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle');

  if (!handle) {
    return NextResponse.json(
      { error: 'Agent handle is required' },
      { status: 400 }
    );
  }

  const cleanHandle = handle.replace(/^@/, '').trim();
  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json({
      isPremium: false,
      premiumConfig: null,
      message: 'Database not configured',
    });
  }

  try {
    const { data: agent, error } = await supabase
      .from('agents')
      .select('id, handle, name, is_premium, premium_config')
      .eq('handle', cleanHandle)
      .single();

    if (error || !agent) {
      return NextResponse.json({
        isPremium: false,
        premiumConfig: null,
        message: 'Agent not found',
      });
    }

    return NextResponse.json({
      agentId: agent.id,
      handle: agent.handle,
      name: agent.name,
      isPremium: agent.is_premium || false,
      premiumConfig: agent.premium_config || null,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT - Update agent premium config
export async function PUT(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`profile:put:${ip}`, { windowMs: 60_000, max: 20 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const { agentHandle, premiumConfig } = await readJsonWithLimit<Record<string, unknown>>(req, MAX_JSON_BYTES);

    if (typeof agentHandle !== 'string' || !agentHandle.trim()) {
      return NextResponse.json(
        { error: 'Agent handle is required' },
        { status: 400 }
      );
    }

    const premiumConfigObj: Record<string, unknown> =
      premiumConfig && typeof premiumConfig === 'object' && !Array.isArray(premiumConfig)
        ? (premiumConfig as Record<string, unknown>)
        : {};

    const cleanHandle = agentHandle.replace(/^@/, '').trim();
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Verify agent exists and is premium
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('id, is_premium')
      .eq('handle', cleanHandle)
      .single();

    if (fetchError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (!agent.is_premium) {
      return NextResponse.json(
        { error: 'Premium subscription required to customize profile' },
        { status: 403 }
      );
    }

    // Validate and sanitize premium config
    const extendedBio = typeof premiumConfigObj.extendedBio === 'string' ? premiumConfigObj.extendedBio : '';
    const pinnedSkills = Array.isArray(premiumConfigObj.pinnedSkills) ? premiumConfigObj.pinnedSkills : [];
    const customLinks = Array.isArray(premiumConfigObj.customLinks) ? premiumConfigObj.customLinks : [];
    const accentColor = typeof premiumConfigObj.accentColor === 'string' ? premiumConfigObj.accentColor : '';

    const sanitizedConfig = {
      extendedBio: extendedBio.slice(0, 500),
      pinnedSkills: pinnedSkills.slice(0, 3),
      customLinks: customLinks
        .slice(0, 5)
        .map((link: unknown) => {
          const obj = (link && typeof link === 'object') ? (link as Record<string, unknown>) : {};
          const label = typeof obj.label === 'string' ? obj.label : '';
          const url = typeof obj.url === 'string' ? obj.url : '';
          return {
            label: label.slice(0, 50),
            url: url.slice(0, 200),
          };
        }),
      accentColor: /^#[0-9A-Fa-f]{6}$/.test(accentColor) 
        ? accentColor 
        : '#22d3ee',
    };

    // Update profile
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        premium_config: sanitizedConfig,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agent.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      premiumConfig: sanitizedConfig,
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (error as any)?.status === 'number' ? (error as any).status : 500;
    if (status === 413) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }

    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
