import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DataGrid from "./DataGrid.vue";
import type { ColumnDef } from "./types";
type Row = { id: string; qty: number };
const cols: ColumnDef<Row>[] = [{ id: "qty", header: "수량", accessorKey: "qty", sortable: true }];
const data: Row[] = [{ id: "1", qty: 3 }, { id: "2", qty: 1 }, { id: "3", qty: 2 }];

it("clicking sortable header toggles sort order", async () => {
  const w = mount(DataGrid, { props: { data, columns: cols as unknown as ColumnDef<Record<string, any>>[], rowKey: "id", height: 300 } });
  const header = w.find("[data-col='qty'] .airgrid-header-label");
  await header.trigger("click"); // asc
  const first = w.findAll("[data-row]")[0].text();
  expect(first).toContain("1");
  await header.trigger("click"); // desc
  expect(w.findAll("[data-row]")[0].text()).toContain("3");
});
