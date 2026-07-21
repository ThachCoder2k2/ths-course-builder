import { ArrowRight, Award, Clock, Star } from 'lucide-react';
import IconBadge from '../ui/IconBadge';
import listingThumb from '../../assets/listings/listing-1.jpg';

/**
 * Figma: `Section` (node 179:5518) — 1376 × 506.
 * Page header (Display xs/Semibold) over a Content row of three brand-tinted
 * columns (node 179:5767 and siblings — bg utility-brand-50, radius-3xl, p-xl,
 * gap-md, 24px between columns). Each column leads with a tertiary-colour link
 * button (Text md/Semibold + 20px arrow-right) then stacks three
 * `_Listing search result desktop` cards (node 179:6131 — bg-primary,
 * border-secondary, shadow-xs, radius-xl, p-xl, gap-2xl): a 130.56 × 94
 * thumbnail carrying a "Rare find" pill, then title, exp/clock badges and the
 * price line.
 *
 * The nine rows carry identical copy in Figma; that is reproduced verbatim.
 */
export interface ListingItem {
  id: string;
  title: string;
  exp: string;
  duration: string;
  price: string;
  priceUnit: string;
  highlight: string;
}

export interface ListingColumn {
  label: string;
  items: ListingItem[];
}

/** Node 179:6131 — every row in the frame repeats these values. */
function figmaRows(prefix: string): ListingItem[] {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `${prefix}-${i}`,
    title: 'Khoá học Python',
    exp: '+700 exp',
    duration: '110 phút',
    price: '$540',
    priceUnit: 'AUD total',
    highlight: 'Rare find',
  }));
}

const FIGMA_COLUMNS: ListingColumn[] = [
  { label: 'Python', items: figmaRows('python') },
  { label: 'Marketing', items: figmaRows('marketing') },
  { label: 'Kỹ năng tin học văn phòng', items: figmaRows('office') },
];

export default function ListingColumns({
  title = 'Các tệp khoá học nổi bật xếp theo chủ đề',
  columns = FIGMA_COLUMNS,
}: {
  title?: string;
  columns?: ListingColumn[];
}) {
  return (
    <section className="flex w-full flex-col gap-xl">
      <div className="flex w-full flex-col gap-2xl">
        <div className="flex w-full flex-wrap items-start gap-xl">
          <div className="flex min-w-[320px] flex-1 flex-col gap-xs">
            <h2 className="w-full text-display-xs text-primary">{title}</h2>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-3xl xl:flex-row">
        {columns.map((column) => (
          <div
            key={column.label}
            className="flex w-full min-w-px flex-1 flex-col items-start justify-center gap-md rounded-3xl bg-utility-brand-50 p-xl"
          >
            <button
              type="button"
              className="flex items-center justify-center gap-sm text-md font-semibold text-brand-secondary"
            >
              {column.label}
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </button>

            {column.items.map((item) => (
              <article
                key={item.id}
                className="flex w-full items-start gap-2xl rounded-xl bg-primary p-xl shadow-xs-ring-secondary"
              >
                <div className="relative h-[94px] w-[130.556px] shrink-0 overflow-hidden rounded-md">
                  <img
                    src={listingThumb}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute bottom-md left-md flex items-center gap-xxs rounded-full border border-utility-brand-200 bg-utility-brand-50 py-xxs pl-sm pr-md text-xs font-medium text-utility-brand-700">
                    <Award className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {item.highlight}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-md">
                  <div className="flex w-full items-start gap-xl">
                    <div className="flex min-w-px flex-1 flex-col gap-xs">
                      <h3 className="w-full text-md font-semibold text-primary">{item.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-md">
                    <IconBadge icon={<Star className="h-3 w-3 text-utility-orange-500" />}>{item.exp}</IconBadge>
                    <IconBadge icon={<Clock className="h-3 w-3" />}>{item.duration}</IconBadge>
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-3xl">
                    <div className="flex items-end gap-md">
                      <p className="text-xl font-semibold text-primary">{item.price}</p>
                      <div className="flex flex-col items-start pb-[2px]">
                        <p className="text-md text-tertiary">{item.priceUnit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
