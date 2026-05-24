import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ name, email, message }) {
  const { data, error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL,
    to: [process.env.CONTACT_TO_EMAIL],
    subject: `New contact form submission from ${name}`,
    replyTo: email,
    html: `
      <p>You have a new contact form submission:</p>
      <ul style="list-style-type: none; margin: 0; padding: 0;">
        <li><strong>Name:</strong> ${escapeHtml(name)}</li>
        <li><strong>Email:</strong> ${escapeHtml(email)}</li>
        <li><strong>Message:</Strong></li>
        <br />
        <li>${escapeHtml(message).replace(/\n/g, "<br>")}</li>
      </ul>
    `,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  return data;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
