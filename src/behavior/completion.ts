import { CONCEPTS_OF, COURSE_BY_ID, VIDEOS_OF } from './catalog';
import { currentStreak, lessonRows } from './overview';
import type { Statement } from './events';

/**
 * Số liệu cho màn báo cáo cuối khoá (Figma node 432:6863).
 *
 * Mọi con số ở đây rút từ chính tầng sự kiện đang chạy trang /hoc-tap-cua-toi, nên hai
 * trang không bao giờ nói khác nhau. Thiết kế gốc viết cho luyện thi TSA ("trọng số trong
 * bài thi", "thời gian học chuẩn"), nhưng khoá thật không có dữ liệu đề thi — nên đổi ý
 * nghĩa sang thứ có thật:
 *
 * - độ to của nút = phần bài đó chiếm trong khoá, tính theo độ dài video
 * - "thời gian chuẩn" = độ dài video của bài, so với thời gian người học thật sự bỏ ra
 * - trục radar = các chương của khoá
 */

export interface NutSoDo {
  id: string;
  label: string;
  chuong: string;
  /** 0..1 — mức nắm bài này */
  mastery: number;
  /** 0..1 — phần bài này chiếm trong khoá, theo độ dài video */
  phan: number;
  x: number;
  y: number;
  r: number;
}

export interface CanhSoDo {
  from: string;
  to: string;
}

export interface TrucRadar {
  truc: string;
  /** 0..1 — mức nắm trung bình các bài trong chương */
  nam: number;
  /** 0..1 — phần nội dung của chương đã đi qua, tính theo độ dài video */
  tienDo: number;
  soBai: number;
}

export interface ThanhBai {
  conceptId: string;
  label: string;
  /** phút người học thật sự bỏ ra */
  thucTe: number;
  /** phút theo độ dài video */
  chuan: number;
}

export interface BaoCaoKhoa {
  courseId: string;
  slug: string;
  title: string;
  /** 0..1 — phần nội dung đã đi qua, tính theo độ dài video */
  hoanThanh: number;
  /** 0..1 — mức nắm trung bình */
  nam: number;
  soBai: number;
  phut: number;
  chuoi: number;
  nut: NutSoDo[];
  canh: CanhSoDo[];
  radar: TrucRadar[];
  thanh: ThanhBai[];
  yeuNhat: NutSoDo | null;
  khungRong: number;
  khungCao: number;
}

/** Khung vẽ sơ đồ, đơn vị của viewBox. */
const KHUNG_RONG = 960;
const KHUNG_CAO = 340;
const R_MIN = 18;
const R_MAX = 32;
/** Nửa bề rộng nhãn bài, tính theo tên dài nhất trong catalog ở cỡ chữ 11px. */
const NHAN_LE = 55;
/** Khe hở tối thiểu giữa mép hai nút, đơn vị viewBox. */
const KHE = 6;

/** Băm ổn định từ chuỗi ra 0..1 — để bố cục xê dịch một chút mà vẫn không đổi giữa hai lần vẽ. */
function bam01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * Đã đi hết mọi bài của khoá chưa.
 *
 * `every` trên mảng rỗng trả về true, nên phải chặn trước — nếu không thì khoá chưa từng
 * chạm vào cũng được coi là đã học hết.
 */
export function daHocHetBai(sts: Statement[], courseId: string): boolean {
  const rows = lessonRows(sts, courseId);
  return rows.length > 0 && rows.every((r) => r.watched);
}

/**
 * Xếp các nút thành cụm theo chương: mỗi chương một hàng, các bài trong chương dàn đều
 * theo chiều ngang. Xê dịch nhẹ theo băm của chính id nên trông có nhịp chứ không ra một
 * cái bảng, mà vẫn cố định giữa hai lần vẽ.
 *
 * Xê dịch bị chặn theo khoảng trống còn lại quanh mỗi nút, nên không nút nào tràn khỏi
 * khung và không hai nút nào đè nhau — có test canh đúng hai việc đó.
 */
