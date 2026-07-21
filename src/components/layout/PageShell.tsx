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
      {/* TopNav is fixed; offset content by its 76px height (Figma 177:2982). */}
      <main className="flex-1 pt-[76px]">
        <Outlet />
      </main>
      <Footer />
      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
