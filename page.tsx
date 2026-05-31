import Link from 'next/link';
import { db } from '@/lib/db';
import { Search, BookOpen, Atom, FlaskConical, Dna, BookMarked, Globe, Monitor, TrendingUp, ArrowRight, Star, Users, CheckCircle } from 'lucide-react';

const SUBJECT_ICONS: Record<string, any> = {
  maths: '📐', chemistry: '⚗️', physics: '⚡', biology: '🧬',
  english: '📚', history: '🏛️', computing: '💻', economics: '📊',
};

const SUBJECT_COLORS: Record<string, string> = {
  maths: 'from-blue-500 to-indigo-600',
  chemistry: 'from-green-500 to-emerald-600',
  physics: 'from-purple-500 to-violet-600',
  biology: 'from-rose-500 to-pink-600',
  english: 'from-amber-500 to-orange-600',
  history: 'from-stone-500 to-brown-600',
  computing: 'from-cyan-500 to-sky-600',
  economics: 'from-teal-500 to-green-600',
};

export default async function HomePage() {
  const subjectsResult = await db.execute('SELECT * FROM Subject ORDER BY name', []);
  const subjects = subjectsResult.rows as any[];

  const statsResult = await db.execute('SELECT COUNT(*) as count FROM User WHERE role = ?', ['TEACHER']);
  const teacherCount = (statsResult.rows[0] as any).count;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:32px_32px]" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Trusted by 500+ students across Sri Lanka
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Find Your Perfect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300">
              Private Teacher
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto mb-10">
            Connect with qualified, vetted tutors for every subject. From A/L to O/L — we&apos;ve got you covered.
          </p>

          {/* Search Bar */}
          <form action="/teachers" method="get" className="max-w-2xl mx-auto">
            <div className="relative flex bg-white rounded-2xl shadow-2xl overflow-hidden">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                name="search"
                type="text"
                placeholder="Search by subject, teacher name..."
                className="flex-1 pl-14 pr-4 py-4 text-slate-800 text-base outline-none"
              />
              <button
                type="submit"
                className="px-6 py-4 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                Search <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm">
            <div className="text-center"><div className="text-2xl font-bold">{teacherCount}+</div><div className="text-indigo-300">Verified Teachers</div></div>
            <div className="text-center"><div className="text-2xl font-bold">8</div><div className="text-indigo-300">Subjects</div></div>
            <div className="text-center"><div className="text-2xl font-bold">24hr</div><div className="text-indigo-300">Enrollment Review</div></div>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Browse by Subject</h2>
          <p className="text-slate-500 mt-2">Find expert teachers in any subject</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {subjects.map((s: any) => {
            const color = SUBJECT_COLORS[s.slug] || 'from-slate-500 to-slate-600';
            const icon = SUBJECT_ICONS[s.slug] || '📖';
            return (
              <Link key={s.id} href={`/subjects/${s.slug}`}>
                <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform duration-200 cursor-pointer shadow-md`}>
                  <div className="text-4xl mb-3">{icon}</div>
                  <div className="font-semibold text-lg">{s.name}</div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <Link href="/subjects" className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:gap-3 transition-all">
            View all subjects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8">
          <div className="bg-indigo-50 rounded-2xl p-8">
            <Users className="w-10 h-10 text-indigo-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">I want to learn</h3>
            <p className="text-slate-600 mb-6">Browse verified teachers, view their profiles, and enroll with a simple request.</p>
            <Link href="/register" className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              Sign up as Student <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-purple-50 rounded-2xl p-8">
            <BookOpen className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">I want to teach</h3>
            <p className="text-slate-600 mb-6">Create your teacher profile, list your subjects, and start receiving enrollment requests.</p>
            <Link href="/register" className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">
              Sign up as Teacher <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
