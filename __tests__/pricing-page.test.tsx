/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';

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

import PricingPage from '@/app/pricing/page';

describe('Pricing page', () => {
  test('renders pricing tiers', () => {
    render(<PricingPage />);

    // Should have at least one element mentioning the price
    expect(screen.getAllByText(/\$9/)[0]).toBeInTheDocument();
  });
});
