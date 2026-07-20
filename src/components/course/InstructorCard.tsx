import Avatar from '../ui/Avatar';
import Card from '../ui/Card';
import type { Instructor } from '../../mock/types';

export default function InstructorCard({ instructor }: { instructor: Instructor }) {
  return (
    <Card className="p-6">
      <h2 className="text-h3 text-ink-900">Giảng viên</h2>
      <div className="mt-4 flex items-center gap-3">
        <Avatar name={instructor.name} src={instructor.avatar} size="lg" />
        <div>
          <p className="font-bold text-ink-900">{instructor.name}</p>
          <p className="text-sm text-ink-500">{instructor.title}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-ink-700">{instructor.bio}</p>
    </Card>
  );
}
