import ContinueLearning from '../components/home/ContinueLearning';
import LevelTabs from '../components/home/LevelTabs';
import CTABanner from '../components/home/CTABanner';
import CardGrid from '../components/home/CardGrid';
import CollectionGrid from '../components/home/CollectionGrid';
import { getFeaturedCourses } from '../mock';

export default function DashboardPage() {
  return (
    <div data-testid="page-dashboard" className="mx-auto max-w-content space-y-12 px-4 py-8">
      <ContinueLearning />
      <LevelTabs />
      <CTABanner />
      <CardGrid title="Khoá học nổi bật" courses={getFeaturedCourses(8)} />
      <CollectionGrid />
    </div>
  );
}
