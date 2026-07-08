<script setup lang="ts">
// 헤더 셀 — 정렬 토글(라벨 클릭) + 우측 핸들 드래그 리사이즈.
// React 원본(~/airgrid/src/HeaderCell.tsx)의 드래그 리오더 / 우클릭 필터
// popover 는 후속 task(8) — 여기선 sort + resize 만.
import { FlexRender, type Header } from "@tanstack/vue-table";
import type { AirgridMeta } from "./types";

const props = defineProps<{ header: Header<any, unknown> }>();

// 컬럼 폭 하한 — ColumnDef.minWidth 없으면 48px.
const RESIZE_FLOOR = 48;

function onLabelClick() {
  if (!props.header.column.getCanSort()) return;
  props.header.column.toggleSorting();
}

// pointerdown 에서 시작 X / 시작 폭을 캡처, pointermove 로 table 의
// columnSizing 을 갱신, pointerup 에서 리스너 정리. minWidth(메타) 또는
// 48px 하한으로 클램프.
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
  function onEnd(ev: PointerEvent) {
    target.releasePointerCapture?.(ev.pointerId);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onEnd);
  }
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onEnd);
}
</script>

<template>
  <div class="airgrid-header-cell-inner">
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
    <span
      class="airgrid-resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label="컬럼 폭 조절"
      title="드래그하여 컬럼 폭 조절"
      @pointerdown="onResizeStart"
      @click="(e) => e.stopPropagation()"
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
