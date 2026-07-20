import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => localStorage.clear());

describe('DashboardPage', () => {
  it('renders all the main sections', () => {
    renderDashboard();
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Đang học' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Học theo cấp độ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Khoá học nổi bật' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bộ sưu tập' })).toBeInTheDocument();
  });

  it('links course cards to the course detail route', () => {
    renderDashboard();
    const links = screen.getAllByRole('link', { name: /Trí tuệ nhân tạo \(AI\) từ cơ bản/ });
    expect(links[0]).toHaveAttribute('href', '/courses/ai-co-ban-den-thuc-tien');
  });

  it('offers a start-learning action when no progress is stored', () => {
    renderDashboard();
    expect(screen.getAllByRole('button', { name: 'Bắt đầu học' }).length).toBeGreaterThan(0);
  });
});
