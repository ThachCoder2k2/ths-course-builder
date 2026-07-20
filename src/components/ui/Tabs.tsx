import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export default function Tabs({
  items,
  defaultId,
  className,
}: {
  items: TabItem[];
  defaultId?: string;
  className?: string;
}) {
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const activeItem = items.find((t) => t.id === active);

  return (
    <div className={className}>
      <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-secondary">
        {items.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors',
              active === tab.id
                ? 'border-brand-600 text-brand-secondary'
                : 'border-transparent text-tertiary hover:text-secondary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-5">
        {activeItem?.content}
      </div>
    </div>
  );
}
