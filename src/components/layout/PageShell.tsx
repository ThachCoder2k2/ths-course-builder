import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav';
import Footer from './Footer';
import MobileNavDrawer from './MobileNavDrawer';
import ReadingProgress from './ReadingProgress';
import { RouteTransition } from './RouteTransition';

/**
 * Những trang không có footer trong thiết kế. Trang báo cáo kết thúc ngay sau thẻ cuối,
 * thêm footer marketing vào đó vừa lệch thiết kế vừa lôi một mớ chữ tiếng Anh mẫu lên màn.
 */
const NO_FOOTER = ['/hoc-tap-cua-toi'];

export default function PageShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const showFooter = !NO_FOOTER.includes(pathname);

  return (
    <div className="flex min-h-full flex-col">
      <TopNav onOpenMenu={() => setMenuOpen(true)} />
      <ReadingProgress />
      <main className="flex-1">
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </main>
      {showFooter ? <Footer /> : null}
      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
