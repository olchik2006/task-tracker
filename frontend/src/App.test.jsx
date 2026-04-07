import { describe, it, expect } from "vitest";

describe("App", () => {
  it("should pass basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should work with strings", () => {
    expect("task tracker").toContain("task");
  });
});
