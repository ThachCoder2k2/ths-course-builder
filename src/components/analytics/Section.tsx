import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

/** Numbered section heading used down the dashboard. */
export function Section({
  index,
  id,
  title,
  subtitle,
  children,
}: {
  index: number;
  id?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-[132px] flex-col gap-2xl lg:scroll-mt-28">
      <Reveal>
        <header className="flex flex-col gap-xs">
          <span className="flex items-center gap-md">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white tabular-nums">{index}</span>
            <h2 className="text-display-xs font-semibold text-primary">{title}</h2>
          </span>
          <p className="max-w-paragraph pl-[calc(1.75rem+0.5rem)] text-md text-tertiary">{subtitle}</p>
        </header>
      </Reveal>
      {children}
    </section>
  );
}
