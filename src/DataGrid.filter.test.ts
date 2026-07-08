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

it("select filter shows pre-selected options on reopen", async () => {
  type TagRow = { id: string; tag: string };
  const tagData: TagRow[] = [{ id: "1", tag: "a" }, { id: "2", tag: "b" }, { id: "3", tag: "c" }];
  const tagCols: ColumnDef<TagRow>[] = [{ id: "tag", header: "태그", accessorKey: "tag", filterType: "select" }];
  const w = mount(DataGrid, { props: { data: tagData, columns: tagCols as unknown as ColumnDef<Record<string, any>>[], rowKey: "id", height: 300 } });

  await w.find("[data-col='tag'] .airgrid-filter-btn").trigger("click");
  const select = w.find(".airgrid-filter-popover select[multiple]");
  const options = select.findAll("option");
  (options[0].element as HTMLOptionElement).selected = true;
  (options[1].element as HTMLOptionElement).selected = true;
  await select.trigger("change");

  // 닫았다가 다시 열어도 선택 상태가 유지되어야 함(멀티셀렉트 :value 바인딩 버그 회귀).
  await w.find("[data-col='tag'] .airgrid-filter-btn").trigger("click");
  await w.find("[data-col='tag'] .airgrid-filter-btn").trigger("click");
  const reopened = w.find(".airgrid-filter-popover select[multiple]");
  const reopenedOptions = reopened.findAll("option");
  expect((reopenedOptions[0].element as HTMLOptionElement).selected).toBe(true);
  expect((reopenedOptions[1].element as HTMLOptionElement).selected).toBe(true);
  expect((reopenedOptions[2].element as HTMLOptionElement).selected).toBe(false);
});

it("numberRange 'eq' filter compares numerically, not as strings", async () => {
  type QtyRow = { id: string; qty: number };
  const qtyData: QtyRow[] = [{ id: "1", qty: 5 }, { id: "2", qty: 50 }];
  const qtyCols: ColumnDef<QtyRow>[] = [{ id: "qty", header: "수량", accessorKey: "qty", filterType: "numberRange" }];
  const w = mount(DataGrid, { props: { data: qtyData, columns: qtyCols as unknown as ColumnDef<Record<string, any>>[], rowKey: "id", height: 300 } });

  await w.find("[data-col='qty'] .airgrid-filter-btn").trigger("click");
  const opSelect = w.find(".airgrid-filter-popover select");
  await opSelect.setValue("eq");
  const valueInput = w.find(".airgrid-filter-popover input[type='number']");
  await valueInput.setValue("5");
  await valueInput.trigger("input");

  // 값이 문자열로 새면 "5" === 5 (strict) 가 false 라 0행이 남음 — 숫자 변환 회귀 테스트.
  expect(w.findAll("[data-row]")).toHaveLength(1);
  const rowText = w.findAll("[data-row]")[0].text();
  expect(rowText).toContain("5");
  expect(rowText).not.toContain("50");
});

it("boolean filter: selecting 전체 clears filter value and hides active dot", async () => {
  type DoneRow = { id: string; done: boolean };
  const doneData: DoneRow[] = [{ id: "1", done: true }, { id: "2", done: false }];
  const doneCols: ColumnDef<DoneRow>[] = [{ id: "done", header: "완료", accessorKey: "done", filterType: "boolean" }];
  const w = mount(DataGrid, { props: { data: doneData, columns: doneCols as unknown as ColumnDef<Record<string, any>>[], rowKey: "id", height: 300 } });

  await w.find("[data-col='done'] .airgrid-filter-btn").trigger("click");
  const select = w.find(".airgrid-filter-popover select");
  await select.setValue("true");
  expect(w.find("[data-col='done'] .airgrid-filter-dot").exists()).toBe(true);
  expect(w.findAll("[data-row]")).toHaveLength(1);

  await select.setValue("any");
  expect(w.find("[data-col='done'] .airgrid-filter-dot").exists()).toBe(false);
  expect(w.findAll("[data-row]")).toHaveLength(2);
});
