import { Routes, Route } from 'react-router-dom';
import PageShell from './components/layout/PageShell';
import DashboardPage from './routes/DashboardPage';
import TopicPage from './routes/TopicPage';
import CourseDetailPage from './routes/CourseDetailPage';
import LearnPage from './routes/LearnPage';
import NotFound from './routes/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<PageShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/topics/:slug" element={<TopicPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* Lesson player is a full-screen layout, outside PageShell */}
      <Route path="/learn/:courseSlug/:lessonId" element={<LearnPage />} />
    </Routes>
  );
}
