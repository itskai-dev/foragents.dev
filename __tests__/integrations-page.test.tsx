/** @jest-environment jsdom */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IntegrationsPage from '@/app/integrations/page';

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

describe.skip('Integrations Page', () => {
  test('renders main heading', () => {
    render(<IntegrationsPage />);
    
    expect(screen.getByRole('heading', { name: /platform integrations/i })).toBeInTheDocument();
  });

  test('renders page description', () => {
    render(<IntegrationsPage />);
    
    expect(screen.getByText(/connect foragents\.dev kits with the tools you already use/i)).toBeInTheDocument();
  });

  test('shows integrations count', () => {
    render(<IntegrationsPage />);
    
    expect(screen.getByText(/\d+ integrations available/i)).toBeInTheDocument();
  });

  test('renders category filter buttons', () => {
    render(<IntegrationsPage />);
    
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ci\/cd/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /communication/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /project management/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cloud/i })).toBeInTheDocument();
  });

  test('renders integration cards', () => {
    render(<IntegrationsPage />);
    
    // Check for some known integrations
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.getByText('Notion')).toBeInTheDocument();
    expect(screen.getByText('Discord')).toBeInTheDocument();
  });

  test('filters integrations by category', () => {
    render(<IntegrationsPage />);
    
    // Click on Communication category
    const communicationButton = screen.getByRole('button', { name: /communication/i });
    fireEvent.click(communicationButton);
    
    // Should show communication integrations
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.getByText('Discord')).toBeInTheDocument();
  });

  test('shows all integrations when All filter is selected', () => {
    render(<IntegrationsPage />);
    
    // Click on a specific category first
    const cloudButton = screen.getByRole('button', { name: /cloud/i });
    fireEvent.click(cloudButton);
    
    // Then click All
    const allButton = screen.getByRole('button', { name: /^all$/i });
    fireEvent.click(allButton);
    
    // Should show integrations from different categories
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
  });

  test('renders CTA section', () => {
    render(<IntegrationsPage />);
    
    expect(screen.getByText(/don't see your platform\?/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /request integration/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view documentation/i })).toBeInTheDocument();
  });

  test('integration cards have links to detail pages', () => {
    render(<IntegrationsPage />);
    
    // Find GitHub card link
    const links = screen.getAllByRole('link');
    const githubLink = links.find(link => link.getAttribute('href') === '/integrations/github');
    
    expect(githubLink).toBeInTheDocument();
  });

  test('shows type badges on integration cards', () => {
    render(<IntegrationsPage />);
    
    // Look for different types
    expect(screen.getAllByText(/api/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cli/i).length).toBeGreaterThan(0);
  });

  test('renders request integration CTA with correct links', () => {
    render(<IntegrationsPage />);
    
    const requestLink = screen.getByRole('link', { name: /request integration/i });
    expect(requestLink).toHaveAttribute('href', '/contact');
    
    const docsLink = screen.getByRole('link', { name: /view documentation/i });
    expect(docsLink).toHaveAttribute('href', '/guides');
  });
});
