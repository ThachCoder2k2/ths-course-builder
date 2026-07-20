import { Link } from 'react-router-dom';
import { Route } from 'lucide-react';
import Button from '../ui/Button';

export default function CTABanner() {
  return (
    <section className="overflow-hidden rounded-card bg-gradient-to-r from-brand-900 to-brand-700 px-6 py-8 sm:px-10 sm:py-10">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
        <div className="flex-1">
          <h2 className="text-h2 text-white">Thiết kế lộ trình học của riêng bạn</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Chọn mục tiêu nghề nghiệp và nhận gợi ý chuỗi khoá học phù hợp, kèm thời lượng dự kiến cho từng giai đoạn.
          </p>
          <Link to="/topics/tri-tue-nhan-tao" className="mt-6 inline-block">
            <Button variant="inverse">Khám phá lộ trình</Button>
          </Link>
        </div>
        <Route className="hidden h-28 w-28 shrink-0 text-white/30 md:block" aria-hidden="true" />
      </div>
    </section>
  );
}
