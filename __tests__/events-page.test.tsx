/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/app/events/events-client", () => ({
  EventsClient: () => (
    <div>
      <h1>Events & Community</h1>
      <p>Mock events client</p>
    </div>
  ),
}));

import EventsPage from "@/app/events/page";

describe("Events page", () => {
  test("renders events client", () => {
    render(<EventsPage />);
    expect(screen.getByRole("heading", { name: /events & community/i })).toBeInTheDocument();
    expect(screen.getByText("Mock events client")).toBeInTheDocument();
  });
});
