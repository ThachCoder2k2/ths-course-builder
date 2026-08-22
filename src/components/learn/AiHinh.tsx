import { polar, polygonPoints } from '../../lib/svg';
import type { HinhTraLoi } from '../../ai/troLy';

/**
 * Hình vẽ kèm câu trả lời của Course AI.
 *
 * Chỗ vẽ rất hẹp: bảng rộng 360, trừ lề 24 hai bên và 52px chừa cho ảnh đại diện thì còn
 * chừng 250px. Nên mọi hình ở đây là bản THU GỌN, không phải bản trên trang:
 *
 *   - thanh xếp hạng: nhãn và số ở dòng trên, thanh chạy hết bề ngang ở dòng dưới — chia
 *     đôi một dòng 250px thì nhãn tiếng Việt bị cắt còn ba chữ
 *   - radar: chỉ vẽ hai hình, KHÔNG ghi tên trục. Tên trục 14px co xuống 250/560 là 6px,
 *     không đọc được — nên tên chương để ở danh sách bên dưới
 *   - dải nhiệt: 10 cột cuối thay vì 12 tuần
 *
 * Thanh chạy từ 0 ra chiều dài thật bằng cách animate `width`. Biết là nên tránh animate
 * width, nhưng đổi sang scaleX thì hai đầu bo tròn của thanh bị kéo méo, mà ở đây nhiều
 * nhất chỉ có 5 thanh nên không thành vấn đề khung hình.
 */

const DAM = '#20447E';
const NHAT = '#E9EAEB';
const XANH = '#0D67F7';
const HONG_NET = '#EE46BC';
const HONG_NEN = '#FCDAF2';
const TRONG_NET = '#3992E3';
const TRONG_NEN = '#D5CCEF';
/** Bốn bậc nhiệt, cùng dải với bản đồ nhiệt trên trang. */
const NHIET = ['#FDEAD7', '#F9DBAF', '#F7B27A', '#EF6820'];
const NHIET_TRONG = '#F5F5F4';

function Khung({ children }: { children: React.ReactNode }) {
  return <div className="mt-md flex flex-col gap-md rounded-md border border-secondary bg-primary p-lg">{children}</div>;
}

function ThanhXepHang({ muc }: { muc: { ten: string; giaTri: number; phu?: string; mau?: string }[] }) {
  const max = Math.max(0.0001, ...muc.map((m) => m.giaTri));
  return (
    <Khung>
      {muc.map((m, i) => (
        <div key={m.ten} className="flex flex-col gap-xxs">
          <div className="flex items-baseline justify-between gap-md">
            <span className="min-w-0 truncate text-xs text-tertiary" title={m.ten}>
              {m.ten}
            </span>
            {m.phu ? <span className="shrink-0 text-xs font-semibold tabular-nums text-secondary">{m.phu}</span> : null}
          </div>
          <span className="h-2 w-full overflow-hidden rounded-full" style={{ background: NHAT }}>
            <span
              className="ln-hinh-thanh block h-full rounded-full"
              style={
                {
                  background: m.mau ?? XANH,
                  '--ln-w': `${Math.max(4, (m.giaTri / max) * 100)}%`,
                  '--ln-delay': `${i * 70}ms`,
                } as React.CSSProperties
              }
            />
          </span>
        </div>
      ))}
    </Khung>
  );
}

function VongNho({ giaTri, nhan }: { giaTri: number; nhan: string }) {
  const p = Math.min(1, Math.max(0, giaTri));
  const R = 40;
  const CV = 2 * Math.PI * R;
  return (
    <Khung>
      <div className="flex items-center gap-lg">
        <svg viewBox="0 0 100 100" className="h-[86px] w-[86px] shrink-0" role="img" aria-label={`${nhan}: ${Math.round(p * 100)}%`}>
          <circle cx="50" cy="50" r={R} fill="none" stroke={NHAT} strokeWidth={12} />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={XANH}
            strokeWidth={12}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            strokeDasharray={CV}
            strokeDashoffset={CV * (1 - p)}
            className="cp-ring"
          />
          <text x="50" y="56" textAnchor="middle" className="fill-[#181D27] text-[22px] font-bold">
            {Math.round(p * 100)}%
          </text>
        </svg>
        <p className="min-w-0 text-xs text-tertiary">{nhan}</p>
      </div>
    </Khung>
  );
}

function ChipNut({ muc }: { muc: { ten: string; nam: number }[] }) {
  const mau = (nam: number) => (nam >= 0.75 ? '#75E0A7' : nam >= 0.5 ? '#F7B27A' : '#FDE272');
  return (
    <Khung>
      {muc.map((m, i) => (
        <div
          key={m.ten}
          className="ln-hinh-o flex items-center gap-md"
          style={{ '--ln-delay': `${i * 80}ms` } as React.CSSProperties}
        >
          <span
            className="shrink-0 rounded-full"
            style={{ background: mau(m.nam), width: 14 + m.nam * 10, height: 14 + m.nam * 10 }}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate text-xs text-tertiary" title={m.ten}>
            {m.ten}
          </span>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-secondary">{Math.round(m.nam * 100)}%</span>
        </div>
      ))}
    </Khung>
  );
}

