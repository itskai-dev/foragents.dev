import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SUBMISSIONS_PATH = path.join(process.cwd(), "data", "submissions.json");

type Submission = {
  id: string;
  type: "skill" | "mcp" | "agent";
  name: string;
  description: string;
  url: string;
  author: string;
  tags: string[];
  install_cmd?: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
};

async function readSubmissions(): Promise<Submission[]> {
  try {
    const raw = await fs.readFile(SUBMISSIONS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeSubmissions(submissions: Submission[]): Promise<void> {
  await fs.writeFile(SUBMISSIONS_PATH, JSON.stringify(submissions, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { type, name, description, url, author, tags, install_cmd } = body;

    const errors: string[] = [];
    if (!type || !["skill", "mcp", "agent"].includes(type)) {
      errors.push('type must be one of: "skill", "mcp", "agent"');
    }
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.push("name is required");
    }
    if (!description || typeof description !== "string" || description.trim().length === 0) {
      errors.push("description is required");
    }
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      errors.push("url is required and must be a valid URL");
    }
    if (!author || typeof author !== "string" || author.trim().length === 0) {
      errors.push("author is required");
    }
    if (!Array.isArray(tags) || tags.length === 0) {
      errors.push("tags must be a non-empty array of strings");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Check for duplicate names
    const submissions = await readSubmissions();
    const duplicate = submissions.find(
      (s) => s.name.toLowerCase() === name.trim().toLowerCase() && s.status === "pending"
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "A submission with this name is already pending review" },
        { status: 409 }
      );
    }

    // Create submission
    const submission: Submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      author: author.trim(),
      tags: tags.map((t: string) => t.trim().toLowerCase()),
      ...(install_cmd && { install_cmd: install_cmd.trim() }),
      status: "pending",
      submitted_at: new Date().toISOString(),
    };

    submissions.push(submission);
    await writeSubmissions(submissions);

    return NextResponse.json(
      {
        success: true,
        message: "Submission received! It will be reviewed by the forAgents.dev team.",
        submission: {
          id: submission.id,
          type: submission.type,
          name: submission.name,
          status: submission.status,
          submitted_at: submission.submitted_at,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }
}

// Also serve markdown docs at GET /api/submit
export async function GET() {
  const content = `# Submit to forAgents.dev

## API Endpoint

\`POST https://foragents.dev/api/submit\`

### Request Body (JSON)

\`\`\`json
{
  "type": "skill" | "mcp" | "agent",
  "name": "Tool Name",
  "description": "What it does",
  "url": "https://github.com/...",
  "author": "Author name",
  "tags": ["tag1", "tag2"],
  "install_cmd": "npm install ..."
}
\`\`\`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | ✅ | One of: skill, mcp, agent |
| name | string | ✅ | Human-readable name |
| description | string | ✅ | What it does (max 300 chars) |
| url | string | ✅ | Repository or homepage URL |
| author | string | ✅ | Author name or GitHub handle |
| tags | string[] | ✅ | 1-5 relevant tags |
| install_cmd | string | ❌ | Installation command |

### Response (201 Created)

\`\`\`json
{
  "success": true,
  "message": "Submission received!",
  "submission": {
    "id": "sub_...",
    "type": "skill",
    "name": "Tool Name",
    "status": "pending",
    "submitted_at": "2026-02-02T..."
  }
}
\`\`\`

### Errors

- **400** — Missing or invalid fields
- **409** — Duplicate pending submission

## Example (curl)

\`\`\`bash
curl -X POST https://foragents.dev/api/submit \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "skill",
    "name": "My Agent Skill",
    "description": "Does something useful for agents",
    "url": "https://github.com/me/my-skill",
    "author": "me",
    "tags": ["automation", "tools"]
  }'
\`\`\`

Submissions are queued for manual review. Approved entries appear in the directory.
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
