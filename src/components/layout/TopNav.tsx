import { Link, NavLink } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import IconButton from '../ui/IconButton';
import Logo from './Logo';
import NavDropdown from './NavDropdown';
import AvatarMenu from './AvatarMenu';
import { getTopics, getUser } from '../../mock';
import { cn } from '../../lib/cn';

// Used by MobileNavDrawer; desktop uses the logo + links + dropdowns below.
export const NAV_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/hoc-tap-cua-toi', label: 'Học tập của tôi' },
  { to: '/topics/tri-tue-nhan-tao', label: 'Trí tuệ nhân tạo' },
  { to: '/topics/khoa-hoc-du-lieu', label: 'Khoa học dữ liệu' },
];

/**
 * Transparent 76px header band. Left: logo (→ home) + "Trang chủ" + dropdowns.
 * Right: search + account avatar menu (entry into "Học tập của tôi").
 */
export default function TopNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const user = getUser();
  const topics = getTopics();

  return (
    <header className="sticky top-0 z-40 h-[76px] pt-lg bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-content items-center justify-center px-4 lg:px-4xl">
        <div className="flex h-16 flex-1 items-center justify-between gap-xl rounded-2xl border border-secondary bg-primary pl-xl pr-lg shadow-xs">
          <div className="flex items-center gap-xl">
            <IconButton className="lg:hidden" aria-label="Mở menu" onClick={onOpenMenu}>
              <Menu className="h-5 w-5" />
            </IconButton>

            <Link to="/" aria-label="Về trang chủ" className="shrink-0">
              <Logo />
            </Link>

            <nav className="hidden items-center gap-[20px] lg:flex">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn('text-md font-semibold text-button-tertiary-fg hover:text-brand-secondary', isActive && 'text-brand-secondary')
                }
              >
                Trang chủ
              </NavLink>

              <NavDropdown label="Chủ đề">
                <ul className="flex flex-col">
                  {topics.map((topic) => (
                    <li key={topic.id}>
                      <NavLink
                        to={'/topics/' + topic.slug}
                        className={({ isActive }) =>
                          cn('block rounded-md px-lg py-md text-md text-secondary hover:bg-secondary', isActive && 'text-brand-secondary')
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
                    <Link to="/hoc-tap-cua-toi" className="block rounded-md px-lg py-md text-md font-medium text-brand-secondary hover:bg-secondary">
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

          <label className="flex h-10 min-w-0 flex-1 items-center gap-md rounded-md border border-primary bg-primary px-lg shadow-xs focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-500/40 lg:max-w-[420px]">
            <Search className="h-5 w-5 shrink-0 text-quaternary" aria-hidden="true" />
            <input
              type="search"
              aria-label="Tìm khoá học"
              placeholder="Hôm nay bạn muốn tìm hiểu chủ đề gì?"
              className="w-full bg-transparent text-md text-primary outline-none placeholder:text-placeholder"
            />
          </label>

          <AvatarMenu name={user.name} src={user.avatar} />
        </div>
      </div>
    </header>
  );
}
