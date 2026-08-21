/** Người dùng đã tắt hiệu ứng ở cấp hệ điều hành thì không chạy chuyển động nào. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
