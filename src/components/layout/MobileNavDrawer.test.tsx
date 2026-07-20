import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );
}

describe('MobileNavDrawer', () => {
  it('opens from the nav menu button and lists the primary links', async () => {
    renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Mở menu' }));

    const drawer = screen.getByRole('dialog', { name: 'Danh mục' });
    expect(within(drawer).getByRole('link', { name: 'Trí tuệ nhân tạo' })).toBeInTheDocument();
    expect(within(drawer).getByRole('link', { name: 'Khoa học dữ liệu' })).toBeInTheDocument();
  });

  it('closes on the close button', async () => {
    renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Mở menu' }));
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes automatically after navigating to a new route', async () => {
    renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Mở menu' }));
    const drawer = screen.getByRole('dialog', { name: 'Danh mục' });
    await userEvent.click(within(drawer).getByRole('link', { name: 'Trí tuệ nhân tạo' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('page-topic')).toBeInTheDocument();
  });
});
