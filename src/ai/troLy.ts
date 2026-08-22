/**
 * Bộ khớp câu hỏi cho Course AI.
 *
 * KHÔNG có mô hình nào đứng sau, và bản demo cũng không cần: mọi câu trả lời đều soạn
 * trước rồi dựng lại bằng số thật của khoá (xem `noiDung.ts`). Việc của file này chỉ là
 * đọc câu người học gõ và chọn đúng câu trả lời — thuần hàm, không React, có test.
 *
 * Khớp theo TỪ KHOÁ, không theo nghĩa. Nên phải chuẩn hoá trước: bỏ dấu, bỏ dấu câu, hạ
 * chữ thường, gom khoảng trắng. Người học gõ "chuong may hoc" hay "Chương Máy học?" đều
 * phải ra một.
 */

/** Hình vẽ kèm câu trả lời. Câu chữ trần đọc mệt hơn một hình nhỏ nói đúng ý đó. */
export type HinhTraLoi =
  /** Dãy thanh ngang xếp hạng — dùng cho "chương nào yếu", "nên ôn bài nào". */
  | { kieu: 'thanh'; muc: { ten: string; giaTri: number; phu?: string; mau?: string }[] }
  /** Một vòng tiến trình nhỏ. */
  | { kieu: 'vong'; giaTri: number; nhan: string }
  /** Chip tròn theo màu mức nắm — nhắc lại đúng ba bậc màu của sơ đồ mạng lưới. */
  | { kieu: 'nut'; muc: { ten: string; nam: number }[] }
  /** Cặp thanh thực tế / độ dài bài giảng. */
  | { kieu: 'capThanh'; muc: { ten: string; thucTe: number; chuan: number }[] }
  /** Dải ô nhiệt theo thứ trong tuần. */
  | { kieu: 'nhiet'; hang: { ten: string; o: number[] }[] }
  /** Radar hai lớp thu nhỏ. */
  | { kieu: 'radar'; truc: { label: string; nam: number; tienDo: number }[] };

export interface DapAn {
  chu: string;
  hinh?: HinhTraLoi;
}

export interface CauGoiY {
  id: string;
  hoi: string;
}

export interface LuatTraLoi {
  id: string;
  /**
   * Các từ khoá của luật này, viết KHÔNG DẤU và chữ thường. Một cụm nhiều từ (ví dụ
   * "ton thoi gian") chỉ khớp khi cả cụm xuất hiện liền nhau như những từ trọn vẹn.
   */
  tu: string[];
  dap: DapAn;
  /** Id các chip nên mời sau khi trả lời luật này. Thiếu thì lấy từ `duTru`. */
  tiep?: string[];
}

export interface TroLy {
  chao: string;
  /** id → câu hỏi hiện trên chip. Chỉ id có ở đây mới dựng được thành chip. */
  cauChip: Record<string, string>;
  /** Chip hiện lúc mới mở bảng. */
  moDau: string[];
  /** Chip dùng khi luật vừa trả lời không chỉ định câu tiếp theo. */
  duTru: string[];
  luat: LuatTraLoi[];
  doNhau: DapAn;
}

/** Số chip nhiều nhất hiện một lượt — quá ba là thành danh sách phải đọc, không còn là gợi ý. */
const TOI_DA_CHIP = 3;

/**
 * Bỏ dấu tiếng Việt rồi hạ chữ thường.
 *
 * `normalize('NFD')` tách dấu thành ký tự tổ hợp riêng để xoá bằng một dải Unicode.
 * Riêng đ/Đ không phải chữ có dấu tổ hợp nên phải đổi tay.
 */
export function boDau(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    // Bỏ dấu câu nhưng GIỮ % — "100%" là một từ khoá thật của luật vòng tiến trình.
    .replace(/[^a-z0-9% ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Cụm `tu` có xuất hiện trong `q` như một chuỗi TỪ TRỌN VẸN hay không.
 *
 * Không dùng `includes` trần được: "khong" chứa "hong", nên câu "mai troi co mua khong"
 * từng khớp luật về hình hồng của radar. Kẹp hai đầu bằng khoảng trắng thì "hong" chỉ
 * khớp đúng từ "hong". Test canh chính ca này.
 */
function coCum(q: string, tu: string): boolean {
  return ` ${q} `.includes(` ${tu} `);
}

/**
 * Tìm luật khớp nhất cho một câu hỏi.
 *
 * Luật nào có NHIỀU từ khoá khớp hơn thì thắng; bằng nhau thì luật đứng trước thắng. Cách
 * này để những luật cụ thể (nhiều từ khoá trùng) không bị một luật chung nuốt mất.
 */
export function timLuat(troLy: TroLy, cauHoi: string): LuatTraLoi | null {
  const q = boDau(cauHoi);
  if (!q) return null;

  let tot: { diem: number; luat: LuatTraLoi } | null = null;
  for (const luat of troLy.luat) {
    const diem = luat.tu.reduce((a, t) => a + (coCum(q, t) ? 1 : 0), 0);
    if (diem > 0 && (!tot || diem > tot.diem)) tot = { diem, luat };
  }
  return tot ? tot.luat : null;
}

/** Câu trả lời cho một câu hỏi; không luật nào khớp thì trả về câu đỡ. */
export function traLoi(troLy: TroLy, cauHoi: string): DapAn {
  return timLuat(troLy, cauHoi)?.dap ?? troLy.doNhau;
}

/** Câu trả lời của một chip — đi thẳng theo id, không phải khớp lại từ khoá. */
export function dapChoChip(troLy: TroLy, id: string): DapAn {
  return troLy.luat.find((l) => l.id === id)?.dap ?? troLy.doNhau;
}

/** Dựng danh sách chip từ một dãy id, bỏ những câu đã hỏi rồi. */
export function chipTu(troLy: TroLy, ids: string[], daHoi: ReadonlySet<string>): CauGoiY[] {
  const ra: CauGoiY[] = [];
  for (const id of ids) {
    if (ra.length >= TOI_DA_CHIP) break;
    if (daHoi.has(id)) continue;
    const hoi = troLy.cauChip[id];
    if (hoi) ra.push({ id, hoi });
  }
  return ra;
}

/**
 * Chip mời sau khi vừa trả lời.
 *
 * Ưu tiên `tiep` của chính luật đó — hỏi về chương yếu thì mời tiếp "nên ôn bài nào", tức
 * dẫn người học đi tới chứ không mời câu rời rạc. Hết thì lấy từ `duTru`, và bỏ những câu
 * đã hỏi để không mời lại cái vừa trả lời.
 */
export function chipTiep(troLy: TroLy, luat: LuatTraLoi | null, daHoi: ReadonlySet<string>): CauGoiY[] {
  const uuTien = chipTu(troLy, luat?.tiep ?? [], daHoi);
  if (uuTien.length >= TOI_DA_CHIP) return uuTien;
  const them = chipTu(
    troLy,
    troLy.duTru.filter((id) => !uuTien.some((c) => c.id === id)),
    daHoi,
  );
  return [...uuTien, ...them].slice(0, TOI_DA_CHIP);
}
