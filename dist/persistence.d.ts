import type { SortingState, ColumnFiltersState, VisibilityState, ColumnOrderState, ColumnSizingState } from "@tanstack/vue-table";
export type PersistedState = {
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    columnVisibility: VisibilityState;
    columnOrder: ColumnOrderState;
    columnSizing: ColumnSizingState;
};
export declare function loadState(key: string): PersistedState | null;
export declare function saveState(key: string, state: PersistedState): void;
export declare function clearState(key: string): void;
export declare function mergeColumnOrder(persisted: string[] | undefined, defIds: string[]): string[];
export declare function mergeColumnVisibility(persisted: VisibilityState | undefined, cols: {
    id: string;
    defaultVisible?: boolean;
}[]): VisibilityState;
