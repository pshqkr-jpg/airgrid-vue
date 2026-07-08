import { defineComponent as B, ref as P, watch as le, withDirectives as oe, openBlock as r, createElementBlock as s, vModelText as re, computed as w, createElementVNode as v, Fragment as M, renderList as K, toDisplayString as R, createCommentVNode as T, onBeforeUnmount as Z, createBlock as X, unref as j, withModifiers as J, normalizeClass as Y, createTextVNode as ie, useSlots as ce, shallowRef as de, createVNode as ne, normalizeStyle as W, renderSlot as me } from "vue";
import { FlexRender as ae, useVueTable as ve, getSortedRowModel as ge, getFilteredRowModel as fe, getCoreRowModel as pe } from "@tanstack/vue-table";
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
const be = (l, e, n) => {
  const i = ue(n);
  if (!i || !Q(n)) return !0;
  const g = l.getValue(e), p = g == null || String(g).trim() === "", k = i.op ?? "contains";
  if (k === "isEmpty") return p;
  if (k === "isNotEmpty") return !p;
  if (p) return !1;
  const u = String(g).toLowerCase(), m = (i.value ?? "").trim().toLowerCase();
  switch (k) {
    case "is":
      return u === m;
    case "isNot":
      return u !== m;
    case "notContains":
      return !u.includes(m);
    case "startsWith":
      return u.startsWith(m);
    case "endsWith":
      return u.endsWith(m);
    case "contains":
    default:
      return u.includes(m);
  }
}, he = (l, e, n) => {
  const i = se(n);
  if (!i || !ee(n)) return !0;
  const g = l.getValue(e), p = g == null || g === "", k = i.op ?? "between";
  if (k === "isEmpty") return p;
  if (k === "isNotEmpty") return !p;
  if (p) return !1;
  const u = typeof g == "number" ? g : Number(g);
  if (!Number.isFinite(u)) return !1;
  if (k === "between")
    return !(i.min != null && u < i.min || i.max != null && u > i.max);
  if (i.value == null || !Number.isFinite(i.value)) return !0;
  switch (k) {
    case "eq":
      return u === i.value;
    case "neq":
      return u !== i.value;
    case "lt":
      return u < i.value;
    case "gt":
      return u > i.value;
    case "lte":
      return u <= i.value;
    case "gte":
      return u >= i.value;
  }
  return !0;
}, we = (l, e, n) => {
  if (!Array.isArray(n) || n.length === 0) return !0;
  const i = l.getValue(e);
  return n.includes(String(i ?? ""));
}, _e = (l, e, n) => n === "any" || n == null ? !0 : l.getValue(e) === n;
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
    const n = JSON.parse(e);
    return {
      sorting: n.sorting ?? [],
      columnFilters: n.columnFilters ?? [],
      columnVisibility: n.columnVisibility ?? {},
      columnOrder: n.columnOrder ?? [],
      columnSizing: n.columnSizing ?? {}
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
function Et(l) {
  if (!(typeof window > "u"))
    try {
      window.localStorage.removeItem(te + l);
    } catch {
    }
}
const xe = /* @__PURE__ */ B({
  __name: "EditableCell",
  props: {
    modelValue: {}
  },
  emits: ["commit"],
  setup(l, { emit: e }) {
    const n = l, i = e, g = () => n.modelValue == null ? "" : String(n.modelValue), p = P(g());
    le(() => n.modelValue, () => {
      p.value = g();
    });
    function k() {
      p.value !== g() && i("commit", p.value);
    }
    function u(m) {
      const D = m.currentTarget;
      m.key === "Enter" ? D.blur() : m.key === "Escape" && (p.value = g(), D.blur());
    }
    return (m, D) => oe((r(), s("input", {
      "onUpdate:modelValue": D[0] || (D[0] = (y) => p.value = y),
      onBlur: k,
      onKeydown: u
    }, null, 544)), [
      [re, p.value]
    ]);
  }
}), Ee = {
  class: "airgrid-filter-popover",
  role: "menu"
}, Ve = {
  key: 0,
  class: "airgrid-filter-input-group"
}, Fe = ["value"], $e = ["value"], De = ["placeholder", "value", "disabled"], Ne = {
  key: 1,
  class: "airgrid-filter-input-group"
}, Ie = ["value"], Oe = ["value"], Le = {
  key: 0,
  class: "airgrid-filter-range"
}, Re = ["value"], Te = ["value"], Pe = {
  key: 1,
  type: "text",
  placeholder: "(값 입력 불필요)",
  disabled: ""
}, Me = ["value"], ze = ["value"], Ae = ["value", "selected"], Ke = /* @__PURE__ */ B({
  __name: "HeaderFilterPopover",
  props: {
    column: {},
    table: {}
  },
  setup(l) {
    const e = l, n = w(() => e.column.columnDef.meta), i = w(() => {
      var o;
      return (o = n.value) == null ? void 0 : o.filterType;
    }), g = w(() => {
      var a;
      if ((a = n.value) != null && a.selectOptions) return n.value.selectOptions;
      const o = /* @__PURE__ */ new Set();
      for (const f of e.table.getPreFilteredRowModel().rows) {
        const A = f.getValue(e.column.id);
        A != null && A !== "" && o.add(String(A));
      }
      return Array.from(o);
    }), p = [
      { value: "contains", label: "포함" },
      { value: "notContains", label: "미포함" },
      { value: "is", label: "일치" },
      { value: "isNot", label: "불일치" },
      { value: "startsWith", label: "~로 시작" },
      { value: "endsWith", label: "~로 끝남" },
      { value: "isEmpty", label: "비어있음" },
      { value: "isNotEmpty", label: "값 있음" }
    ], k = [
      { value: "between", label: "범위" },
      { value: "eq", label: "=" },
      { value: "neq", label: "≠" },
      { value: "lt", label: "<" },
      { value: "gt", label: ">" },
      { value: "lte", label: "≤" },
      { value: "gte", label: "≥" },
      { value: "isEmpty", label: "비어있음" },
      { value: "isNotEmpty", label: "값 있음" }
    ], u = w(() => {
      const o = e.column.getFilterValue();
      return typeof o == "string" ? { op: "contains", value: o } : o && typeof o == "object" ? o : {};
    }), m = w(() => u.value.op ?? "contains"), D = w(() => m.value === "isEmpty" || m.value === "isNotEmpty");
    function y(o) {
      const a = o.target.value;
      a === "isEmpty" || a === "isNotEmpty" ? e.column.setFilterValue({ op: a }) : e.column.setFilterValue({ op: a, value: u.value.value ?? "" });
    }
    function L(o) {
      const a = o.target.value;
      e.column.setFilterValue({ op: m.value, value: a });
    }
    const x = w(() => {
      const o = e.column.getFilterValue();
      if (o && typeof o == "object") {
        const a = o;
        return !a.op && (a.min != null || a.max != null) ? { op: "between", min: a.min, max: a.max } : a;
      }
      return {};
    }), N = w(() => x.value.op ?? "between");
    function O(o) {
      const a = o.target.value, f = x.value;
      a === "isEmpty" || a === "isNotEmpty" ? e.column.setFilterValue({ op: a }) : a === "between" ? e.column.setFilterValue({ op: a, min: f.min, max: f.max }) : e.column.setFilterValue({ op: a, value: f.value });
    }
    function b(o) {
      const a = o.target.value, f = a === "" ? void 0 : Number(a);
      e.column.setFilterValue({ op: "between", min: f, max: x.value.max });
    }
    function I(o) {
      const a = o.target.value, f = a === "" ? void 0 : Number(a);
      e.column.setFilterValue({ op: "between", min: x.value.min, max: f });
    }
    function _(o) {
      const a = o.target.value, f = a === "" ? void 0 : Number(a);
      e.column.setFilterValue({ op: N.value, value: f });
    }
    const V = w(() => {
      const o = e.column.getFilterValue();
      return o === !0 ? "true" : o === !1 ? "false" : "any";
    });
    function c(o) {
      const a = o.target.value;
      e.column.setFilterValue(a === "any" ? void 0 : a === "true");
    }
    const d = w(() => {
      const o = e.column.getFilterValue();
      return Array.isArray(o) ? o : [];
    });
    function C(o) {
      const a = Array.from(o.target.selectedOptions, (f) => f.value);
      e.column.setFilterValue(a.length === 0 ? void 0 : a);
    }
    function F() {
      e.column.setFilterValue(void 0);
    }
    const z = w(() => {
      const o = e.column.getFilterValue();
      if (o == null) return !1;
      switch (i.value) {
        case "text":
          return Q(o);
        case "numberRange":
          return ee(o);
        case "select":
          return Array.isArray(o) && o.length > 0;
        case "boolean":
          return o !== "any";
        default:
          return !1;
      }
    });
    return (o, a) => (r(), s("div", Ee, [
      i.value === "text" ? (r(), s("div", Ve, [
        v("select", {
          value: m.value,
          class: "airgrid-filter-select",
          onChange: y
        }, [
          (r(), s(M, null, K(p, (f) => v("option", {
            key: f.value,
            value: f.value
          }, R(f.label), 9, $e)), 64))
        ], 40, Fe),
        v("input", {
          type: "text",
          autofocus: "",
          class: "airgrid-filter-text-input",
          placeholder: D.value ? "(값 입력 불필요)" : "검색…",
          value: u.value.value ?? "",
          disabled: D.value,
          onInput: L
        }, null, 40, De)
      ])) : i.value === "numberRange" ? (r(), s("div", Ne, [
        v("select", {
          value: N.value,
          class: "airgrid-filter-select",
          onChange: O
        }, [
          (r(), s(M, null, K(k, (f) => v("option", {
            key: f.value,
            value: f.value
          }, R(f.label), 9, Oe)), 64))
        ], 40, Ie),
        N.value === "between" ? (r(), s("div", Le, [
          v("input", {
            type: "number",
            autofocus: "",
            placeholder: "min",
            value: x.value.min ?? "",
            onInput: b
          }, null, 40, Re),
          v("input", {
            type: "number",
            placeholder: "max",
            value: x.value.max ?? "",
            onInput: I
          }, null, 40, Te)
        ])) : N.value === "isEmpty" || N.value === "isNotEmpty" ? (r(), s("input", Pe)) : (r(), s("input", {
          key: 2,
          type: "number",
          autofocus: "",
          placeholder: "값",
          value: x.value.value ?? "",
          onInput: _
        }, null, 40, Me))
      ])) : i.value === "boolean" ? (r(), s("select", {
        key: 2,
        value: V.value,
        class: "airgrid-filter-select",
        onChange: c
      }, [...a[0] || (a[0] = [
        v("option", { value: "any" }, "전체", -1),
        v("option", { value: "true" }, "예", -1),
        v("option", { value: "false" }, "아니오", -1)
      ])], 40, ze)) : i.value === "select" ? (r(), s("select", {
        key: 3,
        multiple: "",
        class: "airgrid-filter-select airgrid-filter-multiselect",
        onChange: C
      }, [
        (r(!0), s(M, null, K(g.value, (f) => (r(), s("option", {
          key: f,
          value: f,
          selected: d.value.includes(f)
        }, R(f), 9, Ae))), 128))
      ], 32)) : T("", !0),
      z.value ? (r(), s("button", {
        key: 4,
        type: "button",
        class: "airgrid-filter-reset",
        onClick: F
      }, "필터 초기화")) : T("", !0)
    ]));
  }
}), U = (l, e) => {
  const n = l.__vccOpts || l;
  for (const [i, g] of e)
    n[i] = g;
  return n;
}, He = /* @__PURE__ */ U(Ke, [["__scopeId", "data-v-ff3ffe60"]]), We = ["aria-disabled"], je = {
  key: 1,
  class: "airgrid-sort-indicator",
  "aria-hidden": "true"
}, Be = {
  key: 2,
  class: "airgrid-sort-indicator",
  "aria-hidden": "true"
}, qe = {
  key: 0,
  class: "airgrid-filter-dot",
  "aria-hidden": "true"
}, Xe = 48, Ue = /* @__PURE__ */ B({
  __name: "HeaderCell",
  props: {
    header: {}
  },
  setup(l) {
    const e = l, n = w(() => e.header.column.columnDef.meta), i = w(() => {
      var b;
      return (b = n.value) == null ? void 0 : b.filterType;
    }), g = P(!1), p = P(null), k = w(() => {
      const b = e.header.column.getFilterValue();
      if (b == null) return !1;
      switch (i.value) {
        case "text":
          return Q(b);
        case "numberRange":
          return ee(b);
        case "select":
          return Array.isArray(b) && b.length > 0;
        case "boolean":
          return b !== "any";
        default:
          return !1;
      }
    });
    function u(b) {
      p.value && !p.value.contains(b.target) && y();
    }
    function m(b) {
      b.key === "Escape" && y();
    }
    function D() {
      g.value = !0, document.addEventListener("mousedown", u), document.addEventListener("keydown", m);
    }
    function y() {
      g.value = !1, document.removeEventListener("mousedown", u), document.removeEventListener("keydown", m);
    }
    function L() {
      g.value ? y() : D();
    }
    Z(() => {
      document.removeEventListener("mousedown", u), document.removeEventListener("keydown", m), N == null || N();
    });
    function x() {
      e.header.column.getCanSort() && e.header.column.toggleSorting();
    }
    let N = null;
    function O(b) {
      var f;
      b.stopPropagation(), b.preventDefault();
      const I = e.header, _ = I.getContext().table, V = I.column.columnDef.meta, c = (V == null ? void 0 : V.minWidth) ?? Xe, d = b.clientX, C = I.getSize(), F = b.currentTarget;
      (f = F.setPointerCapture) == null || f.call(F, b.pointerId);
      function z(A) {
        const t = Math.max(c, C + (A.clientX - d));
        _.setColumnSizing(($) => ({ ...$, [I.column.id]: t }));
      }
      function o() {
        N = null, window.removeEventListener("pointermove", z), window.removeEventListener("pointerup", a);
      }
      function a(A) {
        var t;
        (t = F.releasePointerCapture) == null || t.call(F, A.pointerId), o();
      }
      N = o, window.addEventListener("pointermove", z), window.addEventListener("pointerup", a);
    }
    return (b, I) => (r(), s("div", {
      ref_key: "cellRoot",
      ref: p,
      class: "airgrid-header-cell-inner"
    }, [
      v("span", {
        class: "airgrid-header-label",
        role: "button",
        "aria-disabled": !l.header.column.getCanSort(),
        onClick: x
      }, [
        l.header.isPlaceholder ? T("", !0) : (r(), X(j(ae), {
          key: 0,
          render: l.header.column.columnDef.header,
          props: l.header.getContext()
        }, null, 8, ["render", "props"])),
        l.header.column.getIsSorted() === "asc" ? (r(), s("span", je, "↑")) : l.header.column.getIsSorted() === "desc" ? (r(), s("span", Be, "↓")) : T("", !0)
      ], 8, We),
      i.value ? (r(), s("button", {
        key: 0,
        type: "button",
        class: Y(["airgrid-filter-btn", { "airgrid-filter-btn-active": k.value }]),
        "aria-label": "필터",
        onClick: J(L, ["stop"])
      }, [
        I[2] || (I[2] = ie(" ▾ ", -1)),
        k.value ? (r(), s("span", qe)) : T("", !0)
      ], 2)) : T("", !0),
      v("span", {
        class: "airgrid-resize-handle",
        role: "separator",
        "aria-orientation": "vertical",
        "aria-label": "컬럼 폭 조절",
        title: "드래그하여 컬럼 폭 조절",
        onPointerdown: O,
        onClick: I[0] || (I[0] = (_) => _.stopPropagation())
      }, null, 32),
      g.value ? (r(), X(He, {
        key: 1,
        column: l.header.column,
        table: l.header.getContext().table,
        onClick: I[1] || (I[1] = J(() => {
        }, ["stop"]))
      }, null, 8, ["column", "table"])) : T("", !0)
    ], 512));
  }
}), Ge = /* @__PURE__ */ U(Ue, [["__scopeId", "data-v-779345fb"]]), Je = {
  key: 0,
  class: "airgrid-hide-popover"
}, Ye = { class: "airgrid-hide-section-label" }, Ze = ["data-hide-toggle", "onClick"], Qe = { class: "airgrid-hide-item-label" }, et = { class: "airgrid-hide-section-label" }, tt = ["data-hide-toggle", "onClick"], nt = { class: "airgrid-hide-item-label" }, lt = {
  key: 2,
  class: "airgrid-hide-empty"
}, ot = /* @__PURE__ */ B({
  __name: "HideColumnsMenu",
  props: {
    table: {}
  },
  setup(l) {
    const e = l, n = P(!1), i = P(""), g = P(null);
    function p(_) {
      g.value && !g.value.contains(_.target) && m();
    }
    function k(_) {
      _.key === "Escape" && m();
    }
    function u() {
      n.value = !0, document.addEventListener("mousedown", p), document.addEventListener("keydown", k);
    }
    function m() {
      n.value = !1, i.value = "", document.removeEventListener("mousedown", p), document.removeEventListener("keydown", k);
    }
    function D() {
      n.value ? m() : u();
    }
    Z(() => {
      document.removeEventListener("mousedown", p), document.removeEventListener("keydown", k);
    });
    const y = w(() => e.table.getAllLeafColumns()), L = w(() => y.value.filter((_) => _.getIsVisible()).length), x = w(() => {
      const _ = i.value.trim().toLowerCase();
      return _ ? y.value.filter((V) => String(V.columnDef.header).toLowerCase().includes(_)) : y.value;
    }), N = w(() => x.value.filter((_) => _.getIsVisible())), O = w(() => x.value.filter((_) => !_.getIsVisible()));
    function b(_) {
      var V;
      (V = e.table.getColumn(_)) == null || V.toggleVisibility();
    }
    function I() {
      e.table.resetColumnVisibility();
    }
    return (_, V) => (r(), s("div", {
      ref_key: "root",
      ref: g,
      class: "airgrid-hide-menu"
    }, [
      v("button", {
        type: "button",
        class: "airgrid-hide-btn",
        title: "컬럼 표시 / 숨김",
        onClick: D
      }, " ⚙ 컬럼 (" + R(L.value) + "/" + R(y.value.length) + ") ", 1),
      n.value ? (r(), s("div", Je, [
        oe(v("input", {
          "onUpdate:modelValue": V[0] || (V[0] = (c) => i.value = c),
          type: "text",
          autofocus: "",
          placeholder: "컬럼명 검색…",
          class: "airgrid-hide-search"
        }, null, 512), [
          [re, i.value]
        ]),
        N.value.length > 0 ? (r(), s(M, { key: 0 }, [
          v("div", Ye, "표시 중 (" + R(N.value.length) + ")", 1),
          (r(!0), s(M, null, K(N.value, (c) => (r(), s("button", {
            key: c.id,
            type: "button",
            class: "airgrid-hide-item",
            "data-hide-toggle": c.id,
            onClick: (d) => b(c.id)
          }, [
            V[1] || (V[1] = v("span", {
              class: "airgrid-hide-marker airgrid-hide-marker-on",
              "aria-hidden": "true"
            }, "✓", -1)),
            v("span", Qe, R(c.columnDef.header), 1)
          ], 8, Ze))), 128))
        ], 64)) : T("", !0),
        O.value.length > 0 ? (r(), s(M, { key: 1 }, [
          v("div", et, "숨김 (" + R(O.value.length) + ")", 1),
          (r(!0), s(M, null, K(O.value, (c) => (r(), s("button", {
            key: c.id,
            type: "button",
            class: "airgrid-hide-item",
            "data-hide-toggle": c.id,
            onClick: (d) => b(c.id)
          }, [
            V[2] || (V[2] = v("span", {
              class: "airgrid-hide-marker",
              "aria-hidden": "true"
            }, null, -1)),
            v("span", nt, R(c.columnDef.header), 1)
          ], 8, tt))), 128))
        ], 64)) : T("", !0),
        x.value.length === 0 ? (r(), s("div", lt, "일치하는 컬럼 없음")) : T("", !0),
        v("button", {
          type: "button",
          class: "airgrid-hide-reset",
          onClick: I
        }, "모두 표시로 초기화")
      ])) : T("", !0)
    ], 512));
  }
}), rt = /* @__PURE__ */ U(ot, [["__scopeId", "data-v-0276a726"]]), it = {
  key: 0,
  class: "airgrid-sort-popover",
  role: "dialog",
  "aria-label": "정렬 우선순위"
}, at = {
  key: 0,
  class: "airgrid-sort-empty"
}, ut = {
  key: 1,
  class: "airgrid-sort-list"
}, st = ["aria-label", "onDragstart", "onDrop"], ct = { class: "airgrid-sort-badge" }, dt = { class: "airgrid-sort-label" }, mt = ["onClick"], vt = ["onClick"], gt = {
  key: 2,
  class: "airgrid-sort-add-row"
}, ft = ["value"], pt = /* @__PURE__ */ B({
  __name: "SortPriorityPanel",
  props: {
    table: {}
  },
  setup(l) {
    const e = l, n = P(!1), i = P(null), g = P(null);
    function p(c) {
      g.value && !g.value.contains(c.target) && m();
    }
    function k(c) {
      c.key === "Escape" && m();
    }
    function u() {
      n.value = !0, document.addEventListener("mousedown", p), document.addEventListener("keydown", k);
    }
    function m() {
      n.value = !1, i.value = null, document.removeEventListener("mousedown", p), document.removeEventListener("keydown", k);
    }
    function D() {
      n.value ? m() : u();
    }
    Z(() => {
      document.removeEventListener("mousedown", p), document.removeEventListener("keydown", k);
    });
    const y = w(() => e.table.getState().sorting), L = w(() => e.table.getAllLeafColumns().filter((c) => c.getCanSort())), x = w(() => {
      const c = new Set(y.value.map((d) => d.id));
      return L.value.filter((d) => !c.has(d.id));
    });
    function N(c) {
      const d = e.table.getColumn(c);
      return d ? String(d.columnDef.header) : c;
    }
    function O(c, d) {
      if (c === d) return;
      const C = [...y.value], [F] = C.splice(c, 1);
      C.splice(d, 0, F), e.table.setSorting(C);
    }
    function b(c) {
      e.table.setSorting(y.value.map((d, C) => C === c ? { ...d, desc: !d.desc } : d));
    }
    function I(c) {
      e.table.setSorting(y.value.filter((d, C) => C !== c));
    }
    function _(c) {
      const d = c.target, C = d.value;
      if (!C) return;
      const F = [...y.value, { id: C, desc: !1 }];
      e.table.setSorting(F), d.value = "";
    }
    function V() {
      e.table.setSorting([]);
    }
    return (c, d) => (r(), s("div", {
      ref_key: "root",
      ref: g,
      class: "airgrid-sort-menu"
    }, [
      v("button", {
        type: "button",
        class: Y(["airgrid-sort-btn", { "airgrid-sort-btn-active": y.value.length > 0 }]),
        title: "정렬 우선순위 (다중 정렬)",
        onClick: D
      }, " ⇅ 정렬" + R(y.value.length > 0 ? ` (${y.value.length})` : ""), 3),
      n.value ? (r(), s("div", it, [
        d[4] || (d[4] = v("div", { class: "airgrid-sort-title" }, "정렬 우선순위", -1)),
        y.value.length === 0 ? (r(), s("div", at, "정렬이 없습니다. 아래에서 추가하세요.")) : (r(), s("div", ut, [
          (r(!0), s(M, null, K(y.value, (C, F) => (r(), s("div", {
            key: C.id,
            draggable: "true",
            class: Y(["airgrid-sort-row", { "airgrid-sort-row-dragging": i.value === F }]),
            "aria-label": `${F + 1}순위 정렬 ${N(C.id)}`,
            onDragstart: (z) => i.value = F,
            onDragover: d[0] || (d[0] = J(() => {
            }, ["prevent"])),
            onDrop: () => {
              i.value != null && O(i.value, F), i.value = null;
            },
            onDragend: d[1] || (d[1] = (z) => i.value = null)
          }, [
            d[2] || (d[2] = v("span", {
              class: "airgrid-sort-drag-handle",
              "aria-hidden": "true"
            }, "⋮⋮", -1)),
            v("span", ct, R(F + 1), 1),
            v("span", dt, R(N(C.id)), 1),
            v("button", {
              type: "button",
              class: "airgrid-sort-dir-btn",
              onClick: (z) => b(F)
            }, R(C.desc ? "↓ 내림차순" : "↑ 오름차순"), 9, mt),
            v("button", {
              type: "button",
              class: "airgrid-sort-remove-btn",
              "aria-label": "정렬 제거",
              onClick: (z) => I(F)
            }, "×", 8, vt)
          ], 42, st))), 128))
        ])),
        x.value.length > 0 ? (r(), s("div", gt, [
          v("select", {
            class: "airgrid-sort-add-select",
            onChange: _
          }, [
            d[3] || (d[3] = v("option", { value: "" }, "+ 정렬 컬럼 추가…", -1)),
            (r(!0), s(M, null, K(x.value, (C) => (r(), s("option", {
              key: C.id,
              value: C.id
            }, R(String(C.columnDef.header)), 9, ft))), 128))
          ], 32)
        ])) : T("", !0),
        y.value.length > 0 ? (r(), s("button", {
          key: 3,
          type: "button",
          class: "airgrid-sort-reset",
          onClick: V
        }, " 전체 정렬 해제 ")) : T("", !0)
      ])) : T("", !0)
    ], 512));
  }
}), yt = /* @__PURE__ */ U(pt, [["__scopeId", "data-v-2b7dcd97"]]), bt = { class: "airgrid-toolbar" }, ht = ["data-col", "onDragstart", "onDrop"], wt = ["data-row"], _t = ["data-col", "onClick"], kt = /* @__PURE__ */ B({
  __name: "DataGrid",
  props: {
    data: {},
    columns: {},
    rowKey: {},
    height: {},
    estimateRowHeight: {},
    filterPersistKey: {},
    viewState: {}
  },
  emits: ["cellEdit", "rowClick", "update:viewState"],
  setup(l, { emit: e }) {
    var z, o, a, f, A;
    const n = l, i = e, g = ce();
    function p(t) {
      return !!g[`cell-${t}`];
    }
    function k(t, $) {
      var h;
      (h = t.column.columnDef.meta) != null && h.editable && !p(t.column.id) || i("rowClick", $);
    }
    const u = n.filterPersistKey ? Ce(n.filterPersistKey) : null, m = P((u == null ? void 0 : u.sorting) ?? ((z = n.viewState) == null ? void 0 : z.sorting) ?? []), D = P((u == null ? void 0 : u.columnFilters) ?? ((o = n.viewState) == null ? void 0 : o.columnFilters) ?? []), y = P((u == null ? void 0 : u.columnVisibility) ?? ((a = n.viewState) == null ? void 0 : a.columnVisibility) ?? Object.fromEntries(n.columns.filter((t) => t.defaultVisible === !1).map((t) => [t.id, !1]))), L = P((u == null ? void 0 : u.columnOrder) ?? ((f = n.viewState) == null ? void 0 : f.columnOrder) ?? []), x = P((u == null ? void 0 : u.columnSizing) ?? ((A = n.viewState) == null ? void 0 : A.columnSizing) ?? {}), N = w(() => n.columns.map((t) => ({
      id: t.id,
      accessorKey: t.accessorKey,
      header: t.header,
      // c.cell 은 row 전체를 받는 우리 시그니처 — TanStack 의 CellContext 어댑터로 감쌈.
      // 없으면 undefined 로 둬 template 이 raw value(cell.getValue()) 로 폴백.
      cell: t.cell ? ($) => t.cell($.row.original) : void 0,
      enableSorting: t.sortable !== !1,
      filterFn: ke(t.filterType),
      meta: {
        align: t.align,
        width: t.width,
        minWidth: t.minWidth,
        filterType: t.filterType,
        selectOptions: t.selectOptions,
        editable: t.editable
      }
    }))), O = ve({
      get data() {
        return n.data;
      },
      get columns() {
        return N.value;
      },
      state: {
        get sorting() {
          return m.value;
        },
        get columnFilters() {
          return D.value;
        },
        get columnVisibility() {
          return y.value;
        },
        get columnOrder() {
          return L.value;
        },
        get columnSizing() {
          return x.value;
        }
      },
      onSortingChange: (t) => {
        m.value = typeof t == "function" ? t(m.value) : t;
      },
      onColumnFiltersChange: (t) => {
        D.value = typeof t == "function" ? t(D.value) : t;
      },
      onColumnVisibilityChange: (t) => {
        y.value = typeof t == "function" ? t(y.value) : t;
      },
      onColumnOrderChange: (t) => {
        L.value = typeof t == "function" ? t(L.value) : t;
      },
      onColumnSizingChange: (t) => {
        x.value = typeof t == "function" ? t(x.value) : t;
      },
      getCoreRowModel: pe(),
      getFilteredRowModel: fe(),
      getSortedRowModel: ge(),
      getRowId: (t) => String(t[n.rowKey]),
      // TanStack 기본값은 숫자 컬럼을 desc-first 로 토글 — 그리드 관례(오름차순 먼저)에
      // 맞춰 모든 컬럼을 asc-first 로 통일.
      sortDescFirst: !1
    });
    le([m, D, y, L, x], () => {
      const t = {
        sorting: m.value,
        columnFilters: D.value,
        columnVisibility: y.value,
        columnOrder: L.value,
        columnSizing: x.value
      };
      n.filterPersistKey && Se(n.filterPersistKey, t), i("update:viewState", t);
    }, { deep: !0 });
    const b = w(() => typeof n.height == "number" ? `${n.height}px` : n.height ?? "600px"), I = w(() => O.getVisibleLeafColumns().map((t) => {
      var E;
      const $ = x.value[t.id];
      return $ != null ? `${$}px` : ((E = t.columnDef.meta) == null ? void 0 : E.width) ?? "minmax(80px, 1fr)";
    }).join(" ")), _ = de(null), V = ye(w(() => ({
      count: O.getRowModel().rows.length,
      getScrollElement: () => _.value,
      estimateSize: () => n.estimateRowHeight ?? 36,
      overscan: 10
    }))), c = w(() => {
      const t = V.value.getVirtualItems(), $ = O.getRowModel().rows;
      return t.length === 0 && $.length > 0 ? $.map((E, h) => ({ key: E.id, index: h, start: h * (n.estimateRowHeight ?? 36), row: E })) : t.map((E) => ({ key: E.key, index: E.index, start: E.start, row: $[E.index] }));
    });
    function d(t, $, E) {
      const h = t.slice(), [S] = h.splice($, 1);
      return h.splice(E, 0, S), h;
    }
    function C(t, $) {
      var E;
      (E = t.dataTransfer) == null || E.setData("text/col", $);
    }
    function F(t, $) {
      var q;
      const E = (q = t.dataTransfer) == null ? void 0 : q.getData("text/col");
      if (!E || E === $) return;
      const h = L.value.length ? [...L.value] : O.getAllLeafColumns().map((G) => G.id), S = h.indexOf(E), H = h.indexOf($);
      S === -1 || H === -1 || O.setColumnOrder(d(h, S, H));
    }
    return (t, $) => {
      var E;
      return r(), s(M, null, [
        v("div", bt, [
          ne(yt, { table: j(O) }, null, 8, ["table"]),
          ne(rt, { table: j(O) }, null, 8, ["table"])
        ]),
        v("div", {
          ref_key: "scrollEl",
          ref: _,
          class: "airgrid",
          style: W({ height: b.value, overflow: "auto", position: "relative" }),
          role: "grid"
        }, [
          v("div", {
            class: "airgrid-header-row",
            role: "row",
            style: W({ display: "grid", gridTemplateColumns: I.value, position: "sticky", top: 0 })
          }, [
            (r(!0), s(M, null, K(((E = j(O).getHeaderGroups()[0]) == null ? void 0 : E.headers) ?? [], (h) => {
              var S;
              return r(), s("div", {
                key: h.id,
                "data-col": h.column.id,
                role: "columnheader",
                draggable: "true",
                style: W({ textAlign: ((S = h.column.columnDef.meta) == null ? void 0 : S.align) === "right" ? "right" : "left" }),
                onDragstart: (H) => C(H, h.column.id),
                onDragover: $[0] || ($[0] = J(() => {
                }, ["prevent"])),
                onDrop: (H) => F(H, h.column.id)
              }, [
                h.isPlaceholder ? T("", !0) : (r(), X(Ge, {
                  key: 0,
                  header: h
                }, null, 8, ["header"]))
              ], 44, ht);
            }), 128))
          ], 4),
          v("div", {
            style: W({ height: `${j(V).getTotalSize()}px`, width: "100%", position: "relative" })
          }, [
            (r(!0), s(M, null, K(c.value, (h) => (r(), s("div", {
              key: h.row.id,
              "data-row": h.row.id,
              role: "row",
              style: W({ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${h.start}px)`, display: "grid", gridTemplateColumns: I.value })
            }, [
              (r(!0), s(M, null, K(h.row.getVisibleCells(), (S) => {
                var H, q;
                return r(), s("div", {
                  key: S.id,
                  "data-col": S.column.id,
                  role: "gridcell",
                  style: W({ textAlign: ((H = S.column.columnDef.meta) == null ? void 0 : H.align) === "right" ? "right" : "left" }),
                  onClick: (G) => k(S, h.row.original)
                }, [
                  p(S.column.id) ? me(t.$slots, "cell-" + S.column.id, {
                    key: 0,
                    row: h.row.original,
                    value: S.getValue(),
                    column: S.column,
                    cell: S
                  }, void 0, !0) : (q = S.column.columnDef.meta) != null && q.editable ? (r(), X(xe, {
                    key: 1,
                    "model-value": S.getValue(),
                    onCommit: (G) => i("cellEdit", h.row.id, S.column.id, G)
                  }, null, 8, ["model-value", "onCommit"])) : S.column.columnDef.cell ? (r(), X(j(ae), {
                    key: 2,
                    render: S.column.columnDef.cell,
                    props: S.getContext()
                  }, null, 8, ["render", "props"])) : (r(), s(M, { key: 3 }, [
                    ie(R(S.getValue()), 1)
                  ], 64))
                ], 12, _t);
              }), 128))
            ], 12, wt))), 128))
          ], 4)
        ], 4)
      ], 64);
    };
  }
}), Vt = /* @__PURE__ */ U(kt, [["__scopeId", "data-v-cc0d0e3a"]]), Ft = {
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  columnOrder: [],
  columnSizing: {}
}, $t = "0.1.0";
export {
  Vt as DataGrid,
  Ft as EMPTY_VIEW_STATE,
  $t as VERSION,
  Et as clearPersistedState
};
