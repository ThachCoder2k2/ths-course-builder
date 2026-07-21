import { useParams } from 'react-router-dom';
import TopicHero from '../components/course/TopicHero';
import TopicGrid from '../components/course/TopicGrid';
import CTABanner from '../components/home/CTABanner';
import NotFound from './NotFound';
import { getCoursesByTopic, getTopicBySlug } from '../mock';

/**
 * Figma: `Chủ đề` (node 181:4130).
 * Full-bleed hero (181:7288), a 1440-container course grid with filter
 * dropdowns (181:4156), and the shared flaticon CTA (182:7394 === CTABanner).
 */
export default function TopicPage() {
  const { slug } = useParams();
  const topic = slug ? getTopicBySlug(slug) : undefined;

  if (!topic) return <NotFound />;

  const courses = getCoursesByTopic(topic.id);

  return (
    <div data-testid="page-topic" className="flex flex-col pb-9xl">
      <TopicHero topic={topic} />

      <div className="mx-auto mt-7xl w-full max-w-[1440px] px-4 lg:px-8">
        <TopicGrid courses={courses} />
      </div>

      <div className="pt-7xl">
        <CTABanner />
      </div>
    </div>
  );
}
