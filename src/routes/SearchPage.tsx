import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import CourseCard from '../components/home/CourseCard';
import BoLoc, { type TrangThaiLoc } from '../components/search/BoLoc';
import Drawer from '../components/ui/Drawer';
import { getCourses, getTopics } from '../mock';
import type { Course, Level } from '../mock/types';
import { useMediaQuery } from '../lib/useMediaQuery';
import { cn } from '../lib/cn';

/**
 * Trang tìm khoá học — đích đến của ô tìm kiếm, các nút "Xem thêm khoá học" và dải chip
 * kỹ năng ở trang chủ.
 *
 * Bố cục hai bên, theo cách các trang mua sắm hay làm: cột lọc bên trái DÍNH LỀ, thanh tìm
 * và thanh sắp xếp DÍNH TRÊN. Cuộn xuống giữa danh sách vẫn đổi được bộ lọc và gõ được từ
 * khoá mới, không phải cuộn ngược lên đầu trang.
 *
 * TOÀN BỘ trạng thái nằm trong URL. Nhờ vậy: chia sẻ được đường dẫn, nút Back của trình
 * duyệt chạy đúng, và bấm một chip ở trang chủ là mở thẳng kết quả đã lọc sẵn.
 *
 * Đổi từ khoá hay đổi bộ lọc thì tự cuộn về đầu danh sách — đứng ở giữa trang cũ mà danh
 * sách bên dưới đã thay hết thì không biết mình đang xem gì.
 */

type Sap = 'lien-quan' | 'diem-cao' | 'nhieu-nguoi' | 'ngan-nhat';

const SAP_NHAN: { id: Sap; nhan: string }[] = [
  { id: 'lien-quan', nhan: 'Liên quan' },
  { id: 'diem-cao', nhan: 'Đánh giá cao' },
  { id: 'nhieu-nguoi', nhan: 'Nhiều người học' },
  { id: 'ngan-nhat', nhan: 'Học nhanh nhất' },
];

function boDau(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase();
}

/** Đọc một tham số dạng danh sách ngăn bằng dấu phẩy. */
function docDs(sp: URLSearchParams, ten: string): string[] {
  const v = (sp.get(ten) ?? '').trim();
  return v ? v.split(',').filter(Boolean) : [];
}

/** Lọc theo mọi tiêu chí, có thể bỏ qua một tiêu chí — dùng để đếm số khoá cho từng ô lọc. */
function locKhoa(
  ds: Course[],
  dk: { tuKhoa: string; idChuDe: string[]; capDo: Level[]; diem: number; gio: string },
  boQua?: 'chuDe' | 'capDo',
): Course[] {
  return ds.filter((c) => {
    if (boQua !== 'chuDe' && dk.idChuDe.length > 0 && !dk.idChuDe.some((id) => c.topicIds.includes(id))) return false;
    if (boQua !== 'capDo' && dk.capDo.length > 0 && !dk.capDo.includes(c.level)) return false;
    if (dk.diem > 0 && c.rating < dk.diem) return false;
    if (dk.gio === 'duoi-10' && c.durationHours >= 10) return false;
    if (dk.gio === '10-20' && (c.durationHours < 10 || c.durationHours > 20)) return false;
    if (dk.gio === 'tren-20' && c.durationHours <= 20) return false;
    if (!dk.tuKhoa) return true;
    // Tìm cả trong tên, câu phụ và danh sách kỹ năng — gõ "transformer" phải ra khoá dạy
    // transformer dù tên khoá không có chữ đó.
    return boDau([c.title, c.subtitle, ...c.skills].join(' ')).includes(dk.tuKhoa);
  });
}

