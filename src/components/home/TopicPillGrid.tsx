import {
  Aperture,
  BrainCircuit,
  Computer,
  GalleryHorizontalEnd,
  Glasses,
  Languages,
  PiggyBank,
  Pipette,
  Sparkles,
  Speech,
  type LucideIcon,
} from 'lucide-react';

/**
 * Figma: `Section` (node 179:7785) — 1376 × 184.
 * Page header (Display xs/Semibold) over a wrapping Container (node 179:7860 —
 * gap-xl, max-w-1440) of secondary pill buttons: radius-full, border
 * button-secondary on bg-primary, px-[22px] py-xl, gap-md, 24px icon and a
 * Text lg/Semibold label, carrying shadow-xs plus the skeuomorphic inner
 * border. Icons map to their nearest lucide equivalents.
 */
const SKILLS: { label: string; Icon: LucideIcon }[] = [
  { label: 'Công nghệ và lập trình', Icon: Computer }, // computer
  { label: 'Trí tuệ nhân tạo', Icon: Sparkles }, // stars-02
  { label: 'Thiết kế đồ hoạ', Icon: Pipette }, // dropper
  { label: 'Motion graphic', Icon: GalleryHorizontalEnd }, // gallery-horizontal-end
  { label: 'Nhiếp ảnh', Icon: Aperture }, // camera-lens
  { label: 'Ngôn ngữ', Icon: Languages }, // translate-02
  { label: 'Kinh tế và đầu tư', Icon: PiggyBank }, // piggy-bank-01
  { label: 'Ôn luyện và phòng thi ảo', Icon: Glasses }, // glasses
  { label: 'Chiến thuật và thể thao trí tuệ', Icon: BrainCircuit }, // brain-circuit
  { label: 'Tranh biện', Icon: Speech }, // speech
];

export default function TopicPillGrid({ title = 'Kỹ năng phổ biến' }: { title?: string }) {
  return (
    <section className="flex w-full flex-col gap-xl">
      <div className="flex w-full flex-col gap-2xl">
        <div className="flex w-full flex-wrap items-start gap-xl">
          <div className="flex min-w-[320px] flex-1 flex-col gap-xs">
            <h2 className="w-full text-display-xs text-primary">{title}</h2>
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-[1440px] flex-wrap items-start gap-xl">
        {SKILLS.map(({ label, Icon }) => (
          <button
            key={label}
            type="button"
            className="relative flex h-[60px] shrink-0 items-center justify-center gap-md overflow-hidden rounded-full bg-button-secondary px-[22px] py-xl text-lg font-semibold text-button-secondary-fg shadow-xs-ring-primary"
          >
            <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span className="flex items-center justify-center px-xxs">{label}</span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_0_rgba(10,13,18,0.05)]"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
