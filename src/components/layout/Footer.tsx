import { Link } from 'react-router-dom';
import Logo from './Logo';

/**
 * Figma: `Footer` (node 83:19101 / 177:3230) — type "Large 01".
 * gap-7xl between blocks, pt-7xl / pb-6xl, 1280 container with 32px padding.
 * Six flex-1 columns (min-w-128, gap-xl); headings Text sm/Semibold in
 * text-quaternary, links Text md/Semibold in button-tertiary-fg with gap-lg.
 *
 * Column labels, links and the copyright are reproduced verbatim from Figma
 * (the unreplaced Untitled UI boilerplate). Only the logo stays the real THS
 * mark — Figma's "GK Books" placeholder logo has no exportable asset.
 */
const COLUMNS: { title: string; links: { label: string; to: string; badge?: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Overview', to: '/' },
      { label: 'Features', to: '/' },
      { label: 'Solutions', to: '/', badge: 'New' },
      { label: 'Tutorials', to: '/' },
      { label: 'Pricing', to: '/' },
      { label: 'Releases', to: '/' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Press', to: '/' },
      { label: 'News', to: '/' },
      { label: 'Media kit', to: '/' },
      { label: 'Contact', to: '/' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', to: '/' },
      { label: 'Newsletter', to: '/' },
      { label: 'Events', to: '/' },
      { label: 'Help centre', to: '/' },
      { label: 'Tutorials', to: '/' },
      { label: 'Support', to: '/' },
    ],
  },
  {
    title: 'Use cases',
    links: [
      { label: 'Startups', to: '/' },
      { label: 'Enterprise', to: '/' },
      { label: 'Government', to: '/' },
      { label: 'SaaS centre', to: '/' },
      { label: 'Marketplaces', to: '/' },
      { label: 'Ecommerce', to: '/' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'Twitter', to: '/' },
      { label: 'LinkedIn', to: '/' },
      { label: 'Facebook', to: '/' },
      { label: 'GitHub', to: '/' },
      { label: 'AngelList', to: '/' },
      { label: 'Dribbble', to: '/' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', to: '/' },
      { label: 'Privacy', to: '/' },
      { label: 'Cookies', to: '/' },
      { label: 'Licenses', to: '/' },
      { label: 'Settings', to: '/' },
      { label: 'Contact', to: '/' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="flex w-full flex-col items-center gap-7xl overflow-hidden bg-primary pb-6xl pt-7xl">
      <div className="flex w-full max-w-content flex-col gap-6xl px-4 lg:px-4xl">
        <div className="flex w-full flex-wrap items-start gap-4xl">
          {COLUMNS.map((column) => (
            <div key={column.title} className="flex min-w-[128px] flex-1 flex-col gap-xl">
              <p className="w-full text-sm font-semibold text-quaternary">{column.title}</p>
              <div className="flex w-full flex-col gap-lg">
                {column.links.map((link) => (
                  <div key={link.label} className="flex items-center gap-md">
                    <Link
                      to={link.to}
                      className="text-md font-semibold text-button-tertiary-fg hover:text-brand-secondary"
                    >
                      {link.label}
                    </Link>
                    {link.badge ? (
                      <span className="inline-flex items-center rounded-sm border border-primary bg-primary px-sm py-xxs text-xs font-medium text-secondary shadow-xs">
                        {link.badge}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full max-w-content flex-col gap-4xl px-4 lg:px-4xl">
        <div className="flex w-full flex-wrap items-center justify-between gap-y-[24px] border-t border-secondary pt-4xl">
          <Logo />
          <p className="w-[293px] text-md text-quaternary">© 2077 Untitled UI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
