import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface AccordionItem {
  id: string;
  header: ReactNode;
  body: ReactNode;
}

export default function Accordion({
  items,
  defaultOpenIds = [],
  className,
}: {
  items: AccordionItem[];
  defaultOpenIds?: string[];
  className?: string;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpenIds));

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={cn('divide-y divide-secondary overflow-hidden rounded-card border border-secondary bg-primary', className)}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-secondary"
            >
              <span className="font-semibold text-primary">{item.header}</span>
              <ChevronDown
                className={cn('h-5 w-5 shrink-0 text-tertiary transition-transform', isOpen && 'rotate-180')}
                aria-hidden="true"
              />
            </button>
            {isOpen ? <div className="px-5 pb-4">{item.body}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
