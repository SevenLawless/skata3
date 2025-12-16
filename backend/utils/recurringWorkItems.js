const pool = require('../config/database');
const ActivityLog = require('../models/ActivityLog');

/**
 * Check for work items that should be automatically restored to pending
 * based on their recurrence interval, and update them accordingly.
 *
 * This is a simple in-process scheduler. For production use, consider
 * moving to a dedicated cron/worker process.
 */
async function checkAndRestoreRecurringItems() {
  try {
    const [rows] = await pool.execute(
      `SELECT *
       FROM work_items
       WHERE recurrence_interval_minutes IS NOT NULL
         AND status <> 'pending'
         AND TIMESTAMPDIFF(
               MINUTE,
               COALESCE(last_restored_at, updated_at, created_at),
               NOW()
             ) >= recurrence_interval_minutes`
    );

    for (const item of rows) {
      // Update status to pending and bump last_restored_at
      await pool.execute(
        `UPDATE work_items
         SET status = 'pending',
             last_restored_at = NOW(),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [item.id]
      );

      const actingUserId = item.assigned_user_id || item.created_by;

      if (actingUserId) {
        await ActivityLog.log(actingUserId, item.id, 'auto_restore', {
          fromStatus: item.status,
          toStatus: 'pending',
          recurrenceIntervalMinutes: item.recurrence_interval_minutes
        });
      }
    }
  } catch (error) {
    console.error('Error in checkAndRestoreRecurringItems:', error);
  }
}

module.exports = {
  checkAndRestoreRecurringItems
};

