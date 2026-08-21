import { Inbox } from 'lucide-react';
import { cn } from '../../lib/cn';

/**
 * Thông báo khi thẻ không có gì để vẽ. Một dòng ngắn, căn giữa cả chiều ngang và
 * chiều dọc, kèm một icon mờ — để chỗ trống trông như có chủ đích chứ không như lỗi.
 */
export function EmptyState({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('flex flex-1 flex-col items-center justify-center gap-md py-2xl text-center', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
        <Inbox className="h-4 w-4 text-fg-quinary" aria-hidden="true" />
      </span>
      <p className="text-sm text-quaternary">{text}</p>
    </div>
  );
}
