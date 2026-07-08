import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DataGrid from "./DataGrid.vue";
import type { ColumnDef } from "./types";
type Row = { id: string; name: string };
const data: Row[] = [{ id: "1", name: "이지수" }, { id: "2", name: "김아희" }];
const cols: ColumnDef<Row>[] = [{ id: "name", header: "이름", accessorKey: "name", filterType: "text" }];

it("applying text contains filter reduces rows", async () => {
  const w = mount(DataGrid, { props: { data, columns: cols as unknown as ColumnDef<Record<string, any>>[], rowKey: "id", height: 300 } });
  await w.find("[data-col='name'] .airgrid-filter-btn").trigger("click");
  const input = w.find(".airgrid-filter-popover input");
  await input.setValue("이지");
  await input.trigger("input");
  expect(w.findAll("[data-row]")).toHaveLength(1);
  expect(w.text()).toContain("이지수");
});
