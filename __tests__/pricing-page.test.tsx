/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('next/link', () => {
  return ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Keep this test focused on the Pricing page shell.
jest.mock('@/components/mobile-nav', () => ({
  MobileNav: () => <nav data-testid="mobile-nav" />,
}));

jest.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

jest.mock('@/app/pricing/pricing-client', () => ({
  PricingClient: () => <main data-testid="pricing-client">Pricing</main>,
}));

import PricingPage from '@/app/pricing/page';

describe('Pricing page', () => {
  test('renders', () => {
    render(<PricingPage />);

    expect(screen.getByText(/Agent Hub/i)).toBeInTheDocument();
    expect(screen.getByTestId('pricing-client')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
