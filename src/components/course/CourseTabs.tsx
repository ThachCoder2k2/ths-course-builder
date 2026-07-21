import { useState } from 'react';
import { cn } from '../../lib/cn';

/**
 * Figma: `Horizontal tabs` (node 184:8403) at the top of the course main
 * content. A bg-secondary_alt tray (border-secondary, radius-xl, p-sm, gap-xs)
 * of Text md/Semibold tab buttons (h-44, px-lg py-md, radius-sm). The active
 * tab is bg-primary_alt with shadow-sm and secondary text; the rest are
 * quaternary. Clicking scrolls to the matching section.
 */
const TABS = [
  { id: 'learn', label: 'Bạn sẽ học gì?' },
  { id: 'skills', label: 'Kỹ năng bạn sẽ đạt được' },
  { id: 'curriculum', label: 'Cấu trúc khoá học' },
] as const;

export default function CourseTabs() {
  const [active, setActive] = useState(0);

  return (
    <div
      role="tablist"
      className="flex items-center gap-xs rounded-xl border border-secondary bg-secondary p-sm"
    >
      {TABS.map((tab, index) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === index}
          onClick={() => {
            setActive(index);
            document.getElementById(tab.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className={cn(
            'flex h-11 items-center justify-center gap-md rounded-md px-lg py-md text-md font-semibold transition-colors',
            active === index
              ? 'bg-primary text-secondary shadow-sm'
              : 'text-quaternary hover:text-secondary',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
