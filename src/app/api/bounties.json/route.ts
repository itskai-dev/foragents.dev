import { NextResponse } from "next/server";
import { getBounties } from "@/lib/bounties";

export async function GET() {
  const bounties = getBounties();

  return NextResponse.json(
    {
      bounties,
      count: bounties.length,
      updated_at: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
