import { useParams } from 'react-router-dom';
import TopicHero from '../components/course/TopicHero';
import CardGrid from '../components/home/CardGrid';
import CTABanner from '../components/home/CTABanner';
import NotFound from './NotFound';
import { getCoursesByTopic, getTopicBySlug } from '../mock';

export default function TopicPage() {
  const { slug } = useParams();
  const topic = slug ? getTopicBySlug(slug) : undefined;

  if (!topic) return <NotFound />;

  const courses = getCoursesByTopic(topic.id);

  return (
    <div data-testid="page-topic" className="mx-auto max-w-content space-y-10 px-4 py-10">
      <TopicHero topic={topic} courseCount={courses.length} />
      <CardGrid courses={courses} />
      <CTABanner />
    </div>
  );
}
