import { INK, STATUS } from '../palette';

export interface GraphNode {
  id: string;
  label: string;
  mastery: number; // 0..1
  col: number;
  row: number;
}
export interface GraphEdge {
  from: string;
  to: string;
}

function toneOf(m: number): string {
  if (m >= 0.7) return STATUS.good;
  if (m >= 0.45) return STATUS.warning;
  return STATUS.danger;
}

/** Prerequisite DAG — nodes coloured by mastery so gaps blocking progress stand out. */
export function PrereqGraph({ nodes, edges, height = 300 }: { nodes: GraphNode[]; edges: GraphEdge[]; height?: number }) {
  const W = 560;
  const H = height;
  const NW = 122;
  const NH = 54;
  const P = { l: 8, r: 8, t: 10, b: 10 };
  const maxCol = Math.max(...nodes.map((n) => n.col), 1);
  const maxRow = Math.max(...nodes.map((n) => n.row), 1);
  const nx = (col: number) => P.l + (maxCol === 0 ? 0 : col * ((W - P.l - P.r - NW) / maxCol));
  const ny = (row: number) => P.t + (maxRow === 0 ? 0 : row * ((H - P.t - P.b - NH) / maxRow));
  const byId = (id: string) => nodes.find((n) => n.id === id);

  return (
    <div className="-mx-md overflow-x-auto px-md">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bản đồ kiến thức tiên quyết theo mức thành thạo" className="block h-auto w-full min-w-[520px]">
      {edges.map((e, i) => {
        const s = byId(e.from);
        const t = byId(e.to);
        if (!s || !t) return null;
        const x1 = nx(s.col) + NW;
        const y1 = ny(s.row) + NH / 2;
        const x2 = nx(t.col);
        const y2 = ny(t.row) + NH / 2;
        const mx = (x1 + x2) / 2;
        return <path key={i} d={`M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`} fill="none" stroke="#D5D7DA" strokeWidth={1.5} />;
      })}
      {nodes.map((n) => {
        const tone = toneOf(n.mastery);
        return (
          <foreignObject key={n.id} x={nx(n.col)} y={ny(n.row)} width={NW} height={NH}>
            <div
              style={{ borderLeft: `3px solid ${tone}` }}
              className="flex h-full w-full flex-col justify-center gap-xs rounded-lg border border-secondary bg-primary px-md py-xs shadow-xs"
            >
              <span className="line-clamp-2 text-[11px] font-semibold leading-tight" style={{ color: INK.secondary }}>
                {n.label}
              </span>
              <div className="flex items-center gap-xs">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <span className="block h-full rounded-full" style={{ width: `${Math.round(n.mastery * 100)}%`, background: tone }} />
                </span>
                <span className="text-[10px] font-semibold tabular-nums" style={{ color: INK.secondary }}>
                  {Math.round(n.mastery * 100)}%
                </span>
              </div>
            </div>
          </foreignObject>
        );
      })}
    </svg>
    </div>
  );
}
