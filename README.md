# airgrid-vue

Airtable-style data grid for Vue 3. Built on TanStack Vue Table + Virtual. Vue 3 port of [airgrid](https://github.com/pshqkr-jpg/airgrid).

Designed for B2B SaaS list pages where the user needs:

- Per-column filters (text, number range, select, boolean)
- Sort + multi-sort
- Hide / show columns
- Column reorder + resize
- Virtualized rendering (5,000+ rows OK)
- Inline cell editing
- Persisted views (localStorage)
- Headless UI (you own the styling)

## Install

```bash
npm install github:pshqkr-jpg/airgrid-vue
```

Peer dependencies your host app must already provide:

```
vue >= 3.4
@tanstack/vue-table ^8
@tanstack/vue-virtual ^3
```

## Usage (sketch)

```vue
<script setup lang="ts">
import { DataGrid, type ColumnDef } from "airgrid-vue";
import "airgrid-vue/style.css";

const columns: ColumnDef<Sku>[] = [
  { id: "code",         header: "코드",     accessorKey: "sku_code" },
  { id: "product_name", header: "상품명",   accessorKey: "product_name" },
  { id: "on_hand",      header: "실재고",   accessorKey: "on_hand", filterType: "numberRange" },
  { id: "memo",         header: "메모",     accessorKey: "memo",    editable: true },
];

function onCellEdit(rowId: string, columnId: string, value: unknown) {
  patchSku(rowId, { [columnId]: value });
}
</script>

<template>
  <DataGrid
    :data="skus"
    :columns="columns"
    rowKey="id"
    filterPersistKey="stock-inventory"
    @cellEdit="onCellEdit"
    @rowClick="(row) => openDetail(row)"
  />
</template>
```

## Columns

All columns are shown by default; set `defaultVisible: false` on a `ColumnDef` to hide it until the user re-enables it from the hide-columns menu. Column filters, sort (with multi-sort priority), reorder (drag header), and resize (drag right edge) are all built in per column via `ColumnDef` options (`filterType`, `sortable`, `width`, `minWidth`, ...).

Inline editing: set `editable: true` on a column to make its cells an input; edits are emitted via `@cellEdit(rowId, columnId, value)` — the grid doesn't mutate `data` itself.

Custom cell rendering: use `ColumnDef.cell` for a render function, or the `#cell-[id]` scoped slot when you need full control (e.g. `<template #cell-status="{ row }">`).

## View persistence

Pass `filterPersistKey` to persist sorting / column filters / visibility / order / sizing to `localStorage` under that key. Omit it (and drive `viewState` + `@update:viewState` yourself) if you'd rather persist views server-side. `clearPersistedState(key)` is exported to reset a saved view.

`viewState` is one-way, not a true `v-model`: it seeds the grid's *initial* state on mount, and the grid emits `update:viewState` whenever sorting/filters/visibility/order/sizing change. Changing the `viewState` prop after mount is **not** applied reactively. To switch to a different saved view at runtime, remount the grid with a changed `:key` (e.g. `:key="currentViewId"`).

## Status

Pre-1.0. Vue port of `airgrid`, tracking feature parity with the React version.

## License

MIT
