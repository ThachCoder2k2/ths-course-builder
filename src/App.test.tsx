import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('routing', () => {
  it('renders dashboard at /', () => {
    renderAt('/');
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument();
  });

  it('renders topic page', () => {
    renderAt('/topics/tri-tue-nhan-tao');
    expect(screen.getByTestId('page-topic')).toBeInTheDocument();
  });

  it('renders course detail', () => {
    renderAt('/courses/ai-co-ban-den-thuc-tien');
    expect(screen.getByTestId('page-course')).toBeInTheDocument();
  });

  it('renders the lesson player full-screen (no global footer)', () => {
    renderAt('/learn/ai-co-ban-den-thuc-tien/l1');
    expect(screen.getByTestId('page-learn')).toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('renders 404 for an unknown route', () => {
    renderAt('/nope');
    expect(screen.getByTestId('page-404')).toBeInTheDocument();
  });

  it('shows global nav and footer on shell routes', () => {
    renderAt('/');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
