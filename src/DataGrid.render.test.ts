import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DataGrid from "./DataGrid.vue";
import type { ColumnDef } from "./types";

type Row = { id: string; name: string; qty: number };
const rows: Row[] = [{ id: "1", name: "이지수", qty: 3 }, { id: "2", name: "김아희", qty: 5 }];
const cols: ColumnDef<Row>[] = [
  { id: "name", header: "이름", accessorKey: "name", filterType: "text" },
  { id: "qty", header: "수량", accessorKey: "qty", filterType: "numberRange", align: "right" },
  { id: "hidden", header: "숨김", accessorKey: "id", defaultVisible: false },
];

describe("DataGrid render", () => {
  it("renders visible columns + rows, hides defaultVisible=false", () => {
    const w = mount(DataGrid, { props: { data: rows, columns: cols, rowKey: "id", height: 400 } });
    expect(w.text()).toContain("이름");
    expect(w.text()).toContain("수량");
    expect(w.text()).not.toContain("숨김");
    expect(w.text()).toContain("이지수");
    expect(w.text()).toContain("김아희");
  });
});
