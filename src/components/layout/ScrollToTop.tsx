import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '../../lib/motion';

/**
 * Sang trang khác thì đưa về đầu trang. Trình duyệt vốn giữ nguyên vị trí cuộn khi điều
 * hướng trong ứng dụng một trang, nên nếu không làm gì thì mở một khoá học mới lại rơi
 * vào giữa trang. Nhảy thẳng, không chạy mượt — chuyển trang mà còn thấy trang trôi thì rối.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToTop(false);
  }, [pathname]);

  return null;
}
