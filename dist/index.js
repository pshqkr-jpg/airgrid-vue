import { defineComponent as B, ref as P, watch as le, withDirectives as oe, openBlock as i, createElementBlock as s, vModelText as re, computed as _, createElementVNode as g, Fragment as M, renderList as K, toDisplayString as R, createCommentVNode as T, onBeforeUnmount as Z, createBlock as X, unref as j, withModifiers as J, normalizeClass as Y, createTextVNode as ie, useSlots as ce, shallowRef as de, createVNode as ne, normalizeStyle as W, renderSlot as me } from "vue";
import { FlexRender as ae, useVueTable as ve, getSortedRowModel as fe, getFilteredRowModel as ge, getCoreRowModel as pe } from "@tanstack/vue-table";
import { useVirtualizer as ye } from "@tanstack/vue-virtual";
function ue(l) {
  return l == null ? null : typeof l == "string" ? l.trim() === "" ? null : { op: "contains", value: l } : typeof l == "object" ? l : null;
}
function se(l) {
  if (l == null || typeof l != "object") return null;
  const e = l;
  return !e.op && (e.min != null || e.max != null) ? { op: "between", min: e.min, max: e.max } : e;
}
function Q(l) {
  const e = ue(l);
  return e ? e.op === "isEmpty" || e.op === "isNotEmpty" ? !0 : !!e.value && e.value.trim() !== "" : !1;
}
function ee(l) {
  const e = se(l);
  return e ? e.op === "isEmpty" || e.op === "isNotEmpty" ? !0 : e.op === "between" ? typeof e.min == "number" && Number.isFinite(e.min) || typeof e.max == "number" && Number.isFinite(e.max) : typeof e.value == "number" && Number.isFinite(e.value) : !1;
}
const be = (l, e, t) => {
  const o = ue(t);
  if (!o || !Q(t)) return !0;
  const v = l.getValue(e), c = v == null || String(v).trim() === "", h = o.op ?? "contains";
  if (h === "isEmpty") return c;
  if (h === "isNotEmpty") return !c;
  if (c) return !1;
  const a = String(v).toLowerCase(), d = (o.value ?? "").trim().toLowerCase();
  switch (h) {
    case "is":
      return a === d;
    case "isNot":
      return a !== d;
    case "notContains":
      return !a.includes(d);
    case "startsWith":
      return a.startsWith(d);
    case "endsWith":
      return a.endsWith(d);
    case "contains":
    default:
      return a.includes(d);
  }
}, he = (l, e, t) => {
  const o = se(t);
  if (!o || !ee(t)) return !0;
  const v = l.getValue(e), c = v == null || v === "", h = o.op ?? "between";
  if (h === "isEmpty") return c;
  if (h === "isNotEmpty") return !c;
  if (c) return !1;
  const a = typeof v == "number" ? v : Number(v);
  if (!Number.isFinite(a)) return !1;
  if (h === "between")
    return !(o.min != null && a < o.min || o.max != null && a > o.max);
  if (o.value == null || !Number.isFinite(o.value)) return !0;
  switch (h) {
    case "eq":
      return a === o.value;
    case "neq":
      return a !== o.value;
    case "lt":
      return a < o.value;
    case "gt":
      return a > o.value;
    case "lte":
      return a <= o.value;
    case "gte":
      return a >= o.value;
  }
  return !0;
}, we = (l, e, t) => {
  if (!Array.isArray(t) || t.length === 0) return !0;
  const o = l.getValue(e);
  return t.includes(String(o ?? ""));
}, _e = (l, e, t) => t === "any" || t == null ? !0 : l.getValue(e) === t;
function ke(l) {
  switch (l) {
    case "text":
      return be;
    case "numberRange":
      return he;
    case "select":
      return we;
    case "boolean":
      return _e;
    default:
      return;
  }
}
const te = "airgrid:";
function Ce(l) {
  if (typeof window > "u") return null;
  try {
    const e = window.localStorage.getItem(te + l);
    if (!e) return null;
    const t = JSON.parse(e);
    return {
      sorting: t.sorting ?? [],
      columnFilters: t.columnFilters ?? [],
      columnVisibility: t.columnVisibility ?? {},
      columnOrder: t.columnOrder ?? [],
      columnSizing: t.columnSizing ?? {}
    };
  } catch {
    return null;
  }
}
function Se(l, e) {
  if (!(typeof window > "u"))
    try {
      window.localStorage.setItem(te + l, JSON.stringify(e));
    } catch {
    }
}
function Ft(l) {
  if (!(typeof window > "u"))
    try {
      window.localStorage.removeItem(te + l);
    } catch {
    }
}
function xe(l, e) {
  if (!l || l.length === 0) return [];
  const t = new Set(e), o = l.filter((c) => t.has(c)), v = new Set(o);
  for (let c = 0; c < e.length; c++) {
    const h = e[c];
    if (v.has(h)) continue;
    let a = 0;
    for (let d = c - 1; d >= 0; d--) {
      const x = o.indexOf(e[d]);
      if (x >= 0) {
        a = x + 1;
        break;
      }
    }
    o.splice(a, 0, h), v.add(h);
  }
  return o;
}
function Ee(l, e) {
  const t = { ...l ?? {} };
  for (const o of e)
    !(o.id in t) && o.defaultVisible === !1 && (t[o.id] = !1);
  return t;
}
const Ve = /* @__PURE__ */ B({
  __name: "EditableCell",
  props: {
    modelValue: {}
  },
  emits: ["commit"],
  setup(l, { emit: e }) {
    const t = l, o = e, v = () => t.modelValue == null ? "" : String(t.modelValue), c = P(v());
    le(() => t.modelValue, () => {
      c.value = v();
    });
    function h() {
      c.value !== v() && o("commit", c.value);
    }
    function a(d) {
      const x = d.currentTarget;
      d.key === "Enter" ? x.blur() : d.key === "Escape" && (c.value = v(), x.blur());
    }
    return (d, x) => oe((i(), s("input", {
      "onUpdate:modelValue": x[0] || (x[0] = (y) => c.value = y),
      onBlur: h,
      onKeydown: a
    }, null, 544)), [
      [re, c.value]
    ]);
  }
}), Fe = {
  class: "airgrid-filter-popover",
  role: "menu"
}, $e = {
  key: 0,
  class: "airgrid-filter-input-group"
}, De = ["value"], Ne = ["value"], Oe = ["placeholder", "value", "disabled"], Le = {
  key: 1,
  class: "airgrid-filter-input-group"
}, Ie = ["value"], Re = ["value"], Te = {
  key: 0,
  class: "airgrid-filter-range"
}, Pe = ["value"], Me = ["value"], ze = {
  key: 1,
  type: "text",
  placeholder: "(값 입력 불필요)",
  disabled: ""
}, Ae = ["value"], Ke = ["value"], He = ["value", "selected"], We = /* @__PURE__ */ B({
  __name: "HeaderFilterPopover",
  props: {
    column: {},
    table: {}
  },
  setup(l) {
    const e = l, t = _(() => e.column.columnDef.meta), o = _(() => {
      var r;
      return (r = t.value) == null ? void 0 : r.filterType;
    }), v = _(() => {
      var u;
      if ((u = t.value) != null && u.selectOptions) return t.value.selectOptions;
      const r = /* @__PURE__ */ new Set();
      for (const p of e.table.getPreFilteredRowModel().rows) {
        const A = p.getValue(e.column.id);
        A != null && A !== "" && r.add(String(A));
      }
      return Array.from(r);
    }), c = [
      { value: "contains", label: "포함" },
      { value: "notContains", label: "미포함" },
      { value: "is", label: "일치" },
      { value: "isNot", label: "불일치" },
      { value: "startsWith", label: "~로 시작" },
      { value: "endsWith", label: "~로 끝남" },
      { value: "isEmpty", label: "비어있음" },
      { value: "isNotEmpty", label: "값 있음" }
    ], h = [
      { value: "between", label: "범위" },
      { value: "eq", label: "=" },
      { value: "neq", label: "≠" },
      { value: "lt", label: "<" },
      { value: "gt", label: ">" },
      { value: "lte", label: "≤" },
      { value: "gte", label: "≥" },
      { value: "isEmpty", label: "비어있음" },
      { value: "isNotEmpty", label: "값 있음" }
    ], a = _(() => {
      const r = e.column.getFilterValue();
      return typeof r == "string" ? { op: "contains", value: r } : r && typeof r == "object" ? r : {};
    }), d = _(() => a.value.op ?? "contains"), x = _(() => d.value === "isEmpty" || d.value === "isNotEmpty");
    function y(r) {
      const u = r.target.value;
      u === "isEmpty" || u === "isNotEmpty" ? e.column.setFilterValue({ op: u }) : e.column.setFilterValue({ op: u, value: a.value.value ?? "" });
    }
    function I(r) {
      const u = r.target.value;
      e.column.setFilterValue({ op: d.value, value: u });
    }
    const E = _(() => {
      const r = e.column.getFilterValue();
      if (r && typeof r == "object") {
        const u = r;
        return !u.op && (u.min != null || u.max != null) ? { op: "between", min: u.min, max: u.max } : u;
      }
      return {};
    }), N = _(() => E.value.op ?? "between");
    function L(r) {
      const u = r.target.value, p = E.value;
      u === "isEmpty" || u === "isNotEmpty" ? e.column.setFilterValue({ op: u }) : u === "between" ? e.column.setFilterValue({ op: u, min: p.min, max: p.max }) : e.column.setFilterValue({ op: u, value: p.value });
    }
    function w(r) {
      const u = r.target.value, p = u === "" ? void 0 : Number(u);
      e.column.setFilterValue({ op: "between", min: p, max: E.value.max });
    }
    function O(r) {
      const u = r.target.value, p = u === "" ? void 0 : Number(u);
      e.column.setFilterValue({ op: "between", min: E.value.min, max: p });
    }
    function k(r) {
      const u = r.target.value, p = u === "" ? void 0 : Number(u);
      e.column.setFilterValue({ op: N.value, value: p });
    }
    const F = _(() => {
      const r = e.column.getFilterValue();
      return r === !0 ? "true" : r === !1 ? "false" : "any";
    });
    function m(r) {
      const u = r.target.value;
      e.column.setFilterValue(u === "any" ? void 0 : u === "true");
    }
    const f = _(() => {
      const r = e.column.getFilterValue();
      return Array.isArray(r) ? r : [];
    });
    function C(r) {
      const u = Array.from(r.target.selectedOptions, (p) => p.value);
      e.column.setFilterValue(u.length === 0 ? void 0 : u);
    }
    function $() {
      e.column.setFilterValue(void 0);
    }
    const z = _(() => {
      const r = e.column.getFilterValue();
      if (r == null) return !1;
      switch (o.value) {
        case "text":
          return Q(r);
        case "numberRange":
          return ee(r);
        case "select":
          return Array.isArray(r) && r.length > 0;
        case "boolean":
          return r !== "any";
        default:
          return !1;
      }
    });
    return (r, u) => (i(), s("div", Fe, [
      o.value === "text" ? (i(), s("div", $e, [
        g("select", {
          value: d.value,
          class: "airgrid-filter-select",
          onChange: y
        }, [
          (i(), s(M, null, K(c, (p) => g("option", {
            key: p.value,
            value: p.value
          }, R(p.label), 9, Ne)), 64))
        ], 40, De),
        g("input", {
          type: "text",
          autofocus: "",
          class: "airgrid-filter-text-input",
          placeholder: x.value ? "(값 입력 불필요)" : "검색…",
          value: a.value.value ?? "",
          disabled: x.value,
          onInput: I
        }, null, 40, Oe)
      ])) : o.value === "numberRange" ? (i(), s("div", Le, [
        g("select", {
          value: N.value,
          class: "airgrid-filter-select",
          onChange: L
        }, [
          (i(), s(M, null, K(h, (p) => g("option", {
            key: p.value,
            value: p.value
          }, R(p.label), 9, Re)), 64))
        ], 40, Ie),
        N.value === "between" ? (i(), s("div", Te, [
          g("input", {
            type: "number",
            autofocus: "",
            placeholder: "min",
            value: E.value.min ?? "",
            onInput: w
          }, null, 40, Pe),
          g("input", {
            type: "number",
            placeholder: "max",
            value: E.value.max ?? "",
            onInput: O
          }, null, 40, Me)
        ])) : N.value === "isEmpty" || N.value === "isNotEmpty" ? (i(), s("input", ze)) : (i(), s("input", {
          key: 2,
          type: "number",
          autofocus: "",
          placeholder: "값",
          value: E.value.value ?? "",
          onInput: k
        }, null, 40, Ae))
      ])) : o.value === "boolean" ? (i(), s("select", {
        key: 2,
        value: F.value,
        class: "airgrid-filter-select",
        onChange: m
      }, [...u[0] || (u[0] = [
        g("option", { value: "any" }, "전체", -1),
        g("option", { value: "true" }, "예", -1),
        g("option", { value: "false" }, "아니오", -1)
      ])], 40, Ke)) : o.value === "select" ? (i(), s("select", {
        key: 3,
        multiple: "",
        class: "airgrid-filter-select airgrid-filter-multiselect",
        onChange: C
      }, [
        (i(!0), s(M, null, K(v.value, (p) => (i(), s("option", {
          key: p,
          value: p,
          selected: f.value.includes(p)
        }, R(p), 9, He))), 128))
      ], 32)) : T("", !0),
      z.value ? (i(), s("button", {
        key: 4,
        type: "button",
        class: "airgrid-filter-reset",
        onClick: $
      }, "필터 초기화")) : T("", !0)
    ]));
  }
}), U = (l, e) => {
  const t = l.__vccOpts || l;
  for (const [o, v] of e)
    t[o] = v;
  return t;
}, je = /* @__PURE__ */ U(We, [["__scopeId", "data-v-ff3ffe60"]]), Be = ["aria-disabled"], qe = {
  key: 1,
  class: "airgrid-sort-indicator",
  "aria-hidden": "true"
}, Xe = {
  key: 2,
  class: "airgrid-sort-indicator",
  "aria-hidden": "true"
}, Ue = {
  key: 0,
  class: "airgrid-filter-dot",
  "aria-hidden": "true"
}, Ge = 48, Je = /* @__PURE__ */ B({
  __name: "HeaderCell",
  props: {
    header: {}
  },
  setup(l) {
    const e = l, t = _(() => e.header.column.columnDef.meta), o = _(() => {
      var w;
      return (w = t.value) == null ? void 0 : w.filterType;
    }), v = P(!1), c = P(null), h = _(() => {
      const w = e.header.column.getFilterValue();
      if (w == null) return !1;
      switch (o.value) {
        case "text":
          return Q(w);
        case "numberRange":
          return ee(w);
        case "select":
          return Array.isArray(w) && w.length > 0;
        case "boolean":
          return w !== "any";
        default:
          return !1;
      }
    });
    function a(w) {
      c.value && !c.value.contains(w.target) && y();
    }
    function d(w) {
      w.key === "Escape" && y();
    }
    function x() {
      v.value = !0, document.addEventListener("mousedown", a), document.addEventListener("keydown", d);
    }
    function y() {
      v.value = !1, document.removeEventListener("mousedown", a), document.removeEventListener("keydown", d);
    }
    function I() {
      v.value ? y() : x();
    }
    Z(() => {
      document.removeEventListener("mousedown", a), document.removeEventListener("keydown", d), N == null || N();
    });
    function E() {
      e.header.column.getCanSort() && e.header.column.toggleSorting();
    }
    let N = null;
    function L(w) {
      var p;
      w.stopPropagation(), w.preventDefault();
      const O = e.header, k = O.getContext().table, F = O.column.columnDef.meta, m = (F == null ? void 0 : F.minWidth) ?? Ge, f = w.clientX, C = O.getSize(), $ = w.currentTarget;
      (p = $.setPointerCapture) == null || p.call($, w.pointerId);
      function z(A) {
        const n = Math.max(m, C + (A.clientX - f));
        k.setColumnSizing((D) => ({ ...D, [O.column.id]: n }));
      }
      function r() {
        N = null, window.removeEventListener("pointermove", z), window.removeEventListener("pointerup", u);
      }
      function u(A) {
        var n;
        (n = $.releasePointerCapture) == null || n.call($, A.pointerId), r();
      }
      N = r, window.addEventListener("pointermove", z), window.addEventListener("pointerup", u);
    }
    return (w, O) => (i(), s("div", {
      ref_key: "cellRoot",
      ref: c,
      class: "airgrid-header-cell-inner"
    }, [
      g("span", {
        class: "airgrid-header-label",
        role: "button",
        "aria-disabled": !l.header.column.getCanSort(),
        onClick: E
      }, [
        l.header.isPlaceholder ? T("", !0) : (i(), X(j(ae), {
          key: 0,
          render: l.header.column.columnDef.header,
          props: l.header.getContext()
        }, null, 8, ["render", "props"])),
        l.header.column.getIsSorted() === "asc" ? (i(), s("span", qe, "↑")) : l.header.column.getIsSorted() === "desc" ? (i(), s("span", Xe, "↓")) : T("", !0)
      ], 8, Be),
      o.value ? (i(), s("button", {
        key: 0,
        type: "button",
        class: Y(["airgrid-filter-btn", { "airgrid-filter-btn-active": h.value }]),
        "aria-label": "필터",
        onClick: J(I, ["stop"])
      }, [
        O[2] || (O[2] = ie(" ▾ ", -1)),
        h.value ? (i(), s("span", Ue)) : T("", !0)
      ], 2)) : T("", !0),
      g("span", {
        class: "airgrid-resize-handle",
        role: "separator",
        "aria-orientation": "vertical",
        "aria-label": "컬럼 폭 조절",
        title: "드래그하여 컬럼 폭 조절",
        onPointerdown: L,
        onClick: O[0] || (O[0] = (k) => k.stopPropagation())
      }, null, 32),
      v.value ? (i(), X(je, {
        key: 1,
        column: l.header.column,
        table: l.header.getContext().table,
        onClick: O[1] || (O[1] = J(() => {
        }, ["stop"]))
      }, null, 8, ["column", "table"])) : T("", !0)
    ], 512));
  }
}), Ye = /* @__PURE__ */ U(Je, [["__scopeId", "data-v-779345fb"]]), Ze = {
  key: 0,
  class: "airgrid-hide-popover"
}, Qe = { class: "airgrid-hide-section-label" }, et = ["data-hide-toggle", "onClick"], tt = { class: "airgrid-hide-item-label" }, nt = { class: "airgrid-hide-section-label" }, lt = ["data-hide-toggle", "onClick"], ot = { class: "airgrid-hide-item-label" }, rt = {
  key: 2,
  class: "airgrid-hide-empty"
}, it = /* @__PURE__ */ B({
  __name: "HideColumnsMenu",
  props: {
    table: {}
  },
  setup(l) {
    const e = l, t = P(!1), o = P(""), v = P(null);
    function c(k) {
      v.value && !v.value.contains(k.target) && d();
    }
    function h(k) {
      k.key === "Escape" && d();
    }
    function a() {
      t.value = !0, document.addEventListener("mousedown", c), document.addEventListener("keydown", h);
    }
    function d() {
      t.value = !1, o.value = "", document.removeEventListener("mousedown", c), document.removeEventListener("keydown", h);
    }
    function x() {
      t.value ? d() : a();
    }
    Z(() => {
      document.removeEventListener("mousedown", c), document.removeEventListener("keydown", h);
    });
    const y = _(() => e.table.getAllLeafColumns()), I = _(() => y.value.filter((k) => k.getIsVisible()).length), E = _(() => {
      const k = o.value.trim().toLowerCase();
      return k ? y.value.filter((F) => String(F.columnDef.header).toLowerCase().includes(k)) : y.value;
    }), N = _(() => E.value.filter((k) => k.getIsVisible())), L = _(() => E.value.filter((k) => !k.getIsVisible()));
    function w(k) {
      var F;
      (F = e.table.getColumn(k)) == null || F.toggleVisibility();
    }
    function O() {
      e.table.resetColumnVisibility();
    }
    return (k, F) => (i(), s("div", {
      ref_key: "root",
      ref: v,
      class: "airgrid-hide-menu"
    }, [
      g("button", {
        type: "button",
        class: "airgrid-hide-btn",
        title: "컬럼 표시 / 숨김",
        onClick: x
      }, " ⚙ 컬럼 (" + R(I.value) + "/" + R(y.value.length) + ") ", 1),
      t.value ? (i(), s("div", Ze, [
        oe(g("input", {
          "onUpdate:modelValue": F[0] || (F[0] = (m) => o.value = m),
          type: "text",
          autofocus: "",
          placeholder: "컬럼명 검색…",
          class: "airgrid-hide-search"
        }, null, 512), [
          [re, o.value]
        ]),
        N.value.length > 0 ? (i(), s(M, { key: 0 }, [
          g("div", Qe, "표시 중 (" + R(N.value.length) + ")", 1),
          (i(!0), s(M, null, K(N.value, (m) => (i(), s("button", {
            key: m.id,
            type: "button",
            class: "airgrid-hide-item",
            "data-hide-toggle": m.id,
            onClick: (f) => w(m.id)
          }, [
            F[1] || (F[1] = g("span", {
              class: "airgrid-hide-marker airgrid-hide-marker-on",
              "aria-hidden": "true"
            }, "✓", -1)),
            g("span", tt, R(m.columnDef.header), 1)
          ], 8, et))), 128))
        ], 64)) : T("", !0),
        L.value.length > 0 ? (i(), s(M, { key: 1 }, [
          g("div", nt, "숨김 (" + R(L.value.length) + ")", 1),
          (i(!0), s(M, null, K(L.value, (m) => (i(), s("button", {
            key: m.id,
            type: "button",
            class: "airgrid-hide-item",
            "data-hide-toggle": m.id,
            onClick: (f) => w(m.id)
          }, [
            F[2] || (F[2] = g("span", {
              class: "airgrid-hide-marker",
              "aria-hidden": "true"
            }, null, -1)),
            g("span", ot, R(m.columnDef.header), 1)
          ], 8, lt))), 128))
        ], 64)) : T("", !0),
        E.value.length === 0 ? (i(), s("div", rt, "일치하는 컬럼 없음")) : T("", !0),
        g("button", {
          type: "button",
          class: "airgrid-hide-reset",
          onClick: O
        }, "모두 표시로 초기화")
      ])) : T("", !0)
    ], 512));
  }
}), at = /* @__PURE__ */ U(it, [["__scopeId", "data-v-0276a726"]]), ut = {
  key: 0,
  class: "airgrid-sort-popover",
  role: "dialog",
  "aria-label": "정렬 우선순위"
}, st = {
  key: 0,
  class: "airgrid-sort-empty"
}, ct = {
  key: 1,
  class: "airgrid-sort-list"
}, dt = ["aria-label", "onDragstart", "onDrop"], mt = { class: "airgrid-sort-badge" }, vt = { class: "airgrid-sort-label" }, ft = ["onClick"], gt = ["onClick"], pt = {
  key: 2,
  class: "airgrid-sort-add-row"
}, yt = ["value"], bt = /* @__PURE__ */ B({
  __name: "SortPriorityPanel",
  props: {
    table: {}
  },
  setup(l) {
    const e = l, t = P(!1), o = P(null), v = P(null);
    function c(m) {
      v.value && !v.value.contains(m.target) && d();
    }
    function h(m) {
      m.key === "Escape" && d();
    }
    function a() {
      t.value = !0, document.addEventListener("mousedown", c), document.addEventListener("keydown", h);
    }
    function d() {
      t.value = !1, o.value = null, document.removeEventListener("mousedown", c), document.removeEventListener("keydown", h);
    }
    function x() {
      t.value ? d() : a();
    }
    Z(() => {
      document.removeEventListener("mousedown", c), document.removeEventListener("keydown", h);
    });
    const y = _(() => e.table.getState().sorting), I = _(() => e.table.getAllLeafColumns().filter((m) => m.getCanSort())), E = _(() => {
      const m = new Set(y.value.map((f) => f.id));
      return I.value.filter((f) => !m.has(f.id));
    });
    function N(m) {
      const f = e.table.getColumn(m);
      return f ? String(f.columnDef.header) : m;
    }
    function L(m, f) {
      if (m === f) return;
      const C = [...y.value], [$] = C.splice(m, 1);
      C.splice(f, 0, $), e.table.setSorting(C);
    }
    function w(m) {
      e.table.setSorting(y.value.map((f, C) => C === m ? { ...f, desc: !f.desc } : f));
    }
    function O(m) {
      e.table.setSorting(y.value.filter((f, C) => C !== m));
    }
    function k(m) {
      const f = m.target, C = f.value;
      if (!C) return;
      const $ = [...y.value, { id: C, desc: !1 }];
      e.table.setSorting($), f.value = "";
    }
    function F() {
      e.table.setSorting([]);
    }
    return (m, f) => (i(), s("div", {
      ref_key: "root",
      ref: v,
      class: "airgrid-sort-menu"
    }, [
      g("button", {
        type: "button",
        class: Y(["airgrid-sort-btn", { "airgrid-sort-btn-active": y.value.length > 0 }]),
        title: "정렬 우선순위 (다중 정렬)",
        onClick: x
      }, " ⇅ 정렬" + R(y.value.length > 0 ? ` (${y.value.length})` : ""), 3),
      t.value ? (i(), s("div", ut, [
        f[4] || (f[4] = g("div", { class: "airgrid-sort-title" }, "정렬 우선순위", -1)),
        y.value.length === 0 ? (i(), s("div", st, "정렬이 없습니다. 아래에서 추가하세요.")) : (i(), s("div", ct, [
          (i(!0), s(M, null, K(y.value, (C, $) => (i(), s("div", {
            key: C.id,
            draggable: "true",
            class: Y(["airgrid-sort-row", { "airgrid-sort-row-dragging": o.value === $ }]),
            "aria-label": `${$ + 1}순위 정렬 ${N(C.id)}`,
            onDragstart: (z) => o.value = $,
            onDragover: f[0] || (f[0] = J(() => {
            }, ["prevent"])),
            onDrop: () => {
              o.value != null && L(o.value, $), o.value = null;
            },
            onDragend: f[1] || (f[1] = (z) => o.value = null)
          }, [
            f[2] || (f[2] = g("span", {
              class: "airgrid-sort-drag-handle",
              "aria-hidden": "true"
            }, "⋮⋮", -1)),
            g("span", mt, R($ + 1), 1),
            g("span", vt, R(N(C.id)), 1),
            g("button", {
              type: "button",
              class: "airgrid-sort-dir-btn",
              onClick: (z) => w($)
            }, R(C.desc ? "↓ 내림차순" : "↑ 오름차순"), 9, ft),
            g("button", {
              type: "button",
              class: "airgrid-sort-remove-btn",
              "aria-label": "정렬 제거",
              onClick: (z) => O($)
            }, "×", 8, gt)
          ], 42, dt))), 128))
        ])),
        E.value.length > 0 ? (i(), s("div", pt, [
          g("select", {
            class: "airgrid-sort-add-select",
            onChange: k
          }, [
            f[3] || (f[3] = g("option", { value: "" }, "+ 정렬 컬럼 추가…", -1)),
            (i(!0), s(M, null, K(E.value, (C) => (i(), s("option", {
              key: C.id,
              value: C.id
            }, R(String(C.columnDef.header)), 9, yt))), 128))
          ], 32)
        ])) : T("", !0),
        y.value.length > 0 ? (i(), s("button", {
          key: 3,
          type: "button",
          class: "airgrid-sort-reset",
          onClick: F
        }, " 전체 정렬 해제 ")) : T("", !0)
      ])) : T("", !0)
    ], 512));
  }
}), ht = /* @__PURE__ */ U(bt, [["__scopeId", "data-v-2b7dcd97"]]), wt = { class: "airgrid-toolbar" }, _t = ["data-col", "onDragstart", "onDrop"], kt = ["data-row"], Ct = ["data-col", "onClick"], St = /* @__PURE__ */ B({
  __name: "DataGrid",
  props: {
    data: {},
    columns: {},
    rowKey: {},
    height: {},
    estimateRowHeight: {},
    filterPersistKey: {},
    viewState: {},
    rowClass: { type: Function }
  },
  emits: ["cellEdit", "rowClick", "update:viewState"],
  setup(l, { emit: e }) {
    var z, r, u, p, A;
    const t = l, o = e, v = ce();
    function c(n) {
      return !!v[`cell-${n}`];
    }
    function h(n, D) {
      var b;
      (b = n.column.columnDef.meta) != null && b.editable && !c(n.column.id) || o("rowClick", D);
    }
    const a = t.filterPersistKey ? Ce(t.filterPersistKey) : null, d = P((a == null ? void 0 : a.sorting) ?? ((z = t.viewState) == null ? void 0 : z.sorting) ?? []), x = P((a == null ? void 0 : a.columnFilters) ?? ((r = t.viewState) == null ? void 0 : r.columnFilters) ?? []), y = P(
      Ee((a == null ? void 0 : a.columnVisibility) ?? ((u = t.viewState) == null ? void 0 : u.columnVisibility), t.columns)
    ), I = P(
      xe((a == null ? void 0 : a.columnOrder) ?? ((p = t.viewState) == null ? void 0 : p.columnOrder), t.columns.map((n) => n.id))
    ), E = P((a == null ? void 0 : a.columnSizing) ?? ((A = t.viewState) == null ? void 0 : A.columnSizing) ?? {}), N = _(() => t.columns.map((n) => ({
      id: n.id,
      accessorKey: n.accessorKey,
      header: n.header,
      // c.cell 은 row 전체를 받는 우리 시그니처 — TanStack 의 CellContext 어댑터로 감쌈.
      // 없으면 undefined 로 둬 template 이 raw value(cell.getValue()) 로 폴백.
      cell: n.cell ? (D) => n.cell(D.row.original) : void 0,
      enableSorting: n.sortable !== !1,
      filterFn: ke(n.filterType),
      meta: {
        align: n.align,
        width: n.width,
        minWidth: n.minWidth,
        filterType: n.filterType,
        selectOptions: n.selectOptions,
        editable: n.editable
      }
    }))), L = ve({
      get data() {
        return t.data;
      },
      get columns() {
        return N.value;
      },
      state: {
        get sorting() {
          return d.value;
        },
        get columnFilters() {
          return x.value;
        },
        get columnVisibility() {
          return y.value;
        },
        get columnOrder() {
          return I.value;
        },
        get columnSizing() {
          return E.value;
        }
      },
      onSortingChange: (n) => {
        d.value = typeof n == "function" ? n(d.value) : n;
      },
      onColumnFiltersChange: (n) => {
        x.value = typeof n == "function" ? n(x.value) : n;
      },
      onColumnVisibilityChange: (n) => {
        y.value = typeof n == "function" ? n(y.value) : n;
      },
      onColumnOrderChange: (n) => {
        I.value = typeof n == "function" ? n(I.value) : n;
      },
      onColumnSizingChange: (n) => {
        E.value = typeof n == "function" ? n(E.value) : n;
      },
      getCoreRowModel: pe(),
      getFilteredRowModel: ge(),
      getSortedRowModel: fe(),
      getRowId: (n) => String(n[t.rowKey]),
      // TanStack 기본값은 숫자 컬럼을 desc-first 로 토글 — 그리드 관례(오름차순 먼저)에
      // 맞춰 모든 컬럼을 asc-first 로 통일.
      sortDescFirst: !1
    });
    le([d, x, y, I, E], () => {
      const n = {
        sorting: d.value,
        columnFilters: x.value,
        columnVisibility: y.value,
        columnOrder: I.value,
        columnSizing: E.value
      };
      t.filterPersistKey && Se(t.filterPersistKey, n), o("update:viewState", n);
    }, { deep: !0 });
    const w = _(() => typeof t.height == "number" ? `${t.height}px` : t.height ?? "600px"), O = _(() => L.getVisibleLeafColumns().map((n) => {
      var V;
      const D = E.value[n.id];
      return D != null ? `${D}px` : ((V = n.columnDef.meta) == null ? void 0 : V.width) ?? "minmax(80px, 1fr)";
    }).join(" ")), k = de(null), F = ye(_(() => ({
      count: L.getRowModel().rows.length,
      getScrollElement: () => k.value,
      estimateSize: () => t.estimateRowHeight ?? 36,
      overscan: 10
    }))), m = _(() => {
      const n = F.value.getVirtualItems(), D = L.getRowModel().rows;
      return n.length === 0 && D.length > 0 ? D.map((V, b) => ({ key: V.id, index: b, start: b * (t.estimateRowHeight ?? 36), row: V })) : n.map((V) => ({ key: V.key, index: V.index, start: V.start, row: D[V.index] }));
    });
    function f(n, D, V) {
      const b = n.slice(), [S] = b.splice(D, 1);
      return b.splice(V, 0, S), b;
    }
    function C(n, D) {
      var V;
      (V = n.dataTransfer) == null || V.setData("text/col", D);
    }
    function $(n, D) {
      var q;
      const V = (q = n.dataTransfer) == null ? void 0 : q.getData("text/col");
      if (!V || V === D) return;
      const b = I.value.length ? [...I.value] : L.getAllLeafColumns().map((G) => G.id), S = b.indexOf(V), H = b.indexOf(D);
      S === -1 || H === -1 || L.setColumnOrder(f(b, S, H));
    }
    return (n, D) => {
      var V;
      return i(), s(M, null, [
        g("div", wt, [
          ne(ht, { table: j(L) }, null, 8, ["table"]),
          ne(at, { table: j(L) }, null, 8, ["table"])
        ]),
        g("div", {
          ref_key: "scrollEl",
          ref: k,
          class: "airgrid",
          style: W({ height: w.value, overflow: "auto", position: "relative" }),
          role: "grid"
        }, [
          g("div", {
            class: "airgrid-header-row",
            role: "row",
            style: W({ display: "grid", gridTemplateColumns: O.value, position: "sticky", top: 0 })
          }, [
            (i(!0), s(M, null, K(((V = j(L).getHeaderGroups()[0]) == null ? void 0 : V.headers) ?? [], (b) => {
              var S;
              return i(), s("div", {
                key: b.id,
                "data-col": b.column.id,
                role: "columnheader",
                draggable: "true",
                style: W({ textAlign: ((S = b.column.columnDef.meta) == null ? void 0 : S.align) === "right" ? "right" : "left" }),
                onDragstart: (H) => C(H, b.column.id),
                onDragover: D[0] || (D[0] = J(() => {
                }, ["prevent"])),
                onDrop: (H) => $(H, b.column.id)
              }, [
                b.isPlaceholder ? T("", !0) : (i(), X(Ye, {
                  key: 0,
                  header: b
                }, null, 8, ["header"]))
              ], 44, _t);
            }), 128))
          ], 4),
          g("div", {
            style: W({ height: `${j(F).getTotalSize()}px`, width: "100%", position: "relative" })
          }, [
            (i(!0), s(M, null, K(m.value, (b) => (i(), s("div", {
              key: b.row.id,
              "data-row": b.row.id,
              class: Y(t.rowClass ? t.rowClass(b.row.original) : void 0),
              role: "row",
              style: W({ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${b.start}px)`, display: "grid", gridTemplateColumns: O.value })
            }, [
              (i(!0), s(M, null, K(b.row.getVisibleCells(), (S) => {
                var H, q;
                return i(), s("div", {
                  key: S.id,
                  "data-col": S.column.id,
                  role: "gridcell",
                  style: W({ textAlign: ((H = S.column.columnDef.meta) == null ? void 0 : H.align) === "right" ? "right" : "left" }),
                  onClick: (G) => h(S, b.row.original)
                }, [
                  c(S.column.id) ? me(n.$slots, "cell-" + S.column.id, {
                    key: 0,
                    row: b.row.original,
                    value: S.getValue(),
                    column: S.column,
                    cell: S
                  }, void 0, !0) : (q = S.column.columnDef.meta) != null && q.editable ? (i(), X(Ve, {
                    key: 1,
                    "model-value": S.getValue(),
                    onCommit: (G) => o("cellEdit", b.row.id, S.column.id, G)
                  }, null, 8, ["model-value", "onCommit"])) : S.column.columnDef.cell ? (i(), X(j(ae), {
                    key: 2,
                    render: S.column.columnDef.cell,
                    props: S.getContext()
                  }, null, 8, ["render", "props"])) : (i(), s(M, { key: 3 }, [
                    ie(R(S.getValue()), 1)
                  ], 64))
                ], 12, Ct);
              }), 128))
            ], 14, kt))), 128))
          ], 4)
        ], 4)
      ], 64);
    };
  }
}), $t = /* @__PURE__ */ U(St, [["__scopeId", "data-v-82063e01"]]), Dt = {
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  columnOrder: [],
  columnSizing: {}
}, Nt = "0.1.0";
export {
  $t as DataGrid,
  Dt as EMPTY_VIEW_STATE,
  Nt as VERSION,
  Ft as clearPersistedState
};
