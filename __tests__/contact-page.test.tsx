/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactPage from "@/app/contact/page";

jest.setTimeout(10_000);

// ---- Browser API polyfills commonly used by UI libs ----
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

// ---- Next.js shims ----

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

describe.skip("Contact Page", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("renders contact page without crashing", () => {
    const { container } = render(<ContactPage />);
    expect(container).toBeInTheDocument();
  });

  test("displays page title and description", () => {
    render(<ContactPage />);
    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
    expect(screen.getByText("We'd love to hear from you")).toBeInTheDocument();
  });

  test("renders contact form with all required fields", () => {
    render(<ContactPage />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  test("subject dropdown contains correct options", () => {
    render(<ContactPage />);
    
    const subjectSelect = screen.getByLabelText(/subject/i) as HTMLSelectElement;
    const options = Array.from(subjectSelect.options).map(opt => opt.value);
    
    expect(options).toContain("general");
    expect(options).toContain("support");
    expect(options).toContain("partnership");
    expect(options).toContain("enterprise");
    expect(options).toContain("bug-report");
  });

  test("displays contact information cards", () => {
    render(<ContactPage />);
    
    expect(screen.getByText("Contact Info")).toBeInTheDocument();
    expect(screen.getByText("support@foragents.dev")).toBeInTheDocument();
    expect(screen.getByText("Join our Discord")).toBeInTheDocument();
    expect(screen.getByText(/GitHub Discussions/i)).toBeInTheDocument();
  });

  test("displays office hours section", () => {
    render(<ContactPage />);
    
    expect(screen.getByText("Office Hours")).toBeInTheDocument();
    expect(screen.getByText("Our team responds within 24 hours")).toBeInTheDocument();
  });

  test("displays location card", () => {
    render(<ContactPage />);
    
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Remote-first, Vancouver Island, BC, Canada")).toBeInTheDocument();
  });

  test("displays FAQ quick links", () => {
    render(<ContactPage />);
    
    expect(screen.getByText("Quick FAQ")).toBeInTheDocument();
    expect(screen.getByText("What is forAgents.dev?")).toBeInTheDocument();
    expect(screen.getByText("Who is forAgents.dev for?")).toBeInTheDocument();
    expect(screen.getByText("How does forAgents.dev work?")).toBeInTheDocument();
    expect(screen.getByText("View all FAQ →")).toBeInTheDocument();
  });

  test("form submission shows success message", async () => {
    render(<ContactPage />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: "general" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "This is a test message" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText("Message sent!")).toBeInTheDocument();
      expect(screen.getByText("Thank you for reaching out. We'll get back to you soon.")).toBeInTheDocument();
    });
  });

  test("form resets after successful submission", async () => {
    render(<ContactPage />);
    
    // Fill out and submit the form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: "general" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "This is a test message" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    // Fast-forward time to trigger form reset
    jest.advanceTimersByTime(3000);

    // Wait for form to reappear
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(nameInput.value).toBe("");
      expect(emailInput.value).toBe("");
    });
  });

  test("all external links have correct attributes", () => {
    render(<ContactPage />);
    
    const externalLinks = screen.getAllByRole("link").filter(link => 
      link.getAttribute("href")?.startsWith("http") || 
      link.getAttribute("href")?.startsWith("mailto:")
    );

    externalLinks.forEach(link => {
      if (link.getAttribute("href")?.startsWith("http")) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    });
  });

  test("includes structured data for SEO", () => {
    const { container } = render(<ContactPage />);
    
    const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLdScript).toBeInTheDocument();
    
    if (jsonLdScript?.textContent) {
      const structuredData = JSON.parse(jsonLdScript.textContent);
      expect(structuredData["@type"]).toBe("ContactPage");
      expect(structuredData.url).toBe("https://foragents.dev/contact");
    }
  });
});
