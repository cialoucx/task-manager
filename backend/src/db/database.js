const Database = require('better-sqlite3');
const path = require('path');

const dbName = process.env.NODE_ENV === 'test' ? 'tasks.test.db' : 'tasks.db';
const dbPath = path.join(__dirname, '..', '..', 'data', dbName);

const fs = require('fs');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// 1. Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

// 2. Create tasks table with base schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    completed INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

// 3. Create activity_logs table
db.exec(`
  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskId INTEGER,
    userId INTEGER NOT NULL,
    action TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    details TEXT,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// 4. Run migrations for tasks table dynamically
const pragmaInfo = db.pragma('table_info(tasks)');
const columns = pragmaInfo.map((col) => col.name);

if (!columns.includes('dueDate')) {
  db.exec('ALTER TABLE tasks ADD COLUMN dueDate TEXT');
}

if (!columns.includes('priority')) {
  db.exec("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'");
}

if (!columns.includes('columnPosition')) {
  db.exec('ALTER TABLE tasks ADD COLUMN columnPosition INTEGER DEFAULT 0');
}

if (!columns.includes('userId')) {
  db.exec('ALTER TABLE tasks ADD COLUMN userId INTEGER REFERENCES users(id) ON DELETE CASCADE');
}

module.exports = db;
