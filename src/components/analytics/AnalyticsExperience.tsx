import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Target } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { getLearnerData } from '../../mock/analytics';
import { Reveal } from './Reveal';
import { FilterProvider } from './FilterContext';
import { FilterBar } from './FilterBar';
import { StatusTile } from './tiles/StatusTile';
import { TopicCatalogTile } from './tiles/TopicCatalogTile';
import { MasteryTile } from './tiles/MasteryTile';
import { PaceTile } from './tiles/PaceTile';
import { NextBestTile } from './tiles/NextBestTile';
import { CalibrationTile } from './tiles/CalibrationTile';

function Group({ index, title, subtitle, children }: { index: number; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-xl">
      <Reveal>
        <header className="flex flex-col gap-xxs">
          <span className="flex items-center gap-md">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white tabular-nums">{index}</span>
            <h2 className="text-display-xs font-semibold text-primary">{title}</h2>
          </span>
          <p className="pl-[calc(1.75rem+0.5rem)] text-md text-tertiary">{subtitle}</p>
        </header>
      </Reveal>
      {children}
    </section>
  );
}

export function AnalyticsExperience() {
  const data = getLearnerData();
  const currentCourse = data.courses.find((c) => c.status === 'active' && c.page)?.slug ?? 'ai-co-ban-den-thuc-tien';

  return (
    <FilterProvider>
      <div className="mx-auto w-full max-w-content px-4 pb-9xl pt-lg lg:px-4xl">
        <Reveal>
          <div className="flex flex-col gap-lg rounded-card border border-brand-200 bg-[linear-gradient(120deg,#F0F6FE_0%,#F4F3FF_100%)] p-xl shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-3xl">
            <div className="flex items-center gap-xl">
              <Avatar name={data.learner.name} size="lg" className="border-[0.75px] border-[rgba(0,0,0,0.08)]" />
              <div className="flex flex-col gap-xxs">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">Học tập của tôi</span>
                <h1 className="text-display-sm font-semibold text-primary">{data.learner.name}</h1>
                <p className="text-sm text-tertiary">
                  {data.learner.joinedLabel} · {data.courses.length} khóa · {data.topics.length} chủ đề
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-xs rounded-pill bg-white px-lg py-xs text-sm font-medium text-secondary shadow-xs">
              <Target className="h-4 w-4 text-brand-secondary" aria-hidden="true" />
              Mục tiêu {data.learner.goalWeeklyMinutes} phút / tuần
            </span>
          </div>
        </Reveal>

        <FilterBar />

        <div className="flex flex-col gap-7xl">
          <Group index={1} title="Tổng quan & Định hướng" subtitle="Bạn đang ổn hay cần chú ý, và đang dồn sức cho chủ đề nào — chọn một chủ đề để lái cả bảng.">
            <div className="grid gap-xl lg:grid-cols-2">
              <StatusTile data={data} />
              <TopicCatalogTile data={data} />
            </div>
          </Group>

          <Group index={2} title="Kết quả — Mình hiểu tới đâu" subtitle="Chủ đề nào bạn nắm chắc, chủ đề nào còn yếu — hiểu thật, không phải chỉ “đã xem”.">
            <MasteryTile data={data} />
          </Group>

          <Group index={3} title="Thực hiện — Mình giữ nhịp thế nào" subtitle="Có học đều như dự định không, đang khỏe lên hay nguội đi, và bao giờ xong khóa đang học.">
            <PaceTile data={data} />
          </Group>

          <Group index={4} title="Bước tiếp — Giờ học gì" subtitle="Gộp mọi tín hiệu thành việc nên làm tiếp — trong chính các khóa của bạn.">
            <div className="grid gap-xl lg:grid-cols-2">
              <NextBestTile data={data} />
              <CalibrationTile data={data} />
            </div>
          </Group>

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
                <Link to={`/courses/${currentCourse}`} className="inline-flex items-center gap-xs rounded-btn border border-button-secondary bg-white px-6 py-md text-sm font-semibold text-secondary transition hover:bg-secondary">
                  Tiếp tục khóa đang học
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </FilterProvider>
  );
}
