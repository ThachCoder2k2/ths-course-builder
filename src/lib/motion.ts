import { useMediaQuery } from './useMediaQuery';

/**
 * Người dùng đã tắt hiệu ứng ở cấp hệ điều hành thì không chạy chuyển động nào.
 *
 * Đây là bản đọc một lần, dùng cho những chỗ chỉ cần biết tại thời điểm gọi (ví dụ quyết
 * định cuộn mượt hay cuộn thẳng). Chỗ nào phải đổi hành vi ngay khi người dùng bật/tắt
 * giữa buổi thì dùng `useReducedMotion` bên dưới.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Bản có theo dõi: đổi ngay khi người dùng bật hoặc tắt "giảm chuyển động" giữa buổi.
 *
 * Cần thiết cho những chuyển động tự chạy. Đọc một lần trong `useEffect` thì bật giảm
 * chuyển động xong băng chuyền vẫn tự chạy tới hết buổi, vì không có gì kích hoạt chạy lại.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Đưa trang về đầu. Dùng khi nội dung thay đổi hẳn — đổi bộ lọc, sang trang khác — vì lúc
 * đó vị trí cuộn cũ không còn ứng với thứ gì: đang đọc bảng ở giữa trang mà đổi bộ lọc thì
 * bảng đó đã là dữ liệu khác rồi.
 */
export function scrollToTop(smooth = true): void {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' });
}
