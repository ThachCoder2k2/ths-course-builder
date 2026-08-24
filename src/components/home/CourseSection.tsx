import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import CourseCard from './CourseCard';
import { Reveal } from '../ui/Reveal';
import { useReducedMotion } from '../../lib/motion';
import { cn } from '../../lib/cn';
import type { Course } from '../../mock/types';

/**
 * Một hàng thẻ khoá học có tiêu đề, ĐẨY DẦN sang bên.
 *
 * Bấm mũi tên là hàng trượt đi một thẻ, không phải nhảy sang một bộ thẻ khác — thẻ đang
 * xem vẫn nằm đó, chỉ dịch chỗ. Có cả mũi tên trái để lùi lại.
 *
 * Thẻ TẢI DẦN: mở ra chỉ dựng bốn thẻ đầu, đẩy tới gần cuối thì dựng thêm bốn thẻ nữa và
 * trong lúc chờ thì để thẻ xám giữ chỗ. Giữ chỗ bằng thẻ xám chứ không để trống, vì bề rộng
 * hàng đổi giữa lúc đang trượt thì cú trượt bị giật.
 *
 * Bản thân hai mũi tên KHÔNG có animation nào: không nảy khi bấm, không phóng khi trỏ vào.
 * Việc của chúng là dịch hàng bên trái, không phải tự diễn.
 */

/** Số thẻ dựng thêm mỗi lượt. */
const MOI_LUOT = 4;
/**
 * Số thẻ dựng lúc mở trang. Nhiều hơn một hàng (4 thẻ ở cỡ máy tính) để hàng TRÀN ngay từ
 * đầu — đúng bốn thẻ thì hàng vừa khít khung, bấm mũi tên lần đầu không có gì dịch được và
 * người bấm tưởng nút chết.
 */
const DUNG_DAU = 6;
/** Còn cách cuối hàng bấy nhiêu pixel thì dựng thêm lượt sau. */
const GAN_CUOI = 340;
/** Quãng chờ giả lập tải, đủ để thấy thẻ xám mà không thành chậm. */
const CHO_MS = 420;

function TheXam() {
  return (
    <li aria-hidden="true" className="flex shrink-0 basis-[78%] snap-start sm:basis-[45%] lg:basis-[31%] xl:basis-[23.5%]">
      <div className="flex h-full w-full flex-col gap-xl rounded-2xl bg-tertiary">
        <div className="ln-xam aspect-[16/10] w-full rounded-2xl" />
        <div className="flex flex-col gap-md px-xl pb-2xl">
          <div className="ln-xam h-5 w-4/5 rounded-sm" />
          <div className="ln-xam h-4 w-2/5 rounded-sm" />
          <div className="ln-xam h-4 w-full rounded-sm" />
        </div>
      </div>
    </li>
  );
}

