const { createClient } = require('@libsql/client');
const path = require('path');

const db = createClient({ url: 'file:' + path.join(__dirname, 'dev.db') });

async function init() {
  await db.executeMultiple(`
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'STUDENT',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS TeacherProfile (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  bio TEXT,
  phone TEXT,
  subjects TEXT NOT NULL DEFAULT '[]',
  priceRange TEXT,
  photoUrl TEXT,
  isApproved INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES User(id)
);
CREATE TABLE IF NOT EXISTS Review (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  teacherId TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES User(id),
  FOREIGN KEY (teacherId) REFERENCES TeacherProfile(id)
);
CREATE TABLE IF NOT EXISTS EnrollmentRequest (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  teacherId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  receiptUrl TEXT,
  message TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES User(id),
  FOREIGN KEY (teacherId) REFERENCES User(id)
);
CREATE TABLE IF NOT EXISTS Subject (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT
);
  `);
  console.log('✅ Database initialized');
}

init().catch(console.error).finally(() => process.exit());
