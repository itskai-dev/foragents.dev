/** @jest-environment jsdom */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EcosystemPage from '@/app/ecosystem/page';

describe.skip('Ecosystem Page', () => {
  test('renders main heading', () => {
    render(<EcosystemPage />);
    
    expect(screen.getByRole('heading', { name: /ecosystem map/i })).toBeInTheDocument();
  });

  test('renders page description', () => {
    render(<EcosystemPage />);
    
    expect(screen.getByText(/how foragents\.dev connects to the broader agent landscape/i)).toBeInTheDocument();
  });

  test('displays ecosystem stats', () => {
    render(<EcosystemPage />);
    
    expect(screen.getByText(/total integrations/i)).toBeInTheDocument();
    expect(screen.getByText(/protocols supported/i)).toBeInTheDocument();
    expect(screen.getByText(/hosts compatible/i)).toBeInTheDocument();
  });

  test('renders center node (forAgents.dev)', () => {
    render(<EcosystemPage />);
    
    expect(screen.getByText('forAgents.dev')).toBeInTheDocument();
  });

  test('renders all category labels', () => {
    render(<EcosystemPage />);
    
    expect(screen.getAllByText('Hosts').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Protocols').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Models').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tools').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Standards').length).toBeGreaterThan(0);
  });

  test('renders nodes from each category', () => {
    render(<EcosystemPage />);
    
    // Hosts
    expect(screen.getByText('OpenClaw')).toBeInTheDocument();
    expect(screen.getByText('LangChain')).toBeInTheDocument();
    expect(screen.getByText('CrewAI')).toBeInTheDocument();
    
    // Protocols
    expect(screen.getByText('MCP')).toBeInTheDocument();
    expect(screen.getByText('A2A')).toBeInTheDocument();
    expect(screen.getByText('x402')).toBeInTheDocument();
    
    // Models
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    
    // Tools
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Supabase')).toBeInTheDocument();
    expect(screen.getByText('Vercel')).toBeInTheDocument();
    
    // Standards
    expect(screen.getByText('agent.json')).toBeInTheDocument();
    expect(screen.getByText('llms.txt')).toBeInTheDocument();
    expect(screen.getByText('ACP')).toBeInTheDocument();
  });

  test('shows placeholder message when no node is selected', () => {
    render(<EcosystemPage />);
    
    expect(screen.getByText(/explore the ecosystem/i)).toBeInTheDocument();
    expect(screen.getByText(/click on any node to learn more/i)).toBeInTheDocument();
  });

  test('displays node details when a node is clicked', () => {
    render(<EcosystemPage />);
    
    // Click on OpenClaw node
    const openClawButton = screen.getByRole('button', { name: /openclaw/i });
    fireEvent.click(openClawButton);
    
    // Should show the details
    expect(screen.getByText(/open-source agent runtime with native mcp support/i)).toBeInTheDocument();
  });

  test('displays center node details when center is clicked', () => {
    render(<EcosystemPage />);
    
    // Click on the center forAgents.dev node
    const centerButton = screen.getByRole('button', { name: /foragents\.dev/i });
    fireEvent.click(centerButton);
    
    // Should show the details
    expect(screen.getByText(/the platform built by agents, for agents/i)).toBeInTheDocument();
  });

  test('renders category legend section', () => {
    render(<EcosystemPage />);
    
    // Check for the Categories heading
    expect(screen.getByRole('heading', { name: /^categories$/i })).toBeInTheDocument();
    
    // Check for integration counts in legend (multiple categories have 3 integrations)
    expect(screen.getAllByText(/3 integrations/i).length).toBeGreaterThan(0);
  });

  test('renders CTA section', () => {
    render(<EcosystemPage />);
    
    expect(screen.getByText(/want to join the ecosystem\?/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get in touch/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view documentation/i })).toBeInTheDocument();
  });

  test('CTA links have correct hrefs', () => {
    render(<EcosystemPage />);
    
    const contactLink = screen.getByRole('link', { name: /get in touch/i });
    expect(contactLink).toHaveAttribute('href', '/contact');
    
    const docsLink = screen.getByRole('link', { name: /view documentation/i });
    expect(docsLink).toHaveAttribute('href', '/docs');
  });

  test('detail panel shows visit link with correct URL', () => {
    render(<EcosystemPage />);
    
    // Click on a node
    const githubButton = screen.getByRole('button', { name: /github/i });
    fireEvent.click(githubButton);
    
    // Check for the visit link
    const visitLink = screen.getByRole('link', { name: /visit github/i });
    expect(visitLink).toHaveAttribute('href', 'https://github.com');
    expect(visitLink).toHaveAttribute('target', '_blank');
  });

  test('displays category badge in detail panel', () => {
    render(<EcosystemPage />);
    
    // Click on a node from the Tools category
    const githubButton = screen.getByRole('button', { name: /github/i });
    fireEvent.click(githubButton);
    
    // Should show Tools badge in the details panel
    const badges = screen.getAllByText('Tools');
    expect(badges.length).toBeGreaterThan(0);
  });
});
