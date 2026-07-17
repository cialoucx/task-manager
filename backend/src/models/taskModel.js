const db = require('../db/database');

function rowToTask(row) {
  if (!row) return null;
  return { ...row, completed: !!row.completed };
}

const TaskModel = {
  findAll({ userId, status = 'all', search = '', dueDateFilter = '', sortBy = 'newest' } = {}) {
    let query = 'SELECT * FROM tasks WHERE userId = ?';
    const params = [userId];

    if (status === 'active') {
      query += ' AND completed = 0';
    } else if (status === 'inactive') {
      query += ' AND completed = 1';
    }

    if (search && search.trim() !== '') {
      query += ' AND LOWER(title) LIKE ?';
      params.push(`%${search.trim().toLowerCase()}%`);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (dueDateFilter === 'today') {
      query += ' AND dueDate = ?';
      params.push(todayStr);
    } else if (dueDateFilter === 'week') {
      const oneWeekLater = new Date();
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      const oneWeekLaterStr = oneWeekLater.toISOString().split('T')[0];
      query += ' AND dueDate >= ? AND dueDate <= ?';
      params.push(todayStr, oneWeekLaterStr);
    } else if (dueDateFilter === 'overdue') {
      query += ' AND dueDate < ? AND completed = 0';
      params.push(todayStr);
    } else if (dueDateFilter === 'high') {
      query += " AND priority = 'high'";
    }

    // Sort options
    if (sortBy === 'newest') {
      query += ' ORDER BY createdAt DESC';
    } else if (sortBy === 'oldest') {
      query += ' ORDER BY createdAt ASC';
    } else if (sortBy === 'priority') {
      query += " ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END ASC, createdAt DESC";
    } else if (sortBy === 'dueDate') {
      query += ' ORDER BY CASE WHEN dueDate IS NULL THEN 1 ELSE 0 END ASC, dueDate ASC, createdAt DESC';
    } else if (sortBy === 'alphabetical') {
      query += ' ORDER BY LOWER(title) ASC';
    } else {
      query += ' ORDER BY createdAt DESC';
    }

    const rows = db.prepare(query).all(...params);
    return rows.map(rowToTask);
  },

  findById(id) {
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    return rowToTask(row);
  },

  create({ title, description = '', dueDate = null, priority = 'medium', columnPosition = 0, userId }) {
    const now = new Date().toISOString();
    const stmt = db.prepare(
      `INSERT INTO tasks (title, description, completed, dueDate, priority, columnPosition, userId, createdAt, updatedAt)
       VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?)`
    );
    const info = stmt.run(title, description, dueDate, priority, columnPosition, userId, now, now);
    return this.findById(info.lastInsertRowid);
  },

  update(id, fields) {
    const existing = this.findById(id);
    if (!existing) return null;

    const title = fields.title !== undefined ? fields.title : existing.title;
    const description = fields.description !== undefined ? fields.description : existing.description;
    const completed = fields.completed !== undefined ? (fields.completed ? 1 : 0) : (existing.completed ? 1 : 0);
    const dueDate = fields.dueDate !== undefined ? fields.dueDate : existing.dueDate;
    const priority = fields.priority !== undefined ? fields.priority : existing.priority;
    const columnPosition = fields.columnPosition !== undefined ? fields.columnPosition : existing.columnPosition;
    const now = new Date().toISOString();

    db.prepare(
      `UPDATE tasks SET title = ?, description = ?, completed = ?, dueDate = ?, priority = ?, columnPosition = ?, updatedAt = ? WHERE id = ?`
    ).run(title, description, completed, dueDate, priority, columnPosition, now, id);

    return this.findById(id);
  },

  remove(id) {
    const existing = this.findById(id);
    if (!existing) return null;
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return existing;
  },
};

module.exports = TaskModel;
