import heroWash from '../../assets/heroes/topic-hero.png';

/**
 * Figma: the hero wash behind the transparent 76px nav band, shared by the
 * dashboard (177:2982) and course detail (182:11924) frames: the soft-blue
 * hero image under a 50%→100% white gradient, plus the #E9EAEB grid confined
 * to the band. Render inside a `relative` page root; it bleeds up behind the
 * nav via -top-[76px]. Calibrated to the renders (±1 RGB per sampled row).
 */
export default function NavWash() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[76px] h-[76px] overflow-hidden"
      >
        <img src={heroWash} alt="" className="h-full w-full object-cover object-top" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, #FFFFFF 100%)' }}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[76px] h-[100px] bg-[linear-gradient(to_right,#E9EAEB_1px,transparent_1px),linear-gradient(to_bottom,#E9EAEB_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.9),transparent)]"
      />
    </>
  );
}
