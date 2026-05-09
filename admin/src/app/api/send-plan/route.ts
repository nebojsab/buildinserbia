import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { buildPlanHtml } from "@/planner/lib/buildPlanHtml";
import { wizardTrees } from "@/planner/wizardTree";
import type { WizardState } from "@/planner/wizard/wizardState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeTransporter() {
  const port = parseInt(process.env.SMTP_PORT ?? "465", 10);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      type: "LOGIN",
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
}

export async function POST(req: Request) {
  const body = await req.json() as { emails: string; state: WizardState; lang: string };
  const { emails: rawEmails, state, lang } = body;

  // Parse + validate email list
  const emailList = (rawEmails ?? "")
    .split(",")
    .map((e: string) => e.trim().toLowerCase())
    .filter((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

  if (!emailList.length) {
    return NextResponse.json({ error: "No valid email addresses" }, { status: 400 });
  }

  const tree = wizardTrees[state.projectType ?? ""];
  if (!tree) {
    return NextResponse.json({ error: "Invalid project type" }, { status: 400 });
  }

  const planHtml = buildPlanHtml(state, tree, lang);
  const subject =
    lang === "en" ? "Your BuildInSerbia plan" :
    lang === "ru" ? "Ваш план с BuildInSerbia.com" :
    "Vaš plan sa BuildInSerbia.com";

  const transporter = makeTransporter();

  try {
    await Promise.all(
      emailList.map((to: string) =>
        transporter.sendMail({
          from: `BuildInSerbia <${process.env.SMTP_USER}>`,
          to,
          subject,
          html: planHtml,
        })
      )
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[send-plan] SMTP error:", message);
    return NextResponse.json({ error: "smtp_error", detail: message }, { status: 500 });
  }

  // Notify us (fire-and-forget)
  const notifyTo = process.env.CONTACT_NOTIFY_EMAIL ?? "info@buildinserbia.com";
  const projectLabel = tree.label["sr"] ?? state.projectType ?? "";
  const location = [state.location?.municipality, state.location?.zoneType].filter(Boolean).join(", ");

  transporter.sendMail({
    from: `BuildInSerbia <${process.env.SMTP_USER}>`,
    to: notifyTo,
    subject: `Plan podeljen — ${projectLabel}${location ? `, ${location}` : ""}`,
    html: `<p style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a">
  Plan je podeljen na: <strong>${emailList.join(", ")}</strong><br><br>
  Tip projekta: ${projectLabel}<br>
  Lokacija: ${location || "—"}<br>
  Jezik: ${lang}<br>
  Radovi: ${state.selectedSubcategories.join(", ") || "—"}
</p>`,
  }).catch((e: unknown) => console.error("[send-plan] notify error:", e));

  return NextResponse.json({ ok: true });
}
