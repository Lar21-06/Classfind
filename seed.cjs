const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const path = require('path');

const db = createClient({ url: 'file:' + path.join(__dirname, 'dev.db') });

async function seed() {
  console.log('🌱 Seeding database...');

  const tables = ['Review','EnrollmentRequest','TeacherProfile','User','Subject'];
  for (const t of tables) await db.execute('DELETE FROM ' + t);

  const subjects = [
    ['Maths','maths','📐'],['Chemistry','chemistry','⚗️'],['Physics','physics','⚡'],
    ['Biology','biology','🧬'],['English','english','📚'],['History','history','🏛️'],
    ['Computing','computing','💻'],['Economics','economics','📊']
  ];
  for (const [name,slug,icon] of subjects)
    await db.execute({ sql:'INSERT INTO Subject(id,name,slug,icon)VALUES(?,?,?,?)', args:[randomUUID(),name,slug,icon] });

  await db.execute({ sql:'INSERT INTO User(id,name,email,password,role)VALUES(?,?,?,?,?)',
    args:[randomUUID(),'Admin','admin@classfind.com',await bcrypt.hash('admin123',10),'ADMIN'] });

  const teachers = [
    { name:'Sarah Perera', email:'sarah@example.com', bio:'Experienced A/L Maths and Physics teacher with 8 years in top Colombo schools. I focus on making complex concepts simple and exam-ready.', phone:'+94 71 234 5678', subjects:['Maths','Physics'], price:'Rs. 2,000 - 3,000/hr' },
    { name:'Rajan Fernando', email:'rajan@example.com', bio:'BSc Chemistry graduate from University of Kelaniya. Specialist in A/L and O/L Chemistry. 5 years experience.', phone:'+94 77 345 6789', subjects:['Chemistry','Biology'], price:'Rs. 1,500 - 2,500/hr' },
    { name:'Amali Silva', email:'amali@example.com', bio:'English Literature graduate passionate about teaching English language and Communication. Online and home visits available.', phone:'+94 76 456 7890', subjects:['English','History'], price:'Rs. 1,200 - 2,000/hr' },
  ];
  const tIds=[], tPids=[];
  for (const t of teachers) {
    const uid=randomUUID(), pid=randomUUID();
    tIds.push(uid); tPids.push(pid);
    await db.execute({ sql:'INSERT INTO User(id,name,email,password,role)VALUES(?,?,?,?,?)',
      args:[uid,t.name,t.email,await bcrypt.hash('teacher123',10),'TEACHER'] });
    await db.execute({ sql:'INSERT INTO TeacherProfile(id,userId,bio,phone,subjects,priceRange,isApproved,rating)VALUES(?,?,?,?,?,?,1,0)',
      args:[pid,uid,t.bio,t.phone,JSON.stringify(t.subjects),t.price] });
  }

  const s1=randomUUID(), s2=randomUUID();
  await db.execute({ sql:'INSERT INTO User(id,name,email,password,role)VALUES(?,?,?,?,?)',
    args:[s1,'John Abeysekara','john@example.com',await bcrypt.hash('student123',10),'STUDENT'] });
  await db.execute({ sql:'INSERT INTO User(id,name,email,password,role)VALUES(?,?,?,?,?)',
    args:[s2,'Nisha Bandara','nisha@example.com',await bcrypt.hash('student123',10),'STUDENT'] });

  const reviews = [
    { sid:s1, tid:tPids[0], r:5, c:'Excellent teacher! Made A/L Maths so clear. Highly recommended.' },
    { sid:s2, tid:tPids[0], r:4, c:'Very patient and thorough. My grades improved significantly.' },
    { sid:s1, tid:tPids[1], r:5, c:'Chemistry became my favourite subject after lessons with Rajan sir!' },
  ];
  for (const rv of reviews) {
    await db.execute({ sql:'INSERT INTO Review(id,studentId,teacherId,rating,comment)VALUES(?,?,?,?,?)',
      args:[randomUUID(),rv.sid,rv.tid,rv.r,rv.c] });
  }

  for (const pid of tPids) {
    const res = await db.execute({ sql:'SELECT AVG(rating) as avg FROM Review WHERE teacherId=?', args:[pid] });
    const avg = res.rows[0].avg || 0;
    await db.execute({ sql:'UPDATE TeacherProfile SET rating=? WHERE id=?', args:[avg,pid] });
  }

  console.log('\n✅ Seed complete!\n');
  console.log('Login Credentials:');
  console.log('  Admin:   admin@classfind.com / admin123');
  console.log('  Teacher: sarah@example.com   / teacher123');
  console.log('  Teacher: rajan@example.com   / teacher123');
  console.log('  Teacher: amali@example.com   / teacher123');
  console.log('  Student: john@example.com    / student123');
  console.log('  Student: nisha@example.com   / student123');
}

seed().catch(console.error).finally(() => process.exit());
