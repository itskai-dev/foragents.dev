/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";

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

// Mock notifications data
jest.mock("@/data/notifications.json", () => [
  {
    id: "notif-001",
    category: "New Skills",
    title: "New Skill Available: Agent Memory Kit Pro",
    message: "An enhanced version of the Agent Memory Kit with vector search capabilities has been published.",
    timestamp: "2026-02-08T14:30:00.000Z",
    read: false,
    link: "/skills/agent-memory-kit-pro",
  },
  {
    id: "notif-002",
    category: "Security Alerts",
    title: "Security Update: OAuth2 Integration",
    message: "A security patch has been released for the OAuth2 integration. Please update your dependencies.",
    timestamp: "2026-02-07T09:15:00.000Z",
    read: true,
    link: "/changelog",
  },
]);

// Mock UI components
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    variant,
    size,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    variant?: string;
    size?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} className={className} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p className={className}>{children}</p>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 className={className}>{children}</h3>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ value, onChange, placeholder, type, id, className }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    id?: string;
    className?: string;
  }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      id={id}
      className={className}
    />
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => (
    <div data-testid="select" data-value={value}>
      {children}
    </div>
  ),
  SelectContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  SelectItem: ({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) => (
    <div data-value={value} className={className}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, id, className }: { children: React.ReactNode; id?: string; className?: string }) => (
    <button id={id} className={className}>
      {children}
    </button>
  ),
  SelectValue: () => <span>Select value</span>,
}));

jest.mock("@/components/ui/separator", () => ({
  Separator: ({ className }: { className?: string }) => <hr className={className} />,
}));

jest.mock("@/components/ui/switch", () => ({
  Switch: ({ id, checked, onCheckedChange, className }: {
    id?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    className?: string;
  }) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={className}
    />
  ),
}));

import NotificationsPage from "@/app/notifications/page";

describe.skip("Notifications Page (/notifications)", () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    global.localStorage = localStorageMock as unknown as Storage;
  });

  test("renders page title and description", () => {
    render(<NotificationsPage />);
    
    expect(screen.getByRole("heading", { name: /🔔 Notifications/i })).toBeInTheDocument();
    expect(screen.getByText(/Manage your notification preferences and view recent updates/i)).toBeInTheDocument();
  });

  test("renders all notification categories with switches", () => {
    render(<NotificationsPage />);
    
    // Check for category labels (they appear multiple times, so use getAllByText)
    const newSkills = screen.getAllByText("New Skills");
    expect(newSkills.length).toBeGreaterThan(0);
    
    const securityAlerts = screen.getAllByText("Security Alerts");
    expect(securityAlerts.length).toBeGreaterThan(0);
    
    expect(screen.getByText("Platform Updates")).toBeInTheDocument();
    expect(screen.getByText("Community Activity")).toBeInTheDocument();
    expect(screen.getByText("Weekly Digest")).toBeInTheDocument();
  });

  test("renders delivery method selector", () => {
    render(<NotificationsPage />);
    
    expect(screen.getByText("Delivery Method")).toBeInTheDocument();
    expect(screen.getByText("Delivery Channel")).toBeInTheDocument();
  });

  test("renders save preferences button", () => {
    render(<NotificationsPage />);
    
    expect(screen.getByRole("button", { name: /Save Preferences/i })).toBeInTheDocument();
  });

  test("renders recent notifications list", () => {
    render(<NotificationsPage />);
    
    expect(screen.getByText("Recent Notifications")).toBeInTheDocument();
    expect(screen.getByText("New Skill Available: Agent Memory Kit Pro")).toBeInTheDocument();
    expect(screen.getByText("Security Update: OAuth2 Integration")).toBeInTheDocument();
  });

  test("displays unread count badge when unread notifications exist", () => {
    render(<NotificationsPage />);
    
    expect(screen.getByText("1 unread")).toBeInTheDocument();
  });

  test("renders mark all as read button when unread notifications exist", () => {
    render(<NotificationsPage />);
    
    expect(screen.getByRole("button", { name: /Mark all as read/i })).toBeInTheDocument();
  });

  test("notification items link to correct destinations", () => {
    render(<NotificationsPage />);
    
    const skillLink = screen.getByRole("link", { name: /New Skill Available: Agent Memory Kit Pro/i });
    expect(skillLink).toHaveAttribute("href", "/skills/agent-memory-kit-pro");
    
    const securityLink = screen.getByRole("link", { name: /Security Update: OAuth2 Integration/i });
    expect(securityLink).toHaveAttribute("href", "/changelog");
  });

  test("renders category descriptions", () => {
    render(<NotificationsPage />);
    
    expect(screen.getByText(/Get notified when new skill kits are published/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical security updates and advisories/i)).toBeInTheDocument();
    expect(screen.getByText(/Learn about new features, improvements/i)).toBeInTheDocument();
  });

  test("renders back to home link", () => {
    render(<NotificationsPage />);
    
    const backLink = screen.getByRole("link", { name: /← Back to Home/i });
    expect(backLink).toHaveAttribute("href", "/");
  });
});
