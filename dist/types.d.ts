import type { VNode } from "vue";
export type FilterType = "text" | "numberRange" | "select" | "boolean";
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
export type TextFilterOp = "contains" | "notContains" | "is" | "isNot" | "startsWith" | "endsWith" | "isEmpty" | "isNotEmpty";
export type TextFilter = {
    op?: TextFilterOp;
    value?: string;
};
export type NumberFilterOp = "between" | "eq" | "neq" | "lt" | "gt" | "lte" | "gte" | "isEmpty" | "isNotEmpty";
export type NumberFilter = {
    op?: NumberFilterOp;
    value?: number;
    min?: number;
    max?: number;
};
import type { SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/vue-table";
export type ViewState = {
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    columnVisibility: VisibilityState;
    /** 컬럼 순서. 빈 배열이면 ColumnDef 정의 순서 사용. */
    columnOrder?: string[];
    /** 컬럼 폭 (px) — 사용자가 헤더 우측 핸들로 드래그한 값. 미설정 컬럼은 ColumnDef.width 사용. */
    columnSizing?: Record<string, number>;
};
export declare const EMPTY_VIEW_STATE: ViewState;
