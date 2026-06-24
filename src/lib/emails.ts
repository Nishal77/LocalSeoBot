/**
 * Transactional email helpers (app-side).
 * Workers use workers/lib/email.ts for approval flows.
 * This module handles lifecycle emails: welcome, GBP connected, onboarding, billing events.
 */
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL ?? "agent@rankagent.run";
const BASE = process.env.NEXTAUTH_URL ?? "https://rankagent.run";

// ─── Shared layout ────────────────────────────────────────────────────────────

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RankAgent AI</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
      <!-- Header -->
      <tr><td style="background:linear-gradient(to right,#7c3aed,#2563eb);padding:24px 32px">
        <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px">RankAgent</span>
        <span style="font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,0.25);color:#fff;margin-left:8px;vertical-align:middle">AI</span>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px">
        ${body}
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0">
        <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">
          RankAgent AI &middot; Your local SEO, on autopilot &middot;
          <a href="${BASE}/dashboard/settings" style="color:#94a3b8;text-decoration:none">Manage preferences</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function btn(text: string, url: string, color = "#2563eb"): string {
  return `<a href="${url}" style="display:inline-block;background:${color};color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">${text}</a>`;
}

// ─── Welcome email ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(opts: { to: string; name: string }) {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: "Welcome to RankAgent AI — let's get you set up",
    html: layout(`
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a">Welcome, ${opts.name}!</h1>
      <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6">You just took the first step toward fully autonomous local SEO. Here's what happens next:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px">
        ${[
          ["1", "Connect your Google Business Profile", "Takes 30 seconds — one OAuth click"],
          ["2", "Bot runs an instant audit", "Finds gaps in your Google presence"],
          ["3", "Your local SEO runs on autopilot", "Weekly posts, review responses, citation building — all automatic"],
        ].map(([n, title, desc]) => `
          <tr>
            <td width="40" valign="top" style="padding:0 16px 20px 0">
              <div style="width:32px;height:32px;background:#eff6ff;border-radius:50%;text-align:center;line-height:32px;font-weight:700;color:#2563eb;font-size:14px">${n}</div>
            </td>
            <td valign="top" style="padding:0 0 20px">
              <div style="font-weight:600;color:#0f172a;font-size:15px;margin-bottom:2px">${title}</div>
              <div style="color:#64748b;font-size:14px">${desc}</div>
            </td>
          </tr>`).join("")}
      </table>
      <p style="margin:0 0 24px">${btn("Complete your setup →", `${BASE}/onboarding`)}</p>
      <p style="margin:0;color:#94a3b8;font-size:13px">Your 14-day free trial starts when you enter your card. No charge until then.</p>
    `),
  });
}

// ─── GBP connected ────────────────────────────────────────────────────────────

export async function sendGBPConnectedEmail(opts: { to: string; businessName: string }) {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Google Business Profile connected — ${opts.businessName}`,
    html: layout(`
      <div style="text-align:center;margin:0 0 28px">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:#f0fdf4;border-radius:50%;margin:0 0 16px">
          <span style="font-size:28px">&#10003;</span>
        </div>
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a">Google Business Profile connected!</h2>
        <p style="margin:0;color:#475569;font-size:15px">Your bot is now running an audit on <strong>${opts.businessName}</strong>.</p>
      </div>
      <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:0 0 24px">
        <p style="margin:0 0 12px;font-weight:600;color:#0f172a">What happens next:</p>
        <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.8">
          <li>Audit runs in the next 60 seconds</li>
          <li>First GBP post draft appears immediately</li>
          <li>Citation submissions start today</li>
          <li>Review monitoring begins within 30 minutes</li>
        </ul>
      </div>
      <p>${btn("View your audit results →", `${BASE}/onboarding`)}</p>
    `),
  });
}

// ─── Onboarding complete ──────────────────────────────────────────────────────

export async function sendOnboardingCompleteEmail(opts: { to: string; businessName: string }) {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Your bot is live — ${opts.businessName}`,
    html: layout(`
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a">Your RankAgent AI is live!</h2>
      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
        Payment confirmed. Your bot is now running 24/7 for <strong>${opts.businessName}</strong>.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
        ${[
          ["✓ GBP posts", "Every Monday at 6am — written by AI, published automatically"],
          ["✓ Citation building", "10 new directories per day — building your online presence"],
          ["✓ Review responses", "Within 2 hours of every new review"],
          ["✓ Keyword tracking", "Weekly rankings report every Monday at 8am"],
        ].map(([label, desc]) => `
          <tr>
            <td style="padding:0 0 16px">
              <div style="background:#f0fdf4;border-radius:8px;padding:14px 16px">
                <div style="font-weight:600;color:#15803d;font-size:14px;margin-bottom:2px">${label}</div>
                <div style="color:#475569;font-size:13px">${desc}</div>
              </div>
            </td>
          </tr>`).join("")}
      </table>
      <p style="margin:0 0 8px">${btn("Go to your dashboard →", `${BASE}/dashboard`)}</p>
      <p style="margin:12px 0 0;color:#94a3b8;font-size:13px">You'll receive your first Monday report this coming week. We'll handle everything.</p>
    `),
  });
}

