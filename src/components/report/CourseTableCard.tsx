import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { cn } from '../../lib/cn';
import { EmptyState } from './EmptyState';
import { TOPIC_NAME } from '../../behavior/catalog';
import type { CourseRow } from '../../behavior/types';

const PAGE_SIZE = 5;

type SortKey = 'title' | 'progress' | 'mastery' | 'status' | 'minutes' | 'lastActiveDaysAgo';

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'title', label: 'Khoá học' },
  { key: 'progress', label: 'Tiến độ' },
  { key: 'mastery', label: 'Mức nắm' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'minutes', label: 'Thời gian học' },
  { key: 'lastActiveDaysAgo', label: 'Học gần nhất' },
];

/** "7 giờ 52 phút" / "45 phút" — đọc thành lời thay vì để số phút trần. */
function studyTime(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  // dòng này chỉ tồn tại khi có hoạt động, nên 0 ở đây là "chưa tới một phút"
  if (m === 0) return 'dưới 1 phút';
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h} giờ` : `${h} giờ ${String(rest).padStart(2, '0')} phút`;
}

/** "Hôm nay" / "Hôm qua" / "2 hôm trước" / "29 ngày trước". */
function lastSeen(daysAgo: number): string {
  if (daysAgo <= 0) return 'Hôm nay';
  if (daysAgo === 1) return 'Hôm qua';
  if (daysAgo === 2) return '2 hôm trước';
  return `${daysAgo} ngày trước`;
}

function StatusPill({ status }: { status: CourseRow['status'] }) {
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-xs whitespace-nowrap rounded-pill bg-success-50 px-md py-xxs text-xs font-medium text-success-700 ring-1 ring-success-200">
        <Check className="h-3 w-3" aria-hidden="true" />
        Hoàn thành
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-xs whitespace-nowrap rounded-pill bg-utility-brand-50 px-md py-xxs text-xs font-medium text-brand-600 ring-1 ring-utility-brand-200">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
      Đang học
    </span>
  );
}

/**
 * Toàn bộ khoá học trong khoảng đang xem. Sáu cột đều xếp được, mặc định là khoá học
 * gần nhất lên đầu. Bấm một dòng sẽ mở trang khoá học đó — dòng nào chưa có trang thật
 * thì để nguyên, không tạo cú bấm chẳng dẫn đi đâu.
 */
export function CourseTableCard({
  rows,
  slugCoBaoCao,
}: {
  rows: CourseRow[];
  /**
   * Slug của những khoá đã đi hết bài, tức có báo cáo cuối khoá để mở. Truyền vào thay vì
   * tự tính, vì thẻ này chỉ nhận `CourseRow` chứ không có tầng sự kiện để hỏi.
   */
  slugCoBaoCao?: Set<string>;
}) {
  const navigate = useNavigate();
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'lastActiveDaysAgo', dir: 'asc' });
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    const val = (r: CourseRow): number | string =>
      sort.key === 'title' ? r.title : sort.key === 'status' ? (r.status === 'active' ? 0 : 1) : r[sort.key];
    return [...rows].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      if (typeof x === 'string' || typeof y === 'string') return String(x).localeCompare(String(y), 'vi') * dir;
      return (x - y) * dir;
    });
  }, [rows, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const slice = sorted.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  // Bảng rỗng thì đừng vẽ khung: thead sáu cột + ô sắp xếp + dòng phân trang làm thẻ
  // cao 342px cho đúng 64px nội dung. Chỉ còn lời nhắn là đủ.
  const empty = sorted.length === 0;

  const toggle = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'title' ? 'asc' : 'desc' }));
    setPage(0);
  };

  return (
    <ReportCard
      title="Các khoá học của bạn"
      subtitle="Toàn bộ khoá học bạn đã học trong khoảng này — bấm một khoá học để mở trang khoá đó"
      bodyClassName="gap-2xl px-none"
    >
      {/* Bảng sáu cột cần chỗ; khung hẹp hơn thì xếp mỗi khoá thành một thẻ nhỏ thay vì
          bắt người đọc kéo ngang. */}
      <table className={cn('hidden w-full border-collapse text-left', !empty && 'lg:table')}>
          <thead>
            <tr className="border-b border-secondary">
              {COLUMNS.map((c) => {
                const active = sort.key === c.key;
                return (
                  <th key={c.key} scope="col" className="px-lg py-lg first:pl-3xl last:pr-3xl">
                    <button
                      type="button"
                      onClick={() => toggle(c.key)}
                      className="inline-flex items-center gap-xs whitespace-nowrap text-xs font-semibold text-quaternary transition hover:text-primary"
                    >
                      {c.label}
                      {active && sort.dir === 'asc' ? (
                        <ArrowUp className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <ArrowDown className={cn('h-3 w-3', !active && 'opacity-30')} aria-hidden="true" />
                      )}
                    </button>
                  </th>
                );
              })}
              {/* Cột này không sắp xếp được nên không dùng nút; để trống tên vì nội dung
                  ô đã tự nói ("Xem báo cáo"), thêm tiêu đề nữa là đọc lên hai lần. */}
              <th scope="col" className="px-lg py-lg pr-3xl">
                <span className="sr-only">Báo cáo cuối khoá</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr
                key={r.id}
                onClick={r.page ? () => navigate(`/courses/${r.slug}`) : undefined}
                className={cn('border-b border-secondary last:border-0', r.page && 'cursor-pointer transition hover:bg-secondary')}
              >
                <td className="px-lg py-xl pl-3xl">
                  <span className="flex flex-col gap-xxs">
                    <span className="min-w-[140px] text-sm font-medium text-primary">{r.title}</span>
                    <span className="text-sm text-tertiary">{TOPIC_NAME[r.topic]}</span>
                  </span>
                </td>
                <td className="px-lg py-xl">
                  <span className="flex items-center gap-md">
                    <span className="h-2 w-16 overflow-hidden rounded-full bg-quaternary">
                      <span className="block h-full rounded-full bg-brand-500" style={{ width: `${Math.round(r.progress * 100)}%` }} />
                    </span>
                    <span className="text-sm tabular-nums text-secondary">{Math.round(r.progress * 100)}%</span>
                  </span>
                </td>
                <td className="px-lg py-xl text-sm tabular-nums text-secondary">{Math.round(r.mastery * 100)}%</td>
                <td className="px-lg py-xl">
                  <StatusPill status={r.status} />
                </td>
                <td className="whitespace-nowrap px-lg py-xl text-sm text-secondary">{studyTime(r.minutes)}</td>
                <td className="whitespace-nowrap px-lg py-xl text-sm text-secondary">{lastSeen(r.lastActiveDaysAgo)}</td>
                <td className="whitespace-nowrap px-lg py-xl pr-3xl text-right">
                  {slugCoBaoCao?.has(r.slug) ? (
                    // stopPropagation vì cả dòng đã có onClick dẫn sang trang khoá học;
                    // thiếu nó thì bấm vào link này lại rơi vào trang khoá, không vào báo cáo.
                    <Link
                      to={`/courses/${r.slug}/bao-cao`}
                      onClick={(e) => e.stopPropagation()}
                      className="ln-press ln-press-flat ln-focus-flat whitespace-nowrap rounded-sm text-sm font-semibold text-brand-secondary"
                    >
                      Xem báo cáo
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
      </table>

      {empty ? <EmptyState text="Chưa mở khoá nào trong khoảng này" /> : null}

      {/* bản cho khung hẹp: mỗi khoá một thẻ, nhãn đi kèm giá trị */}
      <div className={cn('flex flex-col', empty ? 'hidden' : 'lg:hidden')}>
        {slice.map((r) => {
          const body = (
            <div className="flex flex-col gap-lg border-b border-secondary px-3xl py-xl last:border-0">
              <div className="flex flex-wrap items-start justify-between gap-md">
                <span className="flex min-w-0 flex-col gap-xxs">
                  <span className="text-sm font-medium text-primary">{r.title}</span>
                  <span className="text-sm text-tertiary">{TOPIC_NAME[r.topic]}</span>
                </span>
                <StatusPill status={r.status} />
              </div>
              <dl className="grid grid-cols-2 gap-lg sm:grid-cols-4">
                <div className="flex flex-col gap-xxs">
                  <dt className="text-xs font-semibold text-quaternary">Tiến độ</dt>
                  <dd className="flex items-center gap-md">
                    <span className="h-2 w-12 overflow-hidden rounded-full bg-quaternary">
                      <span className="block h-full rounded-full bg-brand-500" style={{ width: `${Math.round(r.progress * 100)}%` }} />
                    </span>
                    <span className="text-sm tabular-nums text-secondary">{Math.round(r.progress * 100)}%</span>
                  </dd>
                </div>
                <div className="flex flex-col gap-xxs">
                  <dt className="text-xs font-semibold text-quaternary">Mức nắm</dt>
                  <dd className="text-sm tabular-nums text-secondary">{Math.round(r.mastery * 100)}%</dd>
                </div>
                <div className="flex flex-col gap-xxs">
                  <dt className="text-xs font-semibold text-quaternary">Thời gian học</dt>
                  <dd className="text-sm text-secondary">{studyTime(r.minutes)}</dd>
                </div>
                <div className="flex flex-col gap-xxs">
                  <dt className="text-xs font-semibold text-quaternary">Học gần nhất</dt>
                  <dd className="text-sm text-secondary">{lastSeen(r.lastActiveDaysAgo)}</dd>
                </div>
              </dl>
            </div>
          );
          return r.page ? (
            <button key={r.id} type="button" onClick={() => navigate(`/courses/${r.slug}`)} className="text-left transition hover:bg-secondary">
              {body}
            </button>
          ) : (
            <div key={r.id}>{body}</div>
          );
        })}
      </div>

      {/* sắp xếp: khung hẹp không có tiêu đề cột để bấm nên đưa ra một ô chọn */}
      <div className={cn('flex flex-wrap items-center gap-md px-3xl', empty ? 'hidden' : 'lg:hidden')}>
        <label htmlFor="course-sort" className="text-xs font-semibold text-quaternary">
          Sắp xếp theo
        </label>
        <select
          id="course-sort"
          value={sort.key}
          onChange={(e) => toggle(e.target.value as SortKey)}
          className="rounded-md bg-primary px-lg py-md text-sm font-medium text-secondary shadow-xs ring-1 ring-primary outline-none"
        >
          {COLUMNS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-tertiary">{sort.dir === 'asc' ? 'tăng dần' : 'giảm dần'}</span>
      </div>

      <div className={cn('flex flex-wrap items-center justify-between gap-lg px-3xl', empty && 'hidden')}>
        <span className="text-sm font-medium text-secondary">
          Trang {current + 1} trên {pages}
        </span>
        <span className="flex gap-lg">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, current - 1))}
            disabled={current === 0}
            className="inline-flex items-center gap-xs rounded-btn bg-primary px-lg py-md text-sm font-semibold text-secondary shadow-xs ring-1 ring-primary transition disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Trang trước
          </button>
          <button
            type="button"
            onClick={() => setPage(Math.min(pages - 1, current + 1))}
            disabled={current >= pages - 1}
            className="inline-flex items-center gap-xs rounded-btn bg-primary px-lg py-md text-sm font-semibold text-secondary shadow-xs ring-1 ring-primary transition disabled:opacity-40"
          >
            Trang sau
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </span>
      </div>
    </ReportCard>
  );
}
