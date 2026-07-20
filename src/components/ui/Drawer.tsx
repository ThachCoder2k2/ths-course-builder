import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import IconButton from './IconButton';
import { cn } from '../../lib/cn';

export default function Drawer({
  open,
  onClose,
  title,
  side = 'left',
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: 'left' | 'right';
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute inset-y-0 flex w-[85%] max-w-sm flex-col bg-primary shadow-pop',
          side === 'left' ? 'left-0' : 'right-0',
        )}
      >
        <div className="flex items-center justify-between border-b border-secondary px-4 py-3">
          <p className="font-bold text-primary">{title}</p>
          <IconButton onClick={onClose} aria-label="Đóng">
            <X className="h-5 w-5" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
