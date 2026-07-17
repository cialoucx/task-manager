const db = require('../db/database');

const ActivityModel = {
  findAllByUserId(userId) {
    return db.prepare('SELECT * FROM activity_logs WHERE userId = ? ORDER BY timestamp DESC LIMIT 50').all(userId);
  },

  create({ taskId, userId, action, details = '' }) {
    const now = new Date().toISOString();
    const stmt = db.prepare(
      `INSERT INTO activity_logs (taskId, userId, action, timestamp, details) VALUES (?, ?, ?, ?, ?)`
    );
    const info = stmt.run(taskId || null, userId, action, now, details);
    return db.prepare('SELECT * FROM activity_logs WHERE id = ?').get(info.lastInsertRowid);
  }
};

module.exports = ActivityModel;
