import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => localStorage.clear());

describe('CourseDetailPage', () => {
  it('renders hero, metrics, learning outcomes and skills', () => {
    renderAt('/courses/ai-co-ban-den-thuc-tien');

    expect(screen.getByTestId('page-course')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Trí tuệ nhân tạo (AI)');
    expect(screen.getByText('12h')).toBeInTheDocument();
    expect(screen.getByText('Trình độ của khoá học')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bạn sẽ học được gì?' })).toBeInTheDocument();
    expect(screen.getByText('Prompt Engineering')).toBeInTheDocument();
  });

  it('links the primary CTA to the first lesson', () => {
    renderAt('/courses/ai-co-ban-den-thuc-tien');
    const cta = screen.getByRole('link', { name: 'Bắt đầu học ngay' });
    expect(cta).toHaveAttribute('href', '/learn/ai-co-ban-den-thuc-tien/l1');
  });

  it('opens the first curriculum section by default and expands others on click', async () => {
    renderAt('/courses/ai-co-ban-den-thuc-tien');

    expect(screen.getByText('AI là gì?')).toBeInTheDocument();
    expect(screen.queryByText('Dữ liệu và đặc trưng')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Nền tảng học máy/ }));
    expect(screen.getByText('Dữ liệu và đặc trưng')).toBeInTheDocument();
  });

  it('shows a preview link for preview lessons', () => {
    renderAt('/courses/ai-co-ban-den-thuc-tien');
    const previews = screen.getAllByRole('link', { name: 'Xem trước' });
    expect(previews.length).toBeGreaterThan(0);
  });

  it('lists related courses excluding itself', () => {
    renderAt('/courses/ai-co-ban-den-thuc-tien');
    expect(screen.getByRole('heading', { name: 'Khoá học liên quan' })).toBeInTheDocument();
  });

  it('shows 404 for an unknown course slug', () => {
    renderAt('/courses/khong-ton-tai');
    expect(screen.getByTestId('page-404')).toBeInTheDocument();
  });
});
