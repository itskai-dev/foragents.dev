import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from '@/lib/requestLimits';

/**
 * POST /api/agents/profile/premium
 * Update premium profile configuration
 */
const MAX_JSON_BYTES = 12_000;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`premium_profile:${ip}`, { windowMs: 60_000, max: 20 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  try {
    const body = await readJsonWithLimit<Record<string, unknown>>(req, MAX_JSON_BYTES);
    const agentHandle = body.agentHandle;
    const config = body.config;

    if (typeof agentHandle !== 'string' || !agentHandle.trim() || typeof config !== 'object' || !config) {
      return NextResponse.json({ error: 'Agent handle and config required' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Verify agent exists and is premium
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('id, is_premium')
      .eq('handle', agentHandle.replace('@', ''))
      .single();

    if (fetchError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (!agent.is_premium) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    // Validate config
    const cfg = config as Record<string, unknown>;
    const validatedConfig = {
      accentColor: typeof cfg.accentColor === 'string' ? cfg.accentColor : '#06D6A0',
      extendedBio: (typeof cfg.extendedBio === 'string' ? cfg.extendedBio : '').substring(0, 500),
      customLinks: (Array.isArray(cfg.customLinks) ? cfg.customLinks : [])
        .slice(0, 5)
        .map((link: unknown) => {
          const obj = (link && typeof link === 'object') ? (link as Record<string, unknown>) : {};
          const label = typeof obj.label === 'string' ? obj.label : '';
          const url = typeof obj.url === 'string' ? obj.url : '';
          const icon = typeof obj.icon === 'string' ? obj.icon : '🔗';

          return {
            label: label.substring(0, 50),
            url: url.substring(0, 200),
            icon: icon.substring(0, 2),
          };
        }),
      pinnedSkills: (Array.isArray(cfg.pinnedSkills) ? cfg.pinnedSkills : []).slice(0, 3),
    };

    // Update premium config
    const { error: updateError } = await supabase
      .from('agents')
      .update({ premium_config: validatedConfig })
      .eq('id', agent.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
    }

    return NextResponse.json({ success: true, config: validatedConfig });
  } catch (err) {
    if (typeof err === 'object' && err && 'status' in err && (err as { status?: unknown }).status === 413) {
      return NextResponse.json({ error: 'payload too large' }, { status: 413 });
    }

    console.error('Premium config update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
