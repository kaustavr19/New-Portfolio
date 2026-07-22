import { NextResponse } from "next/server";
import { Resend } from "resend";
import { profile } from "@/data/content";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const { name, email, message, honeypot } = body as {
    name?: string;
    email?: string;
    message?: string;
    honeypot?: string;
  };

  // Bot caught the hidden field — pretend success, don't send anything.
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!message?.trim() || !email?.trim() || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ ok: false, error: "Missing or invalid fields." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Contact channel not configured." }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const callsign = name?.trim() || "UNKNOWN";

  const { error } = await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: profile.social.email,
    replyTo: email.trim(),
    subject: `New transmission from ${callsign}`,
    text: `Callsign: ${callsign}\nReply channel: ${email.trim()}\n\n${message.trim()}`,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "Send failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
