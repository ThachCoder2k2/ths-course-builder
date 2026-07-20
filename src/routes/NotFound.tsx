import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div data-testid="page-404" className="mx-auto flex max-w-content flex-col items-center px-4 py-24 text-center">
      <p className="text-display text-brand-600">404</p>
      <h1 className="mt-2 text-h2 text-primary">Không tìm thấy trang</h1>
      <p className="mt-2 text-tertiary">Nội dung bạn tìm có thể đã được chuyển hoặc không tồn tại.</p>
      <Link to="/" className="mt-6">
        <Button>Về trang chủ</Button>
      </Link>
    </div>
  );
}
