import { Check } from 'lucide-react';

/**
 * Figma: `Section` (node 182:11941) — "Bạn sẽ học được gì?".
 * Display xs heading over a wrapping grid of `_Feature text` items (gap 32row /
 * 64col, each flex-1 min-w-320): a 24px brand check beside a Text xl/Semibold
 * outcome. Figma pairs each with a Text md description; the mock carries only
 * the outcome string, so no description is rendered.
 */
export default function LearnList({ points }: { points: string[] }) {
  return (
    <section className="flex w-full flex-col gap-xl">
      <h2 className="w-full text-display-xs text-primary">Bạn sẽ học được gì?</h2>

      {/*
        Lưới, không phải flex-wrap.

        Bản trước là `flex-wrap` với `flex-1` và khe ngang `gap-x-7xl` (64px). Hai thứ đó
        không đi được với nhau ở khung hẹp: `flex-1` có basis 0 nên các cột KHÔNG BAO GIỜ
        xuống dòng, chúng chỉ co lại — mà hai khe 64px là đã ăn 128px, ở 390px chỉ còn
        358px nên mỗi cột bị bóp xuống 42px và tổng vẫn vượt khung 16px.

        Lưới thì số cột do mốc khung quyết định, nên ở khổ hẹp là một cột, không phải ba
        cột bị bóp.
      */}
      <div className="grid w-full max-w-content grid-cols-1 gap-y-4xl sm:grid-cols-2 sm:gap-x-4xl lg:grid-cols-3 lg:gap-x-7xl">
        {points.map((point) => (
          <div key={point} className="flex min-w-0 flex-col items-start gap-2xl">
            <div className="flex w-full items-center gap-md">
              <Check className="h-6 w-6 shrink-0 text-brand-tertiary" aria-hidden="true" />
              {/* break-words: ở 320px một dòng như "Viết email công việc lịch sự" ở cỡ text-xl
                  dài hơn cột và chọc ra ngoài viewport. */}
              <p className="w-full break-words text-lg font-semibold text-primary sm:text-xl">{point}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
