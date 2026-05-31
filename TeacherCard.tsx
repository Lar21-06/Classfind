import Link from 'next/link';
import { Star, MapPin, DollarSign } from 'lucide-react';

interface TeacherCardProps {
  teacher: {
    id: string;
    userId: string;
    name: string;
    photoUrl?: string | null;
    subjects: string;
    rating: number;
    priceRange?: string | null;
    bio?: string | null;
  };
}

export default function TeacherCard({ teacher }: TeacherCardProps) {
  let subjectList: string[] = [];
  try { subjectList = JSON.parse(teacher.subjects || '[]'); } catch {}

  const stars = Math.round(teacher.rating);

  return (
    <Link href={`/teachers/${teacher.userId}`} className="group block">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
        {/* Photo */}
        <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
          {teacher.photoUrl ? (
            <img
              src={teacher.photoUrl}
              alt={teacher.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-indigo-200 flex items-center justify-center text-3xl font-bold text-indigo-600">
                {teacher.name[0]}
              </div>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
            {teacher.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            {[1,2,3,4,5].map(i => (
              <Star
                key={i}
                className={`w-4 h-4 ${i <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`}
              />
            ))}
            <span className="text-sm text-slate-500 ml-1">{teacher.rating > 0 ? teacher.rating.toFixed(1) : 'New'}</span>
          </div>

          {/* Subjects */}
          {subjectList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {subjectList.slice(0, 3).map(s => (
                <span key={s} className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
                  {s}
                </span>
              ))}
              {subjectList.length > 3 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500 rounded-full">
                  +{subjectList.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          {teacher.priceRange && (
            <div className="flex items-center gap-1 mt-3 text-sm text-slate-600">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{teacher.priceRange}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
