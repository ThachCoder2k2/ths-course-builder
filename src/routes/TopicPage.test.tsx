import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('TopicPage', () => {
  it('renders the topic hero and its courses', () => {
    renderAt('/topics/tri-tue-nhan-tao');

    expect(screen.getByTestId('page-topic')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Trí tuệ nhân tạo');
    expect(screen.getAllByText(/Deep Learning nâng cao/).length).toBeGreaterThan(0);
  });

  it('only lists courses belonging to the topic', () => {
    renderAt('/topics/khoa-hoc-du-lieu');

    expect(screen.getAllByText(/Python cho khoa học dữ liệu/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Deep Learning nâng cao/)).not.toBeInTheDocument();
  });

  it('shows 404 for an unknown topic slug', () => {
    renderAt('/topics/khong-ton-tai');
    expect(screen.getByTestId('page-404')).toBeInTheDocument();
  });
});
