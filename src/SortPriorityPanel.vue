<script setup lang="ts">
// 다중 정렬 우선순위 패널 — Airtable 의 "Sort by..." 다이얼로그.
// React 원본(~/airgrid/src/SortPriorityPanel.tsx) 포팅. React 판은 anchor 좌표로
// 띄우는 fixed popover 였지만, 이 프로젝트의 다른 메뉴(HideColumnsMenu)와 같은
// "버튼 + 상대 popover" 패턴으로 통일 — 트리거 버튼도 이 컴포넌트가 직접 소유.
//
// 순서 변경은 native HTML5 drag(라이브러리 ✗) — 데스크톱 셀러 페르소나엔 충분.
import { ref, computed, onBeforeUnmount } from "vue";
import type { Table, ColumnSort } from "@tanstack/vue-table";

const props = defineProps<{ table: Table<any> }>();

const open = ref(false);
const dragIndex = ref<number | null>(null);
const root = ref<HTMLElement | null>(null);

function onDocMousedown(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) close();
}
function onDocKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}
function openPanel() {
  open.value = true;
  document.addEventListener("mousedown", onDocMousedown);
  document.addEventListener("keydown", onDocKeydown);
}
function close() {
  open.value = false;
  dragIndex.value = null;
  document.removeEventListener("mousedown", onDocMousedown);
  document.removeEventListener("keydown", onDocKeydown);
}
function toggleOpen() {
  if (open.value) close();
  else openPanel();
}
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocMousedown);
  document.removeEventListener("keydown", onDocKeydown);
});

const sorting = computed(() => props.table.getState().sorting);
const sortableColumns = computed(() => props.table.getAllLeafColumns().filter((c: any) => c.getCanSort()));
const candidates = computed(() => {
  const sortedIds = new Set(sorting.value.map((s) => s.id));
  return sortableColumns.value.filter((c: any) => !sortedIds.has(c.id));
});

function headerText(id: string) {
  const col = props.table.getColumn(id);
  return col ? String(col.columnDef.header) : id;
}

function reorder(from: number, to: number) {
  if (from === to) return;
  const next = [...sorting.value];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  props.table.setSorting(next);
}
function toggleDir(idx: number) {
  props.table.setSorting(sorting.value.map((s, i) => (i === idx ? { ...s, desc: !s.desc } : s)));
}
function remove(idx: number) {
  props.table.setSorting(sorting.value.filter((_, i) => i !== idx));
}
function addSort(e: Event) {
  const select = e.target as HTMLSelectElement;
  const columnId = select.value;
  if (!columnId) return;
  const next: ColumnSort[] = [...sorting.value, { id: columnId, desc: false }];
  props.table.setSorting(next);
  select.value = "";
}
function resetAll() {
  props.table.setSorting([]);
}
</script>

<template>
  <div ref="root" class="airgrid-sort-menu">
    <button
      type="button"
      class="airgrid-sort-btn"
      :class="{ 'airgrid-sort-btn-active': sorting.length > 0 }"
      title="정렬 우선순위 (다중 정렬)"
      @click="toggleOpen"
    >
      ⇅ 정렬{{ sorting.length > 0 ? ` (${sorting.length})` : "" }}
    </button>
    <div v-if="open" class="airgrid-sort-popover" role="dialog" aria-label="정렬 우선순위">
      <div class="airgrid-sort-title">정렬 우선순위</div>

      <div v-if="sorting.length === 0" class="airgrid-sort-empty">정렬이 없습니다. 아래에서 추가하세요.</div>
      <div v-else class="airgrid-sort-list">
        <div
          v-for="(s, idx) in sorting"
          :key="s.id"
          draggable="true"
          class="airgrid-sort-row"
          :class="{ 'airgrid-sort-row-dragging': dragIndex === idx }"
          :aria-label="`${idx + 1}순위 정렬 ${headerText(s.id)}`"
          @dragstart="dragIndex = idx"
          @dragover.prevent
          @drop="() => { if (dragIndex != null) reorder(dragIndex, idx); dragIndex = null; }"
          @dragend="dragIndex = null"
        >
          <span class="airgrid-sort-drag-handle" aria-hidden="true">⋮⋮</span>
          <span class="airgrid-sort-badge">{{ idx + 1 }}</span>
          <span class="airgrid-sort-label">{{ headerText(s.id) }}</span>
          <button type="button" class="airgrid-sort-dir-btn" @click="toggleDir(idx)">
            {{ s.desc ? "↓ 내림차순" : "↑ 오름차순" }}
          </button>
          <button type="button" class="airgrid-sort-remove-btn" aria-label="정렬 제거" @click="remove(idx)">×</button>
        </div>
      </div>

      <div v-if="candidates.length > 0" class="airgrid-sort-add-row">
        <select class="airgrid-sort-add-select" @change="addSort">
          <option value="">+ 정렬 컬럼 추가…</option>
          <option v-for="c in candidates" :key="c.id" :value="c.id">{{ String(c.columnDef.header) }}</option>
        </select>
      </div>

      <button v-if="sorting.length > 0" type="button" class="airgrid-sort-reset" @click="resetAll">
        전체 정렬 해제
      </button>
    </div>
  </div>
