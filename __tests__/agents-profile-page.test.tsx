/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';

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

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean; [key: string]: unknown }) => {
    if (asChild && React.isValidElement(children)) {
      return children;
    }
    return <button {...props}>{children}</button>;
  },
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

import AgentProfilePage from '@/app/agents/[handle]/page';

describe('Agent Profile Page', () => {
  const mockParams = Promise.resolve({ handle: 'kai' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders agent profile with name and role', async () => {
    const Component = await AgentProfilePage({ params: mockParams });
    render(Component);

    expect(screen.getByText('Kai')).toBeInTheDocument();
    expect(screen.getByText(/Lead Agent.*Orchestrator/i)).toBeInTheDocument();
  });

  test('renders agent description', async () => {
    const Component = await AgentProfilePage({ params: mockParams });
    render(Component);

    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/orchestrates Team Reflectt/i)).toBeInTheDocument();
  });

  test('renders verified badge for verified agents', async () => {
    const Component = await AgentProfilePage({ params: mockParams });
    render(Component);

    expect(screen.getByText(/✓ Verified/i)).toBeInTheDocument();
  });

  test('renders trust score', async () => {
    const Component = await AgentProfilePage({ params: mockParams });
    render(Component);

    expect(screen.getByText(/Trust Score/i)).toBeInTheDocument();
    expect(screen.getByText('98')).toBeInTheDocument();
  });

  test('renders capabilities section', async () => {
    const Component = await AgentProfilePage({ params: mockParams });
    render(Component);

    expect(screen.getByText(/Capabilities/i)).toBeInTheDocument();
    expect(screen.getByText(/Platforms/i)).toBeInTheDocument();
  });

  test('renders skills section', async () => {
    const Component = await AgentProfilePage({ params: mockParams });
    render(Component);

    expect(screen.getByText(/Skills/i)).toBeInTheDocument();
  });

  test('renders recent activity timeline', async () => {
    const Component = await AgentProfilePage({ params: mockParams });
    render(Component);

    expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployed forAgents.dev v2.0/i)).toBeInTheDocument();
  });

  test('renders connect CTA section', async () => {
    const Component = await AgentProfilePage({ params: mockParams });
    render(Component);

    expect(screen.getByText(/Connect with Kai/i)).toBeInTheDocument();
  });

  test('calls notFound for non-existent agent', async () => {
    const invalidParams = Promise.resolve({ handle: 'nonexistent-agent-xyz' });
    await AgentProfilePage({ params: invalidParams });

    expect(notFound).toHaveBeenCalled();
  });

  test('renders back navigation link', async () => {
    const Component = await AgentProfilePage({ params: mockParams });
    render(Component);

    const backLink = screen.getByRole('link', { name: /back to agents/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/agents');
  });
});
