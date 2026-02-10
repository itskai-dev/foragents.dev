import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CONTACT_SUBMISSIONS_PATH = path.join(
  process.cwd(),
  "data",
  "contact-submissions.json"
);

const CONTACT_TYPES = ["general", "support", "partnership", "feedback"] as const;

type ContactType = (typeof CONTACT_TYPES)[number];

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: ContactType;
  submittedAt: string;
};

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  type?: unknown;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateContactPayload(payload: ContactPayload): string[] {
  const errors: string[] = [];
  const name = toTrimmedString(payload.name);
  const email = toTrimmedString(payload.email);
  const subject = toTrimmedString(payload.subject);
  const message = toTrimmedString(payload.message);
  const type = payload.type;

  if (name.length < 2) {
    errors.push("Name must be at least 2 characters long.");
  }

  if (!EMAIL_REGEX.test(email)) {
    errors.push("Email must be a valid email address.");
  }

  if (subject.length < 3) {
    errors.push("Subject must be at least 3 characters long.");
  }

  if (message.length < 10) {
    errors.push("Message must be at least 10 characters long.");
  }

  if (!CONTACT_TYPES.includes(type as ContactType)) {
    errors.push("Type must be one of: general, support, partnership, feedback.");
  }

  return errors;
}

async function readSubmissions(): Promise<ContactSubmission[]> {
  try {
    const raw = await fs.readFile(CONTACT_SUBMISSIONS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ContactSubmission[]) : [];
  } catch {
    return [];
  }
}

async function writeSubmissions(submissions: ContactSubmission[]): Promise<void> {
  await fs.writeFile(CONTACT_SUBMISSIONS_PATH, JSON.stringify(submissions, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactPayload;
    const errors = validateContactPayload(body);

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const submission: ContactSubmission = {
      id: `contact_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: toTrimmedString(body.name),
      email: toTrimmedString(body.email).toLowerCase(),
      subject: toTrimmedString(body.subject),
      message: toTrimmedString(body.message),
      type: body.type as ContactType,
      submittedAt: new Date().toISOString(),
    };

    const submissions = await readSubmissions();
    submissions.push(submission);
    await writeSubmissions(submissions);

    return NextResponse.json(
      {
        success: true,
        message: "Contact form submitted successfully.",
        submissionId: submission.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request. Expected JSON body." },
      { status: 400 }
    );
  }
}
