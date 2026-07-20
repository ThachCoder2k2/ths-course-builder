import { Link, NavLink } from 'react-router-dom';
import { Bell, Menu, Search } from 'lucide-react';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';
import IconButton from '../ui/IconButton';
import { getUser } from '../../mock';
import { cn } from '../../lib/cn';

export const NAV_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/topics/tri-tue-nhan-tao', label: 'Trí tuệ nhân tạo' },
  { to: '/topics/khoa-hoc-du-lieu', label: 'Khoa học dữ liệu' },
];

export default function TopNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const user = getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center gap-3 px-4">
        <IconButton className="md:hidden" aria-label="Mở menu" onClick={onOpenMenu}>
          <Menu className="h-5 w-5" />
        </IconButton>

        <Link to="/" className="flex items-center gap-2 font-extrabold text-ink-900">
          <span className="grid h-8 w-8 place-items-center rounded-btn bg-brand-600 text-sm text-white">GK</span>
          <span className="hidden sm:inline">THS Learning</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-btn px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface-muted',
                  isActive && 'text-brand-700',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Input
            className="hidden w-56 lg:flex xl:w-72"
            placeholder="Tìm khoá học..."
            aria-label="Tìm khoá học"
            icon={<Search className="h-4 w-4" />}
          />
          <IconButton aria-label="Thông báo">
            <Bell className="h-5 w-5" />
          </IconButton>
          <Avatar name={user.name} src={user.avatar} size="sm" />
        </div>
      </div>
    </header>
  );
}
