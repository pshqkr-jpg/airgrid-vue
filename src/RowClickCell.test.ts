import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import DataGrid from "./DataGrid.vue";
import type { ColumnDef } from "./types";
type Row = { id: string; name: string };
const data: Row[] = [{ id: "1", name: "이지수" }];

it("clicking a non-editable cell emits rowClick with the row", async () => {
  const cols: ColumnDef<Row>[] = [{ id: "name", header: "이름", accessorKey: "name" }];
  const w = mount(DataGrid, { props: { data, columns: cols as unknown as ColumnDef<Record<string, any>>[], rowKey: "id", height: 300 } });
  await w.find("[data-row='1'] [data-col='name']").trigger("click");
  expect(w.emitted("rowClick")?.[0]).toEqual([{ id: "1", name: "이지수" }]);
});

it("ColumnDef.cell render-fn customizes cell", () => {
  const cols: ColumnDef<Row>[] = [{ id: "name", header: "이름", accessorKey: "name", cell: (r) => h("b", { class: "cust" }, r.name) as any }];
  const w = mount(DataGrid, { props: { data, columns: cols as unknown as ColumnDef<Record<string, any>>[], rowKey: "id", height: 300 } });
  expect(w.find("b.cust").text()).toBe("이지수");
});

it("#cell-[id] slot overrides and takes priority", () => {
  const cols: ColumnDef<Row>[] = [{ id: "name", header: "이름", accessorKey: "name", cell: (r) => h("b", { class: "cust" }, r.name) as any }];
  const w = mount(DataGrid, {
    props: { data, columns: cols as unknown as ColumnDef<Record<string, any>>[], rowKey: "id", height: 300 },
    slots: { "cell-name": (props: any) => h("i", { class: "slotted" }, props.row.name) },
  });
  expect(w.find("i.slotted").text()).toBe("이지수");
  expect(w.find("b.cust").exists()).toBe(false); // slot beats ColumnDef.cell
});
