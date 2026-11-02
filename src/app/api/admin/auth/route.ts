import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || "admin2026";
const AUTH_COOKIE_NAME = "hct_admin_session";
const SESSION_VALUE = "authenticated_hct_admin_session_token_2026";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (session === SESSION_VALUE) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function POST(request: Request) {
  try {
    const { passkey } = await request.json();

    if (!passkey || passkey !== ADMIN_PASSKEY) {
      return NextResponse.json(
        { success: false, error: "Invalid administrative access passkey." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, SESSION_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Authentication successful." });
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication failed. Invalid request." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  return NextResponse.json({ success: true, message: "Logged out successfully." });
}
