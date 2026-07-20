import { BookOpen, Clock, GraduationCap } from 'lucide-react';
import { LEVEL_LABEL, type Course } from '../../mock/types';

export default function StatsRow({ course }: { course: Course }) {
  const stats = [
    { icon: BookOpen, value: course.lessonCount + ' bài học', label: 'Nội dung' },
    { icon: GraduationCap, value: LEVEL_LABEL[course.level], label: 'Cấp độ' },
    { icon: Clock, value: course.durationHours + ' giờ', label: 'Thời lượng' },
  ];

  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-4">
      {stats.map(({ icon: Icon, value, label }) => (
        <div key={label} className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-white/60" aria-hidden="true" />
          <div>
            <dd className="font-bold text-white">{value}</dd>
            <dt className="text-xs text-white/60">{label}</dt>
          </div>
        </div>
      ))}
    </dl>
  );
}
