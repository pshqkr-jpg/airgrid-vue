import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import DataGrid from "./DataGrid.vue";
import type { ColumnDef } from "./types";

type Row = { id: string; name: string; qty: number };
const rows: Row[] = [{ id: "1", name: "이지수", qty: 3 }, { id: "2", name: "김아희", qty: 5 }];
const cols: ColumnDef<Row>[] = [
  { id: "name", header: "이름", accessorKey: "name", filterType: "text" },
  { id: "qty", header: "수량", accessorKey: "qty", filterType: "numberRange", align: "right" },
  { id: "hidden", header: "숨김", accessorKey: "id", defaultVisible: false },
];

// mount() 의 props 타입 추론이 DataGrid 의 generic 을 그대로 이어받지 못해
// (Vue 3 generic SFC + @vue/test-utils 의 알려진 한계) mount 경계에서만
// 단언 — 컴포넌트 쪽 generic 제약은 그대로 유지.
const colsForMount = cols as unknown as ColumnDef<Record<string, any>>[];

describe("DataGrid render", () => {
  it("renders visible columns + rows, hides defaultVisible=false", () => {
    const w = mount(DataGrid, { props: { data: rows, columns: colsForMount, rowKey: "id", height: 400 } });
    expect(w.text()).toContain("이름");
    expect(w.text()).toContain("수량");
    expect(w.text()).not.toContain("숨김");
    expect(w.text()).toContain("이지수");
    expect(w.text()).toContain("김아희");
  });

  it("invokes custom cell renderer instead of raw value", () => {
    const customCols: ColumnDef<Row>[] = [
      { id: "name", header: "이름", accessorKey: "name", cell: (row) => h("b", { class: "cust" }, row.name) },
    ];
    const w = mount(DataGrid, {
      props: { data: rows, columns: customCols as unknown as ColumnDef<Record<string, any>>[], rowKey: "id", height: 400 },
    });
    const b = w.find("b.cust");
    expect(b.exists()).toBe(true);
    expect(b.text()).toBe("이지수");
  });

  it("applies default height 600px when height prop is omitted", () => {
    const w = mount(DataGrid, { props: { data: rows, columns: colsForMount, rowKey: "id" } });
    expect(w.find('[role="grid"]').attributes("style")).toContain("height: 600px");
  });

  it("honors columnVisibility/columnOrder/columnSizing from the viewState prop at init", () => {
    const w = mount(DataGrid, {
      props: {
        data: rows, columns: colsForMount, rowKey: "id", height: 400,
        viewState: {
          sorting: [], columnFilters: [],
          columnVisibility: { name: false }, columnOrder: [], columnSizing: {},
        },
      },
    });
    expect(w.find('[data-col="name"]').exists()).toBe(false);
    expect(w.find('[data-col="qty"]').exists()).toBe(true);
  });

  it("applies rowClass to each row based on data", () => {
    const w = mount(DataGrid, { props: { data: rows, columns: colsForMount, rowKey: "id", height: 400, rowClass: (r: any) => (r.name === "이지수" ? "row-hi" : undefined) } });
    expect(w.find("[data-row='1'].row-hi").exists()).toBe(true);
    expect(w.find("[data-row='2'].row-hi").exists()).toBe(false);
  });
});
