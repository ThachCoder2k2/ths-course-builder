/**
 * Lưới nhịp học. Cùng một tập dữ liệu nhưng khoảng thời gian dài ngắn khác nhau thì
 * cách xếp trục cũng phải khác: xem một ngày thì trục ngang là giờ, xem một tuần thì
 * là ngày × khung giờ, xem vài tháng thì là tuần × thứ, xem cả năm thì chia khối tháng.
 * Xếp kiểu nào cũng vậy sẽ ra một lưới thưa thớt toàn ô trống ở những khoảng ngắn.
 *
 * Cả bốn kiểu trả về cùng một hình dạng dữ liệu (hàng × cột + nhãn), nên phía vẽ chỉ
 * cần một đường duy nhất và thêm kiểu thứ năm sau này không phải sửa giao diện.
 */
import type { Statement } from './events';
import { DAY_S, dateFromT } from './catalog';
import { focusSeconds, sessionsOf } from './selectors';

export type RhythmMode = 'hour' | 'dayHour' | 'weekday' | 'month';

export interface RhythmCell {
  minutes: number;
  /** lời chú khi trỏ vào; null nghĩa là ô giữ chỗ, không vẽ */
  tooltip: string | null;
}

/** nhãn cột thưa — chỉ hiện ở cột mở đầu mỗi nhóm (tháng, hoặc khối tháng) */
export interface ColGroup {
  start: number;
  span: number;
  label: string;
}

export interface RhythmMatrix {
  mode: RhythmMode;
  rowLabels: string[];
  /** nhãn dày, một nhãn cho mỗi cột (dùng cho kiểu giờ và kiểu ngày) */
  colLabels: string[];
  /** nhãn thưa theo nhóm (dùng cho kiểu tuần và kiểu khối tháng) */
  colGroups: ColGroup[];
  cells: (RhythmCell | null)[][];
  cols: number;
  /** true khi các cột được chia thành khối, cần chừa khoảng giữa các khối */
  grouped: boolean;
}

const WEEKDAY_ROWS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const WEEKDAY_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
/** sáu dải bốn giờ, đủ để thấy sáng–chiều–tối mà không thành 24 hàng li ti */
const BANDS = [
  { from: 0, label: '0–4h' },
  { from: 4, label: '4–8h' },
  { from: 8, label: '8–12h' },
  { from: 12, label: '12–16h' },
  { from: 16, label: '16–20h' },
  { from: 20, label: '20–24h' },
];

const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const dmShort = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
/** 0 = Thứ 2 … 6 = Chủ nhật */
const rowOfDate = (d: Date) => (d.getDay() + 6) % 7;
const spanDays = (from: Date, to: Date) => Math.round((midnight(to).getTime() - midnight(from).getTime()) / (DAY_S * 1000)) + 1;

/** Kiểu lưới phù hợp với độ dài khoảng đang xem. */
export function rhythmModeFor(from: Date, to: Date): RhythmMode {
  const days = spanDays(from, to);
  if (days <= 2) return 'hour';
  if (days <= 14) return 'dayHour';
  if (days <= 183) return 'weekday';
  return 'month';
}

/** phút tập trung theo ngày, và theo (ngày, giờ bắt đầu buổi học) */
function tally(scoped: Statement[]) {
  const byDay = new Map<string, number>();
  const byDayHour = new Map<string, number>();
  for (const s of sessionsOf(scoped)) {
    const d = dateFromT(s.start);
    const mins = focusSeconds(s) / 60;
    // Gom theo giờ bắt đầu buổi học — cùng cách với thẻ "giờ vàng", để con số trên
    // biểu đồ và câu chú thích bên dưới không nói hai chuyện khác nhau.
    byDay.set(dayKey(d), (byDay.get(dayKey(d)) ?? 0) + mins);
    const k = `${dayKey(d)}|${d.getHours()}`;
    byDayHour.set(k, (byDayHour.get(k) ?? 0) + mins);
  }
  return { byDay, byDayHour };
}

const minutesWord = (m: number): string => {
  const n = Math.round(m);
  if (n <= 0) return 'không học';
  if (n < 60) return `${n} phút`;
  const h = Math.floor(n / 60);
  const rest = n % 60;
  return rest === 0 ? `${h} giờ` : `${h} giờ ${rest} phút`;
};

