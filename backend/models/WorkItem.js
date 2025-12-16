const pool = require('../config/database');

const WorkItem = {
  async findAll() {
    const [rows] = await pool.execute(
      `SELECT 
         wi.*,
         u.username as created_by_username,
         au.username as assigned_username
       FROM work_items wi 
       LEFT JOIN users u ON wi.created_by = u.id 
       LEFT JOIN users au ON wi.assigned_user_id = au.id
       ORDER BY 
         CASE wi.status 
           WHEN 'in_progress' THEN 1 
           WHEN 'pending' THEN 2 
           WHEN 'completed' THEN 3 
         END,
         wi.created_at DESC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
         wi.*,
         u.username as created_by_username,
         au.username as assigned_username
       FROM work_items wi 
       LEFT JOIN users u ON wi.created_by = u.id 
       LEFT JOIN users au ON wi.assigned_user_id = au.id
       WHERE wi.id = ?`,
      [id]
    );
    return rows[0];
  },

  async create(
    name,
    link,
    videoCount,
    description,
    checkpoints,
    source,
    createdBy,
    recurrenceIntervalMinutes,
    assignedUserId
  ) {
    const [result] = await pool.execute(
      `INSERT INTO work_items 
         (name, link, video_count, description, checkpoints, source, recurrence_interval_minutes, created_by, assigned_user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        link,
        videoCount || null,
        description || null,
        checkpoints || null,
        source || 'other',
        recurrenceIntervalMinutes || null,
        createdBy,
        assignedUserId || null
      ]
    );
    return result.insertId;
  },

  async update(
    id,
    name,
    link,
    videoCount,
    description,
    checkpoints,
    status,
    source,
    recurrenceIntervalMinutes,
    assignedUserId
  ) {
    await pool.execute(
      `UPDATE work_items 
       SET 
         name = ?, 
         link = ?, 
         video_count = ?, 
         description = ?, 
         checkpoints = ?, 
         status = ?, 
         source = ?, 
         recurrence_interval_minutes = ?, 
         assigned_user_id = ?, 
         updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        name,
        link,
        videoCount || null,
        description || null,
        checkpoints || null,
        status || 'pending',
        source || 'other',
        recurrenceIntervalMinutes || null,
        assignedUserId || null,
        id
      ]
    );
    return this.findById(id);
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM work_items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getStats() {
    const [totalRows] = await pool.execute('SELECT COUNT(*) as total FROM work_items');
    const [statusRows] = await pool.execute(
      `SELECT status, COUNT(*) as count 
       FROM work_items 
       GROUP BY status`
    );
    const [videoCountRows] = await pool.execute(
      'SELECT SUM(video_count) as total FROM work_items WHERE video_count IS NOT NULL'
    );
    const [recentRows] = await pool.execute(
      `SELECT wi.*, u.username as created_by_username 
       FROM work_items wi 
       LEFT JOIN users u ON wi.created_by = u.id 
       ORDER BY GREATEST(wi.created_at, wi.updated_at) DESC 
       LIMIT 5`
    );
    const [userStatsRows] = await pool.execute(
      `SELECT u.username, COUNT(wi.id) as item_count 
       FROM users u 
       LEFT JOIN work_items wi ON u.id = wi.created_by 
       GROUP BY u.id, u.username`
    );

    const statusBreakdown = {
      pending: 0,
      in_progress: 0,
      completed: 0
    };
    statusRows.forEach(row => {
      statusBreakdown[row.status] = row.count;
    });

    const total = totalRows[0].total;
    const completionRate = total > 0 ? ((statusBreakdown.completed / total) * 100).toFixed(1) : 0;

    return {
      total,
      statusBreakdown,
      totalVideoCount: videoCountRows[0].total || 0,
      recentActivity: recentRows,
      completionRate: parseFloat(completionRate),
      userStats: userStatsRows
    };
  }
};

module.exports = WorkItem;

