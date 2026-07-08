# airgrid-vue SDD progress

Plan: winipic-os/docs/superpowers/plans/2026-07-08-airgrid-vue-port.md

Task 1: complete (commit 34db7dd, scaffold; controller-verified: 7 files, dist artifacts, no node_modules, unplugin-vue bumped 5.2.4→5.2.1)
Task 2: complete (commit 9cd4ae9, types.ts port; vue-tsc PASS, cell→VNode, vue-table import, no react leftovers)
Task 3: complete (commit 96cde0d, filterFns port; 8/8 tests pass, verbatim + vue-table import, controller-verified)
Task 4: complete (commit 092baff, persistence port; 12/12 total tests pass, controller-verified)
Task 5: complete (commits a7c8a49 + fix 4c02056, DataGrid.vue core; reviewer found 2 criticals [dead cell renderer, numeric height px→virtualization defeat] + type-check gate; fixed; vue-tsc 0 errors, 15/15 tests)
Task 6: complete (commit 0fd90ae, EditableCell + cellEdit; 16/16, vue-tsc 0, controller-verified). NOTE for final review: single-input mode only (React's double-click view/edit toggle + number-parse not ported — out of plan scope, /members edits via modal anyway).
Task 7: complete (commit e1ebbcf, HeaderCell sort+resize; 17/17, vue-tsc 0). NOTE: added sortDescFirst:false (asc-first for numeric, matches test/UX). Resize reimplements pointer-events vs TanStack getResizeHandler (per plan spec) — final-review note.
Task 8: complete (commit 0c34308 + fix 3207b25, HeaderFilterPopover 4 types; reviewer found 2 Important [multi-select :selected binding, popover outside/Esc close] + minor; fixed + 3 regression tests; 21/21, vue-tsc 0)
Task 9: complete (commit 12ecdb0, HideColumnsMenu; 22/22, vue-tsc 0, controller-verified). Skipped React's defaultViewLocked/onHideRequest fork props (no consumer yet).
Task 10: complete (commit 776a313, SortPriorityPanel; 23/23, vue-tsc 0, controller-verified). Multi-sort already worked pre-panel. Self-contained (matches HideColumnsMenu pattern) vs React's anchor/onClose.
Task 11: complete (commit 64472ed, native HTML5 column reorder, no @dnd-kit; 24/24, vue-tsc 0, controller-verified). arrayMove helper, seeds columnOrder from def order first reorder.
Task 12: complete (commit ea3936d, rowClick + cell slot/render-fn; 27/27, vue-tsc 0, controller-verified). Fixed test bug (h from vue not @vue/test-utils); added data-col to body cells + scoped Reorder test selector to header row.
