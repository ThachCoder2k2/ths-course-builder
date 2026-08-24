import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { LEVEL_LABEL, type Level } from '../../mock/types';
import { cn } from '../../lib/cn';

/**
 * Cột lọc của trang tìm khoá học.
 *
 * Dùng ở hai chỗ với cùng một bộ dữ liệu: cột dính lề trái ở cỡ máy tính, và trong tấm
 * trượt từ bên trái ở khung hẹp. Nên nó không tự biết mình đang ở đâu — mọi trạng thái do
 * trang truyền vào.
 *
 * Bốn nhóm, đều dựa trên trường có thật của khoá học:
 *   - chủ đề và cấp độ: chọn được nhiều, như ô tick
 *   - đánh giá và thời lượng: chọn một, vì hai cái đó là ngưỡng chứ không phải danh sách
 *
 * Từng nhóm gập lại được. Bốn nhóm mở hết thì cột dài hơn một màn hình, mà nhóm đang cần
 * lại nằm dưới đáy.
 */

export interface TrangThaiLoc {
  chuDe: string[];
  capDo: Level[];
  diem: number;
  gio: string;
}

export const GIO_CHON: { id: string; nhan: string }[] = [
  { id: 'duoi-10', nhan: 'Dưới 10 giờ' },
  { id: '10-20', nhan: '10 đến 20 giờ' },
  { id: 'tren-20', nhan: 'Trên 20 giờ' },
];

export const DIEM_CHON = [4.5, 4];

function Nhom({
  ten,
  children,
  moSan = true,
}: {
  ten: string;
  children: React.ReactNode;
  moSan?: boolean;
}) {
  const [mo, setMo] = useState(moSan);
  return (
    <div className="flex flex-col border-b border-secondary pb-lg">
      <button
        type="button"
        onClick={() => setMo((v) => !v)}
        aria-expanded={mo}
        className="ln-focus-flat flex min-h-11 items-center justify-between gap-md rounded-sm text-left"
      >
        <span className="text-sm font-semibold text-primary">{ten}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-quaternary transition-transform', mo && 'rotate-180')} aria-hidden="true" />
      </button>
      {mo ? <div className="mt-sm flex flex-col">{children}</div> : null}
    </div>
  );
}

/** Một dòng chọn: ô vuông cho nhiều lựa chọn, ô tròn cho một lựa chọn. */
function Dong({
  nhan,
  chon,
  mot,
  onClick,
  dem,
}: {
  nhan: string;
  chon: boolean;
  mot?: boolean;
  onClick: () => void;
  dem?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={chon}
      className="ln-focus-flat flex min-h-11 items-center gap-md rounded-sm pr-sm text-left"
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center border transition',
          mot ? 'rounded-full' : 'rounded-[4px]',
          chon ? 'border-brand-500 bg-brand-500' : 'border-primary bg-primary',
        )}
      >
        {chon ? <span className={cn('bg-white', mot ? 'h-1.5 w-1.5 rounded-full' : 'h-[9px] w-[5px] rotate-45 border-b-2 border-r-2 border-white bg-transparent')} /> : null}
      </span>
      <span className={cn('min-w-0 flex-1 text-sm', chon ? 'font-semibold text-primary' : 'text-secondary')}>{nhan}</span>
      {typeof dem === 'number' ? <span className="shrink-0 text-xs tabular-nums text-quaternary">{dem}</span> : null}
    </button>
  );
}

export default function BoLoc({
  topics,
  trangThai,
  demTheoChuDe,
  demTheoCapDo,
  doi,
  xoaHet,
  coTieuDe = true,
}: {
  topics: { slug: string; title: string }[];
  /**
   * Tấm trượt ở khung hẹp đã có tiêu đề "Bộ lọc" của chính nó, nên chỗ đó tắt cờ này —
   * để cả hai thì hai chữ "Bộ lọc" đè nhau ở đỉnh tấm.
   */
  coTieuDe?: boolean;
  trangThai: TrangThaiLoc;
  /** Số khoá của từng chủ đề, tính trên kết quả đã lọc mọi thứ TRỪ chủ đề. */
  demTheoChuDe: Record<string, number>;
  demTheoCapDo: Record<string, number>;
  doi: (moi: Partial<TrangThaiLoc>) => void;
  xoaHet: () => void;
}) {
  const { chuDe, capDo, diem, gio } = trangThai;
  const coLoc = chuDe.length > 0 || capDo.length > 0 || diem > 0 || !!gio;

  const bat = <T,>(ds: T[], v: T): T[] => (ds.includes(v) ? ds.filter((x) => x !== v) : [...ds, v]);

  return (
    <div className="flex flex-col gap-lg">
      <div className={cn('flex items-center gap-md', coTieuDe ? 'justify-between' : 'justify-end')}>
        {coTieuDe ? <p className="text-md font-semibold text-primary">Bộ lọc</p> : null}
        {coLoc ? (
          <button
            type="button"
            onClick={xoaHet}
            className="ln-focus-flat flex min-h-11 items-center gap-xs rounded-sm text-sm font-semibold text-brand-secondary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Xoá hết
          </button>
        ) : null}
      </div>

      <Nhom ten="Chủ đề">
        {topics.map((t) => (
          <Dong
            key={t.slug}
            nhan={t.title}
            dem={demTheoChuDe[t.slug] ?? 0}
            chon={chuDe.includes(t.slug)}
            onClick={() => doi({ chuDe: bat(chuDe, t.slug) })}
          />
        ))}
      </Nhom>

      <Nhom ten="Cấp độ">
        {(['beginner', 'intermediate', 'advanced'] as Level[]).map((lv) => (
          <Dong
            key={lv}
            nhan={LEVEL_LABEL[lv]}
            dem={demTheoCapDo[lv] ?? 0}
            chon={capDo.includes(lv)}
            onClick={() => doi({ capDo: bat(capDo, lv) })}
          />
        ))}
      </Nhom>

      <Nhom ten="Đánh giá">
        {DIEM_CHON.map((d) => (
          <Dong key={d} mot nhan={`Từ ${d} sao trở lên`} chon={diem === d} onClick={() => doi({ diem: diem === d ? 0 : d })} />
        ))}
      </Nhom>

      <Nhom ten="Thời lượng">
        {GIO_CHON.map((g) => (
          <Dong key={g.id} mot nhan={g.nhan} chon={gio === g.id} onClick={() => doi({ gio: gio === g.id ? '' : g.id })} />
        ))}
      </Nhom>
    </div>
  );
}
