/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';

type LinkProps = {
  href: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

jest.mock('next/link', () => {
  const LinkMock = ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  LinkMock.displayName = 'Link';
  return LinkMock;
});

jest.mock('@/components/mobile-nav', () => ({
  MobileNav: () => <nav data-testid="mobile-nav" />,
}));

jest.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

import RuntimeHealthPage from '@/app/diagnostics/runtime/page';

describe('Runtime Health page', () => {
  test('renders runtime health page with heading', () => {
    render(<RuntimeHealthPage />);

    expect(screen.getByRole('heading', { name: /Runtime.*Health/i })).toBeInTheDocument();
  });

  test('renders health metrics cards', () => {
    render(<RuntimeHealthPage />);

    expect(screen.getByText(/Memory Usage/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Context Window/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/CPU Usage/i)).toBeInTheDocument();
  });

  test('renders tool call success rates section', () => {
    render(<RuntimeHealthPage />);

    expect(screen.getAllByText(/Tool Call Success Rates/i).length).toBeGreaterThan(0);
  });

  test('renders latency percentiles section', () => {
    render(<RuntimeHealthPage />);

    expect(screen.getByText(/Latency Percentiles/i)).toBeInTheDocument();
  });

  test('renders context window visualization', () => {
    render(<RuntimeHealthPage />);

    expect(screen.getByText(/Context Window Usage/i)).toBeInTheDocument();
  });
});
