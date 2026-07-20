import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VideoPlayer, { formatTime } from './VideoPlayer';

beforeEach(() => vi.restoreAllMocks());

describe('formatTime', () => {
  it('formats seconds as m:ss', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(600)).toBe('10:00');
  });

  it('guards against NaN and negatives', () => {
    expect(formatTime(NaN)).toBe('0:00');
    expect(formatTime(-5)).toBe('0:00');
  });
});

describe('VideoPlayer', () => {
  it('toggles play then pause via the control button', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});

    render(<VideoPlayer src="/media/sample-lesson.mp4" />);

    await userEvent.click(screen.getByRole('button', { name: 'Phát' }));
    expect(play).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Dừng' }));
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it('toggles mute state', async () => {
    render(<VideoPlayer src="/media/sample-lesson.mp4" />);

    await userEvent.click(screen.getByRole('button', { name: 'Tắt tiếng' }));
    expect(screen.getByRole('button', { name: 'Bật tiếng' })).toBeInTheDocument();
  });

  it('changes playback rate', async () => {
    render(<VideoPlayer src="/media/sample-lesson.mp4" />);

    const select = screen.getByRole('combobox', { name: 'Tốc độ phát' });
    await userEvent.selectOptions(select, '1.5');
    expect((select as HTMLSelectElement).value).toBe('1.5');
  });

  it('exposes a seek slider', () => {
    render(<VideoPlayer src="/media/sample-lesson.mp4" />);
    expect(screen.getByRole('slider', { name: 'Tiến trình video' })).toBeInTheDocument();
  });
});
