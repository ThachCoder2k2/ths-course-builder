import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getCollections, getCourseById } from '../../mock';

const TONES = ['bg-accent-blue', 'bg-accent-peach', 'bg-accent-lavender', 'bg-accent-mint'];

export default function CollectionGrid() {
  const collections = getCollections();

  return (
    <section>
      <h2 className="mb-4 text-h2 text-primary">Bộ sưu tập</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {collections.map((collection, index) => {
          const courses = collection.courseIds
            .map((id) => getCourseById(id))
            .filter((course): course is NonNullable<typeof course> => Boolean(course));
          const firstCourse = courses[0];

          return (
            <article key={collection.id} className={'rounded-card p-6 ' + TONES[index % TONES.length]}>
              <h3 className="text-h3 text-primary">{collection.title}</h3>
              <p className="mt-2 text-sm text-secondary">{collection.description}</p>

              <ul className="mt-4 space-y-1">
                {courses.map((course) => (
                  <li key={course.id} className="text-sm text-secondary">
                    • {course.title}
                  </li>
                ))}
              </ul>

              {firstCourse ? (
                <Link
                  to={'/courses/' + firstCourse.slug}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary hover:underline"
                >
                  Bắt đầu bộ sưu tập
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