export default function CourseSection({
  title,
  courses,
  showNext = false,
}: {
  title: string;
  courses: Course[];
  /** Hiện hai mũi tên. Chỉ có tác dụng khi danh sách dài hơn một lượt. */
  showNext?: boolean;
}) {
  const ray = useRef<HTMLUListElement>(null);
  const [daDung, setDaDung] = useState(Math.min(DUNG_DAU, courses.length));
  const [dangTai, setDangTai] = useState(false);
  const [dauRay, setDauRay] = useState(true);
  const [cuoiRay, setCuoiRay] = useState(true);
  const reduced = useReducedMotion();
  const hen = useRef<number | null>(null);
  const themRef = useRef<(() => void) | null>(null);

  const hetHang = daDung >= courses.length;
  const coMuiTen = showNext && courses.length > 4;
  /**
   * Mũi tên nào không còn việc thì KHÔNG DỰNG, chứ không dựng rồi làm mờ.
   *
   * Lúc mới vào hàng đang ở đầu nên chưa có gì để lùi — một mũi tên trái mờ tịt ở đó chỉ
   * làm người xem thử bấm rồi thấy không có gì xảy ra. Bấm sang phải một lần là nó hiện.
   * Mũi tên phải theo cùng luật: tới cuối hàng và hết thẻ để dựng thì nó biến đi. Để một
   * bên ẩn còn một bên mờ thì hai nút cạnh nhau nói hai thứ tiếng.
   */
  const coTrai = coMuiTen && !dauRay;
  const coPhai = coMuiTen && !(cuoiRay && hetHang);

  /**
   * Đo lại hai đầu hàng, và dựng thêm thẻ khi đã trượt tới gần cuối.
   *
   * Dựng thêm ở ĐÂY chứ không ở lúc bấm nút: thẻ xám giữ chỗ mọc ở cuối hàng, mà lúc mới
   * bấm thì cuối hàng còn nằm ngoài màn hình — thấy được thẻ xám chỉ khi mắt đã ở gần đó.
   */
  const doNgay = useCallback(() => {
    const el = ray.current;
    if (!el) return;
    const con = el.scrollWidth - el.clientWidth;
    setDauRay(el.scrollLeft <= 8);
    setCuoiRay(con <= 8 || el.scrollLeft >= con - 8);
    if (con - el.scrollLeft <= GAN_CUOI) themRef.current?.();
  }, []);

  useEffect(() => {
    doNgay();
    const el = ray.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(doNgay);
    ro.observe(el);
    return () => ro.disconnect();
  }, [doNgay, daDung]);

  useEffect(() => () => {
    if (hen.current !== null) window.clearTimeout(hen.current);
  }, []);

  /** Dựng thêm một lượt thẻ, có quãng chờ để thẻ xám kịp thấy. */
  const taiThem = useCallback(() => {
    if (dangTai || hetHang) return;
    setDangTai(true);
    hen.current = window.setTimeout(() => {
      setDaDung((n) => Math.min(courses.length, n + MOI_LUOT));
      setDangTai(false);
      hen.current = null;
    }, reduced ? 0 : CHO_MS);
  }, [dangTai, hetHang, courses.length, reduced]);

  // `doNgay` được ghim một lần nên không thấy `taiThem` mới nhất; đi qua ref để nó luôn
  // gọi được bản hiện tại mà `doNgay` vẫn ổn định cho ResizeObserver.
  themRef.current = taiThem;

  const day = (huong: 1 | -1) => {
    const el = ray.current;
    if (!el) return;
    const buoc = (el.firstElementChild?.clientWidth ?? el.clientWidth * 0.8) + 24;
    if (typeof el.scrollBy === 'function') el.scrollBy({ left: huong * buoc, behavior: reduced ? 'auto' : 'smooth' });
  };

  const nutChung =
    'ln-focus-flat absolute top-[128px] z-10 hidden items-center justify-center rounded-full bg-button-secondary p-xl shadow-xs-ring-primary xl:flex';

  return (
    <section className="flex w-full flex-col gap-xl">
      <Reveal>
        <h2 className="w-full text-display-xs text-primary">{title}</h2>
      </Reveal>

      <div className="relative flex w-full flex-col items-center gap-5xl">
        <ul
          ref={ray}
          onScroll={doNgay}
          tabIndex={0}
          aria-label={title}
          className="ln-ray flex w-full snap-x snap-mandatory gap-3xl overflow-x-auto overscroll-x-contain pb-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
        >
          {courses.slice(0, daDung).map((course, i) => (
            <li
              key={course.id}
              className="flex shrink-0 basis-[78%] snap-start sm:basis-[45%] lg:basis-[31%] xl:basis-[23.5%]"
            >
              <Reveal order={Math.min(i, 3)} className="flex w-full">
                <CourseCard course={course} />
              </Reveal>
            </li>
          ))}
          {dangTai ? (
            <>
              <TheXam />
              <TheXam />
            </>
          ) : null}
        </ul>

        {coTrai ? (
          <button
            type="button"
            onClick={() => day(-1)}
            aria-label={`Xem các thẻ trước trong ${title}`}
            className={cn(nutChung, 'left-0 -translate-x-1/2')}
          >
            <ArrowLeft className="h-6 w-6 text-black" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
            />
          </button>
        ) : null}

        {coPhai ? (
          <button
            type="button"
            onClick={() => day(1)}
            aria-label={`Xem các thẻ sau trong ${title}`}
            className={cn(nutChung, 'right-0 translate-x-1/2')}
          >
            <ArrowRight className="h-6 w-6 text-black" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
            />
          </button>
        ) : null}

        {/* Hai nút cho khung hẹp: mũi tên tuyệt đối ở trên chỉ hiện từ xl, mà quẹt tay
            không phải đường duy nhất được — luôn phải có nút thấy được. */}
        {coTrai || coPhai ? (
          <div className="mt-[-32px] flex items-center justify-end gap-md self-end xl:hidden">
            {coTrai ? (
              <button
                type="button"
                onClick={() => day(-1)}
                aria-label={`Xem các thẻ trước trong ${title}`}
                className="ln-focus-flat flex h-11 w-11 items-center justify-center rounded-full bg-primary text-secondary shadow-xs-ring-primary"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : null}
            {coPhai ? (
              <button
                type="button"
                onClick={() => day(1)}
                aria-label={`Xem các thẻ sau trong ${title}`}
                className="ln-focus-flat flex h-11 w-11 items-center justify-center rounded-full bg-primary text-secondary shadow-xs-ring-primary"
              >
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