export default function SearchPage() {
  const [sp, setSp] = useSearchParams();
  const q = (sp.get('q') ?? '').trim();
  const sap = (sp.get('sap') as Sap) || 'lien-quan';
  const itMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [moLoc, setMoLoc] = useState(false);

  const topics = getTopics();
  const trangThai: TrangThaiLoc = {
    chuDe: docDs(sp, 'chu-de'),
    capDo: docDs(sp, 'cap-do') as Level[],
    diem: Number(sp.get('diem') ?? 0) || 0,
    gio: sp.get('gio') ?? '',
  };

  const dk = useMemo(
    () => ({
      tuKhoa: boDau(q),
      idChuDe: trangThai.chuDe.map((s) => topics.find((t) => t.slug === s)?.id).filter((x): x is string => !!x),
      capDo: trangThai.capDo,
      diem: trangThai.diem,
      gio: trangThai.gio,
    }),
    [q, trangThai.chuDe, trangThai.capDo, trangThai.diem, trangThai.gio, topics],
  );

  const ketQua = useMemo(() => {
    const loc = locKhoa(getCourses(), dk);
    if (sap === 'diem-cao') return [...loc].sort((a, b) => b.rating - a.rating);
    if (sap === 'nhieu-nguoi') return [...loc].sort((a, b) => b.enrolledCount - a.enrolledCount);
    if (sap === 'ngan-nhat') return [...loc].sort((a, b) => a.durationHours - b.durationHours);
    return loc;
  }, [dk, sap]);

  /**
   * Số khoá bên cạnh từng ô lọc, tính khi BỎ QUA chính nhóm đó — nếu tính cả nó thì ô
   * chưa chọn nào cũng hiện 0, mà đó là con số vô nghĩa.
   */
  const demChuDe = useMemo(() => {
    const nen = locKhoa(getCourses(), dk, 'chuDe');
    return Object.fromEntries(topics.map((t) => [t.slug, nen.filter((c) => c.topicIds.includes(t.id)).length]));
  }, [dk, topics]);

  const demCapDo = useMemo(() => {
    const nen = locKhoa(getCourses(), dk, 'capDo');
    return Object.fromEntries((['beginner', 'intermediate', 'advanced'] as Level[]).map((lv) => [lv, nen.filter((c) => c.level === lv).length]));
  }, [dk]);

  /** Đổi tham số URL; danh sách rỗng hoặc giá trị rỗng thì bỏ tham số cho URL gọn. */
  const dat = (moi: Record<string, string | string[] | number>) => {
    const ra = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(moi)) {
      const s = Array.isArray(v) ? v.join(',') : String(v);
      if (s && s !== '0') ra.set(k, s);
      else ra.delete(k);
    }
    setSp(ra);
  };

  const doiLoc = (moi: Partial<TrangThaiLoc>) =>
    dat({
      ...(moi.chuDe !== undefined ? { 'chu-de': moi.chuDe } : {}),
      ...(moi.capDo !== undefined ? { 'cap-do': moi.capDo } : {}),
      ...(moi.diem !== undefined ? { diem: moi.diem } : {}),
      ...(moi.gio !== undefined ? { gio: moi.gio } : {}),
    });

  const xoaHet = () => setSp(q ? new URLSearchParams({ q }) : new URLSearchParams());

  // Đổi từ khoá, bộ lọc hay cách sắp xếp thì đưa mắt về đầu danh sách.
  const dauVet = `${q}|${sp.get('chu-de') ?? ''}|${sp.get('cap-do') ?? ''}|${sp.get('diem') ?? ''}|${sp.get('gio') ?? ''}|${sap}`;
  const dauTien = useRef(true);
  useEffect(() => {
    if (dauTien.current) {
      dauTien.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: itMotion ? 'auto' : 'smooth' });
  }, [dauVet, itMotion]);

  const soLoc = trangThai.chuDe.length + trangThai.capDo.length + (trangThai.diem ? 1 : 0) + (trangThai.gio ? 1 : 0);
  const cot = (coTieuDe: boolean) => (
    <BoLoc
      topics={topics}
      trangThai={trangThai}
      demTheoChuDe={demChuDe}
      demTheoCapDo={demCapDo}
      doi={doiLoc}
      xoaHet={xoaHet}
      coTieuDe={coTieuDe}
    />
  );

  return (
    <div className="mx-auto w-full max-w-content px-4 py-4xl lg:px-8">
      <div className="flex flex-col gap-3xl lg:flex-row lg:items-start lg:gap-4xl">
        {/*
          Cột lọc dính lề từ lg. `top-[96px]` là 80px thanh đầu trang cộng 16px thở; và cột
          tự cuộn riêng khi dài hơn màn hình, không kéo cả trang theo.
        */}
        <aside className="hidden w-[236px] shrink-0 lg:sticky lg:top-[96px] lg:block lg:max-h-[calc(100dvh-120px)] lg:overflow-y-auto lg:overscroll-contain lg:pr-sm">
          {cot(true)}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-2xl">
          {/*
            Thanh tìm và thanh sắp xếp dính trên, ngay dưới thanh đầu trang. Cuộn xuống
            giữa danh sách vẫn gõ được từ khoá mới và đổi được cách xếp.
          */}
          <div className="sticky top-20 z-20 -mx-4 flex flex-col gap-lg border-b border-secondary bg-primary/95 px-4 pb-lg pt-xl backdrop-blur lg:-mx-2 lg:px-2">
            {/*
              KHÔNG có ô tìm riêng ở đây.

              Thanh đầu trang đã có một ô tìm và nó luôn dính trên, nên đặt thêm một ô nữa
              là hai ô cùng việc nằm cách nhau 40px — người dùng phải chọn xem gõ vào cái
              nào. Ô ở thanh đầu trang giờ tự hiện từ khoá đang lọc, nên nó vừa là chỗ gõ
              vừa là chỗ đọc lại mình đã tìm gì.
            */}
            <div className="flex flex-wrap items-center gap-md">
              {/* Khung hẹp không có cột lọc, nên mở bộ lọc trong một tấm trượt. */}
              <button
                type="button"
                onClick={() => setMoLoc(true)}
                className="ln-press ln-focus flex min-h-11 shrink-0 items-center gap-sm rounded-pill bg-primary px-xl text-sm font-semibold text-secondary shadow-xs-ring-primary lg:hidden"
              >
                <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
                Lọc
                {soLoc > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-xs text-xs font-semibold text-white">
                    {soLoc}
                  </span>
                ) : null}
              </button>
              <span className="text-sm text-tertiary">Sắp xếp</span>
              {SAP_NHAN.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => dat({ sap: s.id === 'lien-quan' ? '' : s.id })}
                  aria-pressed={sap === s.id}
                  className={cn(
                    'ln-focus-flat flex min-h-9 items-center rounded-sm px-lg text-sm font-medium transition',
                    sap === s.id ? 'bg-brand-500 text-white' : 'bg-primary text-secondary shadow-xs-ring-primary hover:bg-secondary',
                  )}
                >
                  {s.nhan}
                </button>
              ))}
              <span className="ml-auto text-sm text-tertiary">
                {ketQua.length}/{getCourses().length} khoá
              </span>
            </div>
          </div>

          {/* Tiêu đề nói đúng thứ đang xem: có từ khoá thì nhắc lại từ khoá, chỉ có bộ lọc
              thì nói là đã lọc — để nguyên "Tất cả khoá học" khi đang lọc là nói sai. */}
          <h1 className="text-display-xs text-primary">
            {q ? <>Kết quả cho “{q}”</> : soLoc > 0 ? 'Khoá học theo bộ lọc của bạn' : 'Tất cả khoá học'}
          </h1>

          {ketQua.length > 0 ? (
            <ul className="grid grid-cols-1 gap-2xl sm:grid-cols-2 xl:grid-cols-3">
              {ketQua.map((c) => (
                <li key={c.id} className="flex">
                  <CourseCard course={c} />
                </li>
              ))}
            </ul>
          ) : (
            /* Rỗng vẫn phải có đường ra: một nút bỏ lọc và một đường về trang chủ. */
            <div className="flex flex-col items-center gap-xl rounded-xl bg-primary px-xl py-6xl text-center shadow-xs-ring-secondary">
              <p className="max-w-[420px] text-md text-tertiary">
                Không có khoá nào khớp với những gì bạn đang chọn. Bỏ bộ lọc là xem lại được cả thư viện.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-lg">
                <button
                  type="button"
                  onClick={() => setSp(new URLSearchParams())}
                  className="ln-press ln-focus flex min-h-11 items-center rounded-pill bg-brand-500 px-2xl text-md font-semibold text-white shadow-xs"
                >
                  Xem tất cả khoá học
                </button>
                <Link
                  to="/"
                  className="ln-press ln-focus-flat flex min-h-11 items-center rounded-pill px-lg text-md font-semibold text-secondary"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Drawer open={moLoc} onClose={() => setMoLoc(false)} title="Bộ lọc" side="left">
        {cot(false)}
      </Drawer>
    </div>
  );
}
