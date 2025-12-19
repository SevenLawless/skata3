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

  async findByUser(userId, limit = 100) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
    const [rows] = await pool.execute(
      `SELECT ci.*
       FROM check_ins ci
       WHERE ci.user_id = ?
       ORDER BY ci.check_in_date DESC, ci.created_at DESC
       LIMIT ?`,
      [userId, safeLimit]
    );
    return rows;
  }
};

module.exports = CheckIn;

