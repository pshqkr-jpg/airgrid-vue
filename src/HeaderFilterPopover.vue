<script setup lang="ts">
// 헤더 필터 popover — 컬럼의 filterType 에 맞는 입력 UI를 렌더하고
// column.setFilterValue 로 값을 씀. React 원본(~/airgrid/src/HeaderFilterPopover.tsx)의
// FilterInput 부분만 포팅 — 정렬/hide 섹션은 후속 task(hide 메뉴/정렬 패널)에서.
import { computed } from "vue";
import type { Column, Table } from "@tanstack/vue-table";
import type {
  AirgridMeta,
  TextFilter, TextFilterOp,
  NumberFilter, NumberFilterOp,
} from "./types";

const props = defineProps<{ column: Column<any, unknown>; table: Table<any> }>();

const meta = computed(() => props.column.columnDef.meta as AirgridMeta | undefined);
const filterType = computed(() => meta.value?.filterType);

// select 옵션 — ColumnDef.selectOptions 우선, 없으면 필터 전 전체 row 에서 자동 추출.
const selectOptions = computed<string[]>(() => {
  if (meta.value?.selectOptions) return meta.value.selectOptions;
  const seen = new Set<string>();
  for (const row of props.table.getPreFilteredRowModel().rows) {
    const v = row.getValue(props.column.id);
    if (v != null && v !== "") seen.add(String(v));
  }
  return Array.from(seen);
});

const TEXT_OPS: { value: TextFilterOp; label: string }[] = [
  { value: "contains",    label: "포함" },
  { value: "notContains", label: "미포함" },
  { value: "is",          label: "일치" },
  { value: "isNot",       label: "불일치" },
  { value: "startsWith",  label: "~로 시작" },
  { value: "endsWith",    label: "~로 끝남" },
  { value: "isEmpty",     label: "비어있음" },
  { value: "isNotEmpty",  label: "값 있음" },
];

const NUM_OPS: { value: NumberFilterOp; label: string }[] = [
  { value: "between",    label: "범위" },
  { value: "eq",         label: "=" },
  { value: "neq",        label: "≠" },
  { value: "lt",         label: "<" },
  { value: "gt",         label: ">" },
  { value: "lte",        label: "≤" },
  { value: "gte",        label: "≥" },
  { value: "isEmpty",    label: "비어있음" },
  { value: "isNotEmpty", label: "값 있음" },
];

// ─── text ───────────────────────────────────────────────────────
const textFilter = computed<TextFilter>(() => {
  const v = props.column.getFilterValue();
  if (typeof v === "string") return { op: "contains", value: v };
  if (v && typeof v === "object") return v as TextFilter;
  return {};
});
const textOp = computed<TextFilterOp>(() => textFilter.value.op ?? "contains");
const textValueDisabled = computed(() => textOp.value === "isEmpty" || textOp.value === "isNotEmpty");

function onTextOpChange(e: Event) {
  const next = (e.target as HTMLSelectElement).value as TextFilterOp;
  if (next === "isEmpty" || next === "isNotEmpty") {
    props.column.setFilterValue({ op: next });
  } else {
    props.column.setFilterValue({ op: next, value: textFilter.value.value ?? "" });
  }
}
function onTextValueInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  props.column.setFilterValue({ op: textOp.value, value });
}

// ─── numberRange ────────────────────────────────────────────────
const numberFilter = computed<NumberFilter>(() => {
  const v = props.column.getFilterValue();
  if (v && typeof v === "object") {
    const obj = v as NumberFilter;
    return (!obj.op && (obj.min != null || obj.max != null))
      ? { op: "between", min: obj.min, max: obj.max }
      : obj;
  }
  return {};
});
const numberOp = computed<NumberFilterOp>(() => numberFilter.value.op ?? "between");

function onNumberOpChange(e: Event) {
  const next = (e.target as HTMLSelectElement).value as NumberFilterOp;
  const f = numberFilter.value;
  if (next === "isEmpty" || next === "isNotEmpty") {
    props.column.setFilterValue({ op: next });
  } else if (next === "between") {
    props.column.setFilterValue({ op: next, min: f.min, max: f.max });
  } else {
    props.column.setFilterValue({ op: next, value: f.value });
  }
}
function onNumberMinInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value;
  const v = raw === "" ? undefined : Number(raw);
  props.column.setFilterValue({ op: "between", min: v, max: numberFilter.value.max });
}
function onNumberMaxInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value;
  const v = raw === "" ? undefined : Number(raw);
  props.column.setFilterValue({ op: "between", min: numberFilter.value.min, max: v });
}
function onNumberValueInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value;
  const v = raw === "" ? undefined : Number(raw);
  props.column.setFilterValue({ op: numberOp.value, value: v });
}

