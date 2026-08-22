import { useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import botGlyph from '../../assets/icons/course-ai.svg';
import { cn } from '../../lib/cn';
import { useMediaQuery } from '../../lib/useMediaQuery';
import { dapChoGoiY, traLoi, type CauGoiY, type TroLy } from '../../ai/troLy';

/**
 * Bảng Course AI (Figma `Side panel` 211:10427) — 360px, trắng, bo 2xl.
 *
 * Hình giữ đúng thiết kế: dải đầu có tên và chip "Online", danh sách tin dồn xuống đáy
 * (bong bóng máy nền #FAFAFA có viền, bong bóng người nền xanh thương hiệu, ảnh đại diện
 * 40px có chấm xanh), rồi dải nhập ở chân.
 *
 * Nội dung thì KHÔNG sao y nữa. Bản Figma để nguyên chữ mẫu tiếng Anh của bộ component
 * ("Hey Olivia, can you please review the latest design when you can?") và ô nhập không nối
 * gì. Giờ bảng nhận một `TroLy` từ ngoài: kho câu trả lời soạn trước, dựng bằng số thật của
 * khoá. Không có mô hình nào đứng sau — đây là bản mô phỏng, và câu chân dải nói thẳng điều đó.
 *
 * Người học có hai đường hỏi: bấm chip gợi ý, hoặc gõ tay. Chip đi kèm tin nhắn mở đầu và
 * quay lại mỗi khi máy không hiểu câu hỏi, nên lúc nào bí cũng có đường ra mà không phải
 * chừa chỗ cố định cho chúng.
 */

interface Tin {
  id: number;
  ai: boolean;
  chu: string;
  /** Tin của máy có kèm chip gợi ý hay không. */
  keGoiY?: boolean;
}

/** Thời gian hiện ba dấu chấm trước khi trả lời — đủ để thấy là máy đang nghĩ. */
const NGHI_MS = 550;

function BotAvatar() {
  return (
    <span className="relative h-10 w-10 shrink-0 rounded-full bg-utility-brand-50">
      <img src={botGlyph} alt="" className="absolute inset-1 h-8 w-8" />
      <span className="absolute bottom-0 right-0 h-[10px] w-[10px] rounded-full border-[1.5px] border-white bg-[#17B26A]" />
    </span>
  );
}

export default function CourseAiPanel({
  troLy,
  onClose,
  className,
}: {
  troLy: TroLy;
  onClose: () => void;
  className?: string;
}) {
  const itMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [tin, setTin] = useState<Tin[]>(() => [{ id: 0, ai: true, chu: troLy.chao, keGoiY: true }]);
  const [dangGo, setDangGo] = useState(false);
  const [nhap, setNhap] = useState('');
  const dem = useRef(1);
  const cuon = useRef<HTMLDivElement | null>(null);
  const oNhap = useRef<HTMLInputElement | null>(null);
  const hen = useRef<number | null>(null);

  // Mở bảng thì con trỏ vào luôn ô nhập: bảng này là một vùng mới hiện ra, không đưa tiêu
  // điểm vào thì người đi bàn phím phải Tab lại từ đầu trang.
  useEffect(() => {
    oNhap.current?.focus();
  }, []);

  // Esc để đóng — đường thoát bắt buộc cho mọi lớp phủ và bảng bên.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Dọn hẹn giờ khi bảng đóng giữa lúc đang "nghĩ", không thì setState vào component đã rời.
  useEffect(() => () => {
    if (hen.current !== null) window.clearTimeout(hen.current);
  }, []);

  useEffect(() => {
    cuon.current?.scrollTo({ top: cuon.current.scrollHeight, behavior: itMotion ? 'auto' : 'smooth' });
  }, [tin, dangGo, itMotion]);

  const hoi = (cauHoi: string, dap: string) => {
    if (hen.current !== null) window.clearTimeout(hen.current);
    const idNguoi = dem.current++;
    setTin((t) => [...t.map((x) => ({ ...x, keGoiY: false })), { id: idNguoi, ai: false, chu: cauHoi }]);
    setDangGo(true);
    const cho = itMotion ? 0 : NGHI_MS;
    hen.current = window.setTimeout(() => {
      setDangGo(false);
      // Không hiểu câu hỏi thì mời lại chip gợi ý, để người học không rơi vào ngõ cụt.
      setTin((t) => [...t, { id: dem.current++, ai: true, chu: dap, keGoiY: dap === troLy.doNhau }]);
      hen.current = null;
    }, cho);
  };

  const guiChip = (g: CauGoiY) => hoi(g.hoi, dapChoGoiY(troLy, g));

  const gui = (e: React.FormEvent) => {
    e.preventDefault();
    const q = nhap.trim();
    if (!q || dangGo) return;
    setNhap('');
    hoi(q, traLoi(troLy, q));
  };

  const tinCuoi = tin[tin.length - 1];
  const hienGoiY = !dangGo && tinCuoi?.ai && tinCuoi.keGoiY;

  const bubbleAi = 'w-full rounded-md rounded-tl-none border border-secondary bg-secondary px-[14px] py-[10px] text-md text-primary';

  return (
    <aside
      aria-label="Course AI"
      className={cn(
        'flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-secondary bg-primary xl:w-[360px]',
        className,
      )}
    >
      <div className="flex w-full items-center gap-xl border-b border-secondary px-3xl pb-2xl pt-2xl">
        <div className="flex min-w-px flex-1 items-center gap-md">
          <p className="text-lg font-semibold text-primary">Course AI</p>
          <span className="flex items-center gap-xs rounded-sm border border-primary bg-primary px-sm py-xxs text-xs font-medium text-secondary shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#17B26A]" />
            Online
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng Course AI"
          className="ln-focus flex h-11 w-11 items-center justify-center rounded-md text-quaternary hover:bg-secondary"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/*
        role="log" + aria-live="polite": câu trả lời hiện ra sau một quãng nghỉ, người dùng
        trình đọc màn hình không thấy được nếu vùng này không tự đọc lên khi có tin mới.
      */}
      <div
        ref={cuon}
        role="log"
        aria-live="polite"
        aria-label="Nội dung hội thoại"
        className="flex min-h-[220px] flex-1 flex-col justify-end gap-xl overflow-y-auto px-3xl py-2xl"
      >
        {tin.map((t) =>
          t.ai ? (
            <div key={t.id} className="flex w-full gap-lg">
              <BotAvatar />
              <div className="flex min-w-px flex-1 flex-col gap-sm">
                <div className={bubbleAi}>
                  {/* Câu trả lời dạng danh sách có xuống dòng thật, nên giữ khoảng trắng. */}
                  <span className="whitespace-pre-line">{t.chu}</span>
                </div>
              </div>
            </div>
          ) : (
            <div key={t.id} className="flex w-full justify-end">
              <div className="max-w-[272px] rounded-md rounded-tr-none bg-brand-500 px-[14px] py-[10px] text-md text-white">
                {t.chu}
              </div>
            </div>
          ),
        )}

        {dangGo ? (
          <div className="flex w-full gap-lg">
            <BotAvatar />
            <div className="flex items-center gap-xs rounded-md rounded-tl-none border border-secondary bg-secondary p-[10px]">
              <span className="h-1 w-1 animate-pulse rounded-full bg-quaternary" />
              <span className="h-1 w-1 animate-pulse rounded-full bg-quaternary [animation-delay:150ms]" />
              <span className="h-1 w-1 animate-pulse rounded-full bg-quaternary [animation-delay:300ms]" />
            </div>
          </div>
        ) : null}

        {/* Chip gợi ý: nút thật, cao 44px, XUỐNG DÒNG chứ không cuộn ngang — dải cuộn ngang
            trong một bảng 360px thì chữ bị cắt ở mép, đúng lỗi đã gặp ở trang báo cáo. */}
        {hienGoiY ? (
          <ul className="flex flex-col gap-md pl-[52px]">
            {troLy.goiY.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => guiChip(g)}
                  className="ln-press ln-focus flex min-h-11 w-full items-center rounded-md border border-primary bg-primary px-lg py-md text-left text-sm font-medium text-secondary shadow-xs transition hover:bg-secondary"
                >
                  {g.hoi}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <form onSubmit={gui} className="flex w-full flex-col items-end gap-lg border-t border-secondary px-3xl pb-3xl pt-2xl">
        <div className="flex w-full items-start gap-lg">
          <label htmlFor="course-ai-hoi" className="sr-only">
            Câu hỏi cho Course AI
          </label>
          <input
            id="course-ai-hoi"
            ref={oNhap}
            type="text"
            value={nhap}
            onChange={(e) => setNhap(e.target.value)}
            placeholder="Hỏi bất cứ điều gì ..."
            autoComplete="off"
            className="ln-focus h-11 min-w-px flex-1 rounded-md border border-primary bg-primary px-[14px] text-md text-primary shadow-xs outline-none placeholder:text-placeholder"
          />
          <button
            type="submit"
            aria-label="Gửi câu hỏi"
            disabled={!nhap.trim() || dangGo}
            className="ln-press ln-focus relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-brand-500 text-white shadow-xs transition disabled:opacity-40"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
            />
          </button>
        </div>
        <p className="w-full text-xs text-placeholder">Bản mô phỏng — câu trả lời soạn trước, không nối tới mô hình AI nào</p>
      </form>
    </aside>
  );
}