function xepNut(
  concepts: { id: string; label: string; chuong: string }[],
  mastery: Map<string, number>,
  phan: Map<string, number>,
): NutSoDo[] {
  const chuongs = [...new Set(concepts.map((c) => c.chuong))];
  const maxPhan = Math.max(...[...phan.values()], 0.0001);

  const nut: NutSoDo[] = [];
  chuongs.forEach((ten, hang) => {
    const trongChuong = concepts.filter((c) => c.chuong === ten);
    const buocY = KHUNG_CAO / chuongs.length;
    const yGoc = buocY * (hang + 0.5);

    trongChuong.forEach((c, i) => {
      const p = phan.get(c.id) ?? 0;
      const r = R_MIN + (R_MAX - R_MIN) * (p / maxPhan);
      const buocX = KHUNG_RONG / (trongChuong.length + 1);
      const xGoc = buocX * (i + 1);

      // Chỗ trống an toàn quanh nút: nửa bước trừ bán kính và trừ khe hở tối thiểu.
      //
      // Chiều ngang trừ thêm NHAN_LE vì thiết kế ghi NHÃN của bài ngay giữa nút, và nhãn
      // rộng hơn nút nhiều. Để nút xê dịch hết chỗ trống thì hai nút cạnh nhau có thể
      // dạt về phía nhau và hai nhãn dính vào nhau — đúng lỗi che chữ đang gặp.
      const duX = Math.max(0, buocX / 2 - r - KHE - NHAN_LE);
      const duY = Math.max(0, buocY / 2 - r - KHE);
      const lechX = (bam01(c.id + ':x') * 2 - 1) * duX;
      const lechY = (bam01(c.id + ':y') * 2 - 1) * duY;

      nut.push({
        id: c.id,
        label: c.label,
        chuong: c.chuong,
        mastery: mastery.get(c.id) ?? 0,
        phan: p,
        x: Math.min(KHUNG_RONG - r, Math.max(r, xGoc + lechX)),
        y: Math.min(KHUNG_CAO - r, Math.max(r, yGoc + lechY)),
        r,
      });
    });
  });
  return nhoiRa(nut);
}

/**
 * Đẩy những cặp nút còn dính nhau ra xa, lặp cho tới khi không còn cặp nào.
 *
 * Chặn xê dịch theo từng ô lưới chỉ bảo đảm được các nút TRONG CÙNG một chương không đè
 * nhau, vì mỗi chương có số bài khác nhau nên lưới ngang cũng khác nhau — hai nút ở hai
 * chương liền kề vẫn có thể rơi gần nhau. Trước đây việc đó không xảy ra là do xê dịch
 * ngang lớn tình cờ đẩy chúng ra; đến khi tôi bớt xê dịch cho nhãn khỏi dính là lộ ra
 * ngay (test "hai nút không đè lên nhau" bắt được).
 *
 * Nên không trông vào may nữa: đẩy thẳng, và kẹp trong khung ngay trong từng lượt để lần
 * kẹp cuối không tạo lại chỗ đè.
 */
function nhoiRa(nut: NutSoDo[]): NutSoDo[] {
  for (let lap = 0; lap < 40; lap += 1) {
    let dong = false;
    for (let i = 0; i < nut.length; i += 1) {
      for (let j = i + 1; j < nut.length; j += 1) {
        const a = nut[i];
        const b = nut[j];
        const can = a.r + b.r + KHE;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d >= can) continue;
        // Trùng tâm thì chia cho 0; đẩy theo trục dọc cho có hướng xác định.
        const ux = d < 0.001 ? 0 : dx / d;
        const uy = d < 0.001 ? 1 : dy / d;
        const day = (can - d) / 2 + 0.01;
        a.x -= ux * day;
        a.y -= uy * day;
        b.x += ux * day;
        b.y += uy * day;
        dong = true;
      }
    }
    nut.forEach((n) => {
      n.x = Math.min(KHUNG_RONG - n.r, Math.max(n.r, n.x));
      n.y = Math.min(KHUNG_CAO - n.r, Math.max(n.r, n.y));
    });
    if (!dong) break;
  }
  return nut;
}

