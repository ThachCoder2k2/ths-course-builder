import { Link, NavLink } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import Avatar from '../ui/Avatar';
import IconButton from '../ui/IconButton';
import NavDropdown from './NavDropdown';
import { getTopics, getUser } from '../../mock';
import { cn } from '../../lib/cn';

// Used by MobileNavDrawer; desktop uses the dropdowns below.
export const NAV_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/topics/tri-tue-nhan-tao', label: 'Trí tuệ nhân tạo' },
  { to: '/topics/khoa-hoc-du-lieu', label: 'Khoa học dữ liệu' },
];

/**
 * Figma: `Dropdown header navigation` (node 182:11785), 76px tall.
 * A static, solid-white 76px header band anchored at the top of the page —
 * it scrolls away with the content, exactly like the Figma frame. Holds the
 * nav card (radius-2xl, border-secondary, shadow-xs) inside a 1280 container
 * with 32px padding and a 12px top offset.
 */
export default function TopNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const user = getUser();
  const topics = getTopics();

  return (
    <header className="relative z-40 h-[76px] bg-primary pt-lg">
      <div className="mx-auto flex w-full max-w-content items-center justify-center px-4 lg:px-4xl">
        <div className="flex h-16 flex-1 items-center justify-between gap-xl rounded-2xl border border-secondary bg-primary pl-xl pr-lg shadow-xs">
          {/* mobile trigger */}
          <IconButton className="lg:hidden" aria-label="Mở menu" onClick={onOpenMenu}>
            <Menu className="h-5 w-5" />
          </IconButton>

          {/* Figma: Sub-menu — two dropdown triggers, gap 20px */}
          <nav className="hidden items-center gap-[20px] lg:flex">
            <NavDropdown label="Chủ đề">
              <ul className="flex flex-col">
                {topics.map((topic) => (
                  <li key={topic.id}>
                    <NavLink
                      to={'/topics/' + topic.slug}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-md px-lg py-md text-md text-secondary hover:bg-secondary',
                          isActive && 'text-brand-secondary',
                        )
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
                  <Link to="/" className="block rounded-md px-lg py-md text-md text-secondary hover:bg-secondary">
                    Khoá học của tôi
                  </Link>
                </li>
                <li>
                  <Link to="/" className="block rounded-md px-lg py-md text-md text-secondary hover:bg-secondary">
                    Tiến độ học tập
                  </Link>
                </li>
              </ul>
            </NavDropdown>
          </nav>

          {/* Figma: Input dropdown — 480px, radius-md, border-primary, shadow-xs */}
          <label className="flex h-10 flex-1 items-center gap-md rounded-md border border-primary bg-primary px-lg shadow-xs lg:max-w-[480px]">
            <Search className="h-5 w-5 shrink-0 text-quaternary" aria-hidden="true" />
            <input
              type="search"
              aria-label="Tìm khoá học"
              placeholder="Hôm nay bạn muốn tìm hiểu chủ đề gì?"
              className="w-full bg-transparent text-md text-primary outline-none placeholder:text-placeholder"
            />
          </label>

          {/* Figma: NavigationActions — 40px avatar with contrast border */}
          <Avatar
            name={user.name}
            src={user.avatar}
            size="lg"
            className="h-10 w-10 shrink-0 border-[0.75px] border-[rgba(0,0,0,0.08)] text-sm"
          />
        </div>
      </div>
    </header>
  );
}
