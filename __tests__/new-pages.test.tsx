/** @jest-environment jsdom */

import React from 'react';
import { render } from '@testing-library/react';

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

import AboutPage from '@/app/about/page';
import CareersPage from '@/app/careers/page';
import CommunityPage from '@/app/community/page';
import EventsPage from '@/app/events/page';
import GlossaryPage from '@/app/glossary/page';
import LearnPage from '@/app/learn/page';
import PressPage from '@/app/press/page';
import ResourcesPage from '@/app/resources/page';
import SecurityPage from '@/app/security/page';
import ShowcasePage from '@/app/showcase/page';
import SupportPage from '@/app/support/page';

describe('New Pages Render Tests', () => {
  test('About page renders without crashing', () => {
    const { container } = render(<AboutPage />);
    expect(container).toBeInTheDocument();
  });

  test('Careers page renders without crashing', () => {
    const { container } = render(<CareersPage />);
    expect(container).toBeInTheDocument();
  });

  test('Community page renders without crashing', () => {
    const { container } = render(<CommunityPage />);
    expect(container).toBeInTheDocument();
  });

  test('Events page renders without crashing', () => {
    const { container } = render(<EventsPage />);
    expect(container).toBeInTheDocument();
  });

  test('Glossary page renders without crashing', () => {
    const { container } = render(<GlossaryPage />);
    expect(container).toBeInTheDocument();
  });

  test('Learn page renders without crashing', () => {
    const { container } = render(<LearnPage />);
    expect(container).toBeInTheDocument();
  });

  test('Press page renders without crashing', () => {
    const { container } = render(<PressPage />);
    expect(container).toBeInTheDocument();
  });

  test('Resources page renders without crashing', () => {
    const { container } = render(<ResourcesPage />);
    expect(container).toBeInTheDocument();
  });

  test('Security page renders without crashing', () => {
    const { container } = render(<SecurityPage />);
    expect(container).toBeInTheDocument();
  });

  test('Showcase page renders without crashing', () => {
    const { container } = render(<ShowcasePage />);
    expect(container).toBeInTheDocument();
  });

  test('Support page renders without crashing', () => {
    const { container } = render(<SupportPage />);
    expect(container).toBeInTheDocument();
  });
});
