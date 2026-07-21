import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import Footer from './Footer';
import MobileNavDrawer from './MobileNavDrawer';

export default function PageShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <TopNav onOpenMenu={() => setMenuOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
