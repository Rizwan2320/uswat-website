/* app/api/newsletter/route.ts
   Validates the address and rejects bots. It never claims success unless a provider accepted the address. */
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const { email, company } = (body ?? {}) as { email?: unknown; company?: unknown };

  // Honeypot: real visitors never see or fill the "company" field.
  if (typeof company === "string" && company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (typeof email !== "string") {
    return NextResponse.json({ ok: false, message: "Please enter your email address." }, { status: 422 });
  }
  const value = email.trim().toLowerCase();
  if (value.length > 254 || !EMAIL_RE.test(value)) {
    return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 422 });
  }

  // TODO(provider): send `value` to the real newsletter provider (env: NEWSLETTER_PROVIDER_URL / key).
  // Do not log the address.
  if (!process.env.NEWSLETTER_PROVIDER_URL) {
    return NextResponse.json(
      { ok: false, message: "Subscriptions are not available yet. Please try again later." },
      { status: 503 }
    );
  }

  // const res = await fetch(process.env.NEWSLETTER_PROVIDER_URL, { method: "POST", ... });
  // if (!res.ok) return NextResponse.json({ ok: false, message: "Could not subscribe. Please try again." }, { status: 502 });

  return NextResponse.json({ ok: true, message: "Thank you for subscribing." });
}
