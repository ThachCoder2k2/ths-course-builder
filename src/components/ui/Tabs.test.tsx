import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tabs from './Tabs';

const items = [
  { id: 'a', label: 'Alpha tab', content: 'Alpha content' },
  { id: 'b', label: 'Beta tab', content: 'Beta content' },
];

describe('Tabs', () => {
  it('shows the first tab content by default', () => {
    render(<Tabs items={items} />);
    expect(screen.getByText('Alpha content')).toBeInTheDocument();
    expect(screen.queryByText('Beta content')).not.toBeInTheDocument();
  });

  it('switches content and aria-selected on click', async () => {
    render(<Tabs items={items} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Beta tab' }));

    expect(screen.getByText('Beta content')).toBeInTheDocument();
    expect(screen.queryByText('Alpha content')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Beta tab' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Alpha tab' })).toHaveAttribute('aria-selected', 'false');
  });

  it('honours defaultId', () => {
    render(<Tabs items={items} defaultId="b" />);
    expect(screen.getByText('Beta content')).toBeInTheDocument();
  });
});
