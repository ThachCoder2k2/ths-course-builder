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
  it('renders every section of Figma node 177:2981', () => {
    renderDashboard();
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument();

    // Nodes 179:4442 and 179:5208 carry the same heading in Figma.
    expect(screen.getAllByRole('heading', { name: 'Khoá học nổi bật' })).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Giáo trình theo cấp độ' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Những khoá học giúp bạn mở khoá kĩ năng mới' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Các tệp khoá học nổi bật xếp theo chủ đề' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Thiết kế lộ trình học cá nhân hoá dành cho bạn' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kỹ năng phổ biến' })).toBeInTheDocument();
  });

  it('renders the banner carousel (node 177:2985) with three slides', () => {
    renderDashboard();
    expect(
      screen.getAllByRole('heading', {
        name: 'IEE: Đột phá vật liệu Graphene mở đường cho chip THz',
      }),
    ).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Chuyển tới banner 1' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('renders the skill pills from node 179:7785', () => {
    renderDashboard();
    expect(screen.getByRole('button', { name: 'Công nghệ và lập trình' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tranh biện' })).toBeInTheDocument();
  });

  it('links course cards to the course detail route', () => {
    renderDashboard();
    const links = screen.getAllByRole('link', { name: /Trí tuệ nhân tạo \(AI\) từ cơ bản/ });
    expect(links[0]).toHaveAttribute('href', '/courses/ai-co-ban-den-thuc-tien');
  });
});
