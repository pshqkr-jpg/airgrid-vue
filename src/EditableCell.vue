<script setup lang="ts">
// 인라인 편집 cell — 항상 input 을 렌더 (view/edit 이중 모드는 후속).
// blur / Enter 로 commit, Esc 로 revert(no commit). React 원본의
// commit/cancel semantics 를 그대로 포팅.
import { ref, watch } from "vue";

const props = defineProps<{ modelValue: unknown }>();
const emit = defineEmits<{ commit: [value: unknown] }>();

const initial = () => (props.modelValue == null ? "" : String(props.modelValue));
const draft = ref(initial());

// 외부 modelValue 변경 시 draft 동기화.
watch(() => props.modelValue, () => { draft.value = initial(); });

function commit() {
  if (draft.value === initial()) return;
  emit("commit", draft.value);
}

function onKeydown(e: KeyboardEvent) {
  const input = e.currentTarget as HTMLInputElement;
  if (e.key === "Enter") {
    input.blur();
  } else if (e.key === "Escape") {
    draft.value = initial();
    input.blur();
  }
}
</script>

<template>
  <input v-model="draft" @blur="commit" @keydown="onKeydown" />
</template>
