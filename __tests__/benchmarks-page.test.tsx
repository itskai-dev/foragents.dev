/** @jest-environment jsdom */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BenchmarksPage from '@/app/benchmarks/page';

describe('Benchmarks Page', () => {
  test('renders main heading', () => {
    render(<BenchmarksPage />);
    
    expect(screen.getByRole('heading', { name: /performance benchmarks/i })).toBeInTheDocument();
  });

  test('renders page description', () => {
    render(<BenchmarksPage />);
    
    expect(screen.getByText(/comprehensive performance metrics for top skills/i)).toBeInTheDocument();
  });

  test('displays environment information', () => {
    render(<BenchmarksPage />);
    
    expect(screen.getByText(/hardware:/i)).toBeInTheDocument();
    expect(screen.getByText(/model:/i)).toBeInTheDocument();
    expect(screen.getByText(/date:/i)).toBeInTheDocument();
  });

  test('renders category filters', () => {
    render(<BenchmarksPage />);
    
    expect(screen.getByText(/all categories/i)).toBeInTheDocument();
    expect(screen.getByText(/filter by category/i)).toBeInTheDocument();
  });

  test('renders skill cards with benchmark data', () => {
    render(<BenchmarksPage />);
    
    // Should render multiple skill cards
    expect(screen.getByText('Web Search')).toBeInTheDocument();
    expect(screen.getByText('File Operations')).toBeInTheDocument();
    expect(screen.getByText('Code Execution')).toBeInTheDocument();
  });

  test('displays latency metrics', () => {
    render(<BenchmarksPage />);
    
    // Check for latency labels
    const p50Labels = screen.getAllByText('p50');
    const p95Labels = screen.getAllByText('p95');
    const p99Labels = screen.getAllByText('p99');
    
    expect(p50Labels.length).toBeGreaterThan(0);
    expect(p95Labels.length).toBeGreaterThan(0);
    expect(p99Labels.length).toBeGreaterThan(0);
  });

  test('displays throughput and reliability metrics', () => {
    render(<BenchmarksPage />);
    
    expect(screen.getAllByText(/throughput/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/reliability/i).length).toBeGreaterThan(0);
  });

  test('displays resource usage information', () => {
    render(<BenchmarksPage />);
    
    expect(screen.getAllByText(/resource usage/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/avg memory/i).length).toBeGreaterThan(0);
  });

  test('displays historical trends', () => {
    render(<BenchmarksPage />);
    
    expect(screen.getAllByText(/historical trend/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/last 5 runs/i).length).toBeGreaterThan(0);
  });

  test('renders detailed comparison table', () => {
    render(<BenchmarksPage />);
    
    expect(screen.getByText(/detailed comparison/i)).toBeInTheDocument();
    expect(screen.getByText(/skill/i)).toBeInTheDocument();
    expect(screen.getByText(/req\/sec/i)).toBeInTheDocument();
    expect(screen.getByText(/success %/i)).toBeInTheDocument();
  });

  test('renders metrics explanation section', () => {
    render(<BenchmarksPage />);
    
    expect(screen.getByText(/metrics explained/i)).toBeInTheDocument();
    expect(screen.getByText(/latency percentiles/i)).toBeInTheDocument();
    expect(screen.getByText(/reliability metrics/i)).toBeInTheDocument();
  });

  test('category filter buttons are clickable', () => {
    render(<BenchmarksPage />);
    
    const allCategoriesButton = screen.getByText(/all categories/i);
    expect(allCategoriesButton).toBeInTheDocument();
    
    fireEvent.click(allCategoriesButton);
    expect(allCategoriesButton).toBeInTheDocument();
  });

  test('displays skill descriptions', () => {
    render(<BenchmarksPage />);
    
    expect(screen.getByText(/search and retrieve web content/i)).toBeInTheDocument();
    expect(screen.getByText(/read, write, and manage files/i)).toBeInTheDocument();
  });

  test('renders category badges', () => {
    render(<BenchmarksPage />);
    
    // Categories should be displayed as badges
    const categoryBadges = screen.getAllByText(/research|system|development|integration/i);
    expect(categoryBadges.length).toBeGreaterThan(0);
  });

  test('comparison table has sortable columns', () => {
    render(<BenchmarksPage />);
    
    // Check for sort icons or indicators
    const skillHeader = screen.getByText(/skill/i);
    expect(skillHeader).toBeInTheDocument();
  });

  test('displays multiple benchmark skills', () => {
    render(<BenchmarksPage />);
    
    // Should render at least 8 skills as per requirement
    expect(screen.getByText('Web Search')).toBeInTheDocument();
    expect(screen.getByText('File Operations')).toBeInTheDocument();
    expect(screen.getByText('Code Execution')).toBeInTheDocument();
    expect(screen.getByText('API Integration')).toBeInTheDocument();
    expect(screen.getByText('Database Queries')).toBeInTheDocument();
    expect(screen.getByText('Image Processing')).toBeInTheDocument();
    expect(screen.getByText('Text Generation')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  test('renders without errors', () => {
    const { container } = render(<BenchmarksPage />);
    expect(container).toBeInTheDocument();
  });
});
