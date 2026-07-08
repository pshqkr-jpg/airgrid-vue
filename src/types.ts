// 공유 타입.

import type { VNode } from "vue";

export type FilterType =
  | "text"          // contains (case-insensitive)
  | "numberRange"   // min / max
  | "select"        // multi-select (any-of)
  | "boolean";

export type ColumnDef<TRow> = {
  id: string;
  header: string;
  accessorKey: keyof TRow & string;
  /** 필터 타입. 없으면 컬럼 필터 ✗. */
  filterType?: FilterType;
  /** filterType="select" 일 때의 옵션 list. 없으면 데이터에서 자동 추출. */
  selectOptions?: string[];
  /** 인라인 편집 가능 여부. true 면 cell 이 input. */
  editable?: boolean;
  /** 셀 커스텀 렌더. 없으면 raw value. */
  cell?: (row: TRow) => VNode | string;
  /** 헤더 우측 정렬 여부 (숫자 컬럼 등). */
  align?: "left" | "right";
  /** 기본 표시 여부. false 면 hide 메뉴에서 활성화 시까지 안 보임. */
  defaultVisible?: boolean;
  /** CSS grid template column value. e.g. "minmax(120px, 1fr)" */
  width?: string;
  /** 최소 폭(px). 드래그 리사이즈 하한 + 렌더 시 클램프. 미설정 시 기본 하한(48px). */
  minWidth?: number;
  /** 정렬 가능 여부. 기본 true. */
  sortable?: boolean;
};

/** TanStack Table column.meta 에 박는 airgrid 메타 정보. */
export type AirgridMeta = {
  align?: "left" | "right";
  width?: string;
  minWidth?: number;
  filterType?: FilterType;
  selectOptions?: string[];
};

// ─── 필터 연산자 (Airtable 스타일) ─────────────────────────────────
//
// column.setFilterValue 에 들어가는 객체 형태. backward compat:
//   - text:        문자열만 들어오면 op=contains 로 자동 매핑
//   - numberRange: { min, max } 만 들어오면 op=between 으로 자동 매핑
//   - select / boolean: 변경 없음 (그대로 배열 / boolean).

export type TextFilterOp =
  | "contains" | "notContains"
  | "is" | "isNot"
  | "startsWith" | "endsWith"
  | "isEmpty" | "isNotEmpty";

export type TextFilter = { op?: TextFilterOp; value?: string };

export type NumberFilterOp =
  | "between" | "eq" | "neq"
  | "lt" | "gt" | "lte" | "gte"
  | "isEmpty" | "isNotEmpty";

export type NumberFilter = {
  op?: NumberFilterOp;
  value?: number;
  min?: number;
  max?: number;
};

// ─── View 시스템 (Phase A3 + A4) ─────────────────────────────────
//
// ViewState — DataGrid 의 사용자 설정 (정렬 / 필터 / 보이는 컬럼 /
// 컬럼 순서 / 컬럼 폭). 호스트 앱이 영속화 (서버 또는 localStorage) 한 후
// DataGrid 에 주입.
//
// 단방향(one-way) 계약 — v-model 아님: viewState prop 은 마운트 시점의
// 초기 상태만 시딩하고, 이후 사용자의 조작은 update:viewState 로 emit 된다.
// 마운트 이후 viewState prop 을 바꿔도 그리드에 반응적으로 반영되지 않는다
// (emit ↔ prop 갱신 피드백 루프를 피하기 위한 설계). 런타임에 다른 저장된
// 뷰로 전환하려면 :key 를 바꿔 그리드를 remount 해야 한다.

import type {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/vue-table";

export type ViewState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  /** 컬럼 순서. 빈 배열이면 ColumnDef 정의 순서 사용. */
  columnOrder?: string[];
  /** 컬럼 폭 (px) — 사용자가 헤더 우측 핸들로 드래그한 값. 미설정 컬럼은 ColumnDef.width 사용. */
  columnSizing?: Record<string, number>;
};

export const EMPTY_VIEW_STATE: ViewState = {
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  columnOrder: [],
  columnSizing: {},
};
