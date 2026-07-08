<script setup lang="ts">
// 컬럼 숨김 / 표시 토글 메뉴 — 우측 상단 작은 버튼 → popover.
// React 원본(~/airgrid/src/HideColumnsMenu.tsx) 포팅: 컬럼명 검색, 표시중/숨김
// 섹션 분리, 모두 표시로 초기화. 외부 클릭 / Esc 로 닫기(HeaderCell 의
// 필터 popover 와 동일 패턴) — 이 컴포넌트가 버튼 + popover 를 모두 소유하므로
// open 상태도 여기서 직접 관리.
import { ref, computed, onBeforeUnmount } from "vue";
import type { Table } from "@tanstack/vue-table";

const props = defineProps<{ table: Table<any> }>();

const open = ref(false);
const search = ref("");
const root = ref<HTMLElement | null>(null);

function onDocMousedown(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) close();
}
function onDocKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}
function openMenu() {
  open.value = true;
  document.addEventListener("mousedown", onDocMousedown);
  document.addEventListener("keydown", onDocKeydown);
}
function close() {
  open.value = false;
  search.value = "";
  document.removeEventListener("mousedown", onDocMousedown);
  document.removeEventListener("keydown", onDocKeydown);
}
function toggleOpen() {
  if (open.value) close();
  else openMenu();
}
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocMousedown);
  document.removeEventListener("keydown", onDocKeydown);
});

const allColumns = computed(() => props.table.getAllLeafColumns());
const visibleCount = computed(() => allColumns.value.filter((c) => c.getIsVisible()).length);

const matched = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return allColumns.value;
  return allColumns.value.filter((c) => String(c.columnDef.header).toLowerCase().includes(q));
});
const visible = computed(() => matched.value.filter((c) => c.getIsVisible()));
const hidden = computed(() => matched.value.filter((c) => !c.getIsVisible()));

function toggleColumn(columnId: string) {
  props.table.getColumn(columnId)?.toggleVisibility();
}
function resetAll() {
  props.table.resetColumnVisibility();
}
</script>

<template>
  <div ref="root" class="airgrid-hide-menu">
    <button type="button" class="airgrid-hide-btn" title="컬럼 표시 / 숨김" @click="toggleOpen">
      ⚙ 컬럼 ({{ visibleCount }}/{{ allColumns.length }})
    </button>
    <div v-if="open" class="airgrid-hide-popover">
      <input
        v-model="search"
        type="text"
        autofocus
        placeholder="컬럼명 검색…"
        class="airgrid-hide-search"
      />

      <template v-if="visible.length > 0">
        <div class="airgrid-hide-section-label">표시 중 ({{ visible.length }})</div>
        <button
          v-for="column in visible"
          :key="column.id"
          type="button"
          class="airgrid-hide-item"
          :data-hide-toggle="column.id"
          @click="toggleColumn(column.id)"
        >
          <span class="airgrid-hide-marker airgrid-hide-marker-on" aria-hidden="true">✓</span>
          <span class="airgrid-hide-item-label">{{ column.columnDef.header }}</span>
        </button>
      </template>

      <template v-if="hidden.length > 0">
        <div class="airgrid-hide-section-label">숨김 ({{ hidden.length }})</div>
        <button
          v-for="column in hidden"
          :key="column.id"
          type="button"
          class="airgrid-hide-item"
          :data-hide-toggle="column.id"
          @click="toggleColumn(column.id)"
        >
          <span class="airgrid-hide-marker" aria-hidden="true"></span>
          <span class="airgrid-hide-item-label">{{ column.columnDef.header }}</span>
        </button>
      </template>

      <div v-if="matched.length === 0" class="airgrid-hide-empty">일치하는 컬럼 없음</div>

      <button type="button" class="airgrid-hide-reset" @click="resetAll">모두 표시로 초기화</button>
    </div>
  </div>
</template>

<style scoped>
.airgrid-hide-menu {
  position: relative;
}
.airgrid-hide-btn {
  font-size: 11px;
  padding: 3px 8px;
  border: 1px solid var(--airgrid-border, #e5e7eb);
  background: var(--airgrid-bg, #ffffff);
  color: var(--airgrid-header-fg, #6b7280);
  border-radius: 4px;
  cursor: pointer;
}
.airgrid-hide-popover {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 220px;
  max-height: 480px;
  overflow-y: auto;
  background: var(--airgrid-bg, #ffffff);
  border: 1px solid var(--airgrid-border, #e5e7eb);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
  padding: 4px;
  color: var(--airgrid-fg, #1f2937);
}
.airgrid-hide-search {
  width: 100%;
  font-size: 12px;
  padding: 5px 8px;
  margin: 2px 0 4px;
  border: 1px solid var(--airgrid-border, #e5e7eb);
  border-radius: 4px;
  background: var(--airgrid-bg, #ffffff);
  color: var(--airgrid-fg, #1f2937);
  box-sizing: border-box;
}
.airgrid-hide-section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--airgrid-empty-fg, #9ca3af);
  padding: 6px 8px 2px;
}
.airgrid-hide-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 5px 8px;
  font-size: 12px;
  background: transparent;
  border: none;
  border-radius: 3px;
  color: var(--airgrid-fg, #1f2937);
  cursor: pointer;
  text-align: left;
}
.airgrid-hide-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border-radius: 3px;
  border: 1px solid var(--airgrid-border, #d1d5db);
  background: transparent;
  color: #ffffff;
  font-size: 10px;
  line-height: 1;
}
.airgrid-hide-marker-on {
  border-color: var(--airgrid-active-fg, #4338ca);
  background: var(--airgrid-active-fg, #4338ca);
}
.airgrid-hide-item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.airgrid-hide-empty {
  padding: 10px 8px;
  font-size: 11px;
  color: var(--airgrid-empty-fg, #9ca3af);
  text-align: center;
}
.airgrid-hide-reset {
  margin-top: 4px;
  width: 100%;
  padding: 5px 8px;
  font-size: 11px;
  border: none;
  border-top: 1px solid var(--airgrid-border-subtle, #eceef1);
  background: transparent;
  color: var(--airgrid-header-fg, #6b7280);
  cursor: pointer;
  text-align: left;
}
</style>
