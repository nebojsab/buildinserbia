import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  lang: string;
  fileUrl?: string;
  fileName?: string;
  submittedAt: string;
};

const INDEX_PREFIX = "contact/submissions-index";
const MAX_FILE_BYTES = 10 * 1024 * 1024;

async function readIndex(): Promise<ContactSubmission[]> {
  const { blobs } = await list({ prefix: INDEX_PREFIX, limit: 20 });
  if (!blobs.length) return [];
  const latest = [...blobs].sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
  const res = await fetch(latest.url, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as ContactSubmission[];
}

async function writeIndex(items: ContactSubmission[]): Promise<void> {
  await put(`${INDEX_PREFIX}.json`, JSON.stringify(items, null, 2), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
  });
}

async function sendNotification(s: ContactSubmission): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const toEmail = process.env.CONTACT_NOTIFY_EMAIL;
  if (!host || !user || !pass || !toEmail) return;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const date = new Date(s.submittedAt).toLocaleString("sr-Latn-RS", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Belgrade",
  });

  const fileHtml = s.fileUrl
    ? `<tr><td style="color:#888;padding:6px 0 2px">Prilog</td><td><a href="${s.fileUrl}" style="color:#1D4ED8">${s.fileName ?? "fajl"}</a></td></tr>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="sr">
<head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;background:#f5f5f5;margin:0;padding:0">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:#e05c28;padding:18px 24px">
      <p style="margin:0;font-size:18px;font-weight:700;color:#fff">● BuildInSerbia — Nova poruka</p>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="color:#888;padding:6px 0 2px;width:120px">Ime</td><td style="font-weight:600">${s.name}</td></tr>
        <tr><td style="color:#888;padding:6px 0 2px">Email</td><td><a href="mailto:${s.email}" style="color:#1D4ED8">${s.email}</a></td></tr>
        ${s.phone ? `<tr><td style="color:#888;padding:6px 0 2px">Telefon</td><td>${s.phone}</td></tr>` : ""}
        <tr><td style="color:#888;padding:6px 0 2px">Jezik</td><td style="text-transform:uppercase">${s.lang}</td></tr>
        <tr><td style="color:#888;padding:6px 0 2px">Vreme</td><td>${date}</td></tr>
        ${fileHtml}
      </table>
      <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>
      <p style="color:#888;font-size:12px;margin:0 0 8px">Poruka:</p>
      <div style="background:#f8f5f2;border-left:3px solid #e05c28;padding:12px 16px;border-radius:4px;font-size:14px;line-height:1.6;white-space:pre-wrap">${s.message}</div>
    </div>
    <div style="padding:12px 24px;border-top:1px solid #eee;font-size:11px;color:#aaa">
      buildinserbia.com · kontakt forma
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `BuildInSerbia <${user}>`,
    to: toEmail,
    replyTo: s.email,
    subject: `Nova poruka od ${s.name} — BuildInSerbia`,
    html,
  });
}

export async function GET() {
  const items = await readIndex();
  return NextResponse.json({ submissions: items });
}

export async function POST(req: Request) {
  const fd = await req.formData();
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim();
  const message = String(fd.get("message") ?? "").trim();
  const lang = String(fd.get("lang") ?? "sr").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let fileUrl: string | undefined;
  let fileName: string | undefined;

  const fileEntry = fd.get("file");
  if (fileEntry instanceof File && fileEntry.size > 0) {
    if (fileEntry.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }
    const safeName = fileEntry.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blob = await put(`contact/attachments/${Date.now()}-${safeName}`, fileEntry, {
      access: "public",
      addRandomSuffix: false,
    });
    fileUrl = blob.url;
    fileName = fileEntry.name;
  }

  const submission: ContactSubmission = {
    id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    phone: phone || undefined,
    message,
    lang,
    fileUrl,
    fileName,
    submittedAt: new Date().toISOString(),
  };

  // Save to blob index and send email notification concurrently
  const existing = await readIndex();
  await Promise.all([
    writeIndex([submission, ...existing]),
    sendNotification(submission).catch((err) => {
      console.error("Resend notification failed:", err);
    }),
  ]);

  return NextResponse.json({ ok: true });
}
