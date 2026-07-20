import { Link } from 'react-router-dom';
import Logo from './Logo';

/**
 * Figma: `Footer` (node 83:19101 / 177:3230) — type "Large 01".
 * gap-7xl between blocks, pt-7xl / pb-6xl, 1280 container with 32px padding.
 * Six flex-1 columns (min-w-128, gap-xl); headings Text sm/Semibold in
 * text-quaternary, links Text md/Semibold in button-tertiary-fg with gap-lg.
 *
 * Figma's link labels are unreplaced Untitled UI boilerplate (Dribbble,
 * AngelList, "© 2077 Untitled UI") so the structure is matched exactly while
 * the copy is real.
 */
const COLUMNS: { title: string; links: { label: string; to: string; badge?: string }[] }[] = [
  {
    title: 'Sản phẩm',
    links: [
      { label: 'Khoá học', to: '/' },
      { label: 'Lộ trình học', to: '/', badge: 'Mới' },
      { label: 'Chủ đề', to: '/topics/tri-tue-nhan-tao' },
      { label: 'Bảng giá', to: '/' },
      { label: 'Cập nhật', to: '/' },
    ],
  },
  {
    title: 'Về THS',
    links: [
      { label: 'Giới thiệu', to: '/' },
      { label: 'Tuyển dụng', to: '/' },
      { label: 'Báo chí', to: '/' },
      { label: 'Tin tức', to: '/' },
      { label: 'Liên hệ', to: '/' },
    ],
  },
  {
    title: 'Tài nguyên',
    links: [
      { label: 'Blog', to: '/' },
      { label: 'Bản tin', to: '/' },
      { label: 'Sự kiện', to: '/' },
      { label: 'Trung tâm trợ giúp', to: '/' },
      { label: 'Hướng dẫn', to: '/' },
      { label: 'Hỗ trợ', to: '/' },
    ],
  },
  {
    title: 'Đối tượng',
    links: [
      { label: 'Cá nhân', to: '/' },
      { label: 'Doanh nghiệp', to: '/' },
      { label: 'Trường học', to: '/' },
      { label: 'Tổ chức', to: '/' },
    ],
  },
  {
    title: 'Mạng xã hội',
    links: [
      { label: 'Facebook', to: '/' },
      { label: 'LinkedIn', to: '/' },
      { label: 'YouTube', to: '/' },
      { label: 'TikTok', to: '/' },
    ],
  },
  {
    title: 'Pháp lý',
    links: [
      { label: 'Điều khoản', to: '/' },
      { label: 'Bảo mật', to: '/' },
      { label: 'Cookie', to: '/' },
      { label: 'Giấy phép', to: '/' },
      { label: 'Cài đặt', to: '/' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="flex w-full flex-col items-center gap-7xl overflow-hidden bg-primary pb-6xl pt-7xl">
      <div className="flex w-full max-w-content flex-col gap-6xl px-4 lg:px-4xl">
        <div className="flex w-full flex-wrap items-start gap-4xl">
          {COLUMNS.map((column) => (
            <div key={column.title} className="flex min-w-[128px] flex-1 flex-col gap-xl">
              <p className="w-full text-sm font-semibold text-quaternary">{column.title}</p>
              <div className="flex w-full flex-col gap-lg">
                {column.links.map((link) => (
                  <div key={link.label} className="flex items-center gap-md">
                    <Link
                      to={link.to}
                      className="text-md font-semibold text-button-tertiary-fg hover:text-brand-secondary"
                    >
                      {link.label}
                    </Link>
                    {link.badge ? (
                      <span className="inline-flex items-center rounded-sm border border-primary bg-primary px-sm py-xxs text-xs font-medium text-secondary shadow-xs">
                        {link.badge}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full max-w-content flex-col gap-4xl px-4 lg:px-4xl">
        <div className="flex w-full flex-wrap items-center justify-between gap-y-[24px] border-t border-secondary pt-4xl">
          <Logo />
          <p className="text-md text-quaternary">© 2026 THS Learning. Bản quyền thuộc về Techainer.</p>
        </div>
      </div>
    </footer>
  );
}
