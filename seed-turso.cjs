/**
 * Run this ONCE after creating your Turso database to set up tables + seed data.
 * Usage: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node prisma/seed-turso.cjs
 */

const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('❌  Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables first.');
  process.exit(1);
}

const db = createClient({ url, authToken });

async function run() {
  console.log('🔧 Creating tables...');

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

  console.log('🌱 Seeding data...');

  // Clear existing
  for (const t of ['Review','EnrollmentRequest','TeacherProfile','User','Subject']) {
    await db.execute('DELETE FROM ' + t);
  }

  // Subjects
  const subjects = [
    ['Maths','maths','📐'],['Chemistry','chemistry','⚗️'],['Physics','physics','⚡'],
    ['Biology','biology','🧬'],['English','english','📚'],['History','history','🏛️'],
    ['Computing','computing','💻'],['Economics','economics','📊'],
  ];
  for (const [name, slug, icon] of subjects)
    await db.execute({ sql: 'INSERT INTO Subject(id,name,slug,icon)VALUES(?,?,?,?)', args: [randomUUID(), name, slug, icon] });

  // Admin
  await db.execute({ sql: 'INSERT INTO User(id,name,email,password,role)VALUES(?,?,?,?,?)',
    args: [randomUUID(), 'Admin', 'admin@classfind.com', await bcrypt.hash('admin123', 10), 'ADMIN'] });

  // Teachers
  const teachers = [
    { name:'Sarah Perera', email:'sarah@example.com', bio:'Experienced A/L Maths and Physics teacher with 8 years in top Colombo schools.', phone:'+94 71 234 5678', subjects:['Maths','Physics'], price:'Rs. 2,000 - 3,000/hr' },
    { name:'Rajan Fernando', email:'rajan@example.com', bio:'BSc Chemistry graduate from University of Kelaniya. Specialist in A/L and O/L Chemistry.', phone:'+94 77 345 6789', subjects:['Chemistry','Biology'], price:'Rs. 1,500 - 2,500/hr' },
    { name:'Amali Silva', email:'amali@example.com', bio:'English Literature graduate passionate about teaching English and Communication.', phone:'+94 76 456 7890', subjects:['English','History'], price:'Rs. 1,200 - 2,000/hr' },
  ];
  const tPids = [];
  for (const t of teachers) {
    const uid = randomUUID(), pid = randomUUID();
    tPids.push(pid);
    await db.execute({ sql: 'INSERT INTO User(id,name,email,password,role)VALUES(?,?,?,?,?)',
      args: [uid, t.name, t.email, await bcrypt.hash('teacher123', 10), 'TEACHER'] });
    await db.execute({ sql: 'INSERT INTO TeacherProfile(id,userId,bio,phone,subjects,priceRange,isApproved,rating)VALUES(?,?,?,?,?,?,1,0)',
      args: [pid, uid, t.bio, t.phone, JSON.stringify(t.subjects), t.price] });
  }

  // Students
  const s1 = randomUUID(), s2 = randomUUID();
  await db.execute({ sql: 'INSERT INTO User(id,name,email,password,role)VALUES(?,?,?,?,?)',
    args: [s1, 'John Abeysekara', 'john@example.com', await bcrypt.hash('student123', 10), 'STUDENT'] });
  await db.execute({ sql: 'INSERT INTO User(id,name,email,password,role)VALUES(?,?,?,?,?)',
    args: [s2, 'Nisha Bandara', 'nisha@example.com', await bcrypt.hash('student123', 10), 'STUDENT'] });

  // Reviews
  const reviews = [
    { sid:s1, tid:tPids[0], r:5, c:'Excellent teacher! Made A/L Maths so clear.' },
    { sid:s2, tid:tPids[0], r:4, c:'Very patient and thorough. My grades improved significantly.' },
    { sid:s1, tid:tPids[1], r:5, c:'Chemistry became my favourite subject after lessons with Rajan sir!' },
  ];
  for (const rv of reviews)
    await db.execute({ sql: 'INSERT INTO Review(id,studentId,teacherId,rating,comment)VALUES(?,?,?,?,?)',
      args: [randomUUID(), rv.sid, rv.tid, rv.r, rv.c] });

  for (const pid of tPids) {
    const res = await db.execute({ sql: 'SELECT AVG(rating) as avg FROM Review WHERE teacherId=?', args: [pid] });
    await db.execute({ sql: 'UPDATE TeacherProfile SET rating=? WHERE id=?', args: [res.rows[0].avg || 0, pid] });
  }

  console.log('\n✅ Turso database ready!\n');
  console.log('Login credentials:');
  console.log('  Admin:   admin@classfind.com / admin123');
  console.log('  Teacher: sarah@example.com   / teacher123');
  console.log('  Student: john@example.com    / student123');
}

run().catch(console.error).finally(() => process.exit());
