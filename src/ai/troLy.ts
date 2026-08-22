/**
 * Bộ khớp câu hỏi cho Course AI.
 *
 * KHÔNG có mô hình nào đứng sau, và bản demo cũng không cần: mọi câu trả lời đều soạn
 * trước rồi dựng lại bằng số thật của khoá (xem `noiDung.ts`). Việc của file này chỉ là
 * đọc câu người học gõ và chọn đúng câu trả lời — thuần hàm, không React, có test.
 *
 * Khớp theo TỪ KHOÁ, không theo nghĩa. Nên phải chuẩn hoá trước: bỏ dấu, hạ chữ thường,
 * gom khoảng trắng. Người học gõ "chuong may hoc" hay "Chương Máy học" đều phải ra một.
 */

export interface CauGoiY {
  id: string;
  /** Câu hỏi hiện trên chip gợi ý, viết như người học sẽ hỏi. */
  hoi: string;
}

export interface LuatTraLoi {
  id: string;
  /**
   * Các từ khoá của luật này, viết KHÔNG DẤU và chữ thường. Một cụm nhiều từ (ví dụ
   * "ton thoi gian") chỉ khớp khi cả cụm xuất hiện liền nhau.
   */
  tu: string[];
  dap: string;
}

export interface TroLy {
  /** Lời mở đầu bảng chat. */
  chao: string;
  goiY: CauGoiY[];
  luat: LuatTraLoi[];
  /** Câu dùng khi không luật nào khớp. */
  doNhau: string;
}

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
 * Chọn câu trả lời cho một câu hỏi.
 *
 * Luật nào có NHIỀU từ khoá khớp hơn thì thắng; bằng nhau thì luật đứng trước thắng. Cách
 * này để những luật cụ thể (nhiều từ khoá trùng) không bị một luật chung nuốt mất.
 */
export function traLoi(troLy: TroLy, cauHoi: string): string {
  const q = boDau(cauHoi);
  if (!q) return troLy.doNhau;

  let tot: { diem: number; dap: string } | null = null;
  for (const luat of troLy.luat) {
    const diem = luat.tu.reduce((a, t) => a + (coCum(q, t) ? 1 : 0), 0);
    if (diem > 0 && (!tot || diem > tot.diem)) tot = { diem, dap: luat.dap };
  }
  return tot ? tot.dap : troLy.doNhau;
}

/** Câu trả lời của một chip gợi ý — chip nào cũng phải có luật khớp được. */
export function dapChoGoiY(troLy: TroLy, goiY: CauGoiY): string {
  const luat = troLy.luat.find((l) => l.id === goiY.id);
  return luat ? luat.dap : traLoi(troLy, goiY.hoi);
}
