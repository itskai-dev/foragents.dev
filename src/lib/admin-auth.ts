import { NextRequest, NextResponse } from "next/server";

/**
 * Validates admin authorization.
 * Returns null if authorized, or a 401 response if not.
 */
export function checkAdminAuth(request: NextRequest): NextResponse | null {
  const adminSecret = process.env.ADMIN_SECRET;
  
  if (!adminSecret) {
    return NextResponse.json(
      { error: "Admin authentication not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix
  
  if (token !== adminSecret) {
    return NextResponse.json(
      { error: "Invalid admin secret" },
      { status: 401 }
    );
  }

  return null; // Authorized
}