/** Toàn bộ số liệu của một khoá cho màn báo cáo. `null` khi khoá chưa có dữ liệu nào. */
export function baoCaoKhoa(sts: Statement[], courseId: string): BaoCaoKhoa | null {
  // Chặn theo SỰ KIỆN của khoá, không theo số dòng bài: `lessonRows` liệt kê bài từ
  // catalog nên nó luôn trả về đủ 14 dòng kể cả khi người học chưa chạm vào khoá.
  if (!sts.some((s) => s.courseId === courseId)) return null;

  const rows = lessonRows(sts, courseId);
  if (rows.length === 0) return null;

  const course = COURSE_BY_ID[courseId];
  const concepts = CONCEPTS_OF(courseId);
  const videos = VIDEOS_OF(courseId);
  const giayTheoBai = new Map(videos.map((v) => [v.concept, v.durationS]));
  const tongGiay = videos.reduce((a, v) => a + v.durationS, 0) || 1;

  const mastery = new Map(rows.map((r) => [r.conceptId, r.mastery]));
  const daXem = new Map(rows.map((r) => [r.conceptId, r.watched]));
  const phan = new Map(concepts.map((c) => [c.id, (giayTheoBai.get(c.id) ?? 0) / tongGiay]));

  const nut = xepNut(concepts, mastery, phan);

  // Cạnh: nối theo thứ tự bài trong cùng chương, rồi nối bài cuối chương này sang bài
  // đầu chương sau. Cách nối này ra đúng thứ tự học thật, không phải nối bừa cho rậm.
  const canh: CanhSoDo[] = [];
  const chuongs = [...new Set(concepts.map((c) => c.chuong))];
  chuongs.forEach((ten, k) => {
    const trong = concepts.filter((c) => c.chuong === ten);
    for (let i = 1; i < trong.length; i += 1) canh.push({ from: trong[i - 1].id, to: trong[i].id });
    const sau = chuongs[k + 1];
    if (sau) {
      const dauSau = concepts.find((c) => c.chuong === sau);
      const cuoiNay = trong[trong.length - 1];
      if (dauSau && cuoiNay) canh.push({ from: cuoiNay.id, to: dauSau.id });
    }
  });

  const radar: TrucRadar[] = chuongs.map((ten) => {
    const trong = concepts.filter((c) => c.chuong === ten);
    const tong = trong.reduce((a, c) => a + (mastery.get(c.id) ?? 0), 0);
    // Tiến độ chương tính theo ĐỘ DÀI video, không theo số bài: chương có một bài dài và
    // hai bài ngắn thì xem hết bài dài đã là đi qua phần lớn chương.
    const giayChuong = trong.reduce((a, c) => a + (giayTheoBai.get(c.id) ?? 0), 0) || 1;
    const giayXem = trong.reduce((a, c) => a + (daXem.get(c.id) ? (giayTheoBai.get(c.id) ?? 0) : 0), 0);
    return {
      truc: ten,
      nam: trong.length ? tong / trong.length : 0,
      tienDo: Math.min(1, giayXem / giayChuong),
      soBai: trong.length,
    };
  });

  const thanh: ThanhBai[] = concepts.map((c) => {
    const r = rows.find((x) => x.conceptId === c.id);
    const chuan = Math.round((giayTheoBai.get(c.id) ?? 0) / 60);
    // `struggle` là số giây loay hoay thêm ngoài thời lượng video; thời gian thực tế là
    // độ dài video cộng phần đó. Bài chưa xem thì thực tế bằng 0.
    const thucTe = r?.watched ? Math.round(((giayTheoBai.get(c.id) ?? 0) + (r.struggle ?? 0)) / 60) : 0;
    return { conceptId: c.id, label: c.label, thucTe, chuan };
  });

  const giayDaXem = concepts.reduce((a, c) => a + (daXem.get(c.id) ? (giayTheoBai.get(c.id) ?? 0) : 0), 0);
  const nam = nut.length ? nut.reduce((a, n) => a + n.mastery, 0) / nut.length : 0;
  const yeuNhat = nut.length ? [...nut].sort((a, b) => a.mastery - b.mastery)[0] : null;

  return {
    courseId,
    slug: course?.slug ?? courseId,
    title: course?.title ?? courseId,
    hoanThanh: Math.min(1, giayDaXem / tongGiay),
    nam,
    soBai: concepts.length,
    phut: thanh.reduce((a, t) => a + t.thucTe, 0),
    chuoi: currentStreak(sts),
    nut,
    canh,
    radar,
    thanh,
    yeuNhat,
    khungRong: KHUNG_RONG,
    khungCao: KHUNG_CAO,
  };
}
