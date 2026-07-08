import { defineConfig } from "tsup";
import vue from "unplugin-vue/esbuild";
export default defineConfig({
  entry: ["src/index.ts"], format: ["esm", "cjs"], dts: true,
  external: ["vue", "@tanstack/vue-table", "@tanstack/vue-virtual"],
  esbuildPlugins: [vue()],
});
