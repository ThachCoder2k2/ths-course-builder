import mark from '../../assets/brand/logo-mark.svg';
import word from '../../assets/brand/logo-word.svg';
import { cn } from '../../lib/cn';

/** Figma: `Logo wrap` (node 83:16941) — 64.269 × 32, mark over wordmark. */
export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-8 w-16 shrink-0', className)} aria-label="THS Learning">
      {/* Explicit sizes: Tailwind preflight (img height:auto) breaks the
          inset-solved box, rendering the SVGs at intrinsic size. */}
      <img
        src={mark}
        alt=""
        className="absolute max-w-none"
        style={{ top: 0, left: '11.21%', width: '77.75%', height: '58.38%' }}
      />
      <img
        src={word}
        alt=""
        className="absolute max-w-none"
        style={{ top: '78.46%', left: '4.4%', width: '90.39%', height: '21.64%' }}
      />
    </div>
  );
}
