import Badge from '../ui/Badge';

export default function SkillsList({ skills }: { skills: string[] }) {
  return (
    <section>
      <h2 className="mb-4 text-h2 text-ink-900">Kỹ năng bạn đạt được</h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} tone="brand" className="px-4 py-2 text-sm">
            {skill}
          </Badge>
        ))}
      </div>
    </section>
  );
}
