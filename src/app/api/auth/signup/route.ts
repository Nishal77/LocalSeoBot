import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/emails";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

const signupSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  const limited = await checkRateLimit(getClientIp(req), "auth");
  if (limited) return limited;

  try {
    const body = await req.json() as unknown;
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: { name, email, passwordHash },
    });

    // Fire-and-forget — don't block signup if email fails
    sendWelcomeEmail({ to: email, name }).catch((err) =>
      console.error("Welcome email failed:", err)
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
