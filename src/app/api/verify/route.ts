import { NextRequest, NextResponse } from 'next/server';

interface AgentJson {
  name?: string;
  handle?: string;
  description?: string;
  version?: string;
  capabilities?: string[];
  contact?: {
    email?: string;
    url?: string;
  };
  [key: string]: unknown;
}

interface Check {
  name: string;
  passed: boolean;
  message: string;
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');

  if (!urlParam) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  // Normalize URL
  let targetUrl = urlParam.trim();
  
  // If it's just a domain, add the well-known path
  if (!targetUrl.includes('agent.json')) {
    // Remove protocol if present for domain check
    const domain = targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    targetUrl = `https://${domain}/.well-known/agent.json`;
  }
  
  // Ensure https
  if (!targetUrl.startsWith('http')) {
    targetUrl = `https://${targetUrl}`;
  }

  const checks: Check[] = [];
  let agent: AgentJson | undefined;
  let valid = false;

  try {
    // Check 1: Fetch the URL
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'forAgents.dev Verification Bot',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      checks.push({
        name: 'URL Accessible',
        passed: false,
        message: `HTTP ${response.status} - ${response.statusText}`,
      });
      
      return NextResponse.json({
        valid: false,
        url: targetUrl,
        checks,
        error: `Could not fetch agent.json (HTTP ${response.status})`,
      });
    }

    checks.push({
      name: 'URL Accessible',
      passed: true,
      message: 'agent.json is publicly accessible',
    });

    // Check 2: Valid JSON
    let data: AgentJson;
    try {
      data = await response.json();
      checks.push({
        name: 'Valid JSON',
        passed: true,
        message: 'File contains valid JSON',
      });
    } catch {
      checks.push({
        name: 'Valid JSON',
        passed: false,
        message: 'File is not valid JSON',
      });
      
      return NextResponse.json({
        valid: false,
        url: targetUrl,
        checks,
        error: 'agent.json is not valid JSON',
      });
    }

    // Check 3: Has name field
    if (data.name && typeof data.name === 'string' && data.name.trim()) {
      checks.push({
        name: 'Has Name',
        passed: true,
        message: `Name: "${data.name}"`,
      });
    } else {
      checks.push({
        name: 'Has Name',
        passed: false,
        message: 'Missing or empty "name" field',
      });
    }

    // Check 4: Has handle or identifier
    if (data.handle && typeof data.handle === 'string') {
      checks.push({
        name: 'Has Handle',
        passed: true,
        message: `Handle: @${data.handle}`,
      });
    } else {
      checks.push({
        name: 'Has Handle',
        passed: false,
        message: 'Missing "handle" field (recommended for discovery)',
      });
    }

    // Check 5: Has description
    if (data.description && typeof data.description === 'string' && data.description.length > 10) {
      checks.push({
        name: 'Has Description',
        passed: true,
        message: `${data.description.length} characters`,
      });
    } else {
      checks.push({
        name: 'Has Description',
        passed: false,
        message: 'Missing or too short description',
      });
    }

    // Check 6: Has version
    if (data.version) {
      checks.push({
        name: 'Has Version',
        passed: true,
        message: `Version: ${data.version}`,
      });
    } else {
      checks.push({
        name: 'Has Version',
        passed: false,
        message: 'Missing "version" field (recommended)',
      });
    }

    // Check 7: Has capabilities (optional but good)
    if (Array.isArray(data.capabilities) && data.capabilities.length > 0) {
      checks.push({
        name: 'Has Capabilities',
        passed: true,
        message: `${data.capabilities.length} capabilities listed`,
      });
    } else {
      checks.push({
        name: 'Has Capabilities',
        passed: false,
        message: 'No capabilities array (optional but recommended)',
      });
    }

    // Check 8: Has contact info
    if (data.contact && (data.contact.email || data.contact.url)) {
      checks.push({
        name: 'Has Contact',
        passed: true,
        message: data.contact.email || data.contact.url || 'Contact info present',
      });
    } else {
      checks.push({
        name: 'Has Contact',
        passed: false,
        message: 'No contact information (optional)',
      });
    }

    // Determine overall validity
    // Must have: accessible, valid JSON, name
    // Should have: handle, description
    const requiredPassed = checks.slice(0, 3).every(c => c.passed);
    const recommendedPassed = checks.slice(3, 5).filter(c => c.passed).length >= 1;
    valid = requiredPassed && recommendedPassed;

    agent = {
      name: data.name,
      handle: data.handle,
      description: data.description,
      version: data.version,
    };

    return NextResponse.json({
      valid,
      url: targetUrl,
      agent,
      checks,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    checks.push({
      name: 'URL Accessible',
      passed: false,
      message: message.includes('timeout') ? 'Request timed out' : message,
    });

    return NextResponse.json({
      valid: false,
      url: targetUrl,
      checks,
      error: `Failed to verify: ${message}`,
    });
  }
}
