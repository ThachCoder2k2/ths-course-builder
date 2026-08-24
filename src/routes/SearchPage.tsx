import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import CourseCard from '../components/home/CourseCard';
import { getCourses, getTopics } from '../mock';
import { LEVEL_LABEL, type Level } from '../mock/types';
import { cn } from '../lib/cn';

/**
 * Trang tìm và lọc khoá học — đích đến của ô tìm kiếm, các nút "Xem thêm khoá học", và
 * dải chip kỹ năng ở trang chủ.
 *
 * Trước khi có trang này, mọi thứ đó là nút bấm không dẫn đi đâu: site có đầu vào mà không
 * có đầu ra. Một trang duy nhất gánh cả ba đường vào, thay vì ba trang na ná nhau.
 *
 * TOÀN BỘ trạng thái nằm trong URL (`q`, `chu-de`, `cap-do`), không giữ trong state.
 * Nhờ vậy: chia sẻ được đường dẫn, nút Back của trình duyệt chạy đúng, và bấm một chip ở
 * trang chủ là mở thẳng kết quả đã lọc sẵn.
 */

const KHONG_LOC = 'tat-ca';

/** Đọc một tham số, coi 'tat-ca' như là không lọc. */
function doc(sp: URLSearchParams, ten: string): string {
  const v = (sp.get(ten) ?? '').trim();
  return v === KHONG_LOC ? '' : v;
}

function boDau(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase();
}

export default function SearchPage() {
  const [sp, setSp] = useSearchParams();
  const q = (sp.get('q') ?? '').trim();
  const chuDe = doc(sp, 'chu-de');
  const capDo = doc(sp, 'cap-do');

  const topics = getTopics();
  const coLoc = !!q || !!chuDe || !!capDo;

  const ketQua = useMemo(() => {
    const tuKhoa = boDau(q);
    const topic = topics.find((t) => t.slug === chuDe);
    return getCourses().filter((c) => {
      if (topic && !c.topicIds.includes(topic.id)) return false;
      if (capDo && c.level !== capDo) return false;
      if (!tuKhoa) return true;
      // Tìm cả trong tên, câu phụ và danh sách kỹ năng — gõ "transformer" phải ra khoá
      // dạy transformer dù tên khoá không có chữ đó.
      const kho = boDau([c.title, c.subtitle, ...c.skills].join(' '));
      return kho.includes(tuKhoa);
    });
  }, [q, chuDe, capDo, topics]);

  /** Đổi một tham số, giữ nguyên các tham số còn lại. Đặt rỗng là bỏ lọc. */
  const dat = (ten: string, giaTri: string) => {
    const moi = new URLSearchParams(sp);
    if (giaTri) moi.set(ten, giaTri);
    else moi.delete(ten);
    setSp(moi, { replace: false });
  };

  const guiTim = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const o = new FormData(e.currentTarget).get('q');
    dat('q', typeof o === 'string' ? o.trim() : '');
  };

  const chip = (dangChon: boolean) =>
    cn(
      'ln-press ln-focus-flat flex min-h-11 items-center rounded-pill px-lg text-sm font-semibold transition',
      dangChon
        ? 'bg-brand-500 text-white'
        : 'bg-primary text-secondary shadow-xs-ring-primary hover:bg-secondary',
    );

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-4xl px-4 py-6xl lg:px-8">
      <div className="flex flex-col gap-lg">
        <h1 className="text-display-sm text-primary">
          {q ? <>Kết quả cho “{q}”</> : 'Tìm khoá học'}
        </h1>
        <p className="text-md text-tertiary">
          {ketQua.length > 0
            ? `Có ${ketQua.length} khoá phù hợp trong ${getCourses().length} khoá của thư viện.`
            : 'Không có khoá nào khớp. Thử bỏ một bộ lọc, hoặc gõ từ khoá ngắn hơn.'}
        </p>
      </div>

      {/* Ô tìm là form thật: Enter cũng gửi được, không bắt phải bấm chuột. */}
      <form onSubmit={guiTim} className="flex flex-wrap items-center gap-lg">
        <label className="ln-search flex h-12 min-w-0 flex-1 items-center gap-md rounded-full border border-primary bg-primary px-xl focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-500/40">
          <Search className="ln-search-icon h-5 w-5 shrink-0 text-quaternary" aria-hidden="true" />
          <input
            name="q"
            type="search"
            defaultValue={q}
            key={q}
            aria-label="Từ khoá tìm khoá học"
            placeholder="Tên khoá, kỹ năng, chủ đề…"
            className="w-full min-w-0 bg-transparent text-md text-primary outline-none placeholder:text-placeholder"
          />
        </label>
        <button
          type="submit"
          className="ln-press ln-focus flex h-12 shrink-0 items-center rounded-full bg-brand-500 px-2xl text-md font-semibold text-white shadow-xs"
        >
          Tìm
        </button>
      </form>

      <div className="flex flex-col gap-lg">
        <p className="flex items-center gap-md text-sm font-semibold text-tertiary">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Chủ đề
        </p>
        <div className="flex flex-wrap gap-md">
          <button type="button" onClick={() => dat('chu-de', '')} className={chip(!chuDe)}>
            Tất cả chủ đề
          </button>
          {topics.map((t) => (
            <button key={t.slug} type="button" onClick={() => dat('chu-de', t.slug)} className={chip(chuDe === t.slug)}>
              {t.title}
            </button>
          ))}
        </div>

        <p className="mt-md text-sm font-semibold text-tertiary">Cấp độ</p>
        <div className="flex flex-wrap gap-md">
          <button type="button" onClick={() => dat('cap-do', '')} className={chip(!capDo)}>
            Tất cả cấp độ
          </button>
          {(['beginner', 'intermediate', 'advanced'] as Level[]).map((lv) => (
            <button key={lv} type="button" onClick={() => dat('cap-do', lv)} className={chip(capDo === lv)}>
              {LEVEL_LABEL[lv]}
            </button>
          ))}
        </div>

        {coLoc ? (
          <button
            type="button"
            onClick={() => setSp(new URLSearchParams())}
            className="ln-press ln-focus-flat mt-md flex min-h-11 w-fit items-center gap-sm rounded-pill px-lg text-sm font-semibold text-brand-secondary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Bỏ hết bộ lọc
          </button>
        ) : null}
      </div>

      {ketQua.length > 0 ? (
        <ul className="grid grid-cols-1 gap-2xl sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ketQua.map((c) => (
            <li key={c.id} className="flex">
              <CourseCard course={c} />
            </li>
          ))}
        </ul>
      ) : (
        /* Trang rỗng vẫn phải có đường ra: một nút bỏ lọc và một đường về thư viện. */
        <div className="flex flex-col items-center gap-xl rounded-xl bg-secondary px-xl py-6xl text-center">
          <p className="max-w-[420px] text-md text-tertiary">
            Chưa có khoá nào khớp với những gì bạn chọn. Bỏ bộ lọc để xem lại toàn bộ thư viện.
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
  );
}
