import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Vị trí cuộn khi điều hướng.
 *
 * Trình duyệt giữ nguyên vị trí cuộn khi điều hướng trong một ứng dụng một trang, nên nếu
 * không làm gì thì mở một khoá học mới lại rơi vào giữa trang.
 *
 * Bản trước luôn nhảy về đầu, kể cả khi bấm nút Quay lại. Đó là chỗ khiến điều hướng đọc
 * ra rất cứng: đang xem thẻ thứ mười, bấm vào một khoá, quay lại thì mất chỗ và phải cuộn
 * lại từ đầu. Nay tách hai trường hợp:
 *
 * - Đi tới một trang mới: nhảy về đầu. Nhảy thẳng, không cuộn mượt — chuyển trang mà còn
 *   thấy trang trôi thì rối.
 * - Quay lại: trả về ĐÚNG chỗ đang đứng lúc rời trang đó.
 *
 * Vị trí lưu theo `key` của từng mục trong lịch sử, không theo đường dẫn: cùng một đường
 * dẫn có thể được vào nhiều lần ở nhiều chỗ cuộn khác nhau.
 *
 * Bảng đặt ở mức module chứ không trong component: component này nằm ngoài `Routes` nên
 * bình thường không bị tháo, nhưng nếu có ai bọc nó vào chỗ khác thì bảng vẫn còn.
 */
const daLuu = new Map<string, number>();

export function ScrollToTop() {
  const { key } = useLocation();
  const kieu = useNavigationType();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (kieu === 'POP') {
      window.scrollTo({ top: daLuu.get(key) ?? 0, behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    // Hàm dọn chạy đúng lúc rời trang này, nên đây là chỗ ghi lại vị trí đang đứng.
    return () => {
      daLuu.set(key, window.scrollY);
    };
  }, [key, kieu]);

  return null;
}