// ---------- kiểu 1: một ngày, trục ngang là 24 giờ ----------
function hourMatrix(scoped: Statement[], from: Date): RhythmMatrix {
  const { byDayHour } = tally(scoped);
  const d = midnight(from);
  const row: (RhythmCell | null)[] = [];
  for (let h = 0; h < 24; h++) {
    const minutes = Math.round(byDayHour.get(`${dayKey(d)}|${h}`) ?? 0);
    row.push({ minutes, tooltip: `${h}h–${(h + 1) % 24}h · ${minutesWord(minutes)}` });
  }
  return {
    mode: 'hour',
    rowLabels: [`${WEEKDAY_SHORT[rowOfDate(d)]} ${dmShort(d)}`],
    colLabels: Array.from({ length: 24 }, (_, h) => `${h}h`),
    colGroups: [],
    cells: [row],
    cols: 24,
    grouped: false,
  };
}

// ---------- kiểu 2: vài ngày, hàng là khung giờ, cột là ngày ----------
function dayHourMatrix(scoped: Statement[], from: Date, to: Date): RhythmMatrix {
  const { byDayHour } = tally(scoped);
  const days: Date[] = [];
  for (let d = midnight(from); d.getTime() <= midnight(to).getTime(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    days.push(d);
  }
  const cells = BANDS.map((band) =>
    days.map((d) => {
      let minutes = 0;
      for (let h = band.from; h < band.from + 4; h++) minutes += byDayHour.get(`${dayKey(d)}|${h}`) ?? 0;
      minutes = Math.round(minutes);
      return { minutes, tooltip: `${WEEKDAY_SHORT[rowOfDate(d)]} ${dmShort(d)}, ${band.label} · ${minutesWord(minutes)}` };
    }),
  );
  return {
    mode: 'dayHour',
    rowLabels: BANDS.map((b) => b.label),
    colLabels: days.map((d) => `${WEEKDAY_SHORT[rowOfDate(d)]} ${dmShort(d)}`),
    colGroups: [],
    cells,
    cols: days.length,
    grouped: false,
  };
}

// ---------- kiểu 3: vài tuần tới vài tháng, hàng là thứ, cột là tuần liền mạch ----------
function weekdayMatrix(scoped: Statement[], from: Date, to: Date): RhythmMatrix {
  const { byDay } = tally(scoped);
  const lo = midnight(from);
  const hi = midnight(to);
  // lùi về thứ Hai của tuần chứa ngày đầu, để các hàng thẳng theo thứ
  const start = new Date(lo.getFullYear(), lo.getMonth(), lo.getDate() - rowOfDate(lo));
  const weeks = Math.ceil((hi.getTime() - start.getTime()) / (7 * DAY_S * 1000) + 1e-9) || 1;
  const cells: (RhythmCell | null)[][] = [];
  for (let r = 0; r < 7; r++) {
    const row: (RhythmCell | null)[] = [];
    for (let w = 0; w < weeks; w++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + r);
      if (d.getTime() < lo.getTime() || d.getTime() > hi.getTime()) {
        row.push(null);
        continue;
      }
      const minutes = Math.round(byDay.get(dayKey(d)) ?? 0);
      row.push({ minutes, tooltip: `${dmShort(d)}/${d.getFullYear()} · ${minutesWord(minutes)}` });
    }
    cells.push(row);
  }
  // nhãn tháng đặt ở cột đầu tiên mà tháng đó xuất hiện
  const colGroups: ColGroup[] = [];
  for (let w = 0; w < weeks; w++) {
    const monday = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7);
    const label = `T${monday.getMonth() + 1}`;
    const prev = colGroups[colGroups.length - 1];
    if (prev && prev.label === label) prev.span += 1;
    else colGroups.push({ start: w, span: 1, label });
  }
  return { mode: 'weekday', rowLabels: WEEKDAY_ROWS, colLabels: [], colGroups, cells, cols: weeks, grouped: false };
}

