import { useLocation, useNavigationType } from 'react-router-dom';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Chuyển trang mềm hơn.
 *
 * Trước đây sang trang khác là thay cây DOM tức thì rồi nhảy cuộn về 0 — không có gì ở
 * giữa, nên nó đọc ra như trang bị bắn sang chỗ khác chứ không phải mình vừa đi tới đâu.
 *
 * Ở đây thêm một nhịp vào cho trang mới: mờ dần lên kèm dịch nhẹ theo hướng đi. Chỉ có
 * pha VÀO, không có pha ra — muốn có pha ra thì phải giữ hai cây trang cùng lúc, tức
 * chiều cao trang nhảy hai lần và ảnh tải hai lượt, đổi lấy nửa ít giá trị nhất của cử chỉ.
 *
 * Hướng theo đúng `navigation-direction`: đi tới thì trang mới vào từ bên phải; quay lại
 * thì KHÔNG dịch ngang, chỉ mờ lên. Hai lý do: quay lại là về chỗ cũ nên nó không nên đọc
 * ra như "đi tới một chỗ mới", và lúc quay lại vị trí cuộn được trả về chỗ cũ nên thanh
 * bộ lọc dính của trang báo cáo đang ở trạng thái dính — dịch ngang cả trang lúc đó là
 * thấy thanh dính trượt theo, trông như lỗi.
 *
 * Bọc quanh `Outlet` của PageShell, KHÔNG bọc toàn bộ Routes: trang học bài nằm ngoài
 * PageShell và có một hộp chat `position: fixed`; `transform` trên tổ tiên sẽ đổi mốc neo
 * của nó và hộp chat rơi sai chỗ.
 */
export function RouteTransition({
  children,
  chiMo = false,
}: {
  children: ReactNode;
  /**
   * Chỉ đổi độ mờ, không dịch gì. Bắt buộc cho trang học bài: trang đó có hộp chat
   * `position: fixed`, mà `transform` trên tổ tiên sẽ biến tổ tiên thành mốc neo mới.
   */
  chiMo?: boolean;
}) {
  const { key } = useLocation();
  const kieu = useNavigationType();

  return (
    <div key={key} className={cn(chiMo ? 'ln-route-fade' : kieu === 'POP' ? 'ln-route-back' : 'ln-route-in')}>
      {children}
    </div>
  );
}
