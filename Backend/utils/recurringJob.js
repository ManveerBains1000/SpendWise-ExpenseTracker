import cron from 'node-cron';
import { Expense } from '../models/expense.model.js';

// Runs daily at 00:05 AM
export const startRecurringJob = () => {
  cron.schedule('5 0 * * *', async () => {
    try {
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

      // Find recurring templates
      const recurringTemplates = await Expense.find({ recurring: true });

      for (const tpl of recurringTemplates) {
        // only monthly supported
        if (tpl.recurrence !== 'monthly') continue;

        // check if an expense exists for this owner + description in this month
        const exists = await Expense.findOne({
          owner: tpl.owner,
          description: tpl.description,
          recurring: { $ne: true }, // do not match templates
          $expr: {
            $eq: [
              { $dateToString: { format: "%Y-%m", date: "$date" } },
              todayKey,
            ],
          },
        });

        if (!exists) {
          // create a new expense instance for this month
          await Expense.create({
            description: tpl.description,
            amount: tpl.amount,
            category: tpl.category,
            owner: tpl.owner,
            date: new Date(),
            recurring: false,
          });
        }
      }
    } catch (err) {
      console.error('Recurring job error:', err);
    }
  });
};
