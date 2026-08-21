import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { cn } from '../../../lib/cn';
import type { RhythmMatrix } from '../../../behavior/rhythm';

/** Nhạt → đậm theo số phút học. Ô xám là khoảng không học. */
const EMPTY = '#F5F5F4';
const RAMP = ['#FDEAD7', '#F9DBAF', '#F7B27A', '#EF6820'];

const GAP = 2;
const GROUP_GAP = 6; // khoảng chừa giữa các khối tháng
const GRID_HEIGHT = 250; // chiều cao mong muốn của phần lưới
const MIN_CELL = 12; // nhỏ hơn nữa thì ô vừa không thấy vừa không trỏ vào được

/**
 * Vẽ lưới nhịp học. Nhận đúng một ma trận hàng × cột kèm nhãn, nên bốn kiểu lưới
 * (giờ trong ngày, ngày × khung giờ, tuần × thứ, khối tháng) dùng chung một đường vẽ.
 *
 * Ô tự co giãn để lưới lấp khung: ít cột thì ô rộng ra, nhiều cột thì ô nhỏ lại và
 * giữ dạng vuông cho giống thiết kế.
 */
export function RhythmHeatmap({ matrix }: { matrix: RhythmMatrix }) {
  const { cells, rowLabels, colLabels, colGroups, cols, grouped, mode } = matrix;

  // Ngưỡng màu lấy từ chính phân bố các ô có học, để một buổi học dồn bất thường
  // không kéo hết những ô còn lại xuống cùng một sắc nhạt.
  const steps = useMemo(() => {
    const vals = cells
      .flat()
      .filter((c): c is NonNullable<typeof c> => c != null)
      .map((c) => c.minutes)
      .filter((v) => v > 0)
      .sort((a, b) => a - b);
    if (vals.length === 0) return [1, 2, 3, Infinity];
    const q = (t: number) => vals[Math.min(vals.length - 1, Math.floor(vals.length * t))];
    return [q(0.25), q(0.5), q(0.75), Infinity];
  }, [cells]);

  const colorOf = (minutes: number): string => {
    if (minutes <= 0) return EMPTY;
    for (let i = 0; i < steps.length; i++) if (minutes <= steps[i]) return RAMP[i];
    return RAMP[RAMP.length - 1];
  };

  const rows = cells.length;

  // Đo bề rộng thật của khung rồi mới tính cỡ ô. Trước đây con số này bị cắm cứng theo
  // cỡ máy tính, nên hễ khung hẹp hơn giả định là lưới tràn ra và mọc thanh cuộn ngang.
  const scroller = useRef<HTMLDivElement>(null);
  const labelCol = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const measure = () => {
      // clientWidth đã gồm cả padding hai bên của vùng cuộn, phải trừ ra mới là chỗ thật
      // còn lại cho lưới — thiếu bước này thì lệch một lượng cố định ở mọi khổ màn.
      const cs = getComputedStyle(el);
      const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      setTrack(Math.max(0, el.clientWidth - pad - (labelCol.current?.offsetWidth ?? 0)));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    // Theo dõi cả cột nhãn: đổi kiểu lưới là nhãn hàng đổi từ "0–4h" sang "Chủ nhật",
    // cột nhãn rộng ra nhưng vùng cuộn thì không đổi nên số đo cũ vẫn còn nguyên.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (labelCol.current) ro.observe(labelCol.current);
    return () => ro.disconnect();
  }, [mode, cols]);

  const groupGaps = grouped ? Math.max(0, colGroups.length - 1) * (GROUP_GAP - GAP) : 0;
  const free = Math.max(0, (track ?? 1120) - Math.max(0, cols - 1) * GAP - groupGaps);
  // Nhiều cột thì giữ ô vuông cho giống thiết kế; ít cột thì cho ô rộng ra thành hình
  // chữ nhật, nếu không lưới sẽ teo thành một vệt nhỏ giữa cái thẻ rất rộng.
  const dense = cols > 26;
  const fit = Math.floor(free / Math.max(1, cols));
  const w = dense ? Math.max(MIN_CELL, Math.min(24, fit)) : Math.max(MIN_CELL, Math.min(160, fit));
  const h = dense ? w : Math.max(20, Math.min(56, Math.floor(GRID_HEIGHT / rows)));
  /** cột quá hẹp để chứa nhãn đầy đủ */
  const tight = w < 26;

  // Khung hẹp tới mức ô đã co hết cỡ mà vẫn không vừa (xem cả năm trên điện thoại) thì
  // đành cuộn ngang — cuộn sẵn về cuối để phần gần đây nằm trong tầm mắt.
  useEffect(() => {
    const el = scroller.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth;
  }, [mode, cols, w]);

  /** khoảng cách bên phải của một cột: rộng hơn ở chỗ giáp hai khối tháng */
  const gapAfter = (col: number): number => {
    if (!grouped) return GAP;
    const isLastOfGroup = colGroups.some((g) => g.start + g.span - 1 === col);
    return isLastOfGroup ? GROUP_GAP : GAP;
  };

  return (
    <div className="flex flex-col gap-lg">
      <div ref={scroller} className="-mx-3xl overflow-x-auto overflow-y-hidden px-3xl">
        <div className="flex min-w-max">
          {/* cột nhãn hàng, dính bên trái để không trôi mất khi cuộn ngang */}
          <div ref={labelCol} className="sticky left-0 z-10 flex flex-col bg-primary pr-lg" style={{ gap: GAP }}>
            <div style={{ height: 18 }} aria-hidden="true" />
            {rowLabels.map((label) => (
              <div
                key={label}
                data-weekday
                className="flex items-center whitespace-nowrap text-xs font-medium text-tertiary"
                style={{ height: h }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex flex-col" style={{ gap: GAP }}>
            {/* hàng nhãn cột: nhãn dày cho kiểu giờ và kiểu ngày, nhãn thưa cho hai kiểu còn lại */}
            <div className="flex" style={{ height: 18 }}>
              {colLabels.length > 0
                ? colLabels.map((label, i) => (
                    <div
                      key={`${label}-${i}`}
                      data-col-label
                      className={cn('overflow-hidden whitespace-nowrap text-center font-medium text-tertiary', tight ? 'text-[10px]' : 'text-xs')}
                      style={{ width: w, marginRight: i === cols - 1 ? 0 : gapAfter(i), lineHeight: '18px' }}
                    >
                      {/* Cột hẹp thì bỏ tiền tố "T" của nhãn tháng, không thì các nhãn dính
                          vào nhau thành "T10T11T12". */}
                      {tight ? label.replace(/^T(?=\d)/, '') : label}
                    </div>
                  ))
                : colGroups.map((g) => (
                    <div
                      key={`${g.label}-${g.start}`}
                      data-month-label
                      className="whitespace-nowrap text-left text-xs font-medium text-tertiary"
                      style={{
                        width: g.span * w + (g.span - 1) * GAP,
                        marginRight: g.start + g.span >= cols ? 0 : gapAfter(g.start + g.span - 1),
                        lineHeight: '18px',
                      }}
                    >
                      {g.label}
                    </div>
                  ))}
            </div>

            {cells.map((row, ri) => (
              <div key={ri} data-row={ri} className="flex">
                {row.map((cell, ci) =>
                  cell == null ? (
                    <span key={ci} style={{ width: w, height: h, marginRight: ci === cols - 1 ? 0 : gapAfter(ci) }} aria-hidden="true" />
                  ) : (
                    <span
                      key={ci}
                      data-day-cell
                      className="rp-cell rounded-[2px]"
                      style={
                        {
                          width: w,
                          height: h,
                          marginRight: ci === cols - 1 ? 0 : gapAfter(ci),
                          background: colorOf(cell.minutes),
                          '--rp-delay': `${Math.min(12, Math.floor(ci / Math.max(1, Math.floor(cols / 12)))) * 26}ms`,
                        } as CSSProperties
                      }
                      title={cell.tooltip ?? undefined}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-md text-xs text-tertiary">
        <span>Ít</span>
        <span className="flex gap-xxs">
          {RAMP.map((c) => (
            <span key={c} className="h-[16px] w-[16px] rounded-[2px]" style={{ background: c }} />
          ))}
        </span>
        <span>Nhiều</span>
      </div>
    </div>
  );
}
