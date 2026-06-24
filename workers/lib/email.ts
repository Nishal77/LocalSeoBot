import { Resend } from "resend";
import { createHmac } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL ?? "agent@rankagent.run";
const BASE = process.env.NEXTAUTH_URL ?? "https://rankagent.run";
const OPS_EMAIL = process.env.OPS_EMAIL ?? "ops@rankagent.run";

function approvalToken(id: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET not set");
  return createHmac("sha256", secret).update(id).digest("hex");
}

export async function sendPostApprovalEmail(opts: {
  to: string;
  businessName: string;
  postId: string;
  content: string;
}) {
  const token = approvalToken(opts.postId);
  const approveUrl = `${BASE}/api/webhooks/posts/approve?postId=${opts.postId}&token=${token}`;
  const editUrl = `${BASE}/dashboard/posts`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `[Action needed] Approve your Google post — ${opts.businessName}`,
    html: `
<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#1e293b">
  <div style="margin-bottom:24px;display:flex;align-items:center;gap:8px">
    <span style="font-weight:700;font-size:18px;color:#1e293b">RankAgent</span>
    <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:linear-gradient(to right,#7c3aed,#2563eb);color:#fff">AI</span>
  </div>
  <h2 style="font-size:20px;font-weight:700;margin:0 0 8px">Your weekly Google post is ready</h2>
  <p style="color:#64748b;margin:0 0 24px">Review and approve before it goes live on <strong>${opts.businessName}</strong>&apos;s Google Business Profile.</p>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:0 0 24px;white-space:pre-wrap;line-height:1.6;color:#334155">${opts.content}</div>
  <div style="display:flex;gap:12px;margin:0 0 24px">
    <a href="${approveUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">✓ Approve &amp; Publish</a>
    <a href="${editUrl}" style="display:inline-block;background:#f1f5f9;color:#475569;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">Edit in Dashboard</a>
  </div>
  <p style="color:#94a3b8;font-size:13px;margin:0">If you don&apos;t approve within 4 hours, the bot will publish automatically. Change this in <a href="${BASE}/dashboard/settings" style="color:#94a3b8">Settings</a>.</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
  <p style="color:#cbd5e1;font-size:12px;margin:0">RankAgent AI · <a href="${BASE}/dashboard/settings" style="color:#cbd5e1">Unsubscribe</a></p>
</div>`,
  });
}

// ─── Ops alert: citation needs manual submission ──────────────────────────────

export async function sendCitationManualAlert(opts: {
  citationId: string;
  businessName: string;
  directoryName: string;
  directoryUrl: string | null;
  reason: string;
  nap: { name: string; phone: string; address: string; city: string; state: string; zip: string; website?: string };
}) {
  await resend.emails.send({
    from: FROM,
    to: OPS_EMAIL,
    subject: `[Manual citation needed] ${opts.directoryName} — ${opts.businessName}`,
    html: `
<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b">
  <h2 style="margin:0 0 16px;color:#dc2626">Manual citation submission required</h2>
  <p><strong>Business:</strong> ${opts.businessName}</p>
  <p><strong>Directory:</strong> ${opts.directoryName}</p>
  <p><strong>Add-business URL:</strong> ${opts.directoryUrl ? `<a href="${opts.directoryUrl}">${opts.directoryUrl}</a>` : "Unknown — search manually"}</p>
  <p><strong>Reason flagged:</strong> ${opts.reason}</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>
  <p style="font-weight:600">Business NAP to submit:</p>
  <ul>
    <li><strong>Name:</strong> ${opts.nap.name}</li>
    <li><strong>Phone:</strong> ${opts.nap.phone}</li>
    <li><strong>Address:</strong> ${opts.nap.address}, ${opts.nap.city}, ${opts.nap.state} ${opts.nap.zip}</li>
    ${opts.nap.website ? `<li><strong>Website:</strong> ${opts.nap.website}</li>` : ""}
  </ul>
  <p><strong>Citation ID:</strong> <code>${opts.citationId}</code></p>
  <p style="color:#64748b;font-size:13px">Once live, update the citation record via the admin panel.</p>
</div>`,
  });
}

export async function sendReviewApprovalEmail(opts: {
  to: string;
  businessName: string;
  reviewId: string;
  reviewerName: string;
  starRating: number;
  reviewText: string;
  responseText: string;
}) {
  const token = approvalToken(opts.reviewId);
  const approveUrl = `${BASE}/api/webhooks/reviews/approve?reviewId=${opts.reviewId}&token=${token}`;
  const editUrl = `${BASE}/dashboard/reviews`;
  const stars = "★".repeat(opts.starRating) + "☆".repeat(5 - opts.starRating);
  const starColor = opts.starRating >= 4 ? "#f59e0b" : opts.starRating === 3 ? "#fb923c" : "#ef4444";

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `[Action needed] ${opts.starRating}★ review from ${opts.reviewerName} — approve response`,
    html: `
<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#1e293b">
  <div style="margin-bottom:24px"><span style="font-weight:700;font-size:18px;color:#2563eb">RankAgent AI</span></div>
  <h2 style="font-size:20px;font-weight:700;margin:0 0 8px">New review response ready</h2>
  <p style="color:#64748b;margin:0 0 20px">Your bot wrote a response to a <strong>${opts.starRating}-star review</strong> on ${opts.businessName}. Approve it before it goes live.</p>

  <div style="background:#f8fafc;border-left:4px solid ${starColor};border-radius:0 8px 8px 0;padding:16px;margin:0 0 8px">
    <div style="color:${starColor};font-size:18px;margin-bottom:6px">${stars}</div>
    <p style="margin:0;color:#475569;font-style:italic">&ldquo;${opts.reviewText}&rdquo;</p>
    <p style="margin:8px 0 0;color:#94a3b8;font-size:13px">— ${opts.reviewerName}</p>
  </div>

  <p style="font-weight:600;margin:20px 0 8px">Bot&apos;s proposed response:</p>
  <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:0 0 24px">
    <p style="margin:0;color:#166534;line-height:1.6">${opts.responseText}</p>
  </div>

  <div style="margin:0 0 24px">
    <a href="${approveUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;margin-right:12px">✓ Approve &amp; Post</a>
    <a href="${editUrl}" style="display:inline-block;background:#f1f5f9;color:#475569;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">Edit Response</a>
  </div>
  <p style="color:#94a3b8;font-size:13px;margin:0">Auto-posts in 4 hours if no action taken. Responding quickly improves your local ranking.</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
  <p style="color:#cbd5e1;font-size:12px;margin:0">RankAgent AI · <a href="${BASE}/dashboard/settings" style="color:#cbd5e1">Settings</a></p>
</div>`,
  });
}
