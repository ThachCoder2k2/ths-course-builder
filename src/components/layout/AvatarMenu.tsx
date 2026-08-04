import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, LogOut, UserRound } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { cn } from '../../lib/cn';

function MenuLink({ to, icon, label, onClick, highlight }: { to: string; icon: ReactNode; label: string; onClick: () => void; highlight?: boolean }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-md rounded-md px-lg py-md text-md text-secondary hover:bg-secondary',
        highlight && 'font-semibold text-brand-secondary',
      )}
    >
      <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', highlight ? 'bg-brand-50 text-brand-secondary' : 'bg-secondary text-quaternary')}>{icon}</span>
      <span className="flex-1">{label}</span>
      {highlight ? <span className="rounded-pill bg-brand-50 px-md py-xxs text-xs font-semibold text-brand-secondary">Mới</span> : null}
    </Link>
  );
}

/** Account avatar with a dropdown — the entry point into "Học tập của tôi". */
export default function AvatarMenu({ name, src }: { name: string; src?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Mở menu tài khoản"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-full outline-none ring-brand-500 ring-offset-2 focus-visible:ring-2"
      >
        <Avatar name={name} src={src} size="md" className="border-[0.75px] border-[rgba(0,0,0,0.08)]" />
      </button>

      {open ? (
        <nav aria-label="Tài khoản" className="absolute right-0 top-[calc(100%+12px)] z-50 w-[264px] overflow-hidden rounded-xl border border-secondary bg-primary p-md shadow-sm">
          <div className="flex items-center gap-md px-lg py-md">
            <Avatar name={name} src={src} size="md" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-primary">{name}</span>
              <span className="truncate text-xs text-tertiary">Người học</span>
            </div>
          </div>
          <div className="my-xs h-px bg-gray-200" />
          <MenuLink to="/hoc-tap-cua-toi" icon={<LineChart className="h-4 w-4" />} label="Học tập của tôi" onClick={() => setOpen(false)} highlight />
          <MenuLink to="/" icon={<UserRound className="h-4 w-4" />} label="Hồ sơ cá nhân" onClick={() => setOpen(false)} />
          <div className="my-xs h-px bg-gray-200" />
          <MenuLink to="/" icon={<LogOut className="h-4 w-4" />} label="Đăng xuất" onClick={() => setOpen(false)} />
        </nav>
      ) : null}
    </div>
  );
}
