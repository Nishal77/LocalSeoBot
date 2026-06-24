import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { sendGBPConnectedEmail } from "@/lib/emails";

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

  // Ownership check — businessId in state must belong to the logged-in user
  const ownedBusiness = await prisma.business.findFirst({
    where: { id: businessId, userId: session.user.id },
    select: { id: true },
  });
  if (!ownedBusiness) {
    return NextResponse.redirect(new URL("/onboarding?error=gbp_unauthorized", req.url));
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

    // Send GBP connected confirmation email (fire-and-forget)
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { user: true },
    });
    if (business) {
      sendGBPConnectedEmail({ to: business.user.email, businessName: business.name }).catch(
        (err) => console.error("GBP connected email failed:", err)
      );
    }

    return NextResponse.redirect(
      new URL(`/onboarding?gbp=connected&businessId=${businessId}`, req.url)
    );
  } catch (err) {
    console.error("GBP callback error:", err);
    return NextResponse.redirect(new URL("/onboarding?error=gbp_failed", req.url));
  }
}
