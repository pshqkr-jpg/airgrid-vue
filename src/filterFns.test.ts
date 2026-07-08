import { describe, it, expect } from "vitest";
import { pickFilterFn, isTextFilterActive, isNumberFilterActive } from "./filterFns";

const rowOf = (v: unknown) => ({ getValue: (_: string) => v }) as any;

describe("textFilter", () => {
  const fn = pickFilterFn("text")!;
  it("contains (legacy string)", () => {
    expect(fn(rowOf("Hello"), "c", "ell")).toBe(true);
    expect(fn(rowOf("Hello"), "c", "xyz")).toBe(false);
  });
  it("isEmpty / isNotEmpty", () => {
    expect(fn(rowOf(""), "c", { op: "isEmpty" })).toBe(true);
    expect(fn(rowOf("x"), "c", { op: "isNotEmpty" })).toBe(true);
  });
  it("startsWith / endsWith / is / isNot / notContains", () => {
    expect(fn(rowOf("winipic"), "c", { op: "startsWith", value: "win" })).toBe(true);
    expect(fn(rowOf("winipic"), "c", { op: "endsWith", value: "pic" })).toBe(true);
    expect(fn(rowOf("A"), "c", { op: "is", value: "a" })).toBe(true);
    expect(fn(rowOf("A"), "c", { op: "isNot", value: "b" })).toBe(true);
    expect(fn(rowOf("abc"), "c", { op: "notContains", value: "z" })).toBe(true);
  });
});

describe("numberRangeFilter", () => {
  const fn = pickFilterFn("numberRange")!;
  it("between (legacy min/max)", () => {
    expect(fn(rowOf(5), "n", { min: 1, max: 10 })).toBe(true);
    expect(fn(rowOf(50), "n", { min: 1, max: 10 })).toBe(false);
  });
  it("eq/neq/lt/gt/lte/gte", () => {
    expect(fn(rowOf(5), "n", { op: "eq", value: 5 })).toBe(true);
    expect(fn(rowOf(5), "n", { op: "gt", value: 4 })).toBe(true);
    expect(fn(rowOf(5), "n", { op: "lte", value: 5 })).toBe(true);
  });
});

describe("select / boolean", () => {
  it("select any-of", () => {
    const fn = pickFilterFn("select")!;
    expect(fn(rowOf("P"), "s", ["P", "PA"])).toBe(true);
    expect(fn(rowOf("X"), "s", ["P", "PA"])).toBe(false);
    expect(fn(rowOf("X"), "s", [])).toBe(true);
  });
  it("boolean", () => {
    const fn = pickFilterFn("boolean")!;
    expect(fn(rowOf(true), "b", true)).toBe(true);
    expect(fn(rowOf(true), "b", "any")).toBe(true);
  });
});

describe("active detectors", () => {
  it("text/number active", () => {
    expect(isTextFilterActive("x")).toBe(true);
    expect(isTextFilterActive("")).toBe(false);
    expect(isNumberFilterActive({ min: 1 })).toBe(true);
    expect(isNumberFilterActive({})).toBe(false);
  });
});
