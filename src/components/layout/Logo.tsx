import mark from '../../assets/brand/logo-mark.svg';
import word from '../../assets/brand/logo-word.svg';
import { cn } from '../../lib/cn';

/** Figma: `Logo wrap` (node 83:16941) — 64.269 × 32, mark over wordmark. */
export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-8 w-16 shrink-0', className)} aria-label="THS Learning">
      <img src={mark} alt="" className="absolute" style={{ top: 0, right: '11.04%', bottom: '41.62%', left: '11.21%' }} />
      <img src={word} alt="" className="absolute" style={{ top: '78.46%', right: '5.21%', bottom: '-0.1%', left: '4.4%' }} />
    </div>
  );
}