// ─── Trial ending (3 days before) ─────────────────────────────────────────────

export async function sendTrialEndingEmail(opts: {
  to: string;
  businessName: string;
  daysLeft: number;
  trialEndDate: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Your free trial ends in ${opts.daysLeft} days — ${opts.businessName}`,
    html: layout(`
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a">Your trial ends ${opts.daysLeft === 1 ? "tomorrow" : `in ${opts.daysLeft} days`}</h2>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6">
        Your RankAgent AI trial for <strong>${opts.businessName}</strong> ends on <strong>${opts.trialEndDate}</strong>.
        After that, service continues at $99/month — no interruption.
      </p>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:0 0 24px">
        <p style="margin:0;font-size:14px;color:#92400e">
          <strong>What you've built so far:</strong> your bot has been working every day. Cancelling means those rankings, citations, and review responses stop.
        </p>
      </div>
      <p style="margin:0 0 8px">${btn("Keep my bot running →", `${BASE}/dashboard/settings/billing`)}</p>
      <p style="margin:12px 0 0;color:#94a3b8;font-size:13px">
        Cancel anytime from your billing settings. Questions? Reply to this email.
      </p>
    `),
  });
}

// ─── Trial ended ──────────────────────────────────────────────────────────────

export async function sendTrialEndedEmail(opts: { to: string; businessName: string }) {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Your RankAgent AI trial has ended — ${opts.businessName}`,
    html: layout(`
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a">Your free trial has ended</h2>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6">
        Your RankAgent AI service for <strong>${opts.businessName}</strong> is currently paused.
        Reactivate to resume your weekly posts, review responses, and citation building.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:0 0 24px">
        <p style="margin:0;font-size:14px;color:#991b1b">
          While paused: competitors are getting reviews responded to. You're not. New posts stop.
          Citations stop submitting.
        </p>
      </div>
      <p style="margin:0 0 8px">${btn("Reactivate my bot →", `${BASE}/api/billing/checkout`, "#16a34a")}</p>
      <p style="margin:12px 0 0;color:#94a3b8;font-size:13px">$99/month. Cancel anytime. No contracts.</p>
    `),
  });
}

// ─── Payment failed ───────────────────────────────────────────────────────────

export async function sendPaymentFailedEmail(opts: { to: string; businessName: string }) {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Payment failed — action required for ${opts.businessName}`,
    html: layout(`
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a">Payment failed</h2>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6">
        We couldn't process your payment for <strong>${opts.businessName}</strong>'s RankAgent AI subscription.
        Your bot is still running for now — please update your payment method to avoid interruption.
      </p>
      <p style="margin:0 0 8px">${btn("Update payment method →", `${BASE}/dashboard/settings/billing`, "#dc2626")}</p>
      <p style="margin:12px 0 0;color:#94a3b8;font-size:13px">
        If this keeps failing, service will pause automatically. Reply to this email if you need help.
      </p>
    `),
  });
}
