import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

/**
 * Chip trạng thái đúng như Figma 506:5593/5594: NỀN TRẮNG, viền #D5D7DA, bo 6px, chữ
 * #414651. Chỉ cái dấu đầu dòng mới có màu — chấm xanh cho "Đang học", dấu tích xanh lá
 * cho "Hoàn thành".
 *
 * Trước đây tôi tô cả chip theo màu trạng thái (nền xanh nhạt, viền xanh, chữ xanh) —
 * sai màu, và còn làm chip trạng thái nhìn nặng hơn cả tên khoá ở cột bên cạnh.
 */
function StatusPill({ status }: { status: CourseRow['status'] }) {
  return (
    <span className="inline-flex items-center gap-xs whitespace-nowrap rounded-sm bg-primary px-sm py-xxs text-xs font-medium text-secondary ring-1 ring-primary">
      {status === 'done' ? (
        <Check className="h-3 w-3 text-success-600" aria-hidden="true" />
      ) : (
        // #2D7CFB là màu chấm của bộ component trong Figma, nhạt hơn brand-500 một chút
        <span className="h-1.5 w-1.5 rounded-full bg-[#2D7CFB]" aria-hidden="true" />
      )}
      {status === 'done' ? 'Hoàn thành' : 'Đang học'}
    </span>
  );
}

/** Thanh tiến độ: máng 110×8 như thiết kế, rồi cách 12px tới con số. */
function ProgressCell({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <span className="flex items-center gap-lg">
      <span className="h-2 w-[110px] max-w-full shrink overflow-hidden rounded-full bg-quaternary">
        <span className="block h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </span>
      <span className="shrink-0 text-sm font-medium tabular-nums text-secondary">{pct}%</span>
    </span>
  );
}

/**
 * Toàn bộ khoá học trong khoảng đang xem. ĐÚNG sáu cột như Figma 506:5561, không có cột
 * thứ bảy: trước đây tôi thêm một cột "Xem báo cáo" — thiết kế không có cột đó, và ở khổ
 * 1440 nó còn bị mép thẻ cắt mất chữ. Đường vào báo cáo nằm ở chính cú bấm vào dòng,
 * đúng như câu phụ của thẻ đã hứa.
 */
export function CourseTableCard({
  rows,
  slugCoBaoCao,
}: {
  rows: CourseRow[];
  /**
   * Slug của những khoá đã đi hết bài, tức có báo cáo cuối khoá để mở. Truyền vào thay vì
   * tự tính, vì thẻ này chỉ nhận `CourseRow` chứ không có tầng sự kiện để hỏi. Dùng để
   * chọn đích của cú bấm: khoá đã xong thì "chi tiết" của nó là báo cáo cuối khoá.
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

  /** Khoá đã đi hết bài thì bấm vào mở báo cáo cuối khoá; còn lại mở trang khoá. */
  const dich = (r: CourseRow): string | null =>
    slugCoBaoCao?.has(r.slug) ? `/courses/${r.slug}/bao-cao` : r.page ? `/courses/${r.slug}` : null;

  return (
    <ReportCard
      title="Các khoá học của bạn"
      subtitle="Toàn bộ khoá học bạn đã học trong khoảng này - bấm một khoá học để mở chi tiết"
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
                  <th
                    key={c.key}
                    scope="col"
                    className="px-lg py-lg first:pl-3xl last:pr-3xl"
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(c.key)}
                      className="inline-flex items-center gap-xs whitespace-nowrap text-xs font-semibold text-quaternary transition hover:text-primary"
                    >
                      {c.label}
                      {/* Mũi tên CHỈ hiện ở cột đang sắp xếp. Thiết kế không vẽ mũi tên nào
                          cả; sáu mũi tên mờ trên sáu tiêu đề là rác thị giác tôi tự thêm.
                          Giữ một cái ở cột đang xếp thì vừa sạch vừa còn cho biết đang xếp
                          theo cột nào. */}
                      {active ? (
                        sort.dir === 'asc' ? (
                          <ArrowUp className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="h-3 w-3" aria-hidden="true" />
                        )
                      ) : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => {
              const to = dich(r);
              return (
                <tr
                  key={r.id}
                  onClick={to ? () => navigate(to) : undefined}
                  className={cn('border-b border-secondary last:border-0', to && 'cursor-pointer transition hover:bg-secondary')}
                >
                  <td className="px-lg py-xl pl-3xl">
                    <span className="flex flex-col gap-xxs">
                      <span className="min-w-[140px] text-sm font-medium text-primary">{r.title}</span>
                      <span className="text-sm text-tertiary">{TOPIC_NAME[r.topic]}</span>
                    </span>
                  </td>
                  <td className="px-lg py-xl">
                    <ProgressCell value={r.progress} />
                  </td>
                  <td className="px-lg py-xl text-sm tabular-nums text-tertiary">{Math.round(r.mastery * 100)}%</td>
                  <td className="px-lg py-xl">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="whitespace-nowrap px-lg py-xl text-sm text-tertiary">{studyTime(r.minutes)}</td>
                  <td className="whitespace-nowrap px-lg py-xl pr-3xl text-sm text-tertiary">{lastSeen(r.lastActiveDaysAgo)}</td>
                </tr>
              );
            })}
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
                  <dd>
                    <ProgressCell value={r.progress} />
                  </dd>
                </div>
                <div className="flex flex-col gap-xxs">
                  <dt className="text-xs font-semibold text-quaternary">Mức nắm</dt>
                  <dd className="text-sm tabular-nums text-tertiary">{Math.round(r.mastery * 100)}%</dd>
                </div>
                <div className="flex flex-col gap-xxs">
                  <dt className="text-xs font-semibold text-quaternary">Thời gian học</dt>
                  <dd className="text-sm text-tertiary">{studyTime(r.minutes)}</dd>
                </div>
                <div className="flex flex-col gap-xxs">
                  <dt className="text-xs font-semibold text-quaternary">Học gần nhất</dt>
                  <dd className="text-sm text-tertiary">{lastSeen(r.lastActiveDaysAgo)}</dd>
                </div>
              </dl>
            </div>
          );
          const to = dich(r);
          return to ? (
            <button key={r.id} type="button" onClick={() => navigate(to)} className="text-left transition hover:bg-secondary">
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
