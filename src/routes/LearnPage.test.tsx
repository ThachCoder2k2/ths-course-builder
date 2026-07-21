import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { readProgress } from '../lib/progress';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => localStorage.clear());

describe('LearnPage', () => {
  it('renders the lesson, its section and the video element', () => {
    const { container } = renderAt('/learn/ai-co-ban-den-thuc-tien/l1');

    expect(screen.getByTestId('page-learn')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'AI là gì?' })).toBeInTheDocument();
    expect(container.querySelector('video')).toHaveAttribute('src', '/media/sample-lesson.mp4');
  });

  it('lists all lessons in the sidebar and marks the active one', () => {
    renderAt('/learn/ai-co-ban-den-thuc-tien/l1');

    const nav = screen.getByRole('navigation', { name: 'Danh sách bài học' });
    expect(within(nav).getAllByRole('link').length).toBe(11);
    expect(within(nav).getByRole('link', { current: 'page' })).toHaveTextContent('AI là gì?');
  });

  it('records the visited lesson as last opened', () => {
    renderAt('/learn/ai-co-ban-den-thuc-tien/l2');
    expect(readProgress('c1').lastLessonId).toBe('l2');
  });

  it('marks a lesson complete and persists it', async () => {
    renderAt('/learn/ai-co-ban-den-thuc-tien/l1');

    await userEvent.click(screen.getByRole('button', { name: /Đánh dấu hoàn thành/ }));

    expect(screen.getByRole('button', { name: /Đã hoàn thành/ })).toBeInTheDocument();
    expect(readProgress('c1').completedLessonIds).toContain('l1');
  });

  it('offers next navigation on the first lesson and previous on a later one', () => {
    const first = renderAt('/learn/ai-co-ban-den-thuc-tien/l1');
    expect(screen.getByRole('link', { name: /Bài tiếp/ })).toHaveAttribute(
      'href',
      '/learn/ai-co-ban-den-thuc-tien/l2',
    );
    expect(screen.queryByRole('link', { name: /Bài trước/ })).not.toBeInTheDocument();
    first.unmount();

    renderAt('/learn/ai-co-ban-den-thuc-tien/l2');
    expect(screen.getByRole('link', { name: /Bài trước/ })).toHaveAttribute(
      'href',
      '/learn/ai-co-ban-den-thuc-tien/l1',
    );
  });

  it('opens the lesson list in a drawer on small screens', async () => {
    renderAt('/learn/ai-co-ban-den-thuc-tien/l1');

    await userEvent.click(screen.getByRole('button', { name: /Danh sách bài/ }));
    expect(screen.getByRole('dialog', { name: 'Danh sách bài học' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows 404 for an unknown lesson', () => {
    renderAt('/learn/ai-co-ban-den-thuc-tien/khong-co');
    expect(screen.getByTestId('page-404')).toBeInTheDocument();
  });
});
