import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

interface StatusHistoryEntry {
  date: string;
  uptime: number;
  incidents: number;
}

interface StatusHistoryData {
  history: StatusHistoryEntry[];
}

const STATUS_HISTORY_PATH = path.join(process.cwd(), "data", "status-history.json");

export async function GET() {
  try {
    const file = await readFile(STATUS_HISTORY_PATH, "utf8");
    const parsed = JSON.parse(file) as StatusHistoryData;

    return NextResponse.json(parsed, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        history: [],
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
