<script setup lang="ts" generic="TRow extends Record<string, any>">
// airgrid DataGrid 코어 — 가상 스크롤 + CSS grid + vue-table 바인딩.
// 컬럼 reorder 는 네이티브 HTML5 드래그앤드롭(@dnd-kit 미사용) — 아래 onHeaderDragStart/onDropColumn.
import { ref, computed, watch, shallowRef, useSlots } from "vue";
import { useVueTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  FlexRender, type ColumnDef as TSCol, type CellContext, type SortingState, type ColumnFiltersState,
  type VisibilityState, type ColumnOrderState, type ColumnSizingState } from "@tanstack/vue-table";
import { useVirtualizer } from "@tanstack/vue-virtual";
import type { ColumnDef, ViewState, AirgridMeta } from "./types";
import { pickFilterFn } from "./filterFns";
import { loadState, saveState, type PersistedState } from "./persistence";
import EditableCell from "./EditableCell.vue";
import HeaderCell from "./HeaderCell.vue";
import HideColumnsMenu from "./HideColumnsMenu.vue";
import SortPriorityPanel from "./SortPriorityPanel.vue";

// column.columnDef.meta 에 실제로 박아 넣는 필드 — AirgridMeta(정렬/폭/필터) +
// editable(후속 편집 task 용). cell 은 top-level columnDef.cell 로 옮겨졌으니
// 여기엔 없음 — 이 타입이 meta 를 정직하게 서술(excess-property 은폐 ✗).
type CellMeta = AirgridMeta & { editable?: boolean };

const props = defineProps<{
  data: TRow[]; columns: ColumnDef<TRow>[]; rowKey: keyof TRow & string;
  height?: number | string; estimateRowHeight?: number;
  filterPersistKey?: string; viewState?: ViewState;
  /** 행 데이터 기반 클래스. 반환 클래스가 각 행 요소에 적용됨(행 색상 등). */
  rowClass?: (row: TRow) => string | undefined;
}>();
const emit = defineEmits<{
  cellEdit: [rowId: string, columnId: string, value: unknown];
  rowClick: [row: TRow];
  "update:viewState": [v: ViewState];
}>();

// #cell-[id] 스코프드 슬롯 우선순위 체크용. 있으면 editable/columnDef.cell 보다
// 먼저 그 슬롯으로 렌더 — 호스트 앱이 특정 셀만 완전히 갈아끼우고 싶을 때 사용.
const slots = useSlots();
function hasCellSlot(columnId: string) {
  return !!slots[`cell-${columnId}`];
}

// 편집 중(EditableCell)인 셀 클릭은 이미 그 자체로 편집 진입 액션이니 rowClick
// 을 또 쏘지 않음 — 단, #cell-[id] 슬롯이 있으면 표시용 셀로 취급해 emit.
function onCellClick(cell: { column: { id: string; columnDef: { meta?: CellMeta } } }, row: TRow) {
  const editable = cell.column.columnDef.meta?.editable && !hasCellSlot(cell.column.id);
  if (editable) return;
  emit("rowClick", row);
}

const init = props.filterPersistKey ? loadState(props.filterPersistKey) : null;
const sorting = ref<SortingState>(init?.sorting ?? props.viewState?.sorting ?? []);
const columnFilters = ref<ColumnFiltersState>(init?.columnFilters ?? props.viewState?.columnFilters ?? []);
const columnVisibility = ref<VisibilityState>(init?.columnVisibility ?? props.viewState?.columnVisibility
  ?? Object.fromEntries(props.columns.filter(c => c.defaultVisible === false).map(c => [c.id, false])));
const columnOrder = ref<ColumnOrderState>(init?.columnOrder ?? props.viewState?.columnOrder ?? []);
const columnSizing = ref<ColumnSizingState>(init?.columnSizing ?? props.viewState?.columnSizing ?? {});

