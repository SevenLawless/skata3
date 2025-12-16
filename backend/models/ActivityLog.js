const pool = require('../config/database');

const ActivityLog = {
  async log(userId, workItemId, actionType, metadata = null) {
    const metadataJson = metadata ? JSON.stringify(metadata) : null;
    await pool.execute(
      `INSERT INTO activity_logs (user_id, work_item_id, action_type, metadata) 
       VALUES (?, ?, ?, ?)`,
      [userId, workItemId || null, actionType, metadataJson]
    );
  },

  async findActivities({ userId, actionType, from, to, limit = 100, offset = 0 }) {
    const conditions = [];
    const params = [];

    if (userId) {
      conditions.push('al.user_id = ?');
      params.push(userId);
    }
    if (actionType) {
      conditions.push('al.action_type = ?');
      params.push(actionType);
    }
    if (from) {
      conditions.push('al.created_at >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('al.created_at <= ?');
      params.push(to);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sanitize limit/offset and inline them to avoid prepared statement issues
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 1000));
    const safeOffset = Math.max(0, Number(offset) || 0);

    const sql = `
      SELECT 
        al.*, 
        u.username AS user_username,
        wi.name AS work_item_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN work_items wi ON al.work_item_id = wi.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [rows] = await pool.execute(sql, params);

    return rows;
  }
};

module.exports = ActivityLog;

