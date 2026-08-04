import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, ClipboardCheck, Compass, LayoutDashboard, Smile, Sparkles, Target, TrendingUp } from 'lucide-react';
import { getLearnerAnalytics } from '../../mock/analytics';
import { Reveal } from './Reveal';
import { SectionRail, type RailSection } from './SectionRail';
import { AiCompanion } from './AiCompanion';
import { BentoOverview } from './sections/BentoOverview';
import { ProgressSection } from './sections/ProgressSection';
import { MasterySection } from './sections/MasterySection';
import { AssessmentSection } from './sections/AssessmentSection';
import { RhythmSection } from './sections/RhythmSection';
import { MindsetSection } from './sections/MindsetSection';
import { RecommendationSection } from './sections/RecommendationSection';

interface SectionMeta extends RailSection {
  hint: string;
}

const SECTIONS: SectionMeta[] = [
  { id: 'tong-quan', label: 'Tổng quan', Icon: LayoutDashboard, hint: 'Đây là bức tranh tổng quan. Bạn đang đúng nhịp — mạnh phần Nền tảng AI, cần để ý thêm phần Học máy. Bấm vào từng thẻ để đi sâu hơn nhé.' },
  { id: 'tien-do', label: 'Tiến độ', Icon: TrendingUp, hint: 'Bạn đã đi được 64% khóa AI, chỉ còn vài bài. Giữ nhịp học đều như mấy tuần nay thì khoảng 20/8 là hoàn thành.' },
  { id: 'thanh-thao', label: 'Thành thạo', Icon: Target, hint: 'Phần Học máy còn yếu, chủ yếu vì bài “Đánh giá mô hình” chưa vững. Ôn lại nó trước sẽ mở thông cả nhánh phía sau.' },
  { id: 'danh-gia', label: 'Đánh giá', Icon: ClipboardCheck, hint: 'Bạn hay lẫn giữa học có giám sát và không giám sát. Phần Đạo đức AI đang thấp nhất, nên làm lại một bài ngắn cho chắc.' },
  { id: 'nhip-hoc', label: 'Nhịp học', Icon: CalendarClock, hint: 'Bạn học tập trung nhất vào khoảng 21–23h các ngày trong tuần. Mình sẽ nhắc bài mới vào tối đầu tuần cho hợp với bạn.' },
  { id: 'cam-xuc', label: 'Cảm xúc', Icon: Smile, hint: 'Có bài bạn thấy khó và suýt bỏ, nhưng vẫn quay lại làm cho xong — điều đó đáng quý. Đừng đánh giá mình qua một bài làm sai.' },
  { id: 'goi-y', label: 'Gợi ý', Icon: Sparkles, hint: 'Bước hợp lý tiếp theo: học “Phân loại với học có giám sát”. Ôn nhanh “Đánh giá mô hình” khoảng 10 phút trước cho nhẹ.' },
];

