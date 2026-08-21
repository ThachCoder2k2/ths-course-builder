import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Vỏ thẻ dùng chung cho cả trang báo cáo: tiêu đề 18/28, câu mô tả 14/20, một
 * đường kẻ mảnh rồi tới phần nội dung. Viền vẽ bằng inset ring nên chiều cao thẻ
 * khớp Figma thay vì phình thêm 1px như khi dùng border.
 */
export function ReportCard({
  title,
  subtitle,
  badge,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    // w-full để thẻ luôn lấp hết cột của nó. Thiếu nó thì thẻ là flex item không có
    // flex-grow nên co theo nội dung: bảng rỗng làm thẻ hụt hơn 150px so với cột, và
    // khoảng cách giữa hai thẻ phình ra trông như lỗi dàn trang.
    <section className={cn('flex w-full min-w-0 flex-col rounded-xl bg-primary shadow-xs-ring-secondary', className)}>
      <header className="flex flex-col gap-2xl pt-2xl">
        <div className="flex flex-wrap items-start justify-between gap-xl px-3xl">
          <div className="flex min-w-0 flex-col gap-xxs">
            <div className="flex flex-wrap items-center gap-md">
              <h2 className="text-lg font-semibold text-primary">{title}</h2>
              {badge}
            </div>
            {subtitle ? <p className="text-sm text-tertiary">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-lg">{actions}</div> : null}
        </div>
        <div className="h-px w-full bg-secondary" />
      </header>
      <div className={cn('flex flex-1 flex-col px-3xl py-2xl', bodyClassName)}>{children}</div>
    </section>
  );
}

/** Chip xanh nhạt cạnh tiêu đề — dùng cho những con số đáng khoe như chuỗi ngày học. */
export function CardBadge({ children, tone = 'success' }: { children: ReactNode; tone?: 'success' | 'brand' | 'warning' }) {
  const cls = {
    success: 'bg-success-50 text-success-700 ring-success-200',
    brand: 'bg-utility-brand-50 text-brand-600 ring-utility-brand-200',
    warning: 'bg-warning-50 text-warning-700 ring-warning-600/20',
  }[tone];
  return <span className={cn('inline-flex items-center rounded-pill px-md py-xxs text-xs font-medium ring-1', cls)}>{children}</span>;
}
