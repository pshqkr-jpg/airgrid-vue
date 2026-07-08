import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DataGrid from "./DataGrid.vue";
import type { ColumnDef } from "./types";
type Row = { id: string; g: string; n: number };
const data: Row[] = [{ id: "1", g: "b", n: 1 }, { id: "2", g: "a", n: 2 }, { id: "3", g: "a", n: 1 }];
const cols: ColumnDef<Row>[] = [
  { id: "g", header: "그룹", accessorKey: "g" }, { id: "n", header: "번호", accessorKey: "n" },
];
it("multi-sort by g asc then n asc", async () => {
  const w = mount(DataGrid, { props: { data, columns: cols as unknown as ColumnDef<Record<string, any>>[], rowKey: "id", height: 300, viewState: {
    sorting: [{ id: "g", desc: false }, { id: "n", desc: false }], columnFilters: [], columnVisibility: {}, columnOrder: [], columnSizing: {} } } });
  const ids = w.findAll("[data-row]").map(r => r.attributes("data-row"));
  expect(ids).toEqual(["3", "2", "1"]);
});
