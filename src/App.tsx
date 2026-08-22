import { Routes, Route } from 'react-router-dom';
import PageShell from './components/layout/PageShell';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { RouteTransition } from './components/layout/RouteTransition';
import DashboardPage from './routes/DashboardPage';
import TopicPage from './routes/TopicPage';
import CourseDetailPage from './routes/CourseDetailPage';
import LearnPage from './routes/LearnPage';
import MyLearningPage from './routes/MyLearningPage';
import NotFound from './routes/NotFound';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PageShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/topics/:slug" element={<TopicPage />} />
          <Route path="/hoc-tap-cua-toi" element={<MyLearningPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/*
          Trang học bài là bố cục toàn màn hình, nằm ngoài PageShell — nên nó cũng không
          được hưởng chuyển cảnh của PageShell. Đó chính là chỗ bấm "Bắt đầu học" thấy
          cứng: đo được không có một khung chuyển động nào, cắt thẳng sang trang mới.

          Dùng bản `chiMo` (chỉ đổi độ mờ): trang này có hộp chat `position: fixed`, mà
          `transform` trên tổ tiên sẽ biến tổ tiên thành mốc neo mới và hộp chat rơi sai chỗ.
        */}
        <Route
          path="/learn/:courseSlug/:lessonId"
          element={
            <RouteTransition chiMo>
              <LearnPage />
            </RouteTransition>
          }
        />
      </Routes>
    </>
  );
}