// ---------- kiểu 4: từ nửa năm trở lên, chia thành khối tháng ----------
function monthMatrix(scoped: Statement[], from: Date, to: Date): RhythmMatrix {
  const { byDay } = tally(scoped);
  const lo = midnight(from);
  const hi = midnight(to);
  const cells: (RhythmCell | null)[][] = Array.from({ length: 7 }, () => []);
  const colGroups: ColGroup[] = [];
  let col = 0;
  const first = new Date(lo.getFullYear(), lo.getMonth(), 1);
  const last = new Date(hi.getFullYear(), hi.getMonth(), 1);
  for (let cur = first; cur.getTime() <= last.getTime(); cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)) {
    const y = cur.getFullYear();
    const m = cur.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const block: (RhythmCell | null)[][] = Array.from({ length: 7 }, () => []);
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(y, m, day);
      const r = rowOfDate(d);
      if (d.getTime() < lo.getTime() || d.getTime() > hi.getTime()) {
        block[r].push(null);
        continue;
      }
      const minutes = Math.round(byDay.get(dayKey(d)) ?? 0);
      block[r].push({ minutes, tooltip: `${dmShort(d)}/${y} · ${minutesWord(minutes)}` });
    }
    const width = Math.max(...block.map((r) => r.length));
    for (let r = 0; r < 7; r++) {
      while (block[r].length < width) block[r].push(null);
      cells[r].push(...block[r]);
    }
    colGroups.push({ start: col, span: width, label: `T${m + 1}` });
    col += width;
  }
  return { mode: 'month', rowLabels: WEEKDAY_ROWS, colLabels: [], colGroups, cells, cols: col, grouped: true };
}

/** Lưới nhịp học cho khoảng đang xem; kiểu lưới tự chọn theo độ dài khoảng. */
export function rhythmMatrix(scoped: Statement[], from: Date, to: Date): RhythmMatrix {
  switch (rhythmModeFor(from, to)) {
    case 'hour':
      return hourMatrix(scoped, from);
    case 'dayHour':
      return dayHourMatrix(scoped, from, to);
    case 'weekday':
      return weekdayMatrix(scoped, from, to);
    default:
      return monthMatrix(scoped, from, to);
  }
}

export interface DropHint {
  count: number;
  /** "vào quãng 21h" / "hôm Thứ 5" / "trong tuần 3 tháng 8" */
  when: string;
}

/**
 * Chỗ bỏ dở nhiều nhất trong khoảng, nói theo đơn vị mà lưới đang dùng — xem một ngày
 * thì nói giờ, xem một tuần thì nói ngày, xem dài hơn thì nói tuần.
 */
export function dropHint(scoped: Statement[], mode: RhythmMode): DropHint | null {
  const abandons = scoped.filter((s) => s.verb === 'abandoned');
  if (abandons.length === 0) return null;

  const bucket = new Map<string, { n: number; when: string }>();
  for (const s of abandons) {
    const d = dateFromT(s.t);
    let key: string;
    let when: string;
    if (mode === 'hour') {
      key = `h${d.getHours()}`;
      when = `vào quãng ${d.getHours()}h`;
    } else if (mode === 'dayHour') {
      key = dayKey(d);
      when = `hôm ${WEEKDAY_ROWS[rowOfDate(d)]} ${dmShort(d)}`;
    } else {
      const week = Math.floor((d.getDate() - 1) / 7) + 1;
      key = `${d.getFullYear()}-${d.getMonth()}-${week}`;
      when = `trong tuần ${week} tháng ${d.getMonth() + 1}`;
    }
    const cur = bucket.get(key);
    if (cur) cur.n += 1;
    else bucket.set(key, { n: 1, when });
  }
  const best = [...bucket.values()].sort((a, b) => b.n - a.n)[0];
  return { count: best.n, when: best.when };
}

/**
 * Gộp mỗi khối tháng thành một cột. Xem cả năm trên khung hẹp thì lưới ngày cần hơn sáu
 * chục cột — ô co đến mức không thấy mà vẫn phải kéo ngang. Gộp lại thì mỗi ô là tổng
 * thời gian học của một thứ trong một tháng: mất chi tiết từng ngày nhưng vẫn đọc được
 * "thứ Bảy tháng nào cũng học nhiều", và vừa đúng một khung.
 */
export function coarsenByGroup(matrix: RhythmMatrix): RhythmMatrix {
  if (matrix.colGroups.length === 0) return matrix;
  const cells = matrix.cells.map((row, r) =>
    matrix.colGroups.map((g) => {
      const slice = row.slice(g.start, g.start + g.span);
      if (slice.every((c) => c == null)) return null;
      const minutes = slice.reduce((n, c) => n + (c?.minutes ?? 0), 0);
      return {
        minutes,
        tooltip: `${matrix.rowLabels[r]}, tháng ${g.label.replace('T', '')} · ${minutesWord(minutes)}`,
      };
    }),
  );
  return {
    ...matrix,
    cells,
    cols: matrix.colGroups.length,
    colLabels: matrix.colGroups.map((g) => g.label),
    colGroups: [],
    grouped: false,
  };
}
