const db = require('../db/database');

const UserModel = {
  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  findByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  create({ username, password }) {
    const now = new Date().toISOString();
    const stmt = db.prepare(
      `INSERT INTO users (username, password, createdAt) VALUES (?, ?, ?)`
    );
    const info = stmt.run(username, password, now);
    return this.findById(info.lastInsertRowid);
  }
};

module.exports = UserModel;
