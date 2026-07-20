import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import Footer from './Footer';

export default function PageShell() {
  return (
    <div className="flex min-h-full flex-col">
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
