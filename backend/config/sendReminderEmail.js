const sendEmail = require('../config/sendEmail');

/**
 * Build a styled reminder email.
 * Works in dev mode (logs to console) and production (sends real email).
 */
const sendReminderEmail = async ({ user, book, dueDate, type = 'reminder' }) => {
  if (!user || !user.email) throw new Error('Cannot send reminder: User email is missing');
  if (!book || !book.title) throw new Error('Cannot send reminder: Book title is missing');

  const dueObj = new Date(dueDate);
  if (isNaN(dueObj.getTime())) {
    console.error(`Invalid due date for transaction: ${dueDate}`);
    throw new Error('Cannot send reminder: Invalid due date');
  }

  const formattedDue = dueObj.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const isOverdue  = type === 'overdue';
  const subject    = isOverdue
    ? `⚠️ LibraryOS — "${book.title}" is overdue!`
    : `📚 LibraryOS — Reminder: "${book.title}" due in 2 days`;

  const accentColor = isOverdue ? '#ef4444' : '#f59e0b';
  const emoji       = isOverdue ? '⚠️' : '⏰';
  const heading     = isOverdue ? 'Your book is overdue!' : 'Your book is due soon!';
  const bodyText    = isOverdue
    ? `<strong>"${book.title}"</strong> was due on <strong>${formattedDue}</strong> and has not been returned yet. Please return it to the library as soon as possible to avoid further penalties.`
    : `<strong>"${book.title}"</strong> by ${book.author} is due on <strong>${formattedDue}</strong> — that's 2 days from now. Please return it to the library on time.`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
      <div style="text-align:center;margin-bottom:20px">
        <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:12px;line-height:52px;font-size:24px">📚</div>
        <h2 style="color:#1e293b;margin:10px 0 4px">LibraryOS</h2>
      </div>
      <div style="background:white;border-radius:10px;padding:20px;border-left:4px solid ${accentColor}">
        <p style="font-size:20px;margin:0 0 8px">${emoji} ${heading}</p>
        <p style="color:#334155;font-size:14px;line-height:1.6">Hi <strong>${user.name}</strong>,</p>
        <p style="color:#334155;font-size:14px;line-height:1.6">${bodyText}</p>
      </div>
      <div style="margin-top:16px;padding:14px;background:#f1f5f9;border-radius:8px;font-size:13px;color:#64748b">
        <strong>Book:</strong> ${book.title}<br/>
        <strong>Author:</strong> ${book.author}<br/>
        <strong>Due Date:</strong> ${formattedDue}
      </div>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <p style="color:#94a3b8;font-size:12px;text-align:center">© 2024 LibraryOS · Automated notification</p>
    </div>
  `;

  // If EMAIL_PASS isn't configured yet — log to console instead of crashing
  const emailConfigured = process.env.EMAIL_PASS &&
    !process.env.EMAIL_PASS.includes('your_') &&
    !process.env.EMAIL_PASS.includes('app_password');

  if (!emailConfigured) {
    console.log('\n========================================');
    console.log(`📧  REMINDER EMAIL (no email config) — ${type.toUpperCase()}`);
    console.log('----------------------------------------');
    console.log(`To   : ${user.name} <${user.email}>`);
    console.log(`Book : ${book.title}`);
    console.log(`Due  : ${formattedDue}`);
    console.log('  → Set EMAIL_PASS in .env to send real emails');
    console.log('========================================\n');
    return { devMode: true };
  }

  // Real email
  await sendEmail({ to: user.email, subject, html });
};

module.exports = sendReminderEmail;
