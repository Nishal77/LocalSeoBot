import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function logAudit(params: {
  businessId?: string;
  jobType: string;
  status: "success" | "failed" | "skipped";
  details?: Record<string, unknown>;
  durationMs?: number;
}) {
  await prisma.auditLog.create({
    data: {
      businessId: params.businessId,
      jobType: params.jobType,
      status: params.status,
      details: (params.details ?? {}) as Prisma.InputJsonValue,
      durationMs: params.durationMs,
    },
  });
}
