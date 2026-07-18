// localStorage 기반 view persistence — sorting + columnFilters + columnVisibility.
//
// SSR / 첫 마운트에서 안전하게 localStorage 접근. 키 namespacing 으로 같은
// 도메인의 여러 grid 가 서로 덮어쓰지 않게.

import type {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ColumnOrderState,
  ColumnSizingState,
} from "@tanstack/vue-table";

export type PersistedState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  columnSizing: ColumnSizingState;
};

const PREFIX = "airgrid:";

export function loadState(key: string): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      sorting: parsed.sorting ?? [],
      columnFilters: parsed.columnFilters ?? [],
      columnVisibility: parsed.columnVisibility ?? {},
      columnOrder: parsed.columnOrder ?? [],
      columnSizing: parsed.columnSizing ?? {},
    };
  } catch {
    return null;
  }
}

export function saveState(key: string, state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(state));
  } catch {
    // quota exceeded / storage disabled — silent
  }
}

export function clearState(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

// 저장된 컬럼 순서(persisted)와 현재 컬럼 정의(defIds)를 병합한다.
// - 저장분에 있던 사라진 컬럼은 제거, 유저가 바꾼 순서는 그대로 유지.
// - 저장분에 없던 새 컬럼은 "정의상 바로 앞 컬럼" 뒤에 삽입(끝에 append 하지 않음) →
//   새 기본 컬럼이 저장된 설정이 있어도 정의 위치에 나타난다.
// 저장분이 비어있으면 [] 반환(= 정의 순서 그대로 사용, TanStack 기본).
export function mergeColumnOrder(
  persisted: string[] | undefined,
  defIds: string[],
): string[] {
  if (!persisted || persisted.length === 0) return [];
  const defSet = new Set(defIds);
  const result = persisted.filter((id) => defSet.has(id)); // 현존 컬럼만, 유저 순서 유지
  const have = new Set(result);
  for (let i = 0; i < defIds.length; i++) {
    const id = defIds[i];
    if (have.has(id)) continue; // 이미 배치됨
    // 정의상 바로 앞의 "결과에 존재하는" 컬럼 뒤에 삽입. 없으면 맨 앞(0).
    let insertAt = 0;
    for (let j = i - 1; j >= 0; j--) {
      const idx = result.indexOf(defIds[j]);
      if (idx >= 0) { insertAt = idx + 1; break; }
    }
    result.splice(insertAt, 0, id);
    have.add(id);
  }
  return result;
}

// 저장된 가시성(persisted)에 없던 새 컬럼의 기본 가시성을 채운다.
// - 새 컬럼이 defaultVisible === false 면 숨김을 명시(저장분에 없으면 TanStack 이 보이게 하는 것 방지).
// - 그 외(기본 노출) 새 컬럼은 건드리지 않음 → 보이게 됨.
// - 기존 컬럼의 유저 설정은 그대로 유지.
export function mergeColumnVisibility(
  persisted: VisibilityState | undefined,
  cols: { id: string; defaultVisible?: boolean }[],
): VisibilityState {
  const out: VisibilityState = { ...(persisted ?? {}) };
  for (const c of cols) {
    if (!(c.id in out) && c.defaultVisible === false) out[c.id] = false;
  }
  return out;
}
