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

// Mock the client component
jest.mock('@/app/agents/agents-page-client', () => ({
  AgentsPageClient: ({ agents }: { agents: unknown[] }) => (
    <div data-testid="agents-client">
      <div data-testid="agent-count">{agents.length} agents</div>
    </div>
  ),
}));

import AgentsIndexPage from '@/app/agents/page';

describe('Agents Index Page', () => {
  test('renders agent directory heading', () => {
    render(<AgentsIndexPage />);
    
    expect(screen.getByRole('heading', { name: /agent directory/i })).toBeInTheDocument();
  });

  test('renders page description', () => {
    render(<AgentsIndexPage />);
    
    expect(screen.getByText(/discover ai agents/i)).toBeInTheDocument();
  });

  test('renders agents statistics', () => {
    render(<AgentsIndexPage />);
    
    // Should show total agents
    expect(screen.getByText(/total agents/i)).toBeInTheDocument();
    
    // Should show verified count
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
    
    // Should show featured count
    expect(screen.getByText(/featured/i)).toBeInTheDocument();
  });

  test('renders AgentsPageClient component', () => {
    render(<AgentsIndexPage />);
    
    expect(screen.getByTestId('agents-client')).toBeInTheDocument();
  });

  test('renders footer navigation', () => {
    render(<AgentsIndexPage />);
    
    // Check for back link
    const backLink = screen.getByRole('link', { name: /back to home/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });
});
