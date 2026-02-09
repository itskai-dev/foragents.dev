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

import SandboxClient from '@/app/sandbox/SandboxClient';

describe('Sandbox page', () => {
  test('renders sandbox page with heading', () => {
    render(<SandboxClient />);

    expect(screen.getByRole('heading', { name: /Agent Sandbox/i })).toBeInTheDocument();
  });

  test('renders configuration editor textarea', () => {
    render(<SandboxClient />);

    const textarea = screen.getByPlaceholderText(/name.*My Agent/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('font-mono');
  });

  test('renders validate button', () => {
    render(<SandboxClient />);

    const validateButton = screen.getByRole('button', { name: /^Validate$/i });
    expect(validateButton).toBeInTheDocument();
  });

  test('renders test endpoints button', () => {
    render(<SandboxClient />);

    const testButton = screen.getByRole('button', { name: /Test Endpoints/i });
    expect(testButton).toBeInTheDocument();
  });

  test('renders sample templates dropdown', () => {
    render(<SandboxClient />);

    const select = screen.getByLabelText(/Template:/i);
    expect(select).toBeInTheDocument();
    
    // Check for template options
    expect(screen.getByText(/Basic Agent/i)).toBeInTheDocument();
    expect(screen.getByText(/MCP-Enabled Agent/i)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Tool Agent/i)).toBeInTheDocument();
  });

  test('renders results panel', () => {
    render(<SandboxClient />);

    expect(screen.getByRole('heading', { name: /Results/i })).toBeInTheDocument();
  });

  test('validates JSON syntax', () => {
    render(<SandboxClient />);

    const textarea = screen.getByPlaceholderText(/name.*My Agent/i);
    const validateButton = screen.getByRole('button', { name: /^Validate$/i });

    // Enter invalid JSON
    fireEvent.change(textarea, { target: { value: '{ invalid json }' } });
    fireEvent.click(validateButton);

    // Should show validation error
    expect(screen.getByText(/Invalid Configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/Expected property name/i)).toBeInTheDocument();
  });

  test('validates required fields', () => {
    render(<SandboxClient />);

    const textarea = screen.getByPlaceholderText(/name.*My Agent/i);
    const validateButton = screen.getByRole('button', { name: /^Validate$/i });

    // Enter valid JSON but missing required fields
    fireEvent.change(textarea, { target: { value: '{"name": "Test"}' } });
    fireEvent.click(validateButton);

    // Should show missing field errors
    expect(screen.getByText(/Missing required field: version/i)).toBeInTheDocument();
    expect(screen.getByText(/Missing required field: description/i)).toBeInTheDocument();
    // Check that errors section exists
    expect(screen.getByText(/Invalid Configuration/i)).toBeInTheDocument();
  });

  test('shows success for valid configuration', () => {
    render(<SandboxClient />);

    const textarea = screen.getByPlaceholderText(/name.*My Agent/i);
    const validateButton = screen.getByRole('button', { name: /^Validate$/i });

    // Enter valid configuration
    const validConfig = JSON.stringify({
      name: "Test Agent",
      version: "1.0.0",
      description: "A test agent"
    });
    
    fireEvent.change(textarea, { target: { value: validConfig } });
    fireEvent.click(validateButton);

    // Should show valid with warnings (since no capabilities/endpoints)
    expect(screen.getByText(/Valid with Warnings/i)).toBeInTheDocument();
  });

  test('loads template when selected', () => {
    render(<SandboxClient />);

    const select = screen.getByLabelText(/Template:/i) as HTMLSelectElement;
    const textarea = screen.getByPlaceholderText(/name.*My Agent/i) as HTMLTextAreaElement;

    // Initially empty
    expect(textarea.value).toBe('');

    // Select basic template
    fireEvent.change(select, { target: { value: 'basic' } });

    // Should populate textarea with template
    expect(textarea.value).toContain('My Agent');
    expect(textarea.value).toContain('1.0.0');
    expect(JSON.parse(textarea.value)).toHaveProperty('name');
  });

  test('clear button resets form', () => {
    render(<SandboxClient />);

    const textarea = screen.getByPlaceholderText(/name.*My Agent/i) as HTMLTextAreaElement;
    const clearButton = screen.getByRole('button', { name: /Clear/i });
    const validateButton = screen.getByRole('button', { name: /^Validate$/i });

    // Add some content and validate
    fireEvent.change(textarea, { target: { value: '{"name": "Test"}' } });
    fireEvent.click(validateButton);

    // Should have validation results (check for at least one error)
    expect(screen.getAllByText(/Missing required field/i).length).toBeGreaterThan(0);

    // Click clear
    fireEvent.click(clearButton);

    // Should reset everything
    expect(textarea.value).toBe('');
    expect(screen.queryByText(/Missing required field/i)).not.toBeInTheDocument();
  });
});
