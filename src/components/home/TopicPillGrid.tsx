import { Link } from 'react-router-dom';
import {
  Aperture,
  BrainCircuit,
  Computer,
  GalleryHorizontalEnd,
  Glasses,
  Languages,
  PiggyBank,
  Pipette,
  Sparkles,
  Speech,
  type LucideIcon,
} from 'lucide-react';

/**
 * Figma: `Section` (node 179:7785) — 1376 × 184.
 * Page header (Display xs/Semibold) over a wrapping Container (node 179:7860 —
 * gap-xl, max-w-1440) of secondary pill buttons: radius-full, border
 * button-secondary on bg-primary, px-[22px] py-xl, gap-md, 24px icon and a
 * Text lg/Semibold label, carrying shadow-xs plus the skeuomorphic inner
 * border. Icons map to their nearest lucide equivalents.
 */
/**
 * Mỗi chip dẫn sang trang tìm kiếm.
 *
 * Trước đây cả mười chip là `<button>` không có việc gì — bấm vào không đi đâu. Giờ năm chip
 * trùng một chủ đề thật của thư viện thì mở đúng chủ đề đó; năm chip còn lại (Thiết kế đồ
 * hoạ, Motion graphic, Nhiếp ảnh, Kinh tế, Ôn luyện) là nhóm kỹ năng mà thư viện demo chưa
 * có khoá nào, nên mở trang tìm kiếm KHÔNG lọc, tức cả thư viện.
 *
 * Cố tình không gửi chúng thành từ khoá: gõ "Nhiếp ảnh" ra không kết quả thì người xem
 * tưởng site lỗi, còn mở cả thư viện thì vẫn là một câu trả lời thật. Muốn khớp đúng thì
 * phải thêm khoá cho mấy nhóm đó vào mock, hoặc rút dải chip về đúng năm chủ đề đang có.
 */
const SKILLS: { label: string; Icon: LucideIcon; den: string }[] = [
  { label: 'Công nghệ và lập trình', Icon: Computer, den: '/tim-kiem?chu-de=khoa-hoc-du-lieu' },
  { label: 'Trí tuệ nhân tạo', Icon: Sparkles, den: '/tim-kiem?chu-de=tri-tue-nhan-tao' },
  { label: 'Thiết kế đồ hoạ', Icon: Pipette, den: '/tim-kiem' },
  { label: 'Motion graphic', Icon: GalleryHorizontalEnd, den: '/tim-kiem' },
  { label: 'Nhiếp ảnh', Icon: Aperture, den: '/tim-kiem' },
  { label: 'Ngôn ngữ', Icon: Languages, den: '/tim-kiem?chu-de=tieng-anh-giao-tiep' },
  { label: 'Kinh tế và đầu tư', Icon: PiggyBank, den: '/tim-kiem' },
  { label: 'Ôn luyện và phòng thi ảo', Icon: Glasses, den: '/tim-kiem' },
  { label: 'Chiến thuật và thể thao trí tuệ', Icon: BrainCircuit, den: '/tim-kiem?chu-de=co-vua' },
  { label: 'Tranh biện', Icon: Speech, den: '/tim-kiem?chu-de=ky-nang-thuyet-trinh' },
];

export default function TopicPillGrid({ title = 'Kỹ năng phổ biến' }: { title?: string }) {
  return (
    <section className="flex w-full flex-col gap-xl">
      <div className="flex w-full flex-col gap-2xl">
        <div className="flex w-full flex-wrap items-start gap-xl">
          <div className="flex min-w-0 flex-1 flex-col gap-xs">
            <h2 className="w-full text-display-xs text-primary">{title}</h2>
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-[1440px] flex-wrap items-start gap-xl">
        {SKILLS.map(({ label, Icon, den }) => (
          <Link
            key={label}
            to={den}
            className="relative flex h-[52px] max-w-full items-center justify-center gap-md overflow-hidden rounded-full bg-button-secondary px-xl py-lg text-md font-semibold text-button-secondary-fg shadow-xs-ring-primary ln-press ln-press-soft ln-focus-flat sm:h-[60px] sm:px-[22px] sm:py-xl sm:text-lg"
          >
            <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span className="flex items-center justify-center px-xxs">{label}</span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
