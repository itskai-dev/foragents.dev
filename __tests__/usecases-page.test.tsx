/** @jest-environment jsdom */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UseCasesClient from '@/app/use-cases/use-cases-client';

describe('Use Cases Page', () => {
  test('renders main heading', () => {
    render(<UseCasesClient />);
    
    const heading = screen.getByRole('heading', { name: /how teams use foragents\.dev/i });
    expect(heading).toBeInTheDocument();
  });

  test('renders page description', () => {
    render(<UseCasesClient />);
    
    expect(screen.getByText(/real success stories from companies transforming their operations/i)).toBeInTheDocument();
  });

  test('renders all industry filter buttons', () => {
    render(<UseCasesClient />);
    
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SaaS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finance' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Healthcare' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'E-commerce' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'DevTools' })).toBeInTheDocument();
  });

  test('renders featured case study section', () => {
    render(<UseCasesClient />);
    
    expect(screen.getByText('Featured Story')).toBeInTheDocument();
    expect(screen.getByText('Success Spotlight')).toBeInTheDocument();
  });

  test('renders featured use case details', () => {
    render(<UseCasesClient />);
    
    // Featured case is DevOps Automation
    expect(screen.getByText('DevOps Automation at Scale')).toBeInTheDocument();
    expect(screen.getByText('CloudFlow Systems')).toBeInTheDocument();
  });

  test('renders challenge/solution/result sections in featured case', () => {
    render(<UseCasesClient />);
    
    expect(screen.getAllByText(/challenge/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/solution/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/result/i).length).toBeGreaterThan(0);
  });

  test('renders key metrics for featured case', () => {
    render(<UseCasesClient />);
    
    expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    expect(screen.getByText(/faster deployments/i)).toBeInTheDocument();
  });

  test('renders testimonial in featured case', () => {
    render(<UseCasesClient />);
    
    expect(screen.getByText(/transformed how we ship code/i)).toBeInTheDocument();
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText(/VP of Engineering/i)).toBeInTheDocument();
  });

  test('renders more success stories heading', () => {
    render(<UseCasesClient />);
    
    expect(screen.getByRole('heading', { name: /more success stories/i })).toBeInTheDocument();
  });

  test('renders use case cards', () => {
    render(<UseCasesClient />);
    
    // Check for specific use case titles
    expect(screen.getByText('24/7 Customer Support Excellence')).toBeInTheDocument();
    expect(screen.getByText('Real-Time Data Pipeline Orchestration')).toBeInTheDocument();
    expect(screen.getByText('Proactive Security Threat Detection')).toBeInTheDocument();
  });

  test('renders company information on cards', () => {
    render(<UseCasesClient />);
    
    expect(screen.getByText('HelpDesk Pro')).toBeInTheDocument();
    expect(screen.getByText('QuantEdge Analytics')).toBeInTheDocument();
    expect(screen.getByText('MedSecure Systems')).toBeInTheDocument();
  });

  test('renders industry badges on cards', () => {
    render(<UseCasesClient />);
    
    const saasCards = screen.getAllByText('SaaS');
    const financeCards = screen.getAllByText('Finance');
    const healthcareCards = screen.getAllByText('Healthcare');
    
    expect(saasCards.length).toBeGreaterThan(0);
    expect(financeCards.length).toBeGreaterThan(0);
    expect(healthcareCards.length).toBeGreaterThan(0);
  });

  test('filters use cases by industry', () => {
    render(<UseCasesClient />);
    
    // Click Finance filter
    const financeButton = screen.getByRole('button', { name: 'Finance' });
    fireEvent.click(financeButton);
    
    // Should show Finance use case
    expect(screen.getByText('Real-Time Data Pipeline Orchestration')).toBeInTheDocument();
    
    // Should not show other industries (they would be in the "More Success Stories" section if shown)
    expect(screen.queryByText('24/7 Customer Support Excellence')).not.toBeInTheDocument();
  });

  test('shows all use cases when "All" filter is selected', () => {
    render(<UseCasesClient />);
    
    // Click a specific filter first
    const healthcareButton = screen.getByRole('button', { name: 'Healthcare' });
    fireEvent.click(healthcareButton);
    
    // Then click "All"
    const allButton = screen.getByRole('button', { name: 'All' });
    fireEvent.click(allButton);
    
    // Should show multiple use cases
    expect(screen.getByText('24/7 Customer Support Excellence')).toBeInTheDocument();
    expect(screen.getByText('Real-Time Data Pipeline Orchestration')).toBeInTheDocument();
  });

  test('expands and collapses use case details', () => {
    render(<UseCasesClient />);
    
    // Find a "Read Full Story" button
    const expandButtons = screen.getAllByText(/read full story/i);
    const firstExpandButton = expandButtons[0];
    
    // Click to expand
    fireEvent.click(firstExpandButton);
    
    // Now should show "Show Less" button
    expect(screen.getByText(/show less/i)).toBeInTheDocument();
    
    // Click to collapse
    const collapseButton = screen.getByText(/show less/i);
    fireEvent.click(collapseButton);
    
    // Should show "Read Full Story" again
    expect(screen.getAllByText(/read full story/i).length).toBeGreaterThan(0);
  });

  test('renders impact statistics section', () => {
    render(<UseCasesClient />);
    
    expect(screen.getByRole('heading', { name: /impact at a glance/i })).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText(/companies using/i)).toBeInTheDocument();
  });

  test('renders CTA section', () => {
    render(<UseCasesClient />);
    
    expect(screen.getByText(/ready to write your success story/i)).toBeInTheDocument();
    expect(screen.getByText(/join hundreds of companies transforming/i)).toBeInTheDocument();
  });

  test('renders CTA buttons with correct links', () => {
    render(<UseCasesClient />);
    
    const getStartedLink = screen.getByRole('link', { name: /get started/i });
    const talkToSalesLink = screen.getByRole('link', { name: /talk to sales/i });
    
    expect(getStartedLink).toHaveAttribute('href', '/get-started');
    expect(talkToSalesLink).toHaveAttribute('href', '/contact');
  });

  test('renders company avatars/emojis', () => {
    render(<UseCasesClient />);
    
    // The emojis are rendered as text content
    expect(screen.getByText('☁️')).toBeInTheDocument(); // CloudFlow Systems
    expect(screen.getByText('💬')).toBeInTheDocument(); // HelpDesk Pro
    expect(screen.getByText('📈')).toBeInTheDocument(); // QuantEdge Analytics
  });

  test('displays metrics for each use case', () => {
    render(<UseCasesClient />);
    
    // Check for percentage metrics
    expect(screen.getAllByText(/98%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/73%/).length).toBeGreaterThan(0);
  });
});
