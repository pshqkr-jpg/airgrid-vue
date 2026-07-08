import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DataGrid from "./DataGrid.vue";
import type { ColumnDef } from "./types";
type Row = { id: string; memo: string };
const cols: ColumnDef<Row>[] = [{ id: "memo", header: "메모", accessorKey: "memo", editable: true }];

it("editable cell emits cellEdit on commit", async () => {
  const w = mount(DataGrid, { props: { data: [{ id: "1", memo: "old" }], columns: cols as unknown as ColumnDef<Record<string, any>>[], rowKey: "id", height: 300 } });
  const input = w.find("input");
  await input.setValue("new");
  await input.trigger("blur");
  const ev = w.emitted("cellEdit");
  expect(ev?.[0]).toEqual(["1", "memo", "new"]);
});
