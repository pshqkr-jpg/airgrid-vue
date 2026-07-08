import type { ColumnDef, ViewState } from "./types";
declare const _default: <TRow extends Record<string, any>>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: __VLS_PrettifyLocal<Pick<Partial<{}> & Omit<{
        readonly onCellEdit?: ((rowId: string, columnId: string, value: unknown) => any) | undefined;
        readonly onRowClick?: ((row: TRow) => any) | undefined;
        readonly "onUpdate:viewState"?: ((v: ViewState) => any) | undefined;
    } & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, never>, "onCellEdit" | "onRowClick" | "onUpdate:viewState"> & {
        data: TRow[];
        columns: ColumnDef<TRow>[];
        rowKey: keyof TRow & string;
        height?: number | string;
        estimateRowHeight?: number;
        filterPersistKey?: string;
        viewState?: ViewState;
    } & Partial<{}>> & import("vue").PublicProps;
    expose(exposed: import("vue").ShallowUnwrapRef<{}>): void;
    attrs: any;
    slots: {
        [x: string]: ((props: {
            row: TRow;
            value: unknown;
            column: import("@tanstack/table-core").Column<TRow, unknown>;
            cell: import("@tanstack/table-core").Cell<TRow, unknown>;
        }) => any) | undefined;
    };
    emit: ((evt: "cellEdit", rowId: string, columnId: string, value: unknown) => void) & ((evt: "rowClick", row: TRow) => void) & ((evt: "update:viewState", v: ViewState) => void);
}>) => import("vue").VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
export default _default;
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};
