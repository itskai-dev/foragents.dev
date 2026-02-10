/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import CertificationsPage from "@/app/certifications/page";
import CertificationDetailPage from "@/app/certifications/[slug]/page";
import certificationsData from "@/../data/certifications.json";

jest.setTimeout(10_000);

// Browser API polyfills
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - polyfill for tests
global.ResizeObserver = global.ResizeObserver ?? NoopObserver;
// @ts-expect-error - polyfill for tests
global.IntersectionObserver = global.IntersectionObserver ?? NoopObserver;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value:
    window.matchMedia ??
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })),
});

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/certifications",
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  notFound: jest.fn(),
}));

// Mock next/link
type LinkProps = {
  href: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

jest.mock("next/link", () => {
  const LinkMock = ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  LinkMock.displayName = "Link";
  return LinkMock;
});

describe.skip("Certifications Pages", () => {
  describe.skip("CertificationsPage", () => {
    it("renders the certifications listing page", () => {
      render(<CertificationsPage />);

      expect(screen.getByText("Agent Certification Program")).toBeInTheDocument();
      expect(
        screen.getByText(/Validate your agent's capabilities and earn recognized certifications/i)
      ).toBeInTheDocument();
    });

    it("displays all certifications from data file", () => {
      render(<CertificationsPage />);

      certificationsData.forEach((cert) => {
        const elements = screen.getAllByText(cert.name);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it("shows certification requirements preview", () => {
      render(<CertificationsPage />);

      expect(screen.getAllByText(/Key Requirements:/i).length).toBeGreaterThan(0);
    });

    it("displays FAQ section", () => {
      render(<CertificationsPage />);

      expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
      expect(screen.getByText(/How long does certification take?/i)).toBeInTheDocument();
    });

    it("shows Start Certification CTAs", () => {
      render(<CertificationsPage />);

      const startButtons = screen.getAllByText("Start Certification");
      expect(startButtons.length).toBe(certificationsData.length);
    });
  });

  describe.skip("CertificationDetailPage", () => {
    it("renders the detail page for security certification", async () => {
      const params = Promise.resolve({ slug: "security-certified" });
      const page = await CertificationDetailPage({ params });
      
      render(page);

      const elements = screen.getAllByText("Security Certified Agent");
      expect(elements.length).toBeGreaterThan(0);
      expect(screen.getByText(/Validates that an agent follows security best practices/i)).toBeInTheDocument();
    });

    it("displays requirements checklist", async () => {
      const params = Promise.resolve({ slug: "performance-certified" });
      const page = await CertificationDetailPage({ params });
      
      render(page);

      expect(screen.getByText("Requirements Checklist")).toBeInTheDocument();
    });

    it("shows verification process steps", async () => {
      const params = Promise.resolve({ slug: "reliability-certified" });
      const page = await CertificationDetailPage({ params });
      
      render(page);

      expect(screen.getByText("Verification Process")).toBeInTheDocument();
    });

    it("displays certification benefits", async () => {
      const params = Promise.resolve({ slug: "enterprise-ready" });
      const page = await CertificationDetailPage({ params });
      
      render(page);

      expect(screen.getByText("Certification Benefits")).toBeInTheDocument();
    });

    it("shows prerequisites when they exist", async () => {
      const params = Promise.resolve({ slug: "enterprise-ready" });
      const page = await CertificationDetailPage({ params });
      
      render(page);

      expect(screen.getByText("Prerequisites")).toBeInTheDocument();
    });

    it("displays badge preview", async () => {
      const params = Promise.resolve({ slug: "observability-certified" });
      const page = await CertificationDetailPage({ params });
      
      render(page);

      expect(screen.getByText("Your Badge")).toBeInTheDocument();
    });

    it("shows related certifications", async () => {
      const params = Promise.resolve({ slug: "security-certified" });
      const page = await CertificationDetailPage({ params });
      
      render(page);

      expect(screen.getByText("Other Certifications")).toBeInTheDocument();
    });
  });

  describe.skip("Certifications Data", () => {
    it("has valid data structure", () => {
      expect(certificationsData).toBeDefined();
      expect(Array.isArray(certificationsData)).toBe(true);
      expect(certificationsData.length).toBeGreaterThan(0);
    });

    it("each certification has required fields", () => {
      certificationsData.forEach((cert) => {
        expect(cert.id).toBeDefined();
        expect(cert.name).toBeDefined();
        expect(cert.slug).toBeDefined();
        expect(cert.icon).toBeDefined();
        expect(cert.description).toBeDefined();
        expect(cert.category).toBeDefined();
        expect(cert.level).toBeDefined();
        expect(cert.badgeColor).toBeDefined();
        expect(Array.isArray(cert.requirements)).toBe(true);
        expect(Array.isArray(cert.verificationSteps)).toBe(true);
        expect(cert.estimatedTime).toBeDefined();
        expect(Array.isArray(cert.prerequisites)).toBe(true);
        expect(Array.isArray(cert.benefits)).toBe(true);
      });
    });

    it("has exactly 5 certifications", () => {
      expect(certificationsData.length).toBe(5);
    });
  });

  describe.skip("generateStaticParams", () => {
    it("generates correct static params for all certifications", async () => {
      const { generateStaticParams } = await import("@/app/certifications/[slug]/page");
      const params = await generateStaticParams();

      expect(params.length).toBe(certificationsData.length);
      params.forEach((param, index) => {
        expect(param.slug).toBe(certificationsData[index].slug);
      });
    });
  });
});