// ─── boolean ────────────────────────────────────────────────────
const booleanValue = computed(() => {
  const v = props.column.getFilterValue();
  return v === true ? "true" : v === false ? "false" : "any";
});
function onBooleanChange(e: Event) {
  const next = (e.target as HTMLSelectElement).value;
  props.column.setFilterValue(next === "any" ? undefined : next === "true");
}

// ─── select ─────────────────────────────────────────────────────
const selectedValues = computed<string[]>(() => {
  const v = props.column.getFilterValue();
  return Array.isArray(v) ? v as string[] : [];
});
function onSelectChange(e: Event) {
  const next = Array.from((e.target as HTMLSelectElement).selectedOptions, (o) => o.value);
  props.column.setFilterValue(next.length === 0 ? undefined : next);
}

function resetFilter() {
  props.column.setFilterValue(undefined);
}
</script>

<template>
  <div class="airgrid-filter-popover" role="menu">
    <div v-if="filterType === 'text'" class="airgrid-filter-input-group">
      <select :value="textOp" class="airgrid-filter-select" @change="onTextOpChange">
        <option v-for="o in TEXT_OPS" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <input
        type="text"
        autofocus
        class="airgrid-filter-text-input"
        :placeholder="textValueDisabled ? '(값 입력 불필요)' : '검색…'"
        :value="textFilter.value ?? ''"
        :disabled="textValueDisabled"
        @input="onTextValueInput"
      />
    </div>

    <div v-else-if="filterType === 'numberRange'" class="airgrid-filter-input-group">
      <select :value="numberOp" class="airgrid-filter-select" @change="onNumberOpChange">
        <option v-for="o in NUM_OPS" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <div v-if="numberOp === 'between'" class="airgrid-filter-range">
        <input type="number" autofocus placeholder="min" :value="numberFilter.min ?? ''" @input="onNumberMinInput" />
        <input type="number" placeholder="max" :value="numberFilter.max ?? ''" @input="onNumberMaxInput" />
      </div>
      <input
        v-else-if="numberOp === 'isEmpty' || numberOp === 'isNotEmpty'"
        type="text"
        placeholder="(값 입력 불필요)"
        disabled
      />
      <input v-else type="number" autofocus placeholder="값" :value="numberFilter.value ?? ''" @input="onNumberValueInput" />
    </div>

    <select v-else-if="filterType === 'boolean'" :value="booleanValue" class="airgrid-filter-select" @change="onBooleanChange">
      <option value="any">전체</option>
      <option value="true">예</option>
      <option value="false">아니오</option>
    </select>

    <select
      v-else-if="filterType === 'select'"
      multiple
      class="airgrid-filter-select airgrid-filter-multiselect"
      :value="selectedValues"
      @change="onSelectChange"
    >
      <option v-for="opt in selectOptions" :key="opt" :value="opt">{{ opt }}</option>
    </select>

    <button type="button" class="airgrid-filter-reset" @click="resetFilter">필터 초기화</button>
  </div>
</template>

<style scoped>
.airgrid-filter-popover {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  min-width: 200px;
  background: var(--airgrid-bg, #ffffff);
  border: 1px solid var(--airgrid-border, #e5e7eb);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  font-size: 12px;
}
.airgrid-filter-input-group,
.airgrid-filter-range {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.airgrid-filter-range {
  flex-direction: row;
}
.airgrid-filter-popover select,
.airgrid-filter-popover input {
  width: 100%;
  font-size: 12px;
  padding: 4px 6px;
  border: 1px solid var(--airgrid-border, #e5e7eb);
  border-radius: 4px;
  background: var(--airgrid-bg, #ffffff);
  color: var(--airgrid-filter-fg, #1f2937);
  box-sizing: border-box;
  font-family: inherit;
}
.airgrid-filter-multiselect {
  height: 100px;
}
.airgrid-filter-reset {
  margin-top: 4px;
  font-size: 11px;
  padding: 4px 8px;
  border: 1px solid var(--airgrid-border, #e5e7eb);
  border-radius: 4px;
  background: transparent;
  color: var(--airgrid-fg, #1f2937);
  cursor: pointer;
}
</style>
