import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import IconButton from '../ui/IconButton';
import Logo from './Logo';
import NavDropdown from './NavDropdown';
import AvatarMenu from './AvatarMenu';
import { getTopics, getUser } from '../../mock';
import { cn } from '../../lib/cn';

// Dùng bởi MobileNavDrawer; bản cho máy tính là logo + link + dropdown bên dưới.
export const NAV_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/hoc-tap-cua-toi', label: 'Học tập của tôi' },
  { to: '/topics/tri-tue-nhan-tao', label: 'Trí tuệ nhân tạo' },
  { to: '/topics/khoa-hoc-du-lieu', label: 'Khoa học dữ liệu' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'ln-press ln-press-flat ln-focus whitespace-nowrap rounded-sm text-md text-[#535862] transition-colors hover:text-primary',
    isActive ? 'font-semibold' : 'font-medium',
  );

/**
 * Thanh đầu trang, đo lại từ thiết kế Figma node 550:11175 ở tỉ lệ 3x.
 *
 * Bản trước dựng sai bốn chỗ: dải cao 76px lồng một thẻ trắng bo 16px có viền và bóng,
 * logo kèm dòng chữ "GK EBOOKS", ô tìm kiếm bo 8px và bị chặn ở 420px.
 *
 * Thiết kế thì: dải cao 80px và phẳng — không thẻ, không viền, không bóng; logo chỉ còn
 * hình khối lục giác 48×38, cách nhóm link 20px; ô tìm kiếm cao 44px, bo tròn hết, rộng 833px chiếm gần hết
 * khoảng giữa nhóm link và ảnh đại diện.
 *
 * Ba link đều một màu #535862 trong thiết kế, không có link nào được tô xanh. Ở đây giữ
 * lại một dấu hiệu rất nhẹ cho trang đang mở (chữ đậm hơn), vì trang thật có nhiều mục
 * chứ không chỉ một màn hình tĩnh — bỏ hẳn thì người dùng mất chỗ định vị.
 */
export default function TopNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const user = getUser();
  const topics = getTopics();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  /**
   * Ô tìm ở đây là ô tìm DUY NHẤT của cả site — trang tìm kiếm không dựng thêm ô nào nữa.
   *
   * Nên khi đang ở trang tìm kiếm, ô này phải hiện đúng từ khoá đang lọc: nó vừa là chỗ gõ
   * vừa là chỗ đọc lại mình đã tìm gì. `key` đổi theo từ khoá để ô nhận lại giá trị mới khi
   * từ khoá đổi từ nơi khác (ví dụ bấm "Xoá hết" ở cột lọc).
   */
  const dangTim = pathname === '/tim-kiem';
  const tuKhoa = dangTim ? (new URLSearchParams(search).get('q') ?? '') : '';

  /**
   * Gửi từ khoá sang trang tìm kiếm.
   *
   * Đang ở trang tìm kiếm thì THAY tham số chứ không đẩy thêm mục lịch sử: gõ ba lần là ba
   * mục lịch sử, bấm Back ba lần mới ra khỏi trang.
   */
  const timKhoa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const o = new FormData(e.currentTarget).get('q');
    const q = typeof o === 'string' ? o.trim() : '';
    const den = q ? '/tim-kiem?q=' + encodeURIComponent(q) : '/tim-kiem';
    navigate(den, { replace: dangTim });
  };

  return (
    <header className="sticky top-0 z-40 h-20 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-content items-center px-4 lg:px-4xl">
        <div className="flex shrink-0 items-center gap-xl lg:gap-2xl">
          <IconButton className="lg:hidden" aria-label="Mở menu" onClick={onOpenMenu}>
            <Menu className="h-5 w-5" />
          </IconButton>

          <Link to="/" aria-label="Về trang chủ" className="ln-press ln-focus shrink-0 rounded-md">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-2xl lg:flex">
            <NavLink to="/" end className={linkClass}>
              Trang chủ
            </NavLink>

            <NavDropdown label="Chủ đề">
              <ul className="flex flex-col">
                {topics.map((topic) => (
                  <li key={topic.id}>
                    <NavLink
                      to={'/topics/' + topic.slug}
                      className={({ isActive }) =>
                        cn('block rounded-md px-lg py-md text-md text-secondary hover:bg-secondary', isActive && 'font-semibold text-brand-secondary')
                      }
                    >
                      {topic.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </NavDropdown>

            <NavDropdown label="Học tập của tôi">
              <ul className="flex flex-col">
                <li>
                  <Link to="/hoc-tap-cua-toi" className="block rounded-md px-lg py-md text-md text-secondary hover:bg-secondary">
                    Phân tích học tập
                  </Link>
                </li>
                <li>
                  <Link to="/" className="block rounded-md px-lg py-md text-md text-secondary hover:bg-secondary">
                    Khoá học của tôi
                  </Link>
                </li>
              </ul>
            </NavDropdown>
          </nav>
        </div>

        {/*
          Ô tìm kiếm là FORM thật, gửi sang /tim-kiem.

          Trước đây nó là một `<label>` bọc input, không có form và không có đích — gõ rồi
          Enter thì không có gì xảy ra. Site có đầu vào mà không có đầu ra.

          focus-within là bắt buộc: thiết kế Figma không vẽ trạng thái focus, nhưng bỏ hẳn
          thì Tab vào ô tìm kiếm là mất dấu con trỏ hoàn toàn.
        */}
        <form
          role="search"
          onSubmit={timKhoa}
          className="ln-search mx-xl hidden h-11 min-w-0 flex-1 items-center gap-md rounded-full border border-primary bg-primary px-xl focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-500/40 sm:flex lg:mx-4xl"
        >
          <Search className="ln-search-icon h-5 w-5 shrink-0 text-quaternary" aria-hidden="true" />
          <input
            name="q"
            type="search"
            key={tuKhoa}
            defaultValue={tuKhoa}
            aria-label="Tìm khoá học"
            placeholder="Hôm nay bạn muốn tìm hiểu chủ đề gì?"
            className="w-full min-w-0 bg-transparent text-md text-primary outline-none placeholder:text-placeholder"
          />
          <button type="submit" className="sr-only">
            Tìm
          </button>
        </form>

        {/* Khổ hẹp không có chỗ cho ô nhập, nên nút này mở thẳng trang tìm kiếm. */}
        <div className="flex flex-1 justify-end sm:hidden">
          <IconButton aria-label="Tìm khoá học" onClick={() => navigate('/tim-kiem')}>
            <Search className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="shrink-0">
          <AvatarMenu name={user.name} src={user.avatar} />
        </div>
      </div>
    </header>
  );
}
