import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import Drawer from '../ui/Drawer';
import Input from '../ui/Input';
import { NAV_LINKS } from './TopNav';
import { cn } from '../../lib/cn';

export default function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();

  // Close whenever the route changes so the drawer never covers the new page.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <Drawer open={open} onClose={onClose} title="Danh mục" side="left">
      <div className="space-y-4 p-4">
        <Input placeholder="Tìm khoá học..." aria-label="Tìm khoá học" icon={<Search className="h-4 w-4" />} />

        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-btn px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-surface-muted',
                  isActive && 'bg-brand-50 text-brand-700',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </Drawer>
  );
}
