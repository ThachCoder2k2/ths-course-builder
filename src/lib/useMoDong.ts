import { useEffect, useState } from 'react';

/**
 * Giữ một phần tử trong DOM thêm một quãng sau khi nó bị tắt, để chạy được animation ĐÓNG.
 *
 * React tháo phần tử ngay khi điều kiện thành false, nên `{mo ? <Panel/> : null}` không bao
 * giờ có animation đóng — nó biến mất đột ngột, đúng chỗ cứng mà bảng chat đang mắc. Hook
 * trả về `hienThi` (còn dựng hay không) và `dangDong` (đang chạy animation ra), để phía gọi
 * chọn class cho từng chiều.
 *
 * Animation ra ngắn hơn animation vào (~2/3) — vào thì cần thấy nó tới, ra thì càng nhanh
 * càng đỡ chắn đường.
 */
export function useMoDong(mo: boolean, msRa: number): { hienThi: boolean; dangDong: boolean } {
  const [hienThi, setHienThi] = useState(mo);
  const [dangDong, setDangDong] = useState(false);

  useEffect(() => {
    if (mo) {
      setHienThi(true);
      setDangDong(false);
      return;
    }
    if (!hienThi) return;
    setDangDong(true);
    const t = window.setTimeout(() => {
      setHienThi(false);
      setDangDong(false);
    }, msRa);
    return () => window.clearTimeout(t);
    // hienThi cố tình không nằm trong deps: thêm vào thì lượt dọn hẹn giờ tự huỷ chính nó.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mo, msRa]);

  return { hienThi, dangDong };
}
