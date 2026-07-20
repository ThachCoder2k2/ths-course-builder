import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LevelTabs from './LevelTabs';

function renderTabs() {
  return render(
    <MemoryRouter>
      <LevelTabs />
    </MemoryRouter>,
  );
}

describe('LevelTabs', () => {
  it('shows beginner courses by default', () => {
    renderTabs();
    expect(screen.getAllByText(/Trí tuệ nhân tạo \(AI\) từ cơ bản/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Deep Learning nâng cao/)).not.toBeInTheDocument();
  });

  it('switches the grid when another level tab is clicked', async () => {
    renderTabs();
    await userEvent.click(screen.getByRole('tab', { name: 'Nâng cao' }));

    expect(screen.getAllByText(/Deep Learning nâng cao/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Trí tuệ nhân tạo \(AI\) từ cơ bản/)).not.toBeInTheDocument();
  });
});
