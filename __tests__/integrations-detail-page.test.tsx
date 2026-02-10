/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import IntegrationDetailPage from '@/app/integrations/[slug]/page';
import integrationsData from '@/../data/integrations.json';

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
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe.skip('Integration Detail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders GitHub integration details', async () => {
    const params = Promise.resolve({ slug: 'github' });
    render(await IntegrationDetailPage({ params }));
    
    expect(screen.getByRole('heading', { name: /github/i })).toBeInTheDocument();
    expect(screen.getByText(/automate workflows, manage repositories/i)).toBeInTheDocument();
  });

  test('renders Slack integration details', async () => {
    const params = Promise.resolve({ slug: 'slack' });
    render(await IntegrationDetailPage({ params }));
    
    expect(screen.getByRole('heading', { name: /slack/i })).toBeInTheDocument();
    expect(screen.getByText(/send notifications, create interactive workflows/i)).toBeInTheDocument();
  });

  test('shows setup instructions section', async () => {
    const params = Promise.resolve({ slug: 'github' });
    render(await IntegrationDetailPage({ params }));
    
    expect(screen.getByText(/setup instructions/i)).toBeInTheDocument();
  });

  test('displays step-by-step instructions', async () => {
    const params = Promise.resolve({ slug: 'github' });
    render(await IntegrationDetailPage({ params }));
    
    const integration = integrationsData.find(i => i.slug === 'github');
    expect(integration).toBeDefined();
    
    // Check that steps are numbered
    const stepNumbers = screen.getAllByText(/^[1-9]$/);
    expect(stepNumbers.length).toBeGreaterThan(0);
  });

  test('renders required environment variables section', async () => {
    const params = Promise.resolve({ slug: 'github' });
    render(await IntegrationDetailPage({ params }));
    
    expect(screen.getByText(/required environment variables/i)).toBeInTheDocument();
    // Use getAllByText since it appears in env section and code
    const githubTokens = screen.getAllByText(/GITHUB_TOKEN/);
    expect(githubTokens.length).toBeGreaterThan(0);
  });

  test('shows code example with copy button', async () => {
    const params = Promise.resolve({ slug: 'github' });
    render(await IntegrationDetailPage({ params }));
    
    expect(screen.getByText(/code example/i)).toBeInTheDocument();
    // Use getByRole for the copy button
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  test('renders type and category badges', async () => {
    const params = Promise.resolve({ slug: 'github' });
    render(await IntegrationDetailPage({ params }));
    
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('CI/CD')).toBeInTheDocument();
  });

  test('shows featured badge for featured integrations', async () => {
    const params = Promise.resolve({ slug: 'github' });
    render(await IntegrationDetailPage({ params }));
    
    const integration = integrationsData.find(i => i.slug === 'github');
    if (integration?.featured) {
      expect(screen.getByText(/featured/i)).toBeInTheDocument();
    }
  });

  test('renders breadcrumb navigation', async () => {
    const params = Promise.resolve({ slug: 'github' });
    render(await IntegrationDetailPage({ params }));
    
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('href', '/');
    
    const integrationsLink = screen.getByRole('link', { name: /^integrations$/i });
    expect(integrationsLink).toHaveAttribute('href', '/integrations');
  });

  test('renders additional resources section', async () => {
    const params = Promise.resolve({ slug: 'github' });
    render(await IntegrationDetailPage({ params }));
    
    expect(screen.getByText(/additional resources/i)).toBeInTheDocument();
    expect(screen.getByText(/foragents\.dev guides/i)).toBeInTheDocument();
    expect(screen.getByText(/need help\?/i)).toBeInTheDocument();
  });

  test('has link to official documentation', async () => {
    const params = Promise.resolve({ slug: 'github' });
    render(await IntegrationDetailPage({ params }));
    
    const links = screen.getAllByRole('link', { name: /official documentation/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('has back to integrations link', async () => {
    const params = Promise.resolve({ slug: 'github' });
    render(await IntegrationDetailPage({ params }));
    
    const backLink = screen.getByRole('link', { name: /back to integrations/i });
    expect(backLink).toHaveAttribute('href', '/integrations');
  });

  test('calls notFound for invalid slug', async () => {
    const params = Promise.resolve({ slug: 'invalid-integration-slug' });
    
    // Rendering should trigger notFound for invalid slug
    try {
      await IntegrationDetailPage({ params });
    } catch (error) {
      // Expected to throw
    }
    
    expect(notFound).toHaveBeenCalled();
  });

  test('renders AI/ML category integrations correctly', async () => {
    const params = Promise.resolve({ slug: 'openai' });
    render(await IntegrationDetailPage({ params }));
    
    expect(screen.getByRole('heading', { name: /openai/i })).toBeInTheDocument();
    expect(screen.getByText('AI/ML')).toBeInTheDocument();
  });

  test('shows integration icon', async () => {
    const params = Promise.resolve({ slug: 'github' });
    render(await IntegrationDetailPage({ params }));
    
    const integration = integrationsData.find(i => i.slug === 'github');
    expect(integration).toBeDefined();
    expect(screen.getByText(integration!.icon)).toBeInTheDocument();
  });

  test('renders environment variables only when present', async () => {
    const params = Promise.resolve({ slug: 'vscode' });
    render(await IntegrationDetailPage({ params }));
    
    const integration = integrationsData.find(i => i.slug === 'vscode');
    if (integration && integration.requiredEnvVars.length === 0) {
      // Should not render the env vars section
      expect(screen.queryByText(/required environment variables/i)).not.toBeInTheDocument();
    }
  });
});
