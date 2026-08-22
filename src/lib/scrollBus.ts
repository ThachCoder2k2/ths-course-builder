/**
 * Một chỗ duy nhất nghe sự kiện cuộn cho cả trang.
 *
 * Trước đây mỗi thứ cần biết vị trí cuộn lại tự gắn một listener kèm một
 * `requestAnimationFrame` riêng. Ba thứ như vậy là ba lần gọi lại mỗi khung hình để lấy
 * đúng một con số giống nhau. Ở đây gom về một listener và một khung: ai cần thì đăng ký.
 *
 * Phát ra `y` (đã cuộn bao nhiêu pixel) và `tien` (đã đi được bao nhiêu phần của trang,
 * 0 → 1). Cả hai tính trong cùng một khung nên không bao giờ lệch nhau.
 */
export interface TrangThaiCuon {
  y: number;
  tien: number;
}

type NguoiNghe = (s: TrangThaiCuon) => void;

const nguoiNghe = new Set<NguoiNghe>();
let khung = 0;
let daGan = false;

function doVaPhat(): void {
  khung = 0;
  const y = window.scrollY;
  const conLai = document.documentElement.scrollHeight - window.innerHeight;
  const s: TrangThaiCuon = { y, tien: conLai > 0 ? Math.min(1, Math.max(0, y / conLai)) : 0 };
  for (const fn of nguoiNghe) fn(s);
}

function xepKhung(): void {
  if (khung) return;
  khung = requestAnimationFrame(doVaPhat);
}

/** Đăng ký nghe. Trả về hàm để bỏ nghe. */
export function ngheCuon(fn: NguoiNghe): () => void {
  if (typeof window === 'undefined') return () => {};

  nguoiNghe.add(fn);
  if (!daGan) {
    daGan = true;
    window.addEventListener('scroll', xepKhung, { passive: true });
    window.addEventListener('resize', xepKhung, { passive: true });
  }
  // Phát ngay một lần để người mới đăng ký không phải chờ cú cuộn đầu tiên.
  doVaPhat();

  return () => {
    nguoiNghe.delete(fn);
    if (nguoiNghe.size === 0 && daGan) {
      daGan = false;
      window.removeEventListener('scroll', xepKhung);
      window.removeEventListener('resize', xepKhung);
      if (khung) {
        cancelAnimationFrame(khung);
        khung = 0;
      }
    }
  };
}
