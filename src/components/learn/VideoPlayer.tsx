import { useRef, useState, type ChangeEvent } from 'react';
import { Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react';

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return minutes + ':' + String(rest).padStart(2, '0');
}

export default function VideoPlayer({
  src,
  poster,
  onEnded,
}: {
  src: string;
  poster?: string;
  onEnded?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      void video.play();
      setPlaying(true);
    }
  };

  const onSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setCurrent(next);
    if (videoRef.current) videoRef.current.currentTime = next;
  };

  const onRateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = Number(event.target.value);
    setRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  };

  const goFullscreen = () => {
    shellRef.current?.requestFullscreen?.();
  };

  return (
    // Figma 204:4681: the player sits on the white panel with a 16px inset,
    // controls overlaid on the video — no dark letterbox chrome.
    <div ref={shellRef} className="relative bg-primary px-xl pt-xl">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="mx-auto aspect-video max-h-[70vh] w-full max-w-[1348px] rounded-lg bg-black object-contain"
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
        onClick={togglePlay}
      />

      <div className="absolute inset-x-xl bottom-0 flex items-center gap-3 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent px-4 py-3 text-white">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Dừng' : 'Phát'}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-btn hover:bg-white/10"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>

        <span className="shrink-0 text-xs tabular-nums text-white/70">
          {formatTime(current)} / {formatTime(duration)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={onSeek}
          aria-label="Tiến trình video"
          className="h-1 w-full cursor-pointer appearance-none rounded-pill bg-white/25 accent-brand-500"
        />

        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Bật tiếng' : 'Tắt tiếng'}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-btn hover:bg-white/10"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>

        <select
          value={rate}
          onChange={onRateChange}
          aria-label="Tốc độ phát"
          className="shrink-0 rounded-btn bg-white/10 px-2 py-1 text-xs text-white outline-none"
        >
          {RATES.map((value) => (
            <option key={value} value={value} className="text-primary">
              {value}x
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={goFullscreen}
          aria-label="Toàn màn hình"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-btn hover:bg-white/10"
        >
          <Maximize className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
