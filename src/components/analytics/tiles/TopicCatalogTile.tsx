import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { TileCard } from '../TileCard';
import { useFilters } from '../FilterContext';
import { cat } from '../palette';
import { TOPICS, type CourseStatus, type LearnerData } from '../../../mock/analytics';
import { filterCourses, topicShare } from '../../../lib/analyticsSelectors';

const topicColor = (slug: string) => cat(TOPICS.findIndex((t) => t.slug === slug));

const STATUS_PILL: Record<CourseStatus, { label: string; cls: string }> = {
  active: { label: 'Đang học', cls: 'bg-brand-50 text-brand-secondary' },
  done: { label: 'Hoàn thành', cls: 'bg-success-50 text-success-600' },
  paused: { label: 'Tạm dừng', cls: 'bg-warning-50 text-warning-700' },
};
const STATUS_TABS: { value: 'all' | CourseStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang học' },
  { value: 'done', label: 'Hoàn thành' },
  { value: 'paused', label: 'Tạm dừng' },
];

export function TopicCatalogTile({ data }: { data: LearnerData }) {
  const f = useFilters();
  const [status, setStatus] = useState<'all' | CourseStatus>('all');
  const [search, setSearch] = useState('');
  const shares = topicShare(data, { from: f.from, to: f.to, topic: null });
  const courses = filterCourses(data, { topic: f.topic, status, search });
  const topShare = shares[0];
  const cooled = data.courses.find((c) => c.status === 'paused');

  return (
    <TileCard
      title="Danh mục theo chủ đề"
      subtitle="Bạn đang dành thời gian cho môn nào · bấm để lọc cả bảng theo chủ đề đó"
      info={{
        what: 'Tỉ trọng thời gian học của bạn theo từng chủ đề trong khoảng đang xem, và danh sách khóa học của bạn.',
        how: 'Cộng số phút học mỗi chủ đề trong khoảng thời gian đã chọn rồi chia cho tổng. Bấm một chủ đề để lọc toàn bộ bảng theo chủ đề đó.',
        formula: 'Tỉ trọng chủ đề = phút của chủ đề trong khoảng / tổng phút trong khoảng × 100%.',
      }}
      takeaway={
        <>
          Bạn đang nghiêng về <b>{topShare.name}</b> ({topShare.share}% thời gian). {cooled ? <>Khóa “{cooled.title}” đã tạm dừng khá lâu — cân nhắc quay lại một buổi ngắn.</> : null}
        </>
      }
    >
      <div className="flex flex-col gap-2xl">
        <ul className="flex flex-col gap-md">
          {shares.map((s) => {
            const active = f.topic === s.slug;
            return (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => f.toggleTopic(s.slug)}
                  aria-pressed={active}
                  className={cn('group flex w-full flex-col gap-xs rounded-lg p-xs text-left transition hover:bg-secondary', active && 'bg-brand-50')}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn('flex items-center gap-xs', active ? 'font-semibold text-brand-secondary' : 'text-secondary')}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: topicColor(s.slug) }} />
                      {s.name}
                    </span>
                    <span className="tabular-nums font-semibold text-primary">{s.share}%</span>
                  </div>
                  <span className="h-2 w-full overflow-hidden rounded-pill bg-gray-200">
                    <span className="block h-full rounded-pill" style={{ width: `${s.share}%`, background: topicColor(s.slug) }} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-lg">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div className="inline-flex flex-wrap rounded-lg border border-secondary bg-secondary p-[2px]">
              {STATUS_TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setStatus(t.value)}
                  aria-pressed={status === t.value}
                  className={cn('rounded-md px-md py-xxs text-xs font-semibold transition', status === t.value ? 'bg-primary text-brand-secondary shadow-xs' : 'text-tertiary hover:text-secondary')}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <label className="flex h-9 min-w-[180px] flex-1 items-center gap-xs rounded-md border border-primary bg-primary px-md shadow-xs focus-within:border-brand sm:max-w-[260px]">
              <Search className="h-4 w-4 shrink-0 text-quaternary" aria-hidden="true" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} type="search" aria-label="Tìm khóa học" placeholder="Tìm khóa học…" className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-placeholder" />
            </label>
          </div>

          <div className="dv-scroll max-h-[300px] overflow-y-auto pr-xs">
            <ul className="flex flex-col gap-xs">
              {courses.length === 0 ? <li className="px-md py-lg text-sm text-tertiary">Không có khóa nào khớp bộ lọc.</li> : null}
              {courses.map((c) => {
                const pill = STATUS_PILL[c.status];
                const row = (
                  <div className="flex items-center gap-md rounded-lg border border-secondary bg-primary p-md transition hover:border-brand-alt">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: topicColor(c.topic) }} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-xs truncate text-sm font-medium text-primary">
                        {c.title}
                        {c.page ? <ArrowUpRight className="h-3.5 w-3.5 text-quaternary opacity-0 transition group-hover:opacity-100" aria-hidden="true" /> : null}
                      </span>
                      <span className="text-xs text-tertiary">
                        {c.lessonsDone}/{c.lessonsTotal} bài · mức nắm {c.mastery}%
                      </span>
                    </span>
                    <span className="hidden w-24 sm:block">
                      <span className="flex h-1.5 w-full overflow-hidden rounded-pill bg-gray-200">
                        <span className="block h-full rounded-pill bg-brand-500" style={{ width: `${c.progress}%` }} />
                      </span>
                    </span>
                    <span className={cn('shrink-0 rounded-pill px-md py-xxs text-xs font-semibold', pill.cls)}>{pill.label}</span>
                  </div>
                );
                return <li key={c.slug}>{c.page ? <Link to={`/courses/${c.slug}`} className="group block">{row}</Link> : <div className="group">{row}</div>}</li>;
              })}
            </ul>
          </div>
        </div>
      </div>
    </TileCard>
  );
}
