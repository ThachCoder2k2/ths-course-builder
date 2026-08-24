import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/motion';
import banner1 from '../../assets/landing/banner1.jpg';
import banner2 from '../../assets/landing/banner2.jpg';

/**
 * Băng chuyền tin ở chân trang chủ (Figma node 550:11602).
 *
 * Hình học lấy từ thiết kế: đường ray lùi vào 48px, mỗi slide rộng 800px, cách nhau 16px,
 * ray dài 2432px nằm trong khung 1920px — nên thiết kế CÓ Ý cho slide kế tiếp hé ra 240px.
 *
 * Bản trước dịch đường ray bằng `transform` và cho ba dấu tròn, mỗi dấu nhảy đúng một
 * slide. Cách đó sai từ gốc: ở 1920px người ta đã thấy 2,3 trong 3 slide cùng lúc, nên chỉ
 * còn hai vị trí cuộn có nghĩa — dấu 2 và dấu 3 buộc phải trỏ về cùng một chỗ. Và vì
 * không có gì chặn ở cuối, bấm dấu 3 là đẩy ray đi 1632px trong khi chỉ cuộn được 560px,
 * để lại 1072px trắng bên phải — hơn nửa bề ngang.
 *
 * Nay để trình duyệt cuộn thật (`overflow-x` + `scroll-snap`). Được ba thứ miễn phí: nó tự
 * chặn ở cuối nên không còn khoảng trắng, có kéo–quẹt trên cả chuột và ngón tay, và đi
 * được bằng bàn phím. Ba dấu tròn thay bằng một thanh tiến độ — nó nói đúng "bạn đang ở
 * đâu trên đoạn ray này", còn dấu tròn thì nói sai.
 *
 * Bản thiết kế đặt cùng một tiêu đề "IEE: Đột phá vật liệu Graphene…" cho cả ba slide.
 * Ở đây mỗi slide nói một chuyện riêng, vì ba thẻ giống hệt nhau thì băng chuyền chẳng
 * còn lý do tồn tại.
 */
interface Slide {
  id: string;
  heading: string;
  body: string;
  image?: string;
  background?: string;
  headingClass: string;
  cta: string;
  ctaClass: string;
  /** Đích của nút CTA — mỗi slide dẫn tới đúng nhóm khoá nó đang nói về. */
  den: string;
}

const SLIDES: Slide[] = [
  {
    id: 'graphene',
    heading: 'Đột phá vật liệu Graphene mở đường cho chip THz',
    body: 'Khoá học ngoài chương trình chính quy về công nghệ lõi, tư duy hùng biện và chiến thuật trí tuệ giúp bứt phá năng lực bản thân',
    image: banner1,
    headingClass: 'bg-[linear-gradient(45deg,#20447E,#175CD3)] bg-clip-text text-transparent',
    cta: 'Bắt đầu',
    ctaClass: 'shadow-xs-ring-brand text-brand-secondary',
    den: '/tim-kiem',
  },
  {
    id: 'ai-thuc-hanh',
    heading: 'Học AI bằng cách làm ra thứ chạy được',
    body: 'Mỗi bài một sản phẩm nhỏ: từ chatbot tra cứu tới mô hình nhận diện ảnh. Xong khoá là có cái để đưa người khác xem',
    image: banner2,
    headingClass: 'text-orange-dark-900',
    cta: 'Khám phá ngay',
    ctaClass: 'shadow-xs-ring-primary text-button-secondary-fg',
    den: '/tim-kiem?chu-de=tri-tue-nhan-tao',
  },
  {
    id: 'ky-nang-mem',
    heading: 'Nói cho người khác hiểu, không chỉ nói cho xong',
    body: 'Thuyết trình, phản biện và dẫn một cuộc họp. Luyện trên tình huống công việc thật rồi nghe lại chính mình',
    background: 'linear-gradient(111.06deg, #F5F7FA 0%, #C3CFE2 100%)',
    headingClass: 'text-secondary',
    cta: 'Khám phá ngay',
    ctaClass: 'shadow-xs-ring-primary text-button-secondary-fg',
    den: '/tim-kiem?chu-de=ky-nang-thuyet-trinh',
  },
];

