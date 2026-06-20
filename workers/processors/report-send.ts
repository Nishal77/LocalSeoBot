import { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { Resend } from "resend";
import { format } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function processReportSend(job: Job) {
  const { businessId, reportId } = job.data as { businessId: string; reportId: string };
  const start = Date.now();

  try {
    const [report, business] = await Promise.all([
      prisma.weeklyReport.findUnique({ where: { id: reportId } }),
      prisma.business.findUnique({
        where: { id: businessId },
        include: { user: true },
      }),
    ]);

    if (!report || !business) throw new Error("Report or business not found");
    if (report.sentAt) return; // already sent

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: business.user.email,
      subject: `Your LocalSEOBot report — week of ${format(report.weekOf, "MMMM d, yyyy")}`,
      html: report.reportHtml ?? "<p>Report not available.</p>",
    });

    await prisma.weeklyReport.update({
      where: { id: reportId },
      data: { sentAt: new Date() },
    });

    await logAudit({
      businessId,
      jobType: "report.send",
      status: "success",
      details: { reportId, to: business.user.email },
      durationMs: Date.now() - start,
    });
  } catch (err) {
    await logAudit({
      businessId,
      jobType: "report.send",
      status: "failed",
      details: { reportId, error: String(err) },
      durationMs: Date.now() - start,
    });
    throw err;
  }
}
