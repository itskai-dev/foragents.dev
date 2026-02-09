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

import ProfilerPage from '@/app/diagnostics/profiler/page';

describe('Performance Profiler page', () => {
  test('renders profiler page with heading', () => {
    render(<ProfilerPage />);

    expect(screen.getByRole('heading', { name: /Performance.*Profiler/i })).toBeInTheDocument();
  });

  test('renders summary statistics', () => {
    render(<ProfilerPage />);

    expect(screen.getByText(/Total Time/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Thinking/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tool Calls/i).length).toBeGreaterThan(0);
  });

  test('renders time distribution chart', () => {
    render(<ProfilerPage />);

    expect(screen.getByText(/Time Distribution/i)).toBeInTheDocument();
  });

  test('renders waterfall visualization', () => {
    render(<ProfilerPage />);

    expect(screen.getByText(/Execution Waterfall/i)).toBeInTheDocument();
  });

  test('renders performance insights section', () => {
    render(<ProfilerPage />);

    expect(screen.getByText(/Performance Insights/i)).toBeInTheDocument();
  });
});
