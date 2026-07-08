<script setup lang="ts">
// 헤더 셀 — 정렬 토글(라벨 클릭) + 우측 핸들 드래그 리사이즈 + 필터 popover.
// React 원본(~/airgrid/src/HeaderCell.tsx)의 드래그 리오더는 후속 task —
// 여기선 sort + resize + 필터 버튼/popover(task 8) 만.
import { ref, computed, onBeforeUnmount } from "vue";
import { FlexRender, type Header } from "@tanstack/vue-table";
import type { AirgridMeta } from "./types";
import { isTextFilterActive, isNumberFilterActive } from "./filterFns";
import HeaderFilterPopover from "./HeaderFilterPopover.vue";

const props = defineProps<{ header: Header<any, unknown> }>();

// 컬럼 폭 하한 — ColumnDef.minWidth 없으면 48px.
const RESIZE_FLOOR = 48;

const meta = computed(() => props.header.column.columnDef.meta as AirgridMeta | undefined);
const filterType = computed(() => meta.value?.filterType);
const filterOpen = ref(false);
const cellRoot = ref<HTMLElement | null>(null);

// 필터 "활성" 여부 — 헤더에 dot indicator 노출 판단.
const filterActive = computed(() => {
  const v = props.header.column.getFilterValue();
  if (v == null) return false;
  switch (filterType.value) {
    case "text":        return isTextFilterActive(v);
    case "numberRange":  return isNumberFilterActive(v);
    case "select":       return Array.isArray(v) && v.length > 0;
    case "boolean":      return v !== "any";
    default:             return false;
  }
});

// 외부 클릭 / Esc 으로 닫기 (React 원본 HeaderFilterPopover 의 mousedown/keydown
// 리스너 포팅) — popover 가 열려 있는 동안만 document 에 붙였다 닫히면 뗀다.
function onDocMousedown(e: MouseEvent) {
  if (cellRoot.value && !cellRoot.value.contains(e.target as Node)) closeFilter();
}
function onDocKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeFilter();
}
function openFilter() {
  filterOpen.value = true;
  document.addEventListener("mousedown", onDocMousedown);
  document.addEventListener("keydown", onDocKeydown);
}
function closeFilter() {
  filterOpen.value = false;
  document.removeEventListener("mousedown", onDocMousedown);
  document.removeEventListener("keydown", onDocKeydown);
}
function toggleFilter() {
  if (filterOpen.value) closeFilter();
  else openFilter();
}
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocMousedown);
  document.removeEventListener("keydown", onDocKeydown);
  stopResize?.();
});

function onLabelClick() {
  if (!props.header.column.getCanSort()) return;
  props.header.column.toggleSorting();
}

// pointerdown 에서 시작 X / 시작 폭을 캡처, pointermove 로 table 의
// columnSizing 을 갱신, pointerup 에서 리스너 정리. minWidth(메타) 또는
// 48px 하한으로 클램프. stopResize 는 드래그 도중 헤더가 unmount 되는 경우
// (컬럼 hide/reorder 등) window 리스너가 남지 않도록 onBeforeUnmount 에서도 호출.
let stopResize: (() => void) | null = null;
function onResizeStart(e: PointerEvent) {
  e.stopPropagation();
  e.preventDefault();
  const header = props.header;
  const table = header.getContext().table;
  const meta = header.column.columnDef.meta as AirgridMeta | undefined;
  const minWidth = meta?.minWidth ?? RESIZE_FLOOR;
  const startX = e.clientX;
  const startSize = header.getSize();
  const target = e.currentTarget as HTMLElement;
  target.setPointerCapture?.(e.pointerId);

  function onMove(ev: PointerEvent) {
    const next = Math.max(minWidth, startSize + (ev.clientX - startX));
    table.setColumnSizing((old) => ({ ...old, [header.column.id]: next }));
  }
  function cleanup() {
    stopResize = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onEnd);
  }
  function onEnd(ev: PointerEvent) {
    target.releasePointerCapture?.(ev.pointerId);
    cleanup();
  }
  stopResize = cleanup;
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onEnd);
}
</script>

<template>
  <div ref="cellRoot" class="airgrid-header-cell-inner">
    <span
      class="airgrid-header-label"
      role="button"
      :aria-disabled="!header.column.getCanSort()"
      @click="onLabelClick"
    >
      <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
      <span v-if="header.column.getIsSorted() === 'asc'" class="airgrid-sort-indicator" aria-hidden="true">↑</span>
      <span v-else-if="header.column.getIsSorted() === 'desc'" class="airgrid-sort-indicator" aria-hidden="true">↓</span>
    </span>
    <button
      v-if="filterType"
      type="button"
      class="airgrid-filter-btn"
      :class="{ 'airgrid-filter-btn-active': filterActive }"
      aria-label="필터"
      @click.stop="toggleFilter"
    >
      ▾
      <span v-if="filterActive" class="airgrid-filter-dot" aria-hidden="true" />
    </button>
    <span
      class="airgrid-resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label="컬럼 폭 조절"
      title="드래그하여 컬럼 폭 조절"
      @pointerdown="onResizeStart"
      @click="(e) => e.stopPropagation()"
    />
    <HeaderFilterPopover
      v-if="filterOpen"
      :column="header.column"
      :table="header.getContext().table"
      @click.stop
    />
  </div>
</template>

<style scoped>
.airgrid-header-cell-inner {
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
  position: relative;
}
.airgrid-header-label {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
.airgrid-header-label[aria-disabled="true"] {
  cursor: default;
}
.airgrid-sort-indicator {
  font-size: 10px;
  color: var(--airgrid-sort-fg, #047857);
}
.airgrid-filter-btn {
  position: relative;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--airgrid-empty-fg, #9ca3af);
  cursor: pointer;
  font-size: 10px;
  line-height: 1;
  padding: 2px 4px;
}
.airgrid-filter-btn-active {
  color: var(--airgrid-active-fg, #4338ca);
}
.airgrid-filter-dot {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--airgrid-active-fg, #4338ca);
}
.airgrid-resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  right: -4px;
  width: 8px;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  z-index: 4;
}
</style>
