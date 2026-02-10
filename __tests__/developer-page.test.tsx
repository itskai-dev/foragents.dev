/** @jest-environment jsdom */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeveloperPage from '@/app/developer/page';

describe.skip('Developer Page', () => {
  test('renders main heading', () => {
    render(<DeveloperPage />);
    
    expect(screen.getByRole('heading', { name: /developer portal/i })).toBeInTheDocument();
  });

  test('renders page description', () => {
    render(<DeveloperPage />);
    
    expect(screen.getByText(/build powerful integrations with the foragents\.dev api/i)).toBeInTheDocument();
  });

  test('displays quick links section', () => {
    render(<DeveloperPage />);
    
    expect(screen.getByText(/api documentation/i)).toBeInTheDocument();
    expect(screen.getAllByText(/sdks & libraries/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/webhooks/i).length).toBeGreaterThan(0);
  });

  test('renders API keys section', () => {
    render(<DeveloperPage />);
    
    expect(screen.getByRole('heading', { name: /^api keys$/i })).toBeInTheDocument();
    expect(screen.getByText(/manage your api keys and monitor usage/i)).toBeInTheDocument();
  });

  test('displays API key cards with usage stats', () => {
    render(<DeveloperPage />);
    
    expect(screen.getByText(/production api key/i)).toBeInTheDocument();
    expect(screen.getByText(/development api key/i)).toBeInTheDocument();
    expect(screen.getAllByText(/requests today/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/requests this month/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/rate limit status/i).length).toBeGreaterThan(0);
  });

  test('shows create new key button', () => {
    render(<DeveloperPage />);
    
    const createButton = screen.getByRole('button', { name: /create new key/i });
    expect(createButton).toBeInTheDocument();
  });

  test('toggles new key form on button click', () => {
    render(<DeveloperPage />);
    
    const createButton = screen.getByRole('button', { name: /create new key/i });
    
    // Initially, form should not be visible
    expect(screen.queryByText(/create new api key/i)).not.toBeInTheDocument();
    
    // Click to show form
    fireEvent.click(createButton);
    expect(screen.getByText(/create new api key/i)).toBeInTheDocument();
    
    // Click to hide form
    fireEvent.click(createButton);
    expect(screen.queryByText(/create new api key/i)).not.toBeInTheDocument();
  });

  test('renders SDK download cards', () => {
    render(<DeveloperPage />);
    
    expect(screen.getAllByText(/python/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/typescript/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/go/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/rust/i).length).toBeGreaterThan(0);
  });

  test('displays install commands for SDKs', () => {
    render(<DeveloperPage />);
    
    expect(screen.getByText(/pip install foragents/i)).toBeInTheDocument();
    expect(screen.getByText(/npm install @foragents\/sdk/i)).toBeInTheDocument();
    expect(screen.getByText(/go get github\.com\/foragents\/go-sdk/i)).toBeInTheDocument();
    expect(screen.getByText(/cargo add foragents/i)).toBeInTheDocument();
  });

  test('renders webhooks configuration section', () => {
    render(<DeveloperPage />);
    
    expect(screen.getByRole('heading', { name: /^webhooks$/i })).toBeInTheDocument();
    expect(screen.getByText(/webhook configuration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/endpoint url/i)).toBeInTheDocument();
    expect(screen.getByText(/signing secret/i)).toBeInTheDocument();
  });

  test('displays webhook events checkboxes', () => {
    render(<DeveloperPage />);
    
    expect(screen.getByText(/agent\.created/i)).toBeInTheDocument();
    expect(screen.getByText(/skill\.published/i)).toBeInTheDocument();
    expect(screen.getByText(/integration\.connected/i)).toBeInTheDocument();
  });

  test('renders quick start section', () => {
    render(<DeveloperPage />);
    
    expect(screen.getByRole('heading', { name: /^quick start$/i })).toBeInTheDocument();
    expect(screen.getByText(/get started with these code snippets/i)).toBeInTheDocument();
  });

  test('displays quick start code snippets', () => {
    render(<DeveloperPage />);
    
    expect(screen.getAllByText(/curl/i).length).toBeGreaterThan(0);
    // Verify Quick Start section exists
    expect(screen.getByRole('heading', { name: /^quick start$/i })).toBeInTheDocument();
  });

  test('copy buttons are present', () => {
    render(<DeveloperPage />);
    
    const copyButtons = screen.getAllByRole('button', { name: /copy/i });
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  test('revoke button is present for API keys', () => {
    render(<DeveloperPage />);
    
    const revokeButtons = screen.getAllByRole('button', { name: /revoke/i });
    expect(revokeButtons.length).toBeGreaterThan(0);
  });
});
