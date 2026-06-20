import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_GBP_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_GBP_REDIRECT_URI!,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/business.manage",
    access_type: "offline",
    prompt: "consent",
    state: businessId,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
