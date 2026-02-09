/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ForumPage from "../src/app/forum/page";
import ForumThreadPage from "../src/app/forum/[id]/page";

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

const mockForumData = {
  threads: [
    {
      id: "thread-001",
      title: "Test Thread 1",
      author: "TestAuthor1",
      category: "general",
      tags: ["test", "example"],
      created_at: "2026-02-05T10:30:00Z",
      last_activity: "2026-02-08T14:22:00Z",
      reply_count: 5,
      view_count: 100,
      body: "This is a test thread body",
      replies: [
        {
          id: "reply-001",
          author: "Replier1",
          created_at: "2026-02-05T11:00:00Z",
          body: "This is a test reply"
        }
      ]
    },
    {
      id: "thread-002",
      title: "Test Thread 2",
      author: "TestAuthor2",
      category: "help",
      tags: ["help", "question"],
      created_at: "2026-02-06T09:15:00Z",
      last_activity: "2026-02-07T16:45:00Z",
      reply_count: 3,
      view_count: 50,
      body: "This is another test thread",
      replies: []
    }
  ]
};

jest.mock("fs", () => ({
  readFileSync: jest.fn(() => JSON.stringify(mockForumData)),
}));

jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
}));

describe("Forum List Page", () => {
  it("renders the forum page", async () => {
    const { container } = render(await ForumPage());
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", async () => {
    render(await ForumPage());
    expect(screen.getByText("Community Forum")).toBeInTheDocument();
  });

  it("displays the page description", async () => {
    render(await ForumPage());
    expect(
      screen.getByText(/Connect with agent builders/i)
    ).toBeInTheDocument();
  });

  it("displays category filter buttons", async () => {
    render(await ForumPage());
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Help")).toBeInTheDocument();
    expect(screen.getByText("Showcase")).toBeInTheDocument();
    expect(screen.getByText("Feature Requests")).toBeInTheDocument();
  });

  it("displays thread titles", async () => {
    render(await ForumPage());
    expect(screen.getByText("Test Thread 1")).toBeInTheDocument();
    expect(screen.getByText("Test Thread 2")).toBeInTheDocument();
  });

  it("displays thread metadata", async () => {
    render(await ForumPage());
    expect(screen.getByText("TestAuthor1")).toBeInTheDocument();
    expect(screen.getByText("100 views")).toBeInTheDocument();
  });

  it("displays thread tags", async () => {
    render(await ForumPage());
    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByText("example")).toBeInTheDocument();
  });

  it("displays reply counts", async () => {
    render(await ForumPage());
    const replyBadges = screen.getAllByText("5");
    expect(replyBadges.length).toBeGreaterThan(0);
  });

  it("allows filtering by category", async () => {
    render(await ForumPage());
    const helpButton = screen.getByText("Help");
    fireEvent.click(helpButton);
    expect(screen.getByText("Test Thread 2")).toBeInTheDocument();
  });
});

describe("Forum Thread Detail Page", () => {
  it("renders the thread detail page", async () => {
    const { container } = render(
      await ForumThreadPage({ params: Promise.resolve({ id: "thread-001" }) })
    );
    expect(container).toBeInTheDocument();
  });

  it("displays the thread title", async () => {
    render(
      await ForumThreadPage({ params: Promise.resolve({ id: "thread-001" }) })
    );
    expect(screen.getByText("Test Thread 1")).toBeInTheDocument();
  });

  it("displays the thread body", async () => {
    render(
      await ForumThreadPage({ params: Promise.resolve({ id: "thread-001" }) })
    );
    expect(screen.getByText("This is a test thread body")).toBeInTheDocument();
  });

  it("displays thread metadata", async () => {
    render(
      await ForumThreadPage({ params: Promise.resolve({ id: "thread-001" }) })
    );
    expect(screen.getByText("TestAuthor1")).toBeInTheDocument();
    expect(screen.getByText("100 views")).toBeInTheDocument();
    expect(screen.getByText("5 replies")).toBeInTheDocument();
  });

  it("displays thread category badge", async () => {
    render(
      await ForumThreadPage({ params: Promise.resolve({ id: "thread-001" }) })
    );
    expect(screen.getByText("general")).toBeInTheDocument();
  });

  it("displays thread tags", async () => {
    render(
      await ForumThreadPage({ params: Promise.resolve({ id: "thread-001" }) })
    );
    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByText("example")).toBeInTheDocument();
  });

  it("displays the replies section", async () => {
    render(
      await ForumThreadPage({ params: Promise.resolve({ id: "thread-001" }) })
    );
    expect(screen.getByText(/Replies \(5\)/)).toBeInTheDocument();
  });

  it("displays individual replies", async () => {
    render(
      await ForumThreadPage({ params: Promise.resolve({ id: "thread-001" }) })
    );
    expect(screen.getByText("Replier1")).toBeInTheDocument();
    expect(screen.getByText("This is a test reply")).toBeInTheDocument();
  });

  it("displays back to forum link", async () => {
    render(
      await ForumThreadPage({ params: Promise.resolve({ id: "thread-001" }) })
    );
    expect(screen.getByText("← Back to forum")).toBeInTheDocument();
  });

  it("displays sign in CTA", async () => {
    render(
      await ForumThreadPage({ params: Promise.resolve({ id: "thread-001" }) })
    );
    expect(screen.getByText("Sign In to Reply")).toBeInTheDocument();
  });
});
