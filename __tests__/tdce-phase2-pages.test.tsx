/** @jest-environment jsdom */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

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

jest.mock('@/components/global-nav', () => ({
  GlobalNav: () => <nav data-testid="global-nav" />,
}));

describe('TDCE Phase 2 Pages - Diagnostics and Observability', () => {
  describe('Diagnostics Page', () => {
    it('renders diagnostics page without crashing', async () => {
      const DiagnosticsPage = (await import('@/app/diagnostics/page')).default;
      const { container } = render(<DiagnosticsPage />);
      expect(container).toBeTruthy();
    });

    it('displays correct title and description', async () => {
      const DiagnosticsPage = (await import('@/app/diagnostics/page')).default;
      render(<DiagnosticsPage />);
      
      expect(screen.getByText(/Agent Config/i)).toBeInTheDocument();
      expect(screen.getByText(/Diagnostics/i)).toBeInTheDocument();
    });

    it('includes DiagnosticsClient component', async () => {
      const DiagnosticsPage = (await import('@/app/diagnostics/page')).default;
      const { container } = render(<DiagnosticsPage />);
      
      // Should have textarea for config input
      const textareas = container.querySelectorAll('textarea');
      expect(textareas.length).toBeGreaterThan(0);
    });
  });

  describe('Observability Page', () => {
    it('renders observability page without crashing', async () => {
      const ObservabilityPage = (await import('@/app/observability/page')).default;
      const { container } = render(<ObservabilityPage />);
      expect(container).toBeTruthy();
    });

    it('displays correct title and description', async () => {
      const ObservabilityPage = (await import('@/app/observability/page')).default;
      render(<ObservabilityPage />);
      
      // Check for heading content - use getAllByText since "Agent" appears multiple times
      expect(screen.getAllByText(/Agent/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Observability/i).length).toBeGreaterThan(0);
    });

    it('lists observability tools', async () => {
      const ObservabilityPage = (await import('@/app/observability/page')).default;
      render(<ObservabilityPage />);
      
      // Check for major tool names
      expect(screen.getAllByText(/OpenTelemetry/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/LangSmith/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Helicone/i).length).toBeGreaterThan(0);
    });

    it('includes integration matrix', async () => {
      const ObservabilityPage = (await import('@/app/observability/page')).default;
      render(<ObservabilityPage />);
      
      expect(screen.getByText(/Integration Matrix/i)).toBeInTheDocument();
      expect(screen.getAllByText(/LangChain/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/OpenAI/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Anthropic/i).length).toBeGreaterThan(0);
    });

    it('includes best practices section', async () => {
      const ObservabilityPage = (await import('@/app/observability/page')).default;
      render(<ObservabilityPage />);
      
      expect(screen.getByText(/Best Practices/i)).toBeInTheDocument();
      expect(screen.getByText(/Track token usage/i)).toBeInTheDocument();
    });

    it('includes setup snippets', async () => {
      const ObservabilityPage = (await import('@/app/observability/page')).default;
      const { container } = render(<ObservabilityPage />);
      
      const codeBlocks = container.querySelectorAll('pre code');
      expect(codeBlocks.length).toBeGreaterThan(0);
    });
  });

  describe('DiagnosticsClient Component', () => {
    it('renders input textarea', async () => {
      const { DiagnosticsClient } = await import('@/app/diagnostics/diagnostics-client');
      render(<DiagnosticsClient />);
      
      const textarea = screen.getByPlaceholderText(/name.*version/i);
      expect(textarea).toBeInTheDocument();
    });

    it('has validate button', async () => {
      const { DiagnosticsClient } = await import('@/app/diagnostics/diagnostics-client');
      render(<DiagnosticsClient />);
      
      const button = screen.getByText(/Validate Configuration/i);
      expect(button).toBeInTheDocument();
    });

    it('has clear button', async () => {
      const { DiagnosticsClient } = await import('@/app/diagnostics/diagnostics-client');
      render(<DiagnosticsClient />);
      
      const button = screen.getByText(/Clear/i);
      expect(button).toBeInTheDocument();
    });

    it('shows error for empty input', async () => {
      const { DiagnosticsClient } = await import('@/app/diagnostics/diagnostics-client');
      render(<DiagnosticsClient />);
      
      const validateButton = screen.getByText(/Validate Configuration/i);
      fireEvent.click(validateButton);
      
      expect(screen.getByText(/Please paste your agent.json/i)).toBeInTheDocument();
    });

    it('shows error for invalid JSON', async () => {
      const { DiagnosticsClient } = await import('@/app/diagnostics/diagnostics-client');
      render(<DiagnosticsClient />);
      
      const textarea = screen.getByPlaceholderText(/name.*version/i);
      fireEvent.change(textarea, { target: { value: 'not valid json' } });
      
      const validateButton = screen.getByText(/Validate Configuration/i);
      fireEvent.click(validateButton);
      
      expect(screen.getByText(/Invalid JSON format/i)).toBeInTheDocument();
    });

    it('validates a basic config successfully', async () => {
      const { DiagnosticsClient } = await import('@/app/diagnostics/diagnostics-client');
      render(<DiagnosticsClient />);
      
      const validConfig = JSON.stringify({
        name: 'test-agent',
        version: '1.0.0',
        description: 'A test agent',
      });
      
      const textarea = screen.getByPlaceholderText(/name.*version/i);
      fireEvent.change(textarea, { target: { value: validConfig } });
      
      const validateButton = screen.getByText(/Validate Configuration/i);
      fireEvent.click(validateButton);
      
      expect(screen.getByText(/Validation Summary/i)).toBeInTheDocument();
    });

    it('shows pass/fail/warn badges in results', async () => {
      const { DiagnosticsClient } = await import('@/app/diagnostics/diagnostics-client');
      render(<DiagnosticsClient />);
      
      const validConfig = JSON.stringify({
        name: 'test-agent',
        version: '1.0.0',
        description: 'A test agent',
      });
      
      const textarea = screen.getByPlaceholderText(/name.*version/i);
      fireEvent.change(textarea, { target: { value: validConfig } });
      
      const validateButton = screen.getByText(/Validate Configuration/i);
      fireEvent.click(validateButton);
      
      // Should show summary badges
      expect(screen.getByText(/Passed/i)).toBeInTheDocument();
    });
  });
});
