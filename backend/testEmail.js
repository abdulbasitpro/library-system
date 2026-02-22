require('dotenv').config();
const nodemailer = require('nodemailer');

const run = async () => {
  console.log('\n📧  Testing email config...');
  console.log(`  Host : ${process.env.EMAIL_HOST}`);
  console.log(`  Port : ${process.env.EMAIL_PORT}`);
  console.log(`  User : ${process.env.EMAIL_USER}\n`);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.verify();
  console.log('✅  SMTP connection verified!\n');

  await transporter.sendMail({
    from: `"LibraryOS" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,   // send test to yourself
    subject: '✅ LibraryOS — Email is working!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
        <div style="text-align:center;margin-bottom:16px">
          <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:12px;line-height:52px;font-size:24px">📚</div>
          <h2 style="color:#1e293b;margin:10px 0 4px">LibraryOS</h2>
        </div>
        <p style="color:#334155;font-size:15px">🎉 Your email is configured correctly!</p>
        <p style="color:#64748b;font-size:13px">Sent from: <strong>${process.env.EMAIL_USER}</strong></p>
      </div>
    `,
  });

  console.log(`✅  Test email sent to ${process.env.EMAIL_USER}`);
  console.log('   Check your inbox now!\n');
  process.exit(0);
};

run().catch((err) => {
  console.error('\n❌  Email test failed:', err.message);
  if (err.message.includes('Invalid login') || err.message.includes('535')) {
    console.error('   → App Password is wrong. Re-generate it at myaccount.google.com → Security → App Passwords');
  }
  if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
    console.error('   → Cannot reach Gmail SMTP. Check your internet / firewall.');
  }
  process.exit(1);
});
