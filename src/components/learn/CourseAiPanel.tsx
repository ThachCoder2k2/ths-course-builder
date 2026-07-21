import { Send, X } from 'lucide-react';
import botGlyph from '../../assets/icons/course-ai.svg';

/**
 * Figma: `Side panel` (node 211:10427) — 360 × full height, white, radius-2xl.
 * Card header (Course AI + "Online" dot badge + x-close), a bottom-anchored
 * message list (bot bubbles bg-secondary/border-secondary, user bubbles
 * bg-brand-solid, 40px brand-50 bot avatar with a green online dot, "Today"
 * divider, typing dots), and a Message input footer (border-t, input with the
 * "Hỏi bất cứ điều gì ..." placeholder, brand send button, footnote).
 * Conversation copy is reproduced verbatim from the frame.
 */
function BotAvatar() {
  return (
    <span className="relative h-10 w-10 shrink-0 rounded-full bg-utility-brand-50">
      <img src={botGlyph} alt="" className="absolute inset-1 h-8 w-8" />
      <span className="absolute bottom-0 right-0 h-[10px] w-[10px] rounded-full border-[1.5px] border-white bg-[#17B26A]" />
    </span>
  );
}

export default function CourseAiPanel({ onClose }: { onClose: () => void }) {
  return (
    <aside className="flex w-[360px] shrink-0 flex-col overflow-hidden rounded-2xl border border-secondary bg-primary">
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
          className="flex items-center justify-center rounded-md p-[10px] text-quaternary hover:bg-secondary"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex min-h-px flex-1 flex-col items-center justify-end gap-4xl overflow-y-auto px-3xl pb-3xl">
        <div className="flex w-full flex-col gap-xl">
          <div className="flex w-full items-start">
            <div className="flex w-full gap-lg">
              <BotAvatar />
              <div className="flex min-w-px flex-1 flex-col gap-sm">
                <div className="w-full rounded-md rounded-tl-none border border-secondary bg-secondary px-[14px] py-[10px] text-md text-primary">
                  Just submitted the update to their team. Should be good.
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full items-start justify-end">
            <div className="flex max-w-[176px] flex-1 justify-end">
              <div className="w-full rounded-md rounded-tr-none bg-brand-500 px-[14px] py-[10px] text-md text-white">
                Awesome! Thanks.
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center gap-md">
          <span className="h-px min-w-px flex-1 bg-gray-200" />
          <p className="text-center text-sm font-medium text-tertiary">Today</p>
          <span className="h-px min-w-px flex-1 bg-gray-200" />
        </div>

        <div className="flex w-full flex-col gap-xl">
          <div className="flex w-full items-start">
            <div className="flex w-full gap-lg">
              <BotAvatar />
              <div className="flex min-w-px flex-1 flex-col gap-sm">
                <div className="w-full rounded-md rounded-tl-none border border-secondary bg-secondary px-[14px] py-[10px] text-md text-primary">
                  Hey Olivia, can you please review the latest design when you can?
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full items-start justify-end">
            <div className="flex max-w-[272px] flex-1 justify-end">
              <div className="w-full rounded-md rounded-tr-none bg-brand-500 px-[14px] py-[10px] text-md text-white">
                Sure thing, I’ll have a look today.
              </div>
            </div>
          </div>
          <div className="flex w-full items-start">
            <div className="flex w-full gap-lg">
              <BotAvatar />
              <div className="flex items-center gap-xs rounded-md rounded-tl-none border border-secondary bg-secondary p-[10px]">
                <span className="h-1 w-1 animate-pulse rounded-full bg-quaternary" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-quaternary [animation-delay:150ms]" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-quaternary [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-end gap-lg border-t border-secondary px-3xl pb-3xl pt-2xl">
        <div className="flex w-full items-start gap-lg">
          <input
            type="text"
            placeholder="Hỏi bất cứ điều gì ..."
            aria-label="Hỏi Course AI"
            className="h-11 min-w-px flex-1 rounded-md border border-primary bg-primary px-[14px] text-md text-primary shadow-xs outline-none placeholder:text-placeholder"
          />
          <button
            type="button"
            aria-label="Gửi"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-brand-500 text-white shadow-xs"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
            />
          </button>
        </div>
        <p className="w-full truncate text-xs text-placeholder">Hãy kiểm tra lại thông tin quan trọng</p>
      </div>
    </aside>
  );
}
