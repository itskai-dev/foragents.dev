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
jest.mock('@/app/showcase/showcase-client', () => ({
  ShowcaseClient: ({ agents }: { agents: unknown[] }) => (
    <div data-testid="showcase-client">
      <div data-testid="hall-of-fame-count">{agents.length} agents in hall of fame</div>
    </div>
  ),
}));

import ShowcasePage from '@/app/showcase/page';

describe('Showcase Page', () => {
  test('renders showcase heading', () => {
    render(<ShowcasePage />);
    
    expect(screen.getByRole('heading', { name: /🏆 agent showcase/i, level: 1 })).toBeInTheDocument();
  });

  test('renders page description', () => {
    render(<ShowcasePage />);
    
    expect(screen.getByText(/celebrating the best ai agents/i)).toBeInTheDocument();
  });

  test('renders stats banner with all metrics', () => {
    render(<ShowcasePage />);
    
    // Should show all 4 stats
    expect(screen.getByText(/total agents/i)).toBeInTheDocument();
    expect(screen.getByText(/skills installed/i)).toBeInTheDocument();
    expect(screen.getByText(/tasks completed/i)).toBeInTheDocument();
    expect(screen.getByText(/community members/i)).toBeInTheDocument();
  });

  test('renders agent of the month section', () => {
    render(<ShowcasePage />);
    
    expect(screen.getByRole('heading', { name: /agent of the month/i })).toBeInTheDocument();
  });

  test('renders featured agents', () => {
    render(<ShowcasePage />);
    
    // Should render featured agents (Kai, Scout, Link)
    expect(screen.getByText('Kai')).toBeInTheDocument();
    expect(screen.getByText('Scout')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
  });

  test('renders hall of fame section', () => {
    render(<ShowcasePage />);
    
    expect(screen.getByRole('heading', { name: /hall of fame/i })).toBeInTheDocument();
  });

  test('renders ShowcaseClient component', () => {
    render(<ShowcasePage />);
    
    expect(screen.getByTestId('showcase-client')).toBeInTheDocument();
  });

  test('renders submit your agent CTA', () => {
    render(<ShowcasePage />);
    
    expect(screen.getByRole('heading', { name: /is your agent showcase-worthy/i })).toBeInTheDocument();
    
    const submitLink = screen.getByRole('link', { name: /submit your agent/i });
    expect(submitLink).toBeInTheDocument();
    expect(submitLink).toHaveAttribute('href', '/submit');
  });

  test('displays achievements for featured agents', () => {
    render(<ShowcasePage />);
    
    // Check for achievements sections (there are 3 featured agents)
    const achievements = screen.getAllByText('Achievements');
    expect(achievements.length).toBeGreaterThan(0);
  });

  test('displays trust scores for featured agents', () => {
    render(<ShowcasePage />);
    
    // All featured agents should show trust scores
    expect(screen.getByText(/98%/)).toBeInTheDocument(); // Kai
    expect(screen.getByText(/96%/)).toBeInTheDocument(); // Scout
    expect(screen.getByText(/97%/)).toBeInTheDocument(); // Link
  });
});
