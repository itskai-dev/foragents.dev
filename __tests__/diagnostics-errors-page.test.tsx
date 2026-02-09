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

import ErrorsPage from '@/app/diagnostics/errors/page';

describe('Error Pattern Analyzer page', () => {
  test('renders error analyzer page with heading', () => {
    render(<ErrorsPage />);

    expect(screen.getByRole('heading', { name: /Error.*Pattern Analyzer/i })).toBeInTheDocument();
  });

  test('renders summary statistics', () => {
    render(<ErrorsPage />);

    expect(screen.getByText(/Total Errors/i)).toBeInTheDocument();
    expect(screen.getByText(/Increasing Patterns/i)).toBeInTheDocument();
  });

  test('renders error category breakdown', () => {
    render(<ErrorsPage />);

    expect(screen.getByText(/Error Category Breakdown/i)).toBeInTheDocument();
  });

  test('renders error pattern cards', () => {
    render(<ErrorsPage />);

    expect(screen.getByText(/Tool Timeout/i)).toBeInTheDocument();
    expect(screen.getByText(/Context Window Overflow/i)).toBeInTheDocument();
    expect(screen.getAllByText(/API Rate Limit/i).length).toBeGreaterThan(0);
  });

  test('renders agent-readable format section', () => {
    render(<ErrorsPage />);

    expect(screen.getByText(/Agent-Readable Error Reference/i)).toBeInTheDocument();
  });
});
