import { describe, expect, test } from 'vitest';
import { coarsenByGroup, rhythmMatrix, rhythmModeFor, dropHint } from './rhythm';
import { getBehaviorData } from './seed';
import { NOW } from './catalog';

const sts = getBehaviorData('hieu').statements;
const daysBefore = (n: number) => new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - n);
const today = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

describe('rhythmModeFor', () => {
  test('chọn kiểu theo độ dài khoảng', () => {
    expect(rhythmModeFor(today, today)).toBe('hour');
    expect(rhythmModeFor(daysBefore(1), today)).toBe('hour');
    expect(rhythmModeFor(daysBefore(2), today)).toBe('dayHour');
    expect(rhythmModeFor(daysBefore(6), today)).toBe('dayHour');
    expect(rhythmModeFor(daysBefore(13), today)).toBe('dayHour');
    expect(rhythmModeFor(daysBefore(14), today)).toBe('weekday');
    expect(rhythmModeFor(daysBefore(29), today)).toBe('weekday');
    expect(rhythmModeFor(daysBefore(182), today)).toBe('weekday');
    expect(rhythmModeFor(daysBefore(183), today)).toBe('month');
    expect(rhythmModeFor(daysBefore(364), today)).toBe('month');
  });
});

describe('rhythmMatrix', () => {
  test('xem một ngày thì trục ngang là 24 giờ, không ô nào trống chỗ', () => {
    const m = rhythmMatrix(sts, today, today);
    expect(m.mode).toBe('hour');
    expect(m.cells).toHaveLength(1);
    expect(m.cols).toBe(24);
    expect(m.cells[0]).toHaveLength(24);
    expect(m.cells[0].every((c) => c !== null)).toBe(true);
    expect(m.colLabels[0]).toBe('0h');
    expect(m.colLabels[23]).toBe('23h');
  });

  test('xem một tuần thì lưới 6 khung giờ × 7 ngày và kín hoàn toàn', () => {
    const m = rhythmMatrix(sts, daysBefore(6), today);
    expect(m.mode).toBe('dayHour');
    expect(m.cells).toHaveLength(6);
    expect(m.cols).toBe(7);
    expect(m.cells.every((r) => r.length === 7 && r.every((c) => c !== null))).toBe(true);
    expect(m.rowLabels).toEqual(['0–4h', '4–8h', '8–12h', '12–16h', '16–20h', '20–24h']);
  });

  test('xem 30 ngày thì hàng là thứ, cột là tuần liền mạch, chỉ hai cột mép có ô trống', () => {
    const m = rhythmMatrix(sts, daysBefore(29), today);
    expect(m.mode).toBe('weekday');
    expect(m.cells).toHaveLength(7);
    expect(m.grouped).toBe(false);
    // đúng 30 ngày có dữ liệu, phần còn lại là ô giữ chỗ ở cột đầu và cột cuối
    const filled = m.cells.flat().filter((c) => c !== null);
    expect(filled).toHaveLength(30);
    const inner = m.cells.map((r) => r.slice(1, -1));
    expect(inner.every((r) => r.every((c) => c !== null))).toBe(true);
  });

  test('xem cả năm thì chia khối tháng, mỗi khối có nhãn tháng riêng', () => {
    const m = rhythmMatrix(sts, daysBefore(364), today);
    expect(m.mode).toBe('month');
    expect(m.grouped).toBe(true);
    expect(m.cells).toHaveLength(7);
    expect(m.colGroups.length).toBeGreaterThanOrEqual(12);
    expect(m.cells.flat().filter((c) => c !== null)).toHaveLength(365);
    // nhãn nhóm phải phủ liền mạch hết số cột
    const total = m.colGroups.reduce((n, g) => n + g.span, 0);
    expect(total).toBe(m.cols);
  });

  test('mọi hàng đều dài bằng số cột, để lưới không bị lệch', () => {
    for (const [from, to] of [
      [today, today],
      [daysBefore(6), today],
      [daysBefore(29), today],
      [daysBefore(364), today],
    ] as const) {
      const m = rhythmMatrix(sts, from, to);
      expect(m.cells.every((r) => r.length === m.cols)).toBe(true);
    }
  });

  test('không có buổi học nào thì mọi ô đều bằng không', () => {
    const m = rhythmMatrix([], daysBefore(6), today);
    expect(m.cells.flat().every((c) => c === null || c.minutes === 0)).toBe(true);
  });
});

describe('dropHint', () => {
  test('nói theo đơn vị mà lưới đang dùng', () => {
    expect(dropHint(sts, 'hour')?.when).toMatch(/^vào quãng \d+h$/);
    expect(dropHint(sts, 'dayHour')?.when).toMatch(/^hôm (Thứ [2-7]|Chủ nhật) \d+\/\d+$/);
    expect(dropHint(sts, 'month')?.when).toMatch(/^trong tuần [1-5] tháng \d+$/);
  });

  test('không có lần bỏ dở nào thì không trả về gì', () => {
    expect(dropHint([], 'weekday')).toBeNull();
  });
});

describe('coarsenByGroup', () => {
  test('gộp mỗi khối tháng thành một cột, tổng phút giữ nguyên', () => {
    const raw = rhythmMatrix(sts, daysBefore(364), today);
    const c = coarsenByGroup(raw);
    expect(c.cols).toBe(raw.colGroups.length);
    expect(c.colLabels).toHaveLength(raw.colGroups.length);
    expect(c.colGroups).toHaveLength(0);
    expect(c.grouped).toBe(false);
    expect(c.cells).toHaveLength(7);
    expect(c.cells.every((r) => r.length === c.cols)).toBe(true);
    const sum = (m: typeof raw) => m.cells.flat().reduce((n, x) => n + (x?.minutes ?? 0), 0);
    expect(sum(c)).toBe(sum(raw));
  });

  test('lưới không có nhóm thì trả về y nguyên', () => {
    const raw = rhythmMatrix(sts, daysBefore(6), today);
    expect(coarsenByGroup(raw)).toBe(raw);
  });
});
