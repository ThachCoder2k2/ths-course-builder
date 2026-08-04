import { sum } from '../../../lib/svg';
import { readableText } from '../palette';

export interface TreeItem {
  label: string;
  value: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Recursive binary squarify — good enough for the ≤6-item breakdowns here. */
function squarify(items: TreeItem[], r: Rect): (Rect & { item: TreeItem })[] {
  if (items.length === 1) return [{ ...r, item: items[0] }];
  const total = sum(items.map((i) => i.value)) || 1;
  let acc = 0;
  let idx = 0;
  for (; idx < items.length - 1; idx++) {
    if (acc + items[idx].value > total / 2) break;
    acc += items[idx].value;
  }
  const a = items.slice(0, idx + 1);
  const b = items.slice(idx + 1);
  const ratio = sum(a.map((i) => i.value)) / total;
  let ra: Rect;
  let rb: Rect;
  if (r.w >= r.h) {
    ra = { x: r.x, y: r.y, w: r.w * ratio, h: r.h };
    rb = { x: r.x + r.w * ratio, y: r.y, w: r.w * (1 - ratio), h: r.h };
  } else {
    ra = { x: r.x, y: r.y, w: r.w, h: r.h * ratio };
    rb = { x: r.x, y: r.y + r.h * ratio, w: r.w, h: r.h * (1 - ratio) };
  }
  return [...squarify(a, ra), ...squarify(b, rb)];
}

export function Treemap({
  data,
  colors,
  height = 220,
  unit = '%',
}: {
  data: TreeItem[];
  colors: string[];
  height?: number;
  unit?: string;
}) {
  const W = 540;
  const H = height;
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const total = sum(sorted.map((i) => i.value)) || 1;
  const rects = squarify(sorted, { x: 0, y: 0, w: W, h: H });

  return (
    <div className="-mx-md overflow-x-auto px-md">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={sorted.map((d) => `${d.label} ${Math.round((d.value / total) * 100)}%`).join(', ')} className="block h-auto w-full min-w-[360px]">
      {rects.map((r, i) => {
        const pct = Math.round((r.item.value / total) * 100);
        const showText = r.w > 68 && r.h > 34;
        const fill = colors[i % colors.length];
        const ink = readableText(fill);
        return (
          <g key={r.item.label}>
            <rect x={r.x + 2} y={r.y + 2} width={Math.max(0, r.w - 4)} height={Math.max(0, r.h - 4)} rx={8} fill={fill}>
              <title>{`${r.item.label}: ${pct}${unit}`}</title>
            </rect>
            {showText ? (
              <>
                <text x={r.x + 14} y={r.y + 26} fontSize={13} fontWeight={600} fill={ink}>
                  {r.item.label.length > 18 ? r.item.label.slice(0, 17) + '…' : r.item.label}
                </text>
                <text x={r.x + 14} y={r.y + 46} fontSize={16} fontWeight={700} fill={ink} fillOpacity={0.9} className="tabular-nums">
                  {pct}
                  {unit}
                </text>
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
    </div>
  );
}
