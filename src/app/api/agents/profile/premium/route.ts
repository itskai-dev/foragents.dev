import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * POST /api/agents/profile/premium
 * Update premium profile configuration
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentHandle, config } = body;

    if (!agentHandle || !config) {
      return NextResponse.json(
        { error: 'Agent handle and config required' },
        { status: 400 }
      );
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
    const validatedConfig = {
      accentColor: config.accentColor || '#06D6A0',
      extendedBio: (config.extendedBio || '').substring(0, 500),
      customLinks: (config.customLinks || []).slice(0, 5).map((link: any) => ({
        label: (link.label || '').substring(0, 50),
        url: (link.url || '').substring(0, 200),
        icon: (link.icon || '🔗').substring(0, 2),
      })),
      pinnedSkills: (config.pinnedSkills || []).slice(0, 3),
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
    console.error('Premium config update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
