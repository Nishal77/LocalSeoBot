import { decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

interface GBPTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export async function getGBPTokens(businessId: string): Promise<GBPTokens> {
  const conn = await prisma.googleConnection.findUnique({
    where: { businessId },
  });
  if (!conn) throw new Error(`No GBP connection for business ${businessId}`);

  const accessToken = await decrypt(conn.accessTokenEnc);
  const refreshToken = await decrypt(conn.refreshTokenEnc);

  if (conn.tokenExpiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
    return refreshGBPToken(businessId, refreshToken);
  }

  return { accessToken, refreshToken, expiresAt: conn.tokenExpiresAt };
}

async function refreshGBPToken(
  businessId: string,
  refreshToken: string
): Promise<GBPTokens> {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_GBP_CLIENT_ID!,
    client_secret: process.env.GOOGLE_GBP_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const data = await res.json() as {
    access_token: string;
    expires_in: number;
  };

  const { encrypt } = await import("@/lib/crypto");
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await prisma.googleConnection.update({
    where: { businessId },
    data: {
      accessTokenEnc: await encrypt(data.access_token),
      tokenExpiresAt: expiresAt,
    },
  });

  return {
    accessToken: data.access_token,
    refreshToken,
    expiresAt,
  };
}

export async function gbpFetch(
  businessId: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const { accessToken } = await getGBPTokens(businessId);

  const res = await fetch(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    return gbpFetch(businessId, endpoint, options);
  }

  return res;
}

export async function getGBPAccounts(businessId: string) {
  const res = await gbpFetch(
    businessId,
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts"
  );
  if (!res.ok) throw new Error(`GBP accounts fetch failed: ${res.status}`);
  return res.json();
}

export async function getGBPLocations(businessId: string, accountId: string) {
  const res = await gbpFetch(
    businessId,
    `https://mybusiness.googleapis.com/v4/${accountId}/locations`
  );
  if (!res.ok) throw new Error(`GBP locations fetch failed: ${res.status}`);
  return res.json();
}

export async function createGBPPost(
  businessId: string,
  accountId: string,
  locationId: string,
  post: {
    summary: string;
    callToAction?: { actionType: string; url?: string };
    media?: { mediaFormat: string; sourceUrl: string }[];
  }
) {
  const res = await gbpFetch(
    businessId,
    `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/localPosts`,
    {
      method: "POST",
      body: JSON.stringify({ ...post, topicType: "STANDARD" }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GBP post creation failed: ${err}`);
  }
  return res.json();
}

export async function getGBPReviews(
  businessId: string,
  accountId: string,
  locationId: string
) {
  const res = await gbpFetch(
    businessId,
    `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews`
  );
  if (!res.ok) throw new Error(`GBP reviews fetch failed: ${res.status}`);
  return res.json();
}

export async function replyToGBPReview(
  businessId: string,
  accountId: string,
  locationId: string,
  reviewId: string,
  comment: string
) {
  const res = await gbpFetch(
    businessId,
    `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews/${reviewId}/reply`,
    {
      method: "PUT",
      body: JSON.stringify({ comment }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GBP review reply failed: ${err}`);
  }
  return res.json();
}
