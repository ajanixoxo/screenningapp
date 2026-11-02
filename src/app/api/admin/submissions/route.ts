import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllSubmissions, getAdminStats } from "@/lib/db";

const AUTH_COOKIE_NAME = "hct_admin_session";
const SESSION_VALUE = "authenticated_hct_admin_session_token_2026";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (session !== SESSION_VALUE) {
    return NextResponse.json(
      { success: false, error: "Unauthorized administrative access. Please log in." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const course = searchParams.get("course") || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const submissions = await getAllSubmissions({ course, search });
    const stats = await getAdminStats();

    return NextResponse.json({
      success: true,
      submissions,
      stats,
    });
  } catch (error: unknown) {
    console.error("Error retrieving admin submissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load submissions from database." },
      { status: 500 }
    );
  }
}