export function AnalyticsExperience() {
  const a = getLearnerAnalytics();
  const [activeId, setActiveId] = useState('tong-quan');
  const [tour, setTour] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const tourRef = useRef(false);

  useEffect(() => {
    tourRef.current = tour;
  }, [tour]);

  // Scrollspy — highlight the section crossing the middle band (paused during a guided tour).
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => Boolean(e));
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (tourRef.current) return;
        const visible = entries.filter((e) => e.isIntersecting).sort((x, y) => y.intersectionRatio - x.intersectionRatio);
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  // Defer scrolling past the state-driven re-render/paint, otherwise a same-tick
  // setState (e.g. starting the tour) cancels the programmatic scroll before it runs.
  const rafScroll = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn));

  const scrollTop = () => rafScroll(() => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Scroll the section clear of the sticky header (+ mobile chip bar).
  const scrollToId = (id: string) => {
    if (!document.getElementById(id)) return;
    rafScroll(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const isMobile = window.innerWidth < 1024;
      const offset = 76 + (isMobile ? 56 : 0) + 12;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    });
  };

  const jumpTo = (id: string) => {
    if (id === SECTIONS[0].id) scrollTop();
    else scrollToId(id);
    setActiveId(id);
  };

  const jump = (id: string) => {
    if (tour) setTour(false);
    jumpTo(id);
  };

  const gotoStep = (i: number) => {
    setTourIndex(i);
    setActiveId(SECTIONS[i].id);
    // First step is the top overview — scroll all the way up so nothing sits above it.
    if (i === 0) scrollTop();
    else scrollToId(SECTIONS[i].id);
  };
  const startTour = () => {
    setTour(true);
    gotoStep(0);
  };
  const tourNext = () => {
    if (tourIndex + 1 >= SECTIONS.length) setTour(false);
    else gotoStep(tourIndex + 1);
  };
  const tourPrev = () => {
    if (tourIndex > 0) gotoStep(tourIndex - 1);
  };

  const activeMeta = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];
  const companionLabel = tour ? SECTIONS[tourIndex].label : activeMeta.label;
  const companionMessage = tour ? SECTIONS[tourIndex].hint : activeMeta.hint;

  const renderSection = (id: string) => {
    switch (id) {
      case 'tong-quan':
        return <BentoOverview a={a} onJump={jump} />;
      case 'tien-do':
        return <ProgressSection a={a} />;
      case 'thanh-thao':
        return <MasterySection a={a} />;
      case 'danh-gia':
        return <AssessmentSection a={a} />;
      case 'nhip-hoc':
        return <RhythmSection a={a} />;
      case 'cam-xuc':
        return <MindsetSection a={a} />;
      case 'goi-y':
        return <RecommendationSection a={a} />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-content px-4 pt-lg lg:px-4xl">
      <SectionRail sections={SECTIONS} activeId={activeId} onJump={jump} variant="mobile" />
      <div className="flex gap-3xl pt-md lg:pt-xl">
        <SectionRail sections={SECTIONS} activeId={activeId} onJump={jump} variant="desktop" />
        <main className="flex min-w-0 flex-1 flex-col gap-6xl pb-8xl sm:gap-7xl lg:pb-9xl">
          {SECTIONS.map((s) => (
            <div key={s.id} style={{ opacity: tour && activeId !== s.id ? 0.32 : 1, transition: 'opacity 0.4s ease' }}>
              {renderSection(s.id)}
            </div>
          ))}

          <Reveal>
            <div className="flex flex-col items-center gap-lg rounded-card border border-brand-200 bg-[linear-gradient(120deg,#F0F6FE_0%,#F4F3FF_100%)] p-xl text-center shadow-sm sm:p-6xl">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-secondary shadow-xs">
                <Compass className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-xs">
                <h3 className="text-display-xs font-semibold text-primary">Sẵn sàng cho bước tiếp theo?</h3>
                <p className="max-w-paragraph text-md text-tertiary">Khám phá thêm khóa học mới hoặc quay lại nơi bạn đang học dở.</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-md">
                <Link to="/" className="inline-flex items-center gap-xs rounded-btn bg-button-primary px-6 py-md text-sm font-semibold text-white transition hover:opacity-90">
                  Khám phá thêm khóa học
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to={`/courses/${a.learner.currentCourseSlug}`} className="inline-flex items-center gap-xs rounded-btn border border-button-secondary bg-white px-6 py-md text-sm font-semibold text-secondary transition hover:bg-secondary">
                  Tiếp tục khóa đang học
                </Link>
              </div>
            </div>
          </Reveal>
        </main>
      </div>
      <AiCompanion
        label={companionLabel}
        message={companionMessage}
        tour={tour}
        tourIndex={tourIndex}
        tourTotal={SECTIONS.length}
        onStartTour={startTour}
        onTourNext={tourNext}
        onTourPrev={tourPrev}
        onTourExit={() => setTour(false)}
      />
    </div>
  );
}
