// 라이브러리 빌드 설정. dist/index.js(esm) + dist/index.cjs(cjs) 생성.
// 타입 선언(.d.ts)은 vue-tsc 가 별도 단계에서 생성 (build 스크립트 참고) —
// esbuild 기반 번들러(tsup 등)는 .vue SFC 의 scoped <style> 가상 모듈을
// 올바른 loader 로 처리하지 못하는 알려진 문제가 있어, 이 프로젝트 검증 결과
// Rollup 기반인 vite build 로 전환했다.
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    rollupOptions: {
      external: ["vue", "@tanstack/vue-table", "@tanstack/vue-virtual"],
    },
    emptyOutDir: true,
  },
});