const tsColumns = computed<TSCol<TRow>[]>(() => props.columns.map((c) => ({
  id: c.id, accessorKey: c.accessorKey, header: c.header,
  // c.cell 은 row 전체를 받는 우리 시그니처 — TanStack 의 CellContext 어댑터로 감쌈.
  // 없으면 undefined 로 둬 template 이 raw value(cell.getValue()) 로 폴백.
  cell: c.cell ? (ctx: CellContext<TRow, unknown>) => c.cell!(ctx.row.original) : undefined,
  enableSorting: c.sortable !== false,
  filterFn: pickFilterFn(c.filterType) as any,
  meta: {
    align: c.align, width: c.width, minWidth: c.minWidth,
    filterType: c.filterType, selectOptions: c.selectOptions, editable: c.editable,
  } satisfies CellMeta,
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
  // TanStack 기본값은 숫자 컬럼을 desc-first 로 토글 — 그리드 관례(오름차순 먼저)에
  // 맞춰 모든 컬럼을 asc-first 로 통일.
  sortDescFirst: false,
});

watch([sorting, columnFilters, columnVisibility, columnOrder, columnSizing], () => {
  const v: ViewState = { sorting: sorting.value, columnFilters: columnFilters.value,
    columnVisibility: columnVisibility.value, columnOrder: columnOrder.value, columnSizing: columnSizing.value };
  if (props.filterPersistKey) saveState(props.filterPersistKey, v as PersistedState);
  emit("update:viewState", v);
}, { deep: true });

// Vue :style 는 숫자에 자동으로 "px" 를 안 붙임(React 와 다름) — unitless 숫자를
// CSSOM 이 그대로 거부해 height 가 안 먹고 virtualizer 가 무한정 render-all 됨.
const containerHeight = computed(() =>
  typeof props.height === "number" ? `${props.height}px` : (props.height ?? "600px"));

// 헤더 row 와 각 body row 가 같은 컬럼 폭을 써야 정렬이 맞음 — 한 곳에서만 계산.
// 사용자가 헤더 리사이즈 핸들로 드래그해 columnSizing 에 값을 넣으면 그 폭을
// 우선 사용 — 없는 컬럼은 기존 ColumnDef.width(또는 기본 minmax) 로 폴백.
const gridTemplateColumns = computed(() =>
  table.getVisibleLeafColumns()
    .map((c) => {
      const sized = columnSizing.value[c.id];
      if (sized != null) return `${sized}px`;
      return (c.columnDef.meta as AirgridMeta | undefined)?.width ?? "minmax(80px, 1fr)";
    })
    .join(" "));

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

// dnd-kit 없이 표준 arrayMove(splice-out at from, splice-in at to) — from/to 는
// splice 순서 그대로의 raw index(두 번째 splice 는 이미 한 칸 줄어든 배열 기준).
function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

// 헤더 드래그 시작 — 옮길 컬럼 id 를 dataTransfer 에 담는다.
function onHeaderDragStart(e: DragEvent, columnId: string) {
  e.dataTransfer?.setData("text/col", columnId);
}

// 드롭 대상 헤더에서 실행 — columnOrder 가 비어 있으면(정의 순서 그대로 사용 중)
// 현재 leaf 컬럼 순서로 먼저 시딩한 뒤 옮긴다.
function onDropColumn(e: DragEvent, targetColumnId: string) {
  const fromId = e.dataTransfer?.getData("text/col");
  if (!fromId || fromId === targetColumnId) return;
  const order = columnOrder.value.length
    ? [...columnOrder.value]
    : table.getAllLeafColumns().map((c) => c.id);
  const fromIndex = order.indexOf(fromId);
  const toIndex = order.indexOf(targetColumnId);
  if (fromIndex === -1 || toIndex === -1) return;
  table.setColumnOrder(arrayMove(order, fromIndex, toIndex));
}
</script>

<template>
  <div class="airgrid-toolbar">
    <SortPriorityPanel :table="table" />
    <HideColumnsMenu :table="table" />
  </div>
  <div ref="scrollEl" class="airgrid" :style="{ height: containerHeight, overflow: 'auto', position: 'relative' }" role="grid">
    <div
      class="airgrid-header-row"
      role="row"
      :style="{ display: 'grid', gridTemplateColumns, position: 'sticky', top: 0 }"
    >
      <div
        v-for="header in table.getHeaderGroups()[0]?.headers ?? []"
        :key="header.id"
        :data-col="header.column.id"
        role="columnheader"
        draggable="true"
        :style="{ textAlign: (header.column.columnDef.meta as AirgridMeta | undefined)?.align === 'right' ? 'right' : 'left' }"
        @dragstart="onHeaderDragStart($event, header.column.id)"
        @dragover.prevent
        @drop="onDropColumn($event, header.column.id)"
      >
        <HeaderCell v-if="!header.isPlaceholder" :header="header" />
      </div>
    </div>

    <div :style="{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
      <div
        v-for="item in visibleRows"
        :key="item.row.id"
        :data-row="item.row.id"
        :class="props.rowClass ? props.rowClass(item.row.original) : undefined"
        role="row"
        :style="{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)`, display: 'grid', gridTemplateColumns }"
      >
        <div
          v-for="cell in item.row.getVisibleCells()"
          :key="cell.id"
          :data-col="cell.column.id"
          role="gridcell"
          :style="{ textAlign: (cell.column.columnDef.meta as AirgridMeta | undefined)?.align === 'right' ? 'right' : 'left' }"
          @click="onCellClick(cell, item.row.original)"
        >
          <slot
            v-if="hasCellSlot(cell.column.id)"
            :name="'cell-' + cell.column.id"
            :row="item.row.original"
            :value="cell.getValue()"
            :column="cell.column"
            :cell="cell"
          />
          <EditableCell
            v-else-if="(cell.column.columnDef.meta as CellMeta | undefined)?.editable"
            :model-value="cell.getValue()"
            @commit="(v) => emit('cellEdit', item.row.id, cell.column.id, v)"
          />
          <FlexRender v-else-if="cell.column.columnDef.cell" :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          <template v-else>{{ cell.getValue() }}</template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.airgrid-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-bottom: 4px;
}
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
