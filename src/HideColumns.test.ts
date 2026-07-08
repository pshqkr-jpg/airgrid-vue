import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DataGrid from "./DataGrid.vue";
import type { ColumnDef } from "./types";
type Row = { id: string; a: string; b: string };
const cols: ColumnDef<Row>[] = [
  { id: "a", header: "A", accessorKey: "a" }, { id: "b", header: "B", accessorKey: "b" },
];
it("toggling column off hides it from grid", async () => {
  const w = mount(DataGrid, { props: { data: [{ id: "1", a: "aa", b: "bb" }], columns: cols as unknown as ColumnDef<Record<string, any>>[], rowKey: "id", height: 300 } });
  await w.find(".airgrid-hide-btn").trigger("click");
  const toggle = w.find("[data-hide-toggle='b']");
  await toggle.trigger("click");
  expect(w.find("[data-col='b']").exists()).toBe(false);
});
