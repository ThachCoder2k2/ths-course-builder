import type { BaoCaoKhoa, NutSoDo } from './completion';
import { KHUNG_CAO, KHUNG_RONG, bam01, xepNut } from './completion';
import type { RhythmMatrix } from './rhythm';
import { flattenLessons } from '../mock';
import type { Course } from '../mock/types';

/**
 * Báo cáo cho những khoá KHÔNG có trong tầng sự kiện.
 *
 * Dự án có hai bộ danh mục khoá học chạy song song: `src/mock` là thư viện của site (19
 * khoá, có bài học và video), còn `src/behavior/catalog` là danh mục của tầng sự kiện (18
 * khoá, có mức nắm và giờ học). Hai bộ chỉ TRÙNG NHAU MỘT slug —
 * `ai-co-ban-den-thuc-tien`. Nghĩa là 18 trên 19 khoá của site bấm "Xem báo cáo khoá" là
 * ra trang rỗng, mà mọi khoá đều cần mở được báo cáo để xem thử.
 *
 * Nên ở đây dựng báo cáo từ CHÍNH bài học của khoá đó trong thư viện site: tên chương là
 * tên chương thật, tên bài là tên bài thật, độ dài là độ dài thật. Chỉ mức nắm và thời
 * gian loay hoay là số dựng ra — và dựng bằng băm của id nên mỗi khoá có một hình riêng
 * mà không đổi giữa hai lần mở.
 *
 * Cách nối đúng về sau là cho tầng sự kiện phủ hết thư viện site. File này là chỗ chắp
 * tạm, và nó nói thẳng điều đó chứ không giả vờ là số liệu thật.
 */

/** Bao nhiêu phần khoá đã học, chọn theo băm của slug để có cả khoá xong và khoá dở. */
function tyLeDaXem(slug: string): number {
  const h = Math.floor(bam01(slug + ':xem') * 3);
  return h === 0 ? 1 : h === 1 ? 0.75 : 0.45;
}

