import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'Khoá học',
    links: [
      { label: 'Trí tuệ nhân tạo', to: '/topics/tri-tue-nhan-tao' },
      { label: 'Khoa học dữ liệu', to: '/topics/khoa-hoc-du-lieu' },
      { label: 'Tất cả khoá học', to: '/' },
    ],
  },
  {
    title: 'Về chúng tôi',
    links: [
      { label: 'Giới thiệu', to: '/' },
      { label: 'Đội ngũ giảng viên', to: '/' },
      { label: 'Tuyển dụng', to: '/' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Trung tâm trợ giúp', to: '/' },
      { label: 'Câu hỏi thường gặp', to: '/' },
      { label: 'Liên hệ', to: '/' },
    ],
  },
  {
    title: 'Điều khoản',
    links: [
      { label: 'Điều khoản sử dụng', to: '/' },
      { label: 'Chính sách bảo mật', to: '/' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto max-w-content px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 font-extrabold text-ink-900">
              <span className="grid h-8 w-8 place-items-center rounded-btn bg-brand-600 text-sm text-white">GK</span>
              THS Learning
            </div>
            <p className="mt-3 text-sm text-ink-500">
              Nền tảng học trực tuyến giúp bạn xây dựng lộ trình học phù hợp với mục tiêu nghề nghiệp.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold text-ink-900">{column.title}</h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-ink-500 hover:text-brand-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 border-t border-line pt-6 text-sm text-ink-400">
          © 2026 THS Learning. Bản quyền thuộc về Techainer.
        </p>
      </div>
    </footer>
  );
}