const AUTOPLAY_MS = 6000;
const TRACK_W = 152; // bằng đúng dải ba dấu tròn của thiết kế (3×40 + 2×16)

interface RailState {
  /** phần đã cuộn, 0 → 1 */
  tien: number;
  /** phần đang thấy trên tổng chiều dài ray, 0 → 1 */
  thay: number;
  dauRay: boolean;
  cuoiRay: boolean;
}

const DUNG_YEN: RailState = { tien: 0, thay: 1, dauRay: true, cuoiRay: true };

export default function DashboardBanner() {
  const rail = useRef<HTMLDivElement>(null);
  const khoi = useRef<HTMLElement>(null);
  const [state, setState] = useState<RailState>(DUNG_YEN);
  const [hovering, setHovering] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [trongTam, setTrongTam] = useState(false);
  const reduced = useReducedMotion();

  const khung = useRef(0);

  /** Đo ngay, không gộp khung. Dùng cho lúc mới gắn và khi khổ màn đổi. */
  const doNgay = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const conCuonDuoc = el.scrollWidth - el.clientWidth;
    if (conCuonDuoc <= 1) {
      setState(DUNG_YEN);
      return;
    }
    setState({
      tien: Math.min(1, Math.max(0, el.scrollLeft / conCuonDuoc)),
      thay: Math.min(1, el.clientWidth / el.scrollWidth),
      dauRay: el.scrollLeft <= 1,
      cuoiRay: el.scrollLeft >= conCuonDuoc - 1,
    });
  }, []);

  /**
   * Bản gộp theo khung hình, dùng cho sự kiện cuộn. Cuộn bắn ra hàng chục sự kiện mỗi
   * giây; gọi setState thẳng từ đó là React render lại đúng số lần ấy, kéo đường ray một
   * cái là thấy giật. Gộp về một lần mỗi khung thì chỉ còn ~60 lần/giây và đúng nhịp vẽ.
   */
  const doLai = useCallback(() => {
    if (khung.current) return;
    khung.current = requestAnimationFrame(() => {
      khung.current = 0;
      doNgay();
    });
  }, [doNgay]);

  useEffect(() => {
    doNgay();
    const el = rail.current;
    if (!el || typeof ResizeObserver === 'undefined') return () => {
      if (khung.current) cancelAnimationFrame(khung.current);
    };
    const ro = new ResizeObserver(doNgay);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (khung.current) cancelAnimationFrame(khung.current);
    };
  }, [doNgay]);

  /** Dịch đi một slide. `huong` là −1 hoặc 1. */
  const day = useCallback(
    (huong: number) => {
      const el = rail.current;
      if (!el || typeof el.scrollTo !== 'function') return;
      const buoc = (el.firstElementChild?.clientWidth ?? el.clientWidth) + 16;
      const conCuonDuoc = el.scrollWidth - el.clientWidth;
      let dich = el.scrollLeft + huong * buoc;
      // Chạy tới cuối rồi thì vòng về đầu, chứ không đứng im chờ hết giờ.
      if (huong > 0 && el.scrollLeft >= conCuonDuoc - 1) dich = 0;
      el.scrollTo({ left: Math.max(0, Math.min(conCuonDuoc, dich)), behavior: reduced ? 'auto' : 'smooth' });
    },
    [reduced],
  );

  /**
   * Tự nhảy sau mỗi 6 giây. Có `trongTam` trong điều kiện nên cuộn ra khỏi băng chuyền là
   * nó ngừng đếm — vừa đúng vừa đỡ tốn pin.
   *
   * Từng có một bản dùng thanh đếm ngược nhìn thấy được để làm đồng hồ (mỗi vòng
   * animation là một lần nhảy slide), nhưng thanh đó khai `absolute inset-0` trong khi
   * thẻ bọc không có `relative`, nên nó neo tuốt lên `<section>` và trải thành một khối
   * xanh nhạt tràn hết hàng điều khiển. Đã bỏ theo yêu cầu.
   */
  const running = !hovering && !stopped && !reduced && trongTam;

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => day(1), AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [running, day]);

  useEffect(() => {
    const el = khoi.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setTrongTam(true);
      return;
    }
    const io = new IntersectionObserver((es) => setTrongTam(es.some((e) => e.isIntersecting)), {
      rootMargin: '0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ---- Kéo đường ray bằng chuột --------------------------------------------------
     Quẹt trên màn cảm ứng, hai ngón trên trackpad và bàn phím thì `overflow-x-auto` đã
     lo sẵn. Thiếu đúng một thứ: kéo bằng CHUỘT, thứ mà `overflow-x-auto` không bao giờ
     hỗ trợ — mà slide rộng 800px là phần tử to nhất trang, người dùng chuột chắc chắn
     sẽ thử kéo. Ghi thẳng `scrollLeft`, không transform không transition: 1:1 với con
     chuột, không có mô hình chuyển động nào chen vào giữa. */
  const keo = useRef({ dang: false, x0: 0, s0: 0, daKeo: false, dich: 0, khung: 0 });

  const batDauKeo = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    // Bấm vào nút trong slide thì để nguyên cho nút, đừng biến thành cú kéo.
    if ((e.target as HTMLElement).closest('button, a')) return;
    const el = rail.current;
    if (!el) return;
    keo.current = { dang: true, x0: e.clientX, s0: el.scrollLeft, daKeo: false, dich: 0, khung: 0 };
    el.setPointerCapture(e.pointerId);
    el.classList.add('ln-dragging');
  };

  const dangKeo = (e: React.PointerEvent<HTMLDivElement>) => {
    const k = keo.current;
    if (!k.dang) return;
    k.dich = e.clientX - k.x0;
    if (Math.abs(k.dich) > 8) k.daKeo = true;
    // Trackpad bắn tới 120 lần mỗi giây; gộp về một lần ghi mỗi khung hình.
    if (k.khung) return;
    k.khung = requestAnimationFrame(() => {
      k.khung = 0;
      const el = rail.current;
      if (el) el.scrollLeft = k.s0 - k.dich;
    });
  };

  const thoiKeo = () => {
    const k = keo.current;
    if (!k.dang) return;
    k.dang = false;
    if (k.khung) {
      cancelAnimationFrame(k.khung);
      k.khung = 0;
    }
    // Bỏ class là scroll-snap bật lại và tự chốt về slide gần nhất.
    rail.current?.classList.remove('ln-dragging');
  };

  /* Kéo xong buông tay thì cú click bắn vào nút CTA nằm dưới con trỏ. Chặn đúng một lần
     nếu đã di quá 8px — không thì quẹt một cái là bị đẩy sang trang khác. */
  const chanClickSauKeo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!keo.current.daKeo) return;
    keo.current.daKeo = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const rongThumb = Math.max(24, Math.round(state.thay * TRACK_W));
  const xThumb = Math.round(state.tien * (TRACK_W - rongThumb));

  return (
    <section
      ref={khoi}
      className="relative isolate flex w-full flex-col items-start gap-xl bg-primary pb-3xl pt-6xl"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      aria-roledescription="băng chuyền"
      aria-label="Tin và khoá học nổi bật"
    >
      {/*
        Khung cuộn phải dùng LỀ (ml) chứ không dùng đệm: CSS luôn cắt ở hộp-đệm, nên nếu để
        đệm 48px thì mép cắt vẫn là 0 và mẩu slide vừa trôi qua đứng lại trong dải đệm.
        Bên phải cố tình KHÔNG có lề, để mép cắt là mép cửa sổ và slide kế tiếp hé ra.
      */}
      <div
        ref={rail}
        onScroll={doLai}
        onPointerDown={batDauKeo}
        onPointerMove={dangKeo}
        onPointerUp={thoiKeo}
        onPointerCancel={thoiKeo}
        onClickCapture={chanClickSauKeo}
        tabIndex={0}
        role="group"
        aria-label="Đường ray banner, cuộn ngang được"
        className={cn(
          'ln-carousel ln-rail ml-4 flex w-auto snap-x snap-mandatory items-stretch gap-xl self-stretch overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 lg:ml-6xl',
          !state.dauRay && 'ln-rail-mo-trai',
        )}
      >
        {SLIDES.map((slide) => (
          <article
            key={slide.id}
            className="relative flex w-[var(--ln-slide)] shrink-0 snap-start flex-col items-start justify-center overflow-hidden rounded-[32px] px-xl py-4xl sm:px-4xl lg:rounded-[42px] lg:px-7xl lg:py-6xl"
            style={slide.background ? { backgroundImage: slide.background } : undefined}
          >
            {slide.image ? (
              <img src={slide.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            ) : null}

            <div className="relative flex w-full items-center gap-4xl">
              <div className="flex min-w-px flex-1 flex-col items-start gap-3xl">
                <div className="flex w-full flex-col items-start gap-xs">
                  <h3 className={cn('w-full text-display-xs font-bold sm:text-display-sm lg:text-display-md', slide.headingClass)}>
                    {slide.heading}
                  </h3>
                  <p className="w-full text-md text-secondary lg:text-xl">{slide.body}</p>
                </div>

                {/* CTA là Link: trước đây là `<button>` không có onClick nào, bấm vào
                    đứng yên. Mỗi slide dẫn tới đúng nhóm khoá nó đang quảng cáo. */}
                <Link
                  to={slide.den}
                  className={cn(
                    'ln-press ln-focus relative flex shrink-0 items-center justify-center gap-xs overflow-hidden rounded-md bg-button-secondary px-[14px] py-[10px] text-sm font-semibold',
                    slide.ctaClass,
                  )}
                >
                  <span className="flex items-center justify-center px-xxs">{slide.cta}</span>
                  <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
                  />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Hàng điều khiển, thẳng lề với đường ray. Thanh tiến độ chiếm đúng 152px như dải
          ba dấu tròn của thiết kế, nhưng nói đúng vị trí thật: bề rộng con trượt là phần
          đang thấy trên tổng chiều dài ray. */}
      <div className="ml-4 flex items-center gap-xl lg:ml-6xl">
        <div
          className="h-2 shrink-0 overflow-hidden rounded-full bg-quaternary/35"
          style={{ width: TRACK_W }}
          role="progressbar"
          aria-label="Vị trí trên đường ray banner"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(state.tien * 100)}
        >
          <div
            className="h-full rounded-full bg-brand-500 transition-transform duration-200 ease-out motion-reduce:transition-none"
            style={{ width: rongThumb, transform: `translateX(${xThumb}px)` }}
          />
        </div>

        <div className="flex items-center gap-md">
          <button
            type="button"
            onClick={() => day(-1)}
            disabled={state.dauRay}
            aria-label="Xem banner trước"
            className="ln-press flex h-8 w-8 items-center justify-center rounded-full text-secondary shadow-xs-ring-primary hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => day(1)}
            aria-label="Xem banner sau"
            className="ln-press flex h-8 w-8 items-center justify-center rounded-full text-secondary shadow-xs-ring-primary hover:bg-secondary"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          {reduced ? null : (
            <button
              type="button"
              onClick={() => setStopped((v) => !v)}
              aria-label={stopped ? 'Cho băng chuyền chạy lại' : 'Dừng băng chuyền tự chạy'}
              className="ln-press flex h-8 w-8 items-center justify-center rounded-full text-quaternary hover:bg-secondary hover:text-secondary"
            >
              {stopped ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