</template>

<style scoped>
.airgrid-sort-menu {
  position: relative;
}
.airgrid-sort-btn {
  font-size: 11px;
  padding: 3px 8px;
  border: 1px solid var(--airgrid-border, #e5e7eb);
  background: var(--airgrid-bg, #ffffff);
  color: var(--airgrid-header-fg, #6b7280);
  border-radius: 4px;
  cursor: pointer;
}
.airgrid-sort-btn-active {
  background: var(--airgrid-active-bg, #eef2ff);
  color: var(--airgrid-active-fg, #4338ca);
}
.airgrid-sort-popover {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 320px;
  background: var(--airgrid-bg, #ffffff);
  border: 1px solid var(--airgrid-border, #e5e7eb);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 10;
  padding: 10px;
  font-size: 12px;
  color: var(--airgrid-fg, #1f2937);
}
.airgrid-sort-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--airgrid-empty-fg, #9ca3af);
  margin-bottom: 8px;
}
.airgrid-sort-empty {
  padding: 12px;
  text-align: center;
  font-size: 11px;
  color: var(--airgrid-empty-fg, #9ca3af);
  background: var(--airgrid-header-bg, #f9fafb);
  border-radius: 4px;
  margin-bottom: 8px;
}
.airgrid-sort-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}
.airgrid-sort-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  background: var(--airgrid-header-bg, #f9fafb);
  border: 1px solid var(--airgrid-border-subtle, #eceef1);
  border-radius: 4px;
  cursor: grab;
}
.airgrid-sort-row-dragging {
  background: var(--airgrid-active-bg, #eef2ff);
}
.airgrid-sort-drag-handle {
  font-size: 10px;
  color: var(--airgrid-empty-fg, #9ca3af);
  cursor: grab;
}
.airgrid-sort-badge {
  display: inline-block;
  min-width: 18px;
  padding: 1px 5px;
  border-radius: 9px;
  background: var(--airgrid-sort-badge-bg, #d1fae5);
  color: var(--airgrid-sort-fg, #047857);
  font-size: 10px;
  font-weight: 600;
  text-align: center;
}
.airgrid-sort-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.airgrid-sort-dir-btn {
  font-size: 11px;
  padding: 3px 8px;
  border: 1px solid var(--airgrid-border, #d1d5db);
  border-radius: 3px;
  background: var(--airgrid-bg, #ffffff);
  color: var(--airgrid-fg, #1f2937);
  cursor: pointer;
  white-space: nowrap;
}
.airgrid-sort-remove-btn {
  font-size: 12px;
  padding: 2px 8px;
  border: 1px solid var(--airgrid-border-subtle, #eceef1);
  border-radius: 3px;
  background: transparent;
  color: var(--airgrid-empty-fg, #6b7280);
  cursor: pointer;
}
.airgrid-sort-add-row {
  display: flex;
  gap: 4px;
  align-items: center;
}
.airgrid-sort-add-select {
  flex: 1;
  font-size: 11px;
  padding: 4px 6px;
  border: 1px solid var(--airgrid-border, #e5e7eb);
  border-radius: 4px;
  background: var(--airgrid-bg, #ffffff);
  color: var(--airgrid-fg, #1f2937);
  cursor: pointer;
}
.airgrid-sort-reset {
  margin-top: 6px;
  width: 100%;
  padding: 5px 8px;
  font-size: 11px;
  border: 1px solid var(--airgrid-border-subtle, #eceef1);
  border-radius: 3px;
  background: transparent;
  color: var(--airgrid-empty-fg, #6b7280);
  cursor: pointer;
}
</style>
