import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("session");

  // Redirect to the student/faculty home page with 303 See Other
  return NextResponse.redirect(new URL("/", request.url), 303);
}
