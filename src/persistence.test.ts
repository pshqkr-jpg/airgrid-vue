import { describe, it, expect, beforeEach } from "vitest";
import { loadState, saveState, clearState } from "./persistence";

const sample = { sorting: [{ id: "a", desc: false }], columnFilters: [], columnVisibility: { x: false }, columnOrder: ["a"], columnSizing: { a: 120 } };

describe("persistence", () => {
  beforeEach(() => window.localStorage.clear());
  it("save→load roundtrip with namespacing", () => {
    saveState("members", sample as any);
    expect(window.localStorage.getItem("airgrid:members")).toBeTruthy();
    expect(loadState("members")).toEqual(sample);
  });
  it("load missing → null", () => { expect(loadState("nope")).toBeNull(); });
  it("clear removes", () => { saveState("m", sample as any); clearState("m"); expect(loadState("m")).toBeNull(); });
  it("corrupt json → null", () => { window.localStorage.setItem("airgrid:bad", "{"); expect(loadState("bad")).toBeNull(); });
});
