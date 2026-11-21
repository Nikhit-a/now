import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import NotificationPanel from "../components/NotificationPanel";

describe("NotificationPanel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders notification bell button", () => {
    render(<NotificationPanel />);
    const bellBtn = screen.getByTitle("Notifications");
    expect(bellBtn).toBeDefined();
  });

  it("opens the panel when bell is clicked and displays seed notifications", () => {
    render(<NotificationPanel />);
    const bellBtn = screen.getByTitle("Notifications");
    fireEvent.click(bellBtn);

    expect(screen.getByText("Welcome to CareerInfinity!")).toBeDefined();
    expect(screen.getByText("Profile updated")).toBeDefined();
  });

  it("allows marking all as read", () => {
    render(<NotificationPanel />);
    fireEvent.click(screen.getByTitle("Notifications"));

    const markAllBtn = screen.getByTitle("Mark all as read");
    expect(markAllBtn).toBeDefined();
    fireEvent.click(markAllBtn);

    // After marking all read, the "Mark all as read" button disappears because unread is 0
    expect(screen.queryByTitle("Mark all as read")).toBeNull();
  });

  it("allows clearing all notifications", () => {
    render(<NotificationPanel />);
    fireEvent.click(screen.getByTitle("Notifications"));

    const clearAllBtn = screen.getByTitle("Clear all notifications");
    fireEvent.click(clearAllBtn);

    expect(screen.getByText("No notifications")).toBeDefined();
  });
});
