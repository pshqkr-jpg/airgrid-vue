<script setup lang="ts" generic="TRow extends Record<string, any>">
// airgrid DataGrid 코어 — 가상 스크롤 + CSS grid + vue-table 바인딩.
// 필터/정렬 UI, 편집, hide 메뉴, 컬럼 reorder 는 후속 task 에서 추가.
import { ref, computed, watch, shallowRef } from "vue";
import { useVueTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  FlexRender, type ColumnDef as TSCol, type SortingState, type ColumnFiltersState,
  type VisibilityState, type ColumnOrderState, type ColumnSizingState } from "@tanstack/vue-table";
import { useVirtualizer } from "@tanstack/vue-virtual";
import type { ColumnDef, ViewState, AirgridMeta } from "./types";
import { pickFilterFn } from "./filterFns";
import { loadState, saveState } from "./persistence";

const props = defineProps<{
  data: TRow[]; columns: ColumnDef<TRow>[]; rowKey: keyof TRow & string;
  height?: number | string; estimateRowHeight?: number;
  filterPersistKey?: string; viewState?: ViewState;
}>();
const emit = defineEmits<{
  cellEdit: [rowId: string, columnId: string, value: unknown];
  rowClick: [row: TRow];
  "update:viewState": [v: ViewState];
}>();

const init = props.filterPersistKey ? loadState(props.filterPersistKey) : null;
const sorting = ref<SortingState>(init?.sorting ?? props.viewState?.sorting ?? []);
const columnFilters = ref<ColumnFiltersState>(init?.columnFilters ?? props.viewState?.columnFilters ?? []);
const columnVisibility = ref<VisibilityState>(init?.columnVisibility
  ?? Object.fromEntries(props.columns.filter(c => c.defaultVisible === false).map(c => [c.id, false])));
const columnOrder = ref<ColumnOrderState>(init?.columnOrder ?? props.columns.map(c => c.id));
const columnSizing = ref<ColumnSizingState>(init?.columnSizing ?? {});

const tsColumns = computed<TSCol<TRow>[]>(() => props.columns.map((c) => ({
  id: c.id, accessorKey: c.accessorKey, header: c.header,
  enableSorting: c.sortable !== false,
  filterFn: pickFilterFn(c.filterType) as any,
  meta: { align: c.align, width: c.width, minWidth: c.minWidth, filterType: c.filterType, selectOptions: c.selectOptions, editable: c.editable, cell: c.cell } as AirgridMeta,
})));

const table = useVueTable({
  get data() { return props.data; },
  get columns() { return tsColumns.value; },
  state: {
    get sorting() { return sorting.value; }, get columnFilters() { return columnFilters.value; },
    get columnVisibility() { return columnVisibility.value; }, get columnOrder() { return columnOrder.value; },
    get columnSizing() { return columnSizing.value; },
  },
  onSortingChange: (u) => { sorting.value = typeof u === "function" ? u(sorting.value) : u; },
  onColumnFiltersChange: (u) => { columnFilters.value = typeof u === "function" ? u(columnFilters.value) : u; },
  onColumnVisibilityChange: (u) => { columnVisibility.value = typeof u === "function" ? u(columnVisibility.value) : u; },
  onColumnOrderChange: (u) => { columnOrder.value = typeof u === "function" ? u(columnOrder.value) : u; },
  onColumnSizingChange: (u) => { columnSizing.value = typeof u === "function" ? u(columnSizing.value) : u; },
  getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(),
  getRowId: (r) => String((r as any)[props.rowKey]),
});

watch([sorting, columnFilters, columnVisibility, columnOrder, columnSizing], () => {
  const v: ViewState = { sorting: sorting.value, columnFilters: columnFilters.value,
    columnVisibility: columnVisibility.value, columnOrder: columnOrder.value, columnSizing: columnSizing.value };
  if (props.filterPersistKey) saveState(props.filterPersistKey, v as any);
  emit("update:viewState", v);
}, { deep: true });

const scrollEl = shallowRef<HTMLElement | null>(null);
const rowVirtualizer = useVirtualizer(computed(() => ({
  count: table.getRowModel().rows.length,
  getScrollElement: () => scrollEl.value,
  estimateSize: () => props.estimateRowHeight ?? 36, overscan: 10,
})));

// jsdom 환경에서는 컨테이너 실 높이가 0 이라 virtualizer 가 아무 항목도
// 보고하지 않을 수 있음 — 그 경우 전체 row 를 렌더해 테스트/무레이아웃
// 환경에서도 내용이 보이게 fallback.
const visibleRows = computed(() => {
  const items = rowVirtualizer.value.getVirtualItems();
  const allRows = table.getRowModel().rows;
  if (items.length === 0 && allRows.length > 0) {
    return allRows.map((row, index) => ({ key: row.id, index, start: index * (props.estimateRowHeight ?? 36), row }));
  }
  return items.map((vi) => ({ key: vi.key, index: vi.index, start: vi.start, row: allRows[vi.index] }));
});
</script>

<template>
  <div ref="scrollEl" class="airgrid" :style="{ height: props.height ?? 600, overflow: 'auto', position: 'relative' }" role="grid">
    <div
      class="airgrid-header-row"
      role="row"
      :style="{ display: 'grid', gridTemplateColumns: table.getVisibleLeafColumns().map(c => (c.columnDef.meta as AirgridMeta | undefined)?.width ?? 'minmax(80px, 1fr)').join(' '), position: 'sticky', top: 0 }"
    >
      <div
        v-for="header in table.getHeaderGroups()[0]?.headers ?? []"
        :key="header.id"
        :data-col="header.column.id"
        role="columnheader"
        :style="{ textAlign: (header.column.columnDef.meta as AirgridMeta | undefined)?.align === 'right' ? 'right' : 'left' }"
      >
        <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
      </div>
    </div>

    <div :style="{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
      <div
        v-for="item in visibleRows"
        :key="item.row.id"
        :data-row="item.row.id"
        role="row"
        :style="{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)`, display: 'grid', gridTemplateColumns: table.getVisibleLeafColumns().map(c => (c.columnDef.meta as AirgridMeta | undefined)?.width ?? 'minmax(80px, 1fr)').join(' ') }"
      >
        <div
          v-for="cell in item.row.getVisibleCells()"
          :key="cell.id"
          role="gridcell"
          :style="{ textAlign: (cell.column.columnDef.meta as AirgridMeta | undefined)?.align === 'right' ? 'right' : 'left' }"
        >
          <FlexRender v-if="cell.column.columnDef.cell" :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          <template v-else>{{ cell.getValue() }}</template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.airgrid {
  background: var(--airgrid-bg, #ffffff);
  border: 1px solid var(--airgrid-border, #e5e7eb);
  border-radius: 6px;
  font-size: 13px;
}
.airgrid-header-row {
  background: var(--airgrid-header-bg, #f9fafb);
  border-bottom: 1px solid var(--airgrid-border, #e5e7eb);
  z-index: 2;
}
.airgrid-header-row > div,
[role="gridcell"] {
  padding: 7px 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
[role="gridcell"] {
  border-bottom: 1px solid var(--airgrid-border-subtle, #eceef1);
}
</style>
