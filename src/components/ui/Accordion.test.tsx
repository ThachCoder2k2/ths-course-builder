import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Accordion from './Accordion';

const items = [
  { id: 's1', header: 'Section one', body: 'Body one' },
  { id: 's2', header: 'Section two', body: 'Body two' },
];

describe('Accordion', () => {
  it('starts closed when no defaultOpenIds given', () => {
    render(<Accordion items={items} />);
    expect(screen.queryByText('Body one')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Section one/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens and closes on click', async () => {
    render(<Accordion items={items} />);
    const header = screen.getByRole('button', { name: /Section one/ });

    await userEvent.click(header);
    expect(screen.getByText('Body one')).toBeInTheDocument();
    expect(header).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(header);
    expect(screen.queryByText('Body one')).not.toBeInTheDocument();
  });

  it('supports multiple open sections and defaultOpenIds', async () => {
    render(<Accordion items={items} defaultOpenIds={['s1']} />);
    expect(screen.getByText('Body one')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Section two/ }));
    expect(screen.getByText('Body one')).toBeInTheDocument();
    expect(screen.getByText('Body two')).toBeInTheDocument();
  });
});
