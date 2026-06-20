import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const businessId = searchParams.get("state");

  if (!code || !businessId) {
    return NextResponse.redirect(new URL("/onboarding?error=gbp_failed", req.url));
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_GBP_CLIENT_ID!,
        client_secret: process.env.GOOGLE_GBP_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_GBP_REDIRECT_URI!,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenRes.ok) {
      throw new Error("Token exchange failed");
    }

    const tokens = await tokenRes.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
    };

    // Encrypt tokens before storing
    const [accessTokenEnc, refreshTokenEnc] = await Promise.all([
      encrypt(tokens.access_token),
      encrypt(tokens.refresh_token),
    ]);

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await prisma.googleConnection.upsert({
      where: { businessId },
      create: {
        businessId,
        accessTokenEnc,
        refreshTokenEnc,
        tokenExpiresAt: expiresAt,
        scope: tokens.scope,
      },
      update: {
        accessTokenEnc,
        refreshTokenEnc,
        tokenExpiresAt: expiresAt,
        scope: tokens.scope,
      },
    });

    // Redirect back to onboarding with GBP connected signal
    return NextResponse.redirect(
      new URL(`/onboarding?gbp=connected&businessId=${businessId}`, req.url)
    );
  } catch (err) {
    console.error("GBP callback error:", err);
    return NextResponse.redirect(new URL("/onboarding?error=gbp_failed", req.url));
  }
}
