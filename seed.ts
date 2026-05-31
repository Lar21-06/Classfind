import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import path from 'path';

const db = createClient({ url: `file:${path.join(__dirname, 'dev.db')}` });

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await db.batch([
    { sql: 'DELETE FROM Review', args: [] },
    { sql: 'DELETE FROM EnrollmentRequest', args: [] },
    { sql: 'DELETE FROM TeacherProfile', args: [] },
    { sql: 'DELETE FROM User', args: [] },
    { sql: 'DELETE FROM Subject', args: [] },
  ]);

  // Subjects
  const subjects = [
    { name: 'Maths', slug: 'maths', icon: '📐' },
    { name: 'Chemistry', slug: 'chemistry', icon: '⚗️' },
    { name: 'Physics', slug: 'physics', icon: '⚡' },
    { name: 'Biology', slug: 'biology', icon: '🧬' },
    { name: 'English', slug: 'english', icon: '📚' },
    { name: 'History', slug: 'history', icon: '🏛️' },
    { name: 'Computing', slug: 'computing', icon: '💻' },
    { name: 'Economics', slug: 'economics', icon: '📊' },
  ];

  for (const s of subjects) {
    await db.execute({ sql: 'INSERT INTO Subject (id, name, slug, icon) VALUES (?, ?, ?, ?)', args: [randomUUID(), s.name, s.slug, s.icon] });
  }
  console.log('✅ Subjects created');

  // Admin
  const adminId = randomUUID();
  await db.execute({
    sql: 'INSERT INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
    args: [adminId, 'Admin', 'admin@classfind.com', await bcrypt.hash('admin123', 10), 'ADMIN'],
  });

  // Teachers
  const teacherData = [
    { name: 'Sarah Perera', email: 'sarah@example.com', bio: 'Experienced A/L Maths and Physics teacher with 8 years in top Colombo schools. I focus on making complex concepts simple and exam-ready.', phone: '+94 71 234 5678', subjects: ['Maths', 'Physics'], priceRange: 'Rs. 2,000 - 3,000/hr' },
    { name: 'Rajan Fernando', email: 'rajan@example.com', bio: 'BSc Chemistry graduate from University of Kelaniya. Specialist in A/L and O/L Chemistry. 5 years experience.', phone: '+94 77 345 6789', subjects: ['Chemistry', 'Biology'], priceRange: 'Rs. 1,500 - 2,500/hr' },
    { name: 'Amali Silva', email: 'amali@example.com', bio: 'English Literature graduate passionate about teaching English language and Communication. Online and home visits available.', phone: '+94 76 456 7890', subjects: ['English', 'History'], priceRange: 'Rs. 1,200 - 2,000/hr' },
  ];

  const teacherIds: string[] = [];
  const teacherProfileIds: string[] = [];

  for (const t of teacherData) {
    const userId = randomUUID();
    const profileId = randomUUID();
    teacherIds.push(userId);
    teacherProfileIds.push(profileId);
    await db.execute({
      sql: 'INSERT INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      args: [userId, t.name, t.email, await bcrypt.hash('teacher123', 10), 'TEACHER'],
    });
    await db.execute({
      sql: 'INSERT INTO TeacherProfile (id, userId, bio, phone, subjects, priceRange, isApproved, rating) VALUES (?, ?, ?, ?, ?, ?, 1, 0)',
      args: [profileId, userId, t.bio, t.phone, JSON.stringify(t.subjects), t.priceRange],
    });
  }
  console.log('✅ Teachers created');

  // Students
  const student1Id = randomUUID();
  const student2Id = randomUUID();
  await db.execute({ sql: 'INSERT INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', args: [student1Id, 'John Abeysekara', 'john@example.com', await bcrypt.hash('student123', 10), 'STUDENT'] });
  await db.execute({ sql: 'INSERT INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', args: [student2Id, 'Nisha Bandara', 'nisha@example.com', await bcrypt.hash('student123', 10), 'STUDENT'] });
  console.log('✅ Students created');

  // Reviews
  const reviewData = [
    { studentId: student1Id, teacherProfileId: teacherProfileIds[0], rating: 5, comment: 'Excellent teacher! Made A/L Maths so clear. Highly recommended.' },
    { studentId: student2Id, teacherProfileId: teacherProfileIds[0], rating: 4, comment: 'Very patient and thorough. My grades improved significantly.' },
    { studentId: student1Id, teacherProfileId: teacherProfileIds[1], rating: 5, comment: 'Chemistry became my favourite subject after lessons with Rajan sir!' },
  ];

  for (const r of reviewData) {
    await db.execute({
      sql: 'INSERT INTO Review (id, studentId, teacherId, rating, comment) VALUES (?, ?, ?, ?, ?)',
      args: [randomUUID(), r.studentId, r.teacherProfileId, r.rating, r.comment],
    });
  }

  // Update ratings
  for (const profileId of teacherProfileIds) {
    const res = await db.execute({ sql: 'SELECT AVG(rating) as avg FROM Review WHERE teacherId = ?', args: [profileId] });
    const avg = (res.rows[0] as any).avg || 0;
    await db.execute({ sql: 'UPDATE TeacherProfile SET rating = ? WHERE id = ?', args: [avg, profileId] });
  }
  console.log('✅ Reviews created');

  console.log('\n🎉 Seed complete!\n');
  console.log('Credentials:');
  console.log('  Admin:   admin@classfind.com / admin123');
  console.log('  Teacher: sarah@example.com / teacher123');
  console.log('  Teacher: rajan@example.com / teacher123');
  console.log('  Teacher: amali@example.com / teacher123');
  console.log('  Student: john@example.com / student123');
  console.log('  Student: nisha@example.com / student123');
}

seed().catch(console.error).finally(() => process.exit());
