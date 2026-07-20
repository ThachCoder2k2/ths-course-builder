import Avatar from '../ui/Avatar';
import Card from '../ui/Card';
import type { Instructor } from '../../mock/types';

export default function InstructorCard({ instructor }: { instructor: Instructor }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-primary">Giảng viên</h2>
      <div className="mt-4 flex items-center gap-3">
        <Avatar name={instructor.name} src={instructor.avatar} size="lg" />
        <div>
          <p className="font-bold text-primary">{instructor.name}</p>
          <p className="text-sm text-tertiary">{instructor.title}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-secondary">{instructor.bio}</p>
    </Card>
  );
}
