/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MigratePage from "@/app/migrate/page";

jest.setTimeout(10_000);

// ---- Browser API polyfills ----
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

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
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

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/migrate",
  useParams: () => ({}),
}));

describe("/migrate page", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test("renders without crashing", () => {
    const { container } = render(<MigratePage />);
    expect(container).toBeInTheDocument();
  });

  test("displays hero section with title", () => {
    render(<MigratePage />);
    expect(screen.getByText("Migrate to forAgents.dev")).toBeInTheDocument();
    expect(screen.getByText(/Step-by-step guides with progress tracking/i)).toBeInTheDocument();
  });

  test("displays all four migration guide tabs", () => {
    render(<MigratePage />);
    const langchainTabs = screen.getAllByText("From LangChain");
    const crewaiTabs = screen.getAllByText("From CrewAI");
    const customTabs = screen.getAllByText("From Custom Framework");
    const v2Tabs = screen.getAllByText("Upgrading v1 to v2");
    
    expect(langchainTabs.length).toBeGreaterThan(0);
    expect(crewaiTabs.length).toBeGreaterThan(0);
    expect(customTabs.length).toBeGreaterThan(0);
    expect(v2Tabs.length).toBeGreaterThan(0);
  });

  test("displays estimated time for active guide", () => {
    render(<MigratePage />);
    // LangChain is the default active tab
    expect(screen.getByText("2-4 hours")).toBeInTheDocument();
  });

  test("displays prerequisites section", () => {
    render(<MigratePage />);
    expect(screen.getByText("📋 Prerequisites")).toBeInTheDocument();
  });

  test("displays migration steps section", () => {
    render(<MigratePage />);
    expect(screen.getByText("🚀 Migration Steps")).toBeInTheDocument();
  });

  test("displays common pitfalls section", () => {
    render(<MigratePage />);
    expect(screen.getByText("⚠️ Common Pitfalls")).toBeInTheDocument();
  });

  test("displays why migrate section", () => {
    render(<MigratePage />);
    expect(screen.getByText("Why Migrate?")).toBeInTheDocument();
    expect(screen.getByText("Faster Development")).toBeInTheDocument();
    expect(screen.getByText("Less Maintenance")).toBeInTheDocument();
    expect(screen.getByText("Better Ecosystem")).toBeInTheDocument();
    expect(screen.getByText("Framework Agnostic")).toBeInTheDocument();
  });

  test("displays help CTA section", () => {
    render(<MigratePage />);
    expect(screen.getByText("Need Help Migrating?")).toBeInTheDocument();
    expect(screen.getByText("Get Migration Support →")).toBeInTheDocument();
    expect(screen.getByText("Browse Guides")).toBeInTheDocument();
  });

  test("switches between guide tabs", () => {
    render(<MigratePage />);
    
    // Default is LangChain
    expect(screen.getByText("2-4 hours")).toBeInTheDocument();
    
    // Click CrewAI tab
    const crewAITab = screen.getByText("From CrewAI");
    fireEvent.click(crewAITab);
    
    // Should show CrewAI estimated time
    expect(screen.getByText("3-5 hours")).toBeInTheDocument();
  });

  test("displays progress bar for active guide", () => {
    render(<MigratePage />);
    const progressElements = screen.getAllByText(/Progress/i);
    expect(progressElements.length).toBeGreaterThan(0);
    // Initial progress should be 0%
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  test("step checkboxes are interactive", () => {
    render(<MigratePage />);
    
    // Find the first checkbox (step checkbox)
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
    
    const firstCheckbox = checkboxes[0];
    expect(firstCheckbox).not.toBeChecked();
    
    // Click the checkbox
    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();
  });

  test("displays code examples with before/after", () => {
    render(<MigratePage />);
    const beforeElements = screen.getAllByText(/Before:/i);
    const afterElements = screen.getAllByText(/After:/i);
    expect(beforeElements.length).toBeGreaterThan(0);
    expect(afterElements.length).toBeGreaterThan(0);
  });

  test("progress persists in localStorage", () => {
    const { rerender } = render(<MigratePage />);
    
    // Click a checkbox
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    
    // Check localStorage was updated
    const saved = localStorageMock.getItem("migration-progress");
    expect(saved).toBeTruthy();
    
    // Rerender (simulating page reload)
    rerender(<MigratePage />);
    
    // Checkbox should still be checked
    const checkboxesAfterRerender = screen.getAllByRole("checkbox");
    expect(checkboxesAfterRerender[0]).toBeChecked();
  });

  test("displays completion message when all steps checked", () => {
    render(<MigratePage />);
    
    // Get all checkboxes for the current guide
    const checkboxes = screen.getAllByRole("checkbox");
    
    // Check all boxes
    checkboxes.forEach((checkbox) => {
      if (!checkbox.hasAttribute("checked")) {
        fireEvent.click(checkbox);
      }
    });
    
    // Should show completion message
    expect(screen.getByText("Migration Complete!")).toBeInTheDocument();
    expect(screen.getByText("Browse Skills →")).toBeInTheDocument();
  });

  test("displays step numbers correctly", () => {
    render(<MigratePage />);
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });

  test("shows completed badge on checked steps", () => {
    render(<MigratePage />);
    
    // Click first checkbox
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    
    // Should show "Completed" badge
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});
