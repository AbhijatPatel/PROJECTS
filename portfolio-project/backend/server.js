require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, "[]");

function saveMessageLocally(msg) {
  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf8"));
  messages.push({ ...msg, receivedAt: new Date().toISOString() });
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

async function sendEmail(msg) {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, CONTACT_RECEIVER } = process.env;

  // If SMTP credentials aren't set, skip sending — message is still saved locally.
  if (!EMAIL_USER || !EMAIL_PASS) return false;

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST || "smtp.gmail.com",
    port: Number(EMAIL_PORT) || 587,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Portfolio Contact Form" <${EMAIL_USER}>`,
    to: CONTACT_RECEIVER || EMAIL_USER,
    replyTo: msg.email,
    subject: `[Portfolio] ${msg.subject || "New message from " + msg.name}`,
    text: `From: ${msg.name} (${msg.email})\n\n${msg.message}`,
  });

  return true;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and message are required.",
    });
  }

  saveMessageLocally({ name, email, subject, message });

  try {
    const emailed = await sendEmail({ name, email, subject, message });
    return res.json({ success: true, emailed });
  } catch (err) {
    console.error("Email send failed:", err.message);
    // The message was already saved locally, so we still report success.
    return res.json({
      success: true,
      emailed: false,
      note: "Message saved, but email sending failed. Check your SMTP settings in .env.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
