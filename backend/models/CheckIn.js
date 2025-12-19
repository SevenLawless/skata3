const pool = require('../config/database');

const CheckIn = {
  async create({ userId, checkInDate, startTime, endTime, hours, notes }) {
    const [result] = await pool.execute(
      `INSERT INTO check_ins (user_id, check_in_date, start_time, end_time, hours, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        checkInDate,
        startTime || null,
        endTime || null,
        typeof hours === 'number' ? hours : null,
        notes || null
      ]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ci.*, u.username AS user_username
       FROM check_ins ci
       JOIN users u ON ci.user_id = u.id
       WHERE ci.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findByUserRange(userId, { from, to, limit = 100 }) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
    const conditions = ['ci.user_id = ?'];
    const params = [userId];

    if (from) {
      conditions.push('ci.check_in_date >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('ci.check_in_date <= ?');
      params.push(to);
    }

    const whereClause = conditions.join(' AND ');

    const [rows] = await pool.execute(
      `SELECT ci.*
       FROM check_ins ci
       WHERE ${whereClause}
       ORDER BY ci.check_in_date DESC, ci.created_at DESC
       LIMIT ${safeLimit}`,
      params
    );

    return rows;
  },

  async sumHoursByRange(userId, { from, to }) {
    const conditions = ['ci.user_id = ?'];
    const params = [userId];

    if (from) {
      conditions.push('ci.check_in_date >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('ci.check_in_date <= ?');
      params.push(to);
    }

    const whereClause = conditions.join(' AND ');

    const [rows] = await pool.execute(
      `SELECT COALESCE(SUM(ci.hours), 0) as total
       FROM check_ins ci
       WHERE ${whereClause}`,
      params
    );

    return Number(rows[0]?.total || 0);
  }
};

module.exports = CheckIn;

