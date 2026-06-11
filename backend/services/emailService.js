const nodemailer = require('nodemailer');
const { generateEmailSummary } = require('./groqService');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVideoAlert(to, channelName, ideas, content = null) {
  const emailBody = await generateEmailSummary(channelName, ideas);

  const platformSection = content?.platformPrompts
    ? `
    <div style="background:#f0f9ff;border-radius:8px;padding:16px;margin:16px 0;">
      <h3 style="color:#0369a1;margin:0 0 12px;">🎬 CapCut Generation Prompt</h3>
      <p style="font-family:monospace;font-size:13px;background:#fff;padding:12px;border-radius:4px;border:1px solid #bae6fd;">
        ${content.platformPrompts.capcut || ''}
      </p>
    </div>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
    .header { background: linear-gradient(135deg, #dc2626, #991b1b); padding: 32px 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .header p { color: #fca5a5; margin: 8px 0 0; }
    .body { padding: 24px; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; }
    .btn { display: inline-block; background: #dc2626; color: #fff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎥 YouTube Content Alert</h1>
      <p>New video ideas ready for <strong>${channelName}</strong></p>
    </div>
    <div class="body">
      ${emailBody}
      ${platformSection}
      <div style="text-align:center;margin:24px 0;">
        <a href="https://www.capcut.com" class="btn">Open CapCut & Create</a>
      </div>
      <div style="background:#fef9c3;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #eab308;">
        <strong>📋 Upload Checklist:</strong>
        <ol style="margin:8px 0;padding-left:20px;line-height:1.8;">
          <li>Create video in CapCut using the prompt above</li>
          <li>Add captions &amp; music in CapCut</li>
          <li>Export in 1080p or 4K</li>
          <li>Upload to YouTube with the generated title &amp; description</li>
          <li>Add all hashtags to the description</li>
          <li>Set a custom thumbnail</li>
          <li>Schedule or publish immediately</li>
        </ol>
      </div>
    </div>
    <div class="footer">
      YouTube Content Helper · Powered by Groq AI<br>
      <small>You're receiving this because you set up alerts for ${channelName}</small>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"YouTube Content Helper" <${process.env.SMTP_USER}>`,
    to,
    subject: `🎬 New Video Ideas for ${channelName} - Time to Create!`,
    html,
  });
}

async function sendTestEmail(to) {
  await transporter.sendMail({
    from: `"YouTube Content Helper" <${process.env.SMTP_USER}>`,
    to,
    subject: '✅ YouTube Content Helper - Email Alert Connected!',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;">
        <h2 style="color:#dc2626;">🎉 Email Alerts Connected!</h2>
        <p>Your YouTube Content Helper email alerts are working correctly.</p>
        <p>You'll receive video ideas and CapCut generation prompts based on your configured schedule.</p>
        <hr style="border:1px solid #e2e8f0;margin:24px 0;">
        <p style="color:#64748b;font-size:13px;">Powered by Groq AI</p>
      </div>`,
  });
}

module.exports = { sendVideoAlert, sendTestEmail };
