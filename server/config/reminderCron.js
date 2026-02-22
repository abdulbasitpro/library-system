const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const sendReminderEmail = require('./sendReminderEmail');

/**
 * Daily cron job — runs every day at 8:00 AM server time.
 * Finds all active transactions due exactly 2 days from now
 * and sends a reminder email to each borrower.
 */
const startReminderCron = () => {
  // '0 8 * * *' = every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('\n[Cron] Running due-date reminder job…');

    try {
      const now     = new Date();
      const in2Days = new Date(now);
      in2Days.setDate(in2Days.getDate() + 2);

      // Match transactions whose dueDate falls within the next 48-hour window
      const start = new Date(in2Days); start.setHours(0, 0, 0, 0);
      const end   = new Date(in2Days); end.setHours(23, 59, 59, 999);

      const transactions = await Transaction.find({
        status:  { $in: ['issued', 'overdue'] },
        dueDate: { $gte: start, $lte: end },
      })
        .populate('user',  'name email')
        .populate('book',  'title author');

      console.log(`[Cron] Found ${transactions.length} transaction(s) due in 2 days.`);

      for (const tx of transactions) {
        if (!tx.user?.email) continue;
        try {
          await sendReminderEmail({
            user:    tx.user,
            book:    tx.book,
            dueDate: tx.dueDate,
            type:    'reminder',
          });
          console.log(`[Cron] Reminder sent → ${tx.user.email}`);
        } catch (err) {
          console.error(`[Cron] Failed to send to ${tx.user.email}:`, err.message);
        }
      }

      console.log('[Cron] Due-date reminder job complete.\n');
    } catch (err) {
      console.error('[Cron] Error in reminder job:', err.message);
    }
  });

  console.log('✅ Reminder cron job scheduled (daily at 8:00 AM)');
};

module.exports = startReminderCron;