function CapThanhNho({ muc }: { muc: { ten: string; thucTe: number; chuan: number }[] }) {
  const max = Math.max(1, ...muc.flatMap((m) => [m.thucTe, m.chuan]));
  return (
    <Khung>
      {muc.map((m, i) => (
        <div key={m.ten} className="flex flex-col gap-xxs">
          <div className="flex items-baseline justify-between gap-md">
            <span className="min-w-0 truncate text-xs text-tertiary" title={m.ten}>
              {m.ten}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-quaternary">
              {m.thucTe}/{m.chuan} phút
            </span>
          </div>
          <span className="flex flex-col gap-[2px]">
            <span
              className="ln-hinh-thanh block h-[7px] rounded-full"
              style={{ background: DAM, '--ln-w': `${(m.thucTe / max) * 100}%`, '--ln-delay': `${i * 70}ms` } as React.CSSProperties}
            />
            <span
              className="ln-hinh-thanh block h-[7px] rounded-full"
              style={{ background: NHAT, '--ln-w': `${(m.chuan / max) * 100}%`, '--ln-delay': `${i * 70 + 40}ms` } as React.CSSProperties}
            />
          </span>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-lg pt-xxs text-xs text-quaternary">
        <span className="flex items-center gap-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: DAM }} aria-hidden="true" />
          thực tế
        </span>
        <span className="flex items-center gap-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: NHAT }} aria-hidden="true" />
          độ dài bài
        </span>
      </div>
    </Khung>
  );
}

function DaiNhiet({ hang }: { hang: { ten: string; o: number[] }[] }) {
  const max = Math.max(1, ...hang.flatMap((h) => h.o));
  const bac = (v: number) => (v <= 0 ? NHIET_TRONG : NHIET[Math.min(NHIET.length - 1, Math.floor((v / max) * NHIET.length))]);
  return (
    <Khung>
      <div className="flex flex-col gap-[3px]">
        {hang.map((h, r) => (
          <div key={h.ten} className="flex items-center gap-md">
            <span className="w-[46px] shrink-0 text-right text-[10px] text-quaternary">{h.ten}</span>
            <span className="flex gap-[3px]">
              {h.o.map((v, c) => (
                <span
                  key={c}
                  className="ln-hinh-o h-[14px] w-[14px] rounded-[3px]"
                  style={{ background: bac(v), '--ln-delay': `${(r * 3 + c) * 12}ms` } as React.CSSProperties}
                  title={`${h.ten}: ${v} phút`}
                />
              ))}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-xs text-[10px] text-quaternary">
        Thấp
        {NHIET.map((c) => (
          <span key={c} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: c }} />
        ))}
        Cao
      </div>
    </Khung>
  );
}

function RadarNho({ truc }: { truc: { label: string; nam: number; tienDo: number }[] }) {
  const n = truc.length;
  if (n < 3) return null;
  const CO = 180;
  const C = CO / 2;
  const R = 66;
  const goc = (i: number) => -90 + (360 / n) * i;
  const dinh = (lay: (t: { nam: number; tienDo: number }) => number) =>
    truc.map((t, i) => polar(C, C, R * Math.min(1, Math.max(0, lay(t))), goc(i)));

  return (
    <Khung>
      <div className="flex items-center gap-lg">
        <svg viewBox={`0 0 ${CO} ${CO}`} className="h-[110px] w-[110px] shrink-0" role="img" aria-label="Chân dung năng lực theo chương">
          {[0.25, 0.5, 0.75, 1].map((lv) => (
            <polygon
              key={lv}
              points={polygonPoints(truc.map((_, i) => polar(C, C, R * lv, goc(i))))}
              fill="none"
              stroke="#F5F5F5"
              strokeWidth={1}
            />
          ))}
          <polygon points={polygonPoints(dinh((t) => t.tienDo))} fill={HONG_NEN} stroke={HONG_NET} strokeWidth={1.5} />
          <polygon points={polygonPoints(dinh((t) => t.nam))} fill={TRONG_NEN} stroke={TRONG_NET} strokeWidth={1.5} />
        </svg>
        {/* Tên chương để ở đây vì ghi quanh hình 110px thì chữ còn 6px, không đọc được. */}
        <ul className="flex min-w-0 flex-1 flex-col gap-xxs">
          {truc.map((t, i) => (
            <li
              key={t.label}
              className="ln-hinh-o flex items-baseline justify-between gap-md text-[11px]"
              style={{ '--ln-delay': `${i * 70}ms` } as React.CSSProperties}
            >
              <span className="min-w-0 truncate text-tertiary" title={t.label}>
                {t.label}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-secondary">{Math.round(t.nam * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Khung>
  );
}

export function AiHinh({ hinh }: { hinh: HinhTraLoi }) {
  switch (hinh.kieu) {
    case 'thanh':
      return <ThanhXepHang muc={hinh.muc} />;
    case 'vong':
      return <VongNho giaTri={hinh.giaTri} nhan={hinh.nhan} />;
    case 'nut':
      return <ChipNut muc={hinh.muc} />;
    case 'capThanh':
      return <CapThanhNho muc={hinh.muc} />;
    case 'nhiet':
      return <DaiNhiet hang={hinh.hang} />;
    case 'radar':
      return <RadarNho truc={hinh.truc} />;
    default:
      return null;
  }
}
