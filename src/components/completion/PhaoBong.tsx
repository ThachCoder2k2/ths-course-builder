import { useMemo } from 'react';
import { useMediaQuery } from '../../lib/useMediaQuery';

/**
 * Pháo bông mừng học xong khoá.
 *
 * Không dùng canvas và không thêm thư viện: mỗi mảnh là một cặp thẻ lồng nhau, đường bay
 * vòng cung do hai lớp animation của CSS dựng (xem `.ln-phao-bay` / `.ln-phao-roi` trong
 * globals.css). Cách này còn cho phép `prefers-reduced-motion` tắt hẳn bằng CSS.
 *
 * Hai họng bắn ở hai góc dưới, chếch vào giữa — giống pháo giấy cầm tay, chứ không phải mưa
 * giấy rơi từ trên xuống. Mưa từ trên trông giống thông báo lỗi hơn là ăn mừng.
 *
 * `pointer-events: none` trên cả lớp: pháo bông không được chắn cú bấm nào, kể cả trong
 * quãng nó còn bay.
 */

const MAU = ['#0D67F7', '#75E0A7', '#F7B27A', '#FDE272', '#EE46BC', '#17B26A', '#20447E'];
const SO_MANH = 84;

/** Băm ổn định 0..1 từ một số — để mỗi lần bắn ra một hình khác mà vẫn dựng lại được. */
function bam01(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function PhaoBong({ lan }: { lan: number }) {
  const itMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const manh = useMemo(
    () =>
      Array.from({ length: SO_MANH }, (_, i) => {
        const r = (k: number) => bam01(lan * 977 + i * 31 + k);
        // Nửa đầu bắn từ góc trái, nửa sau từ góc phải.
        const trai = i < SO_MANH / 2;
        const manhTrai = trai ? 6 + r(1) * 10 : 84 + r(1) * 10;
        // Hướng bắn chếch lên và vào giữa; càng xa tâm càng bay cao.
        const xa = 120 + r(2) * 520;
        const dx = (trai ? 1 : -1) * xa;
        const dy = -(180 + r(3) * 300);
        return {
          i,
          left: `${manhTrai}%`,
          mau: MAU[Math.floor(r(4) * MAU.length)],
          rong: 6 + Math.round(r(5) * 5),
          cao: 9 + Math.round(r(6) * 7),
          tron: r(7) > 0.72,
          dx: `${Math.round(dx)}px`,
          dy: `${Math.round(dy)}px`,
          roi: `${Math.round(420 + r(8) * 520)}px`,
          rot: `${Math.round((r(9) * 2 - 1) * 900)}deg`,
          dur: `${(1.5 + r(10) * 1.1).toFixed(2)}s`,
          delay: `${Math.round(r(11) * 260)}ms`,
        };
      }),
    [lan],
  );

  if (itMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {manh.map((m) => (
        <span
          key={m.i}
          className="ln-phao-bay absolute bottom-[12%]"
          style={{ left: m.left, '--ln-dx': m.dx, '--ln-dy': m.dy, '--ln-dur': m.dur, '--ln-delay': m.delay } as React.CSSProperties}
        >
          <span
            className="ln-phao-roi block"
            style={
              {
                width: m.rong,
                height: m.cao,
                background: m.mau,
                borderRadius: m.tron ? '9999px' : '2px',
                '--ln-roi': m.roi,
                '--ln-rot': m.rot,
                '--ln-dur': m.dur,
                '--ln-delay': m.delay,
              } as React.CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
}
