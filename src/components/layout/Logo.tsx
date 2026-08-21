import icon from '../../assets/brand/logo-icon.png';
import { cn } from '../../lib/cn';

/**
 * Dấu hiệu thương hiệu ở thanh đầu trang, theo Figma node 550:11175 — chỉ còn hình khối
 * lục giác và cây bút chì, không kèm dòng chữ "GK EBOOKS" như bản trước.
 *
 * Ảnh cắt ra từ chính bản thiết kế ở tỉ lệ 3x — 48×38 khi vẽ, nên vẫn nét trên màn
 * hình mật độ cao. Cắt phải giữ kênh trong suốt: nền của bản render là trong suốt, đổi
 * sang RGB một cái là nền thành đen và logo hiện ra như một ô đen giữa thanh trắng.
 */
export default function Logo({ className }: { className?: string }) {
  return (
    <img
      src={icon}
      alt="THS Learning"
      width={48}
      height={38}
      className={cn('h-[38px] w-12 shrink-0 object-contain', className)}
    />
  );
}
