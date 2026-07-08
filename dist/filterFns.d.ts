import type { FilterFn } from "@tanstack/vue-table";
export declare function isTextFilterActive(raw: unknown): boolean;
export declare function isNumberFilterActive(raw: unknown): boolean;
export declare const textFilter: FilterFn<any>;
export declare const numberRangeFilter: FilterFn<any>;
export declare const selectFilter: FilterFn<any>;
export declare const booleanFilter: FilterFn<any>;
export declare function pickFilterFn(filterType: string | undefined): FilterFn<any> | undefined;