export function baoCaoTuKhoaMock(course: Course): BaoCaoKhoa | null {
  const bai = flattenLessons(course);
  if (bai.length === 0) return null;

  // Chương = section của khoá; bài nào không thuộc section nào thì gom vào một chương chung.
  const chuongCuaBai = new Map<string, string>();
  for (const sec of course.sections) for (const l of sec.lessons) chuongCuaBai.set(l.id, sec.title);

  const concepts = bai.map((b) => ({
    id: b.lesson.id,
    label: b.lesson.title,
    chuong: chuongCuaBai.get(b.lesson.id) ?? course.title,
  }));

  const phutBai = new Map(bai.map((b) => [b.lesson.id, Math.max(1, b.lesson.durationMin)]));
  const tongPhut = [...phutBai.values()].reduce((a, v) => a + v, 0) || 1;

  const soXem = Math.max(1, Math.ceil(bai.length * tyLeDaXem(course.slug)));
  const daXem = new Map(concepts.map((c, i) => [c.id, i < soXem]));

  /** Bài chưa xem thì mức nắm 0, đúng như tầng sự kiện làm với bài chưa mở. */
  const mastery = new Map(
    concepts.map((c) => [c.id, daXem.get(c.id) ? 0.32 + bam01(c.id + ':nam') * 0.66 : 0]),
  );
  const phan = new Map(concepts.map((c) => [c.id, (phutBai.get(c.id) ?? 1) / tongPhut]));

  const nut = xepNut(concepts, mastery, phan);

  // Cạnh nối theo thứ tự học: trong chương nối tiếp nhau, hết chương thì nối sang chương sau.
  const tenChuong = [...new Set(concepts.map((c) => c.chuong))];
  const canh: { from: string; to: string }[] = [];
  tenChuong.forEach((ten, k) => {
    const trong = concepts.filter((c) => c.chuong === ten);
    for (let i = 1; i < trong.length; i += 1) canh.push({ from: trong[i - 1].id, to: trong[i].id });
    const sau = tenChuong[k + 1];
    if (sau) {
      const dauSau = concepts.find((c) => c.chuong === sau);
      const cuoiNay = trong[trong.length - 1];
      if (dauSau && cuoiNay) canh.push({ from: cuoiNay.id, to: dauSau.id });
    }
  });

  const radar = tenChuong.map((ten) => {
    const trong = concepts.filter((c) => c.chuong === ten);
    const giay = trong.reduce((a, c) => a + (phutBai.get(c.id) ?? 0), 0) || 1;
    const giayXem = trong.reduce((a, c) => a + (daXem.get(c.id) ? (phutBai.get(c.id) ?? 0) : 0), 0);
    return {
      truc: ten,
      nam: trong.length ? trong.reduce((a, c) => a + (mastery.get(c.id) ?? 0), 0) / trong.length : 0,
      tienDo: Math.min(1, giayXem / giay),
      soBai: trong.length,
    };
  });

  const thanh = concepts.map((c) => {
    const chuan = phutBai.get(c.id) ?? 1;
    // Thời gian thật = độ dài bài cộng phần loay hoay; bài chưa xem thì 0.
    const themVao = Math.round(chuan * (0.05 + bam01(c.id + ':loay') * 0.6));
    return { conceptId: c.id, label: c.label, thucTe: daXem.get(c.id) ? chuan + themVao : 0, chuan };
  });

  const phutDaXem = concepts.reduce((a, c) => a + (daXem.get(c.id) ? (phutBai.get(c.id) ?? 0) : 0), 0);
  const daXemNut = nut.filter((n) => daXem.get(n.id));
  const yeuNhat: NutSoDo | null = daXemNut.length
    ? [...daXemNut].sort((a, b) => a.mastery - b.mastery)[0]
    : null;

  return {
    courseId: course.id,
    slug: course.slug,
    title: course.title,
    hoanThanh: Math.min(1, phutDaXem / tongPhut),
    nam: nut.length ? nut.reduce((a, n) => a + n.mastery, 0) / nut.length : 0,
    datChuan: nut.length ? nut.filter((n) => n.mastery >= 0.5).length / nut.length : 0,
    soBai: concepts.length,
    phut: thanh.reduce((a, t) => a + t.thucTe, 0),
    chuoi: Math.floor(bam01(course.slug + ':chuoi') * 7),
    nut,
    canh,
    radar,
    thanh,
    yeuNhat,
    khungRong: KHUNG_RONG,
    khungCao: KHUNG_CAO,
  };
}

const THU = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

/**
 * Lưới nhiệt dựng ra cho những khoá không có sự kiện thật.
 *
 * Cùng hình dạng với `rhythmMatrix` ở chế độ tuần × thứ, để `RhythmHeatmap` vẽ được mà
 * không cần biết số liệu tới từ đâu. Khoảng 40% ô để trống — kín đặc thì trông như dữ liệu
 * bơm chứ không phải nhịp học của một người.
 */
export function luoiNhietMock(slug: string, soTuan = 12): RhythmMatrix {
  const cells = THU.map((ten, r) =>
    Array.from({ length: soTuan }, (_, c) => {
      const h = bam01(`${slug}:${r}:${c}`);
      if (h < 0.4) return { minutes: 0, tooltip: null };
      const phut = Math.round(8 + h * 52);
      return { minutes: phut, tooltip: `${ten}, tuần ${c + 1}: ${phut} phút` };
    }),
  );
  return {
    mode: 'weekday',
    rowLabels: THU,
    colLabels: Array.from({ length: soTuan }, (_, c) => `T${c + 1}`),
    colGroups: Array.from({ length: Math.ceil(soTuan / 4) }, (_, i) => ({
      start: i * 4,
      span: Math.min(4, soTuan - i * 4),
      label: `Tháng ${i + 1}`,
    })),
    cells,
    cols: soTuan,
    grouped: false,
  };
}
