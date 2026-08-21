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
const MAX_CELL = 180; // rộng hơn nữa thì ô thành cái thanh, không còn ra dáng lưới

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
  const gridBox = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState<number | null>(null);
  // Bề rộng lưới thực vẽ ra, đo sau khi vẽ. Chú thích "Ít – Nhiều" phải khớp lề phải của
  // lưới; neo vào lề thẻ thì khi ô bị chặn cỡ, chú thích trôi ra giữa vùng trống trông
  // như lưới bị mất mấy cột bên phải. Tính bằng công thức thì lệch, vì ref đọc trong thân
  // render là số của lần vẽ trước.
  const [gridWidth, setGridWidth] = useState<number | null>(null);
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
    const measureGrid = () => setGridWidth(gridBox.current?.offsetWidth ?? null);
    measureGrid();
    // Theo dõi cả cột nhãn: đổi kiểu lưới là nhãn hàng đổi từ "0–4h" sang "Chủ nhật",
    // cột nhãn rộng ra nhưng vùng cuộn thì không đổi nên số đo cũ vẫn còn nguyên.
    const ro = new ResizeObserver(() => {
      measure();
      measureGrid();
    });
    ro.observe(el);
    if (labelCol.current) ro.observe(labelCol.current);
    if (gridBox.current) ro.observe(gridBox.current);
    return () => ro.disconnect();
  }, [mode, cols]);

  const groupGaps = grouped ? Math.max(0, colGroups.length - 1) * (GROUP_GAP - GAP) : 0;
  const free = Math.max(0, (track ?? 1120) - Math.max(0, cols - 1) * GAP - groupGaps);
  // Nhiều cột thì giữ ô vuông cho giống thiết kế; ít cột thì cho ô rộng ra thành hình
  // chữ nhật, nếu không lưới sẽ teo thành một vệt nhỏ giữa cái thẻ rất rộng.
  const dense = cols > 26;
  const fit = Math.floor(free / Math.max(1, cols));
  // Chặn trên nới rộng: mức 160px cũ làm lưới chỉ dùng 74% bề rộng thẻ ở màn to,
  // chú thích "Ít – Nhiều" trôi ra giữa vùng trống trông như hình bị mất mấy cột.
  const w = dense ? Math.max(MIN_CELL, Math.min(24, fit)) : Math.max(MIN_CELL, Math.min(MAX_CELL, fit));
  const h = dense ? w : Math.max(20, Math.min(56, Math.floor(GRID_HEIGHT / rows)));
  /** cột hẹp: nhãn tháng bỏ tiền tố "T" */
  const tight = w < 26;
  /** cột quá hẹp cho nhãn đầy đủ dạng "CN 16/8" (cần ~46px) — phải rút gọn, không chặt */
  const veryTight = w < 48;

  /**
   * Rút gọn nhãn cột thay vì để overflow chặt ngang chữ. Nhãn "CN 16/8" bị cắt còn
   * "CN 16" rồi "T2 17/" với dấu gạch treo lơ lửng thì đọc lên vô nghĩa; thà bỏ hẳn
   * phần tháng, ngày đầy đủ vẫn còn trong lời chú khi trỏ vào ô.
   */
  const shortLabel = (label: string): string => {
    if (!veryTight) return label;
    const m = label.match(/^(\S+)\s+(\d+)\/\d+$/); // "CN 16/8" -> thứ + ngày
    if (m) return w < 34 ? m[2] : `${m[1]} ${m[2]}`;
    return tight ? label.replace(/^T(?=\d)/, '') : label;
  };

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
        <div ref={gridBox} className="flex min-w-max">
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
                      className={cn('overflow-hidden text-ellipsis whitespace-nowrap text-center font-medium text-tertiary', veryTight ? 'text-[10px]' : 'text-xs')}
                      style={{ width: w, marginRight: i === cols - 1 ? 0 : gapAfter(i), lineHeight: '18px' }}
                      title={label}
                    >
                      {shortLabel(label)}
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

      <div className="flex items-center justify-end gap-md text-xs text-tertiary" style={{ maxWidth: gridWidth ?? undefined }}>
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
