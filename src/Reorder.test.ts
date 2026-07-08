// 네이티브 HTML5 드래그앤드롭 컬럼 리오더 — @dnd-kit 미사용, dataTransfer 로 컬럼 id 전달.
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DataGrid from "./DataGrid.vue";
import type { ColumnDef } from "./types";

type Row = { id: string; a: string; b: string };
const cols: ColumnDef<Row>[] = [
  { id: "a", header: "A", accessorKey: "a" },
  { id: "b", header: "B", accessorKey: "b" },
];

describe("column reorder (native HTML5 DnD)", () => {
  it("dragging header A onto B reorders columns", async () => {
    const w = mount(DataGrid, {
      props: {
        data: [{ id: "1", a: "x", b: "y" }],
        columns: cols as unknown as ColumnDef<Record<string, any>>[],
        rowKey: "id",
        height: 300,
      },
    });
    // 셀 클릭(rowClick) 지원을 위해 body cell 도 이제 data-col 을 갖게 됐으니
    // 헤더 행으로 스코프 — 아니면 body cell 까지 같이 잡혀 개수가 안 맞음.
    const heads = () => w.findAll(".airgrid-header-row [data-col]").map((h) => h.attributes("data-col"));
    expect(heads()).toEqual(["a", "b"]);

    const store: Record<string, string> = {};
    const dt = {
      setData: (k: string, v: string) => { store[k] = v; },
      getData: (k: string) => store[k] ?? "",
      dropEffect: "",
      effectAllowed: "",
    };
    await w.find("[data-col='a']").trigger("dragstart", { dataTransfer: dt });
    await w.find("[data-col='b']").trigger("drop", { dataTransfer: dt });

    expect(heads()).toEqual(["b", "a"]);
  });
});
