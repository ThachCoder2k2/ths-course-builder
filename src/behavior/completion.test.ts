import { describe, expect, it } from 'vitest';
import { baoCaoKhoa, daHocHetBai } from './completion';
import { scope } from './overview';
import { getBehaviorData } from './seed';
import { CONCEPTS_OF, VIDEOS_OF } from './catalog';

const KHOA = 'ai-foundations';

function tatCa() {
  const d = getBehaviorData('l1');
  return scope(d.statements, { fromDay: 0, toDay: 1_000_000, courseId: null });
}

describe('daHocHetBai', () => {
  it('khoá đã đi hết bài thì trả về true', () => {
    expect(daHocHetBai(tatCa(), KHOA)).toBe(true);
  });

  it('khoá không có dữ liệu thì trả về false, không phải true rỗng', () => {
    expect(daHocHetBai([], KHOA)).toBe(false);
  });
});

describe('baoCaoKhoa', () => {
  const bc = baoCaoKhoa(tatCa(), KHOA);

  it('trả về null khi không có dữ liệu, để chỗ gọi biết mà chuyển hướng', () => {
    expect(baoCaoKhoa([], KHOA)).toBeNull();
  });

  it('mỗi bài trong khoá là một nút trên sơ đồ', () => {
    expect(bc).not.toBeNull();
    expect(bc!.nut).toHaveLength(CONCEPTS_OF(KHOA).length);
  });

  it('sơ đồ có nhiều hàng vì khoá chia chương — không phải một đường thẳng', () => {
    const hang = new Set(bc!.nut.map((n) => n.y));
    expect(hang.size).toBeGreaterThan(2);
  });

  it('nút nào cũng nằm trong khung vẽ, không có nút trôi ra ngoài', () => {
    for (const n of bc!.nut) {
      expect(n.x).toBeGreaterThanOrEqual(n.r);
      expect(n.x).toBeLessThanOrEqual(bc!.khungRong - n.r);
      expect(n.y).toBeGreaterThanOrEqual(n.r);
      expect(n.y).toBeLessThanOrEqual(bc!.khungCao - n.r);
    }
  });

  it('hai nút không đè lên nhau', () => {
    const ns = bc!.nut;
    for (let i = 0; i < ns.length; i += 1) {
      for (let j = i + 1; j < ns.length; j += 1) {
        const d = Math.hypot(ns[i].x - ns[j].x, ns[i].y - ns[j].y);
        expect(d, `"${ns[i].label}" đè "${ns[j].label}"`).toBeGreaterThan(ns[i].r + ns[j].r);
      }
    }
  });

  it('phần của mỗi bài trong khoá cộng lại bằng 1', () => {
    const tong = bc!.nut.reduce((a, n) => a + n.phan, 0);
    expect(tong).toBeCloseTo(1, 5);
  });

  it('cạnh nào cũng nối hai nút có thật', () => {
    const co = new Set(bc!.nut.map((n) => n.id));
    for (const e of bc!.canh) {
      expect(co.has(e.from), `cạnh trỏ tới nút lạ: ${e.from}`).toBe(true);
      expect(co.has(e.to), `cạnh trỏ tới nút lạ: ${e.to}`).toBe(true);
    }
    expect(bc!.canh.length).toBeGreaterThan(0);
  });

  it('radar có một trục cho mỗi chương, không trục nào trùng tên', () => {
    const chuong = [...new Set(CONCEPTS_OF(KHOA).map((c) => c.chuong))];
    expect(bc!.radar).toHaveLength(chuong.length);
    expect(new Set(bc!.radar.map((r) => r.truc)).size).toBe(bc!.radar.length);
    for (const r of bc!.radar) {
      expect(r.nam).toBeGreaterThanOrEqual(0);
      expect(r.nam).toBeLessThanOrEqual(1);
    }
  });

  it('biểu đồ thanh: thời gian chuẩn lấy đúng độ dài video của bài đó', () => {
    const videoTheoBai = new Map(VIDEOS_OF(KHOA).map((v) => [v.concept, Math.round(v.durationS / 60)]));
    expect(bc!.thanh).toHaveLength(CONCEPTS_OF(KHOA).length);
    for (const t of bc!.thanh) {
      expect(t.chuan).toBe(videoTheoBai.get(t.conceptId));
      expect(t.thucTe).toBeGreaterThanOrEqual(0);
    }
  });

  it('bài yếu nhất chính là nút có mức nắm thấp nhất', () => {
    const thap = [...bc!.nut].sort((a, b) => a.mastery - b.mastery)[0];
    expect(bc!.yeuNhat?.id).toBe(thap.id);
  });

  it('tiến độ hoàn thành và mức nắm đều nằm trong 0..1', () => {
    for (const v of [bc!.hoanThanh, bc!.nam]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('gọi hai lần cho cùng dữ liệu thì ra cùng một bố cục — không random', () => {
    const lai = baoCaoKhoa(tatCa(), KHOA)!;
    expect(lai.nut.map((n) => [n.id, n.x, n.y, n.r])).toEqual(bc!.nut.map((n) => [n.id, n.x, n.y, n.r]));
  });
});
