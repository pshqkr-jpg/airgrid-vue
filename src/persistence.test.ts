import { describe, it, expect, beforeEach } from "vitest";
import { loadState, saveState, clearState, mergeColumnOrder, mergeColumnVisibility } from "./persistence";

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

describe("mergeColumnOrder", () => {
  const def = ["vipflag", "vipcd", "vipnm", "grade"]; // 현재 컬럼 정의 순서
  it("저장분 없으면 [] (정의 순서 사용)", () => {
    expect(mergeColumnOrder([], def)).toEqual([]);
    expect(mergeColumnOrder(undefined, def)).toEqual([]);
  });
  it("저장분에 없던 새 컬럼(vipcd)을 정의상 앞 컬럼(vipflag) 뒤에 삽입 — 끝에 append 하지 않음", () => {
    // 유저가 저장한 순서: vipflag, vipnm, grade (vipcd 없음 — 나중에 추가된 컬럼)
    const merged = mergeColumnOrder(["vipflag", "vipnm", "grade"], def);
    expect(merged).toEqual(["vipflag", "vipcd", "vipnm", "grade"]);
  });
  it("유저가 바꾼 기존 컬럼 순서는 보존", () => {
    // 유저 순서: grade 를 맨 앞으로. vipcd 는 새 컬럼.
    const merged = mergeColumnOrder(["grade", "vipflag", "vipnm"], def);
    // grade, vipflag 순서 유지 + vipcd 는 정의상 vipflag 뒤에 삽입
    expect(merged).toEqual(["grade", "vipflag", "vipcd", "vipnm"]);
  });
  it("저장분에 있으나 사라진 컬럼은 제거", () => {
    const merged = mergeColumnOrder(["vipflag", "gone", "vipnm"], def);
    expect(merged).not.toContain("gone");
    expect(merged).toContain("vipflag");
  });
  it("정의상 맨 앞의 새 컬럼은 맨 앞에 삽입", () => {
    const merged = mergeColumnOrder(["vipcd", "vipnm"], def); // vipflag 가 새 컬럼(정의 0번)
    expect(merged[0]).toBe("vipflag");
  });
});

describe("mergeColumnVisibility", () => {
  const cols = [
    { id: "vipcd" },                        // 기본 노출
    { id: "mobile", defaultVisible: false }, // 기본 숨김
    { id: "vipnm" },
  ];
  it("저장분에 없는 기본숨김 컬럼은 숨김을 명시(끼어들어 보이는 것 방지)", () => {
    const v = mergeColumnVisibility({ vipnm: false }, cols);
    expect(v.mobile).toBe(false); // 새 기본숨김 컬럼
    expect(v.vipnm).toBe(false);  // 유저 설정 보존
  });
  it("저장분에 없는 기본노출 새 컬럼은 건드리지 않음 → 보이게 됨", () => {
    const v = mergeColumnVisibility({ vipnm: false }, cols);
    expect("vipcd" in v).toBe(false); // 명시 안 함 → TanStack 기본(visible)
  });
  it("저장분의 기존 설정은 그대로", () => {
    const v = mergeColumnVisibility({ mobile: true }, cols); // 유저가 mobile 을 보이게 해둠
    expect(v.mobile).toBe(true); // 덮어쓰지 않음
  });
});
