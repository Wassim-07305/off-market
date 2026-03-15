import { R as Z } from "./vendor-react-Cci7g3Cb.js";
var xe = (e) => e.type === "checkbox",
  ye = (e) => e instanceof Date,
  te = (e) => e == null;
const kr = (e) => typeof e == "object";
var W = (e) => !te(e) && !Array.isArray(e) && kr(e) && !ye(e),
  zr = (e) =>
    W(e) && e.target ? (xe(e.target) ? e.target.checked : e.target.value) : e,
  bn = (e) => e.substring(0, e.search(/\.\d+(\.|$)/)) || e,
  $r = (e, t) => e.has(bn(t)),
  wn = (e) => {
    const t = e.constructor && e.constructor.prototype;
    return W(t) && t.hasOwnProperty("isPrototypeOf");
  },
  gt =
    typeof window < "u" &&
    typeof window.HTMLElement < "u" &&
    typeof document < "u";
function J(e) {
  if (e instanceof Date) return new Date(e);
  const t = typeof FileList < "u" && e instanceof FileList;
  if (gt && (e instanceof Blob || t)) return e;
  const r = Array.isArray(e);
  if (!r && !(W(e) && wn(e))) return e;
  const n = r ? [] : Object.create(Object.getPrototypeOf(e));
  for (const o in e)
    Object.prototype.hasOwnProperty.call(e, o) && (n[o] = J(e[o]));
  return n;
}
var He = (e) => /^\w*$/.test(e),
  C = (e) => e === void 0,
  vt = (e) => (Array.isArray(e) ? e.filter(Boolean) : []),
  yt = (e) => vt(e.replace(/["|']|\]/g, "").split(/\.|\[/)),
  v = (e, t, r) => {
    if (!t || !W(e)) return r;
    const n = (He(t) ? [t] : yt(t)).reduce((o, s) => (te(o) ? o : o[s]), e);
    return C(n) || n === e ? (C(e[t]) ? r : e[t]) : n;
  },
  oe = (e) => typeof e == "boolean",
  ee = (e) => typeof e == "function",
  N = (e, t, r) => {
    let n = -1;
    const o = He(t) ? [t] : yt(t),
      s = o.length,
      i = s - 1;
    for (; ++n < s; ) {
      const u = o[n];
      let l = r;
      if (n !== i) {
        const h = e[u];
        l = W(h) || Array.isArray(h) ? h : isNaN(+o[n + 1]) ? {} : [];
      }
      if (u === "__proto__" || u === "constructor" || u === "prototype") return;
      ((e[u] = l), (e = e[u]));
    }
  };
const Me = { BLUR: "blur", FOCUS_OUT: "focusout", CHANGE: "change" },
  le = {
    onBlur: "onBlur",
    onChange: "onChange",
    onSubmit: "onSubmit",
    onTouched: "onTouched",
    all: "all",
  },
  pe = {
    max: "max",
    min: "min",
    maxLength: "maxLength",
    minLength: "minLength",
    pattern: "pattern",
    required: "required",
    validate: "validate",
  },
  Sr = Z.createContext(null);
Sr.displayName = "HookFormControlContext";
const bt = () => Z.useContext(Sr);
var Zr = (e, t, r, n = !0) => {
  const o = { defaultValues: t._defaultValues };
  for (const s in e)
    Object.defineProperty(o, s, {
      get: () => {
        const i = s;
        return (
          t._proxyFormState[i] !== le.all &&
            (t._proxyFormState[i] = !n || le.all),
          r && (r[i] = !0),
          e[i]
        );
      },
    });
  return o;
};
const wt = typeof window < "u" ? Z.useLayoutEffect : Z.useEffect;
function kn(e) {
  const t = bt(),
    { control: r = t, disabled: n, name: o, exact: s } = e || {},
    [i, u] = Z.useState(r._formState),
    l = Z.useRef({
      isDirty: !1,
      isLoading: !1,
      dirtyFields: !1,
      touchedFields: !1,
      validatingFields: !1,
      isValidating: !1,
      isValid: !1,
      errors: !1,
    });
  return (
    wt(
      () =>
        r._subscribe({
          name: o,
          formState: l.current,
          exact: s,
          callback: (h) => {
            !n && u({ ...r._formState, ...h });
          },
        }),
      [o, n, s],
    ),
    Z.useEffect(() => {
      l.current.isValid && r._setValid(!0);
    }, [r]),
    Z.useMemo(() => Zr(i, r, l.current, !1), [i, r])
  );
}
var se = (e) => typeof e == "string",
  ft = (e, t, r, n, o) =>
    se(e)
      ? (n && t.watch.add(e), v(r, e, o))
      : Array.isArray(e)
        ? e.map((s) => (n && t.watch.add(s), v(r, s)))
        : (n && (t.watchAll = !0), r),
  dt = (e) => te(e) || !kr(e);
function fe(e, t, r = new WeakSet()) {
  if (dt(e) || dt(t)) return Object.is(e, t);
  if (ye(e) && ye(t)) return Object.is(e.getTime(), t.getTime());
  const n = Object.keys(e),
    o = Object.keys(t);
  if (n.length !== o.length) return !1;
  if (r.has(e) || r.has(t)) return !0;
  (r.add(e), r.add(t));
  for (const s of n) {
    const i = e[s];
    if (!o.includes(s)) return !1;
    if (s !== "ref") {
      const u = t[s];
      if (
        (ye(i) && ye(u)) ||
        (W(i) && W(u)) ||
        (Array.isArray(i) && Array.isArray(u))
          ? !fe(i, u, r)
          : !Object.is(i, u)
      )
        return !1;
    }
  }
  return !0;
}
function zn(e) {
  const t = bt(),
    {
      control: r = t,
      name: n,
      defaultValue: o,
      disabled: s,
      exact: i,
      compute: u,
    } = e || {},
    l = Z.useRef(o),
    h = Z.useRef(u),
    b = Z.useRef(void 0),
    g = Z.useRef(r),
    y = Z.useRef(n);
  h.current = u;
  const [m, I] = Z.useState(() => {
      const $ = r._getWatch(n, l.current);
      return h.current ? h.current($) : $;
    }),
    E = Z.useCallback(
      ($) => {
        const S = ft(n, r._names, $ || r._formValues, !1, l.current);
        return h.current ? h.current(S) : S;
      },
      [r._formValues, r._names, n],
    ),
    j = Z.useCallback(
      ($) => {
        if (!s) {
          const S = ft(n, r._names, $ || r._formValues, !1, l.current);
          if (h.current) {
            const H = h.current(S);
            fe(H, b.current) || (I(H), (b.current = H));
          } else I(S);
        }
      },
      [r._formValues, r._names, s, n],
    );
  (wt(
    () => (
      (g.current !== r || !fe(y.current, n)) &&
        ((g.current = r), (y.current = n), j()),
      r._subscribe({
        name: n,
        formState: { values: !0 },
        exact: i,
        callback: ($) => {
          j($.values);
        },
      })
    ),
    [r, i, n, j],
  ),
    Z.useEffect(() => r._removeUnmounted()));
  const M = g.current !== r,
    O = y.current,
    D = Z.useMemo(() => {
      if (s) return null;
      const $ = !M && !fe(O, n);
      return M || $ ? E() : null;
    }, [s, M, n, O, E]);
  return D !== null ? D : m;
}
function $n(e) {
  const t = bt(),
    {
      name: r,
      disabled: n,
      control: o = t,
      shouldUnregister: s,
      defaultValue: i,
      exact: u = !0,
    } = e,
    l = $r(o._names.array, r),
    h = Z.useMemo(
      () => v(o._formValues, r, v(o._defaultValues, r, i)),
      [o, r, i],
    ),
    b = zn({ control: o, name: r, defaultValue: h, exact: u }),
    g = kn({ control: o, name: r, exact: u }),
    y = Z.useRef(e),
    m = Z.useRef(void 0),
    I = Z.useRef(
      o.register(r, {
        ...e.rules,
        value: b,
        ...(oe(e.disabled) ? { disabled: e.disabled } : {}),
      }),
    );
  y.current = e;
  const E = Z.useMemo(
      () =>
        Object.defineProperties(
          {},
          {
            invalid: { enumerable: !0, get: () => !!v(g.errors, r) },
            isDirty: { enumerable: !0, get: () => !!v(g.dirtyFields, r) },
            isTouched: { enumerable: !0, get: () => !!v(g.touchedFields, r) },
            isValidating: {
              enumerable: !0,
              get: () => !!v(g.validatingFields, r),
            },
            error: { enumerable: !0, get: () => v(g.errors, r) },
          },
        ),
      [g, r],
    ),
    j = Z.useCallback(
      ($) =>
        I.current.onChange({
          target: { value: zr($), name: r },
          type: Me.CHANGE,
        }),
      [r],
    ),
    M = Z.useCallback(
      () =>
        I.current.onBlur({
          target: { value: v(o._formValues, r), name: r },
          type: Me.BLUR,
        }),
      [r, o._formValues],
    ),
    O = Z.useCallback(
      ($) => {
        const S = v(o._fields, r);
        S &&
          S._f &&
          $ &&
          (S._f.ref = {
            focus: () => ee($.focus) && $.focus(),
            select: () => ee($.select) && $.select(),
            setCustomValidity: (H) =>
              ee($.setCustomValidity) && $.setCustomValidity(H),
            reportValidity: () => ee($.reportValidity) && $.reportValidity(),
          });
      },
      [o._fields, r],
    ),
    D = Z.useMemo(
      () => ({
        name: r,
        value: b,
        ...(oe(n) || g.disabled ? { disabled: g.disabled || n } : {}),
        onChange: j,
        onBlur: M,
        ref: O,
      }),
      [r, n, g.disabled, j, M, O, b],
    );
  return (
    Z.useEffect(() => {
      const $ = o._options.shouldUnregister || s,
        S = m.current;
      (S && S !== r && !l && o.unregister(S),
        o.register(r, {
          ...y.current.rules,
          ...(oe(y.current.disabled) ? { disabled: y.current.disabled } : {}),
        }));
      const H = (ae, he) => {
        const de = v(o._fields, ae);
        de && de._f && (de._f.mount = he);
      };
      if ((H(r, !0), $)) {
        const ae = J(v(o._options.defaultValues, r, y.current.defaultValue));
        (N(o._defaultValues, r, ae),
          C(v(o._formValues, r)) && N(o._formValues, r, ae));
      }
      return (
        !l && o.register(r),
        (m.current = r),
        () => {
          (l ? $ && !o._state.action : $) ? o.unregister(r) : H(r, !1);
        }
      );
    }, [r, o, l, s]),
    Z.useEffect(() => {
      o._setDisabledField({ disabled: n, name: r });
    }, [n, r, o]),
    Z.useMemo(() => ({ field: D, formState: g, fieldState: E }), [D, g, E])
  );
}
const Oa = (e) => e.render($n(e)),
  Sn = Z.createContext(null);
Sn.displayName = "HookFormContext";
var Zn = (e, t, r, n, o) =>
    t
      ? {
          ...r[e],
          types: { ...(r[e] && r[e].types ? r[e].types : {}), [n]: o || !0 },
        }
      : {},
  Ne = (e) => (Array.isArray(e) ? e : [e]),
  Ut = () => {
    let e = [];
    return {
      get observers() {
        return e;
      },
      next: (o) => {
        for (const s of e) s.next && s.next(o);
      },
      subscribe: (o) => (
        e.push(o),
        {
          unsubscribe: () => {
            e = e.filter((s) => s !== o);
          },
        }
      ),
      unsubscribe: () => {
        e = [];
      },
    };
  };
function Or(e, t) {
  const r = {};
  for (const n in e)
    if (e.hasOwnProperty(n)) {
      const o = e[n],
        s = t[n];
      if (o && W(o) && s) {
        const i = Or(o, s);
        W(i) && (r[n] = i);
      } else e[n] && (r[n] = s);
    }
  return r;
}
var Q = (e) => W(e) && !Object.keys(e).length,
  kt = (e) => e.type === "file",
  Je = (e) => {
    if (!gt) return !1;
    const t = e ? e.ownerDocument : 0;
    return (
      e instanceof
      (t && t.defaultView ? t.defaultView.HTMLElement : HTMLElement)
    );
  },
  Er = (e) => e.type === "select-multiple",
  zt = (e) => e.type === "radio",
  On = (e) => zt(e) || xe(e),
  at = (e) => Je(e) && e.isConnected;
function En(e, t) {
  const r = t.slice(0, -1).length;
  let n = 0;
  for (; n < r; ) e = C(e) ? n++ : e[t[n++]];
  return e;
}
function An(e) {
  for (const t in e) if (e.hasOwnProperty(t) && !C(e[t])) return !1;
  return !0;
}
function B(e, t) {
  const r = Array.isArray(t) ? t : He(t) ? [t] : yt(t),
    n = r.length === 1 ? e : En(e, r),
    o = r.length - 1,
    s = r[o];
  return (
    n && delete n[s],
    o !== 0 &&
      ((W(n) && Q(n)) || (Array.isArray(n) && An(n))) &&
      B(e, r.slice(0, -1)),
    e
  );
}
var In = (e) => {
  for (const t in e) if (ee(e[t])) return !0;
  return !1;
};
function Ar(e) {
  return Array.isArray(e) || (W(e) && !In(e));
}
function ht(e, t = {}) {
  for (const r in e) {
    const n = e[r];
    Ar(n)
      ? ((t[r] = Array.isArray(n) ? [] : {}), ht(n, t[r]))
      : C(n) || (t[r] = !0);
  }
  return t;
}
function $e(e, t, r) {
  r || (r = ht(t));
  for (const n in e) {
    const o = e[n];
    if (Ar(o))
      C(t) || dt(r[n])
        ? (r[n] = ht(o, Array.isArray(o) ? [] : {}))
        : $e(o, te(t) ? {} : t[n], r[n]);
    else {
      const s = t[n];
      r[n] = !fe(o, s);
    }
  }
  return r;
}
const Lt = { value: !1, isValid: !1 },
  Mt = { value: !0, isValid: !0 };
var Ir = (e) => {
    if (Array.isArray(e)) {
      if (e.length > 1) {
        const t = e
          .filter((r) => r && r.checked && !r.disabled)
          .map((r) => r.value);
        return { value: t, isValid: !!t.length };
      }
      return e[0].checked && !e[0].disabled
        ? e[0].attributes && !C(e[0].attributes.value)
          ? C(e[0].value) || e[0].value === ""
            ? Mt
            : { value: e[0].value, isValid: !0 }
          : Mt
        : Lt;
    }
    return Lt;
  },
  Vr = (e, { valueAsNumber: t, valueAsDate: r, setValueAs: n }) =>
    C(e)
      ? e
      : t
        ? e === ""
          ? NaN
          : e && +e
        : r && se(e)
          ? new Date(e)
          : n
            ? n(e)
            : e;
const Jt = { isValid: !1, value: null };
var Fr = (e) =>
  Array.isArray(e)
    ? e.reduce(
        (t, r) =>
          r && r.checked && !r.disabled ? { isValid: !0, value: r.value } : t,
        Jt,
      )
    : Jt;
function Bt(e) {
  const t = e.ref;
  return kt(t)
    ? t.files
    : zt(t)
      ? Fr(e.refs).value
      : Er(t)
        ? [...t.selectedOptions].map(({ value: r }) => r)
        : xe(t)
          ? Ir(e.refs).value
          : Vr(C(t.value) ? e.ref.value : t.value, e);
}
var Vn = (e, t, r, n) => {
    const o = {};
    for (const s of e) {
      const i = v(t, s);
      i && N(o, s, i._f);
    }
    return {
      criteriaMode: r,
      names: [...e],
      fields: o,
      shouldUseNativeValidation: n,
    };
  },
  Be = (e) => e instanceof RegExp,
  Fe = (e) =>
    C(e)
      ? e
      : Be(e)
        ? e.source
        : W(e)
          ? Be(e.value)
            ? e.value.source
            : e.value
          : e,
  Wt = (e) => ({
    isOnSubmit: !e || e === le.onSubmit,
    isOnBlur: e === le.onBlur,
    isOnChange: e === le.onChange,
    isOnAll: e === le.all,
    isOnTouch: e === le.onTouched,
  });
const Kt = "AsyncFunction";
var Fn = (e) =>
    !!e &&
    !!e.validate &&
    !!(
      (ee(e.validate) && e.validate.constructor.name === Kt) ||
      (W(e.validate) &&
        Object.values(e.validate).find((t) => t.constructor.name === Kt))
    ),
  Tn = (e) =>
    e.mount &&
    (e.required ||
      e.min ||
      e.max ||
      e.maxLength ||
      e.minLength ||
      e.pattern ||
      e.validate),
  qt = (e, t, r) =>
    !r &&
    (t.watchAll ||
      t.watch.has(e) ||
      [...t.watch].some(
        (n) => e.startsWith(n) && /^\.\w+/.test(e.slice(n.length)),
      ));
const Pe = (e, t, r, n) => {
  for (const o of r || Object.keys(e)) {
    const s = v(e, o);
    if (s) {
      const { _f: i, ...u } = s;
      if (i) {
        if (i.refs && i.refs[0] && t(i.refs[0], o) && !n) return !0;
        if (i.ref && t(i.ref, i.name) && !n) return !0;
        if (Pe(u, t)) break;
      } else if (W(u) && Pe(u, t)) break;
    }
  }
};
function Gt(e, t, r) {
  const n = v(e, r);
  if (n || He(r)) return { error: n, name: r };
  const o = r.split(".");
  for (; o.length; ) {
    const s = o.join("."),
      i = v(t, s),
      u = v(e, s);
    if (i && !Array.isArray(i) && r !== s) return { name: r };
    if (u && u.type) return { name: s, error: u };
    if (u && u.root && u.root.type) return { name: `${s}.root`, error: u.root };
    o.pop();
  }
  return { name: r };
}
var Nn = (e, t, r, n) => {
    r(e);
    const { name: o, ...s } = e;
    return (
      Q(s) ||
      Object.keys(s).length >= Object.keys(t).length ||
      Object.keys(s).find((i) => t[i] === (!n || le.all))
    );
  },
  Pn = (e, t, r) =>
    !e ||
    !t ||
    e === t ||
    Ne(e).some((n) => n && (r ? n === t : n.startsWith(t) || t.startsWith(n))),
  Dn = (e, t, r, n, o) =>
    o.isOnAll
      ? !1
      : !r && o.isOnTouch
        ? !(t || e)
        : (r ? n.isOnBlur : o.isOnBlur)
          ? !e
          : (r ? n.isOnChange : o.isOnChange)
            ? e
            : !0,
  Cn = (e, t) => !vt(v(e, t)).length && B(e, t),
  xn = (e, t, r) => {
    const n = Ne(v(e, r));
    return (N(n, "root", t[r]), N(e, r, n), e);
  };
function Ht(e, t, r = "validate") {
  if (se(e) || (Array.isArray(e) && e.every(se)) || (oe(e) && !e))
    return { type: r, message: se(e) ? e : "", ref: t };
}
var ze = (e) => (W(e) && !Be(e) ? e : { value: e, message: "" }),
  Yt = async (e, t, r, n, o, s) => {
    const {
        ref: i,
        refs: u,
        required: l,
        maxLength: h,
        minLength: b,
        min: g,
        max: y,
        pattern: m,
        validate: I,
        name: E,
        valueAsNumber: j,
        mount: M,
      } = e._f,
      O = v(r, E);
    if (!M || t.has(E)) return {};
    const D = u ? u[0] : i,
      $ = (A) => {
        o &&
          D.reportValidity &&
          (D.setCustomValidity(oe(A) ? "" : A || ""), D.reportValidity());
      },
      S = {},
      H = zt(i),
      ae = xe(i),
      he = H || ae,
      de =
        ((j || kt(i)) && C(i.value) && C(O)) ||
        (Je(i) && i.value === "") ||
        O === "" ||
        (Array.isArray(O) && !O.length),
      ie = Zn.bind(null, E, n, S),
      Re = (A, V, K, G = pe.maxLength, ce = pe.minLength) => {
        const ne = A ? V : K;
        S[E] = { type: A ? G : ce, message: ne, ref: i, ...ie(A ? G : ce, ne) };
      };
    if (
      s
        ? !Array.isArray(O) || !O.length
        : l &&
          ((!he && (de || te(O))) ||
            (oe(O) && !O) ||
            (ae && !Ir(u).isValid) ||
            (H && !Fr(u).isValid))
    ) {
      const { value: A, message: V } = se(l)
        ? { value: !!l, message: l }
        : ze(l);
      if (
        A &&
        ((S[E] = {
          type: pe.required,
          message: V,
          ref: D,
          ...ie(pe.required, V),
        }),
        !n)
      )
        return ($(V), S);
    }
    if (!de && (!te(g) || !te(y))) {
      let A, V;
      const K = ze(y),
        G = ze(g);
      if (!te(O) && !isNaN(O)) {
        const ce = i.valueAsNumber || (O && +O);
        (te(K.value) || (A = ce > K.value), te(G.value) || (V = ce < G.value));
      } else {
        const ce = i.valueAsDate || new Date(O),
          ne = (Ve) => new Date(new Date().toDateString() + " " + Ve),
          Ae = i.type == "time",
          Ie = i.type == "week";
        (se(K.value) &&
          O &&
          (A = Ae
            ? ne(O) > ne(K.value)
            : Ie
              ? O > K.value
              : ce > new Date(K.value)),
          se(G.value) &&
            O &&
            (V = Ae
              ? ne(O) < ne(G.value)
              : Ie
                ? O < G.value
                : ce < new Date(G.value)));
      }
      if ((A || V) && (Re(!!A, K.message, G.message, pe.max, pe.min), !n))
        return ($(S[E].message), S);
    }
    if ((h || b) && !de && (se(O) || (s && Array.isArray(O)))) {
      const A = ze(h),
        V = ze(b),
        K = !te(A.value) && O.length > +A.value,
        G = !te(V.value) && O.length < +V.value;
      if ((K || G) && (Re(K, A.message, V.message), !n))
        return ($(S[E].message), S);
    }
    if (m && !de && se(O)) {
      const { value: A, message: V } = ze(m);
      if (
        Be(A) &&
        !O.match(A) &&
        ((S[E] = {
          type: pe.pattern,
          message: V,
          ref: i,
          ...ie(pe.pattern, V),
        }),
        !n)
      )
        return ($(V), S);
    }
    if (I) {
      if (ee(I)) {
        const A = await I(O, r),
          V = Ht(A, D);
        if (V && ((S[E] = { ...V, ...ie(pe.validate, V.message) }), !n))
          return ($(V.message), S);
      } else if (W(I)) {
        let A = {};
        for (const V in I) {
          if (!Q(A) && !n) break;
          const K = Ht(await I[V](O, r), D, V);
          K &&
            ((A = { ...K, ...ie(V, K.message) }),
            $(K.message),
            n && (S[E] = A));
        }
        if (!Q(A) && ((S[E] = { ref: D, ...A }), !n)) return S;
      }
    }
    return ($(!0), S);
  };
const Rn = {
  mode: le.onSubmit,
  reValidateMode: le.onChange,
  shouldFocusError: !0,
};
function jn(e = {}) {
  let t = { ...Rn, ...e },
    r = {
      submitCount: 0,
      isDirty: !1,
      isReady: !1,
      isLoading: ee(t.defaultValues),
      isValidating: !1,
      isSubmitted: !1,
      isSubmitting: !1,
      isSubmitSuccessful: !1,
      isValid: !1,
      touchedFields: {},
      dirtyFields: {},
      validatingFields: {},
      errors: t.errors || {},
      disabled: t.disabled || !1,
    },
    n = {},
    o =
      W(t.defaultValues) || W(t.values)
        ? J(t.defaultValues || t.values) || {}
        : {},
    s = t.shouldUnregister ? {} : J(o),
    i = { action: !1, mount: !1, watch: !1, keepIsValid: !1 },
    u = {
      mount: new Set(),
      disabled: new Set(),
      unMount: new Set(),
      array: new Set(),
      watch: new Set(),
    },
    l,
    h = 0;
  const b = {
      isDirty: !1,
      dirtyFields: !1,
      validatingFields: !1,
      touchedFields: !1,
      isValidating: !1,
      isValid: !1,
      errors: !1,
    },
    g = { ...b };
  let y = { ...g };
  const m = { array: Ut(), state: Ut() },
    I = t.criteriaMode === le.all,
    E = (a) => (c) => {
      (clearTimeout(h), (h = setTimeout(a, c)));
    },
    j = async (a) => {
      if (!i.keepIsValid && !t.disabled && (g.isValid || y.isValid || a)) {
        let c;
        (t.resolver
          ? ((c = Q((await he()).errors)), M())
          : (c = await ie(n, !0)),
          c !== r.isValid && m.state.next({ isValid: c }));
      }
    },
    M = (a, c) => {
      !t.disabled &&
        (g.isValidating ||
          g.validatingFields ||
          y.isValidating ||
          y.validatingFields) &&
        ((a || Array.from(u.mount)).forEach((f) => {
          f && (c ? N(r.validatingFields, f, c) : B(r.validatingFields, f));
        }),
        m.state.next({
          validatingFields: r.validatingFields,
          isValidating: !Q(r.validatingFields),
        }));
    },
    O = (a, c = [], f, w, _ = !0, p = !0) => {
      if (w && f && !t.disabled) {
        if (((i.action = !0), p && Array.isArray(v(n, a)))) {
          const z = f(v(n, a), w.argA, w.argB);
          _ && N(n, a, z);
        }
        if (p && Array.isArray(v(r.errors, a))) {
          const z = f(v(r.errors, a), w.argA, w.argB);
          (_ && N(r.errors, a, z), Cn(r.errors, a));
        }
        if (
          (g.touchedFields || y.touchedFields) &&
          p &&
          Array.isArray(v(r.touchedFields, a))
        ) {
          const z = f(v(r.touchedFields, a), w.argA, w.argB);
          _ && N(r.touchedFields, a, z);
        }
        ((g.dirtyFields || y.dirtyFields) && (r.dirtyFields = $e(o, s)),
          m.state.next({
            name: a,
            isDirty: A(a, c),
            dirtyFields: r.dirtyFields,
            errors: r.errors,
            isValid: r.isValid,
          }));
      } else N(s, a, c);
    },
    D = (a, c) => {
      (N(r.errors, a, c), m.state.next({ errors: r.errors }));
    },
    $ = (a) => {
      ((r.errors = a), m.state.next({ errors: r.errors, isValid: !1 }));
    },
    S = (a, c, f, w) => {
      const _ = v(n, a);
      if (_) {
        const p = v(s, a, C(f) ? v(o, a) : f);
        (C(p) || (w && w.defaultChecked) || c
          ? N(s, a, c ? p : Bt(_._f))
          : G(a, p),
          i.mount && !i.action && j());
      }
    },
    H = (a, c, f, w, _) => {
      let p = !1,
        z = !1;
      const F = { name: a };
      if (!t.disabled) {
        if (!f || w) {
          (g.isDirty || y.isDirty) &&
            ((z = r.isDirty),
            (r.isDirty = F.isDirty = A()),
            (p = z !== F.isDirty));
          const T = fe(v(o, a), c);
          ((z = !!v(r.dirtyFields, a)),
            T ? B(r.dirtyFields, a) : N(r.dirtyFields, a, !0),
            (F.dirtyFields = r.dirtyFields),
            (p = p || ((g.dirtyFields || y.dirtyFields) && z !== !T)));
        }
        if (f) {
          const T = v(r.touchedFields, a);
          T ||
            (N(r.touchedFields, a, f),
            (F.touchedFields = r.touchedFields),
            (p = p || ((g.touchedFields || y.touchedFields) && T !== f)));
        }
        p && _ && m.state.next(F);
      }
      return p ? F : {};
    },
    ae = (a, c, f, w) => {
      const _ = v(r.errors, a),
        p = (g.isValid || y.isValid) && oe(c) && r.isValid !== c;
      if (
        (t.delayError && f
          ? ((l = E(() => D(a, f))), l(t.delayError))
          : (clearTimeout(h),
            (l = null),
            f ? N(r.errors, a, f) : B(r.errors, a)),
        (f ? !fe(_, f) : _) || !Q(w) || p)
      ) {
        const z = {
          ...w,
          ...(p && oe(c) ? { isValid: c } : {}),
          errors: r.errors,
          name: a,
        };
        ((r = { ...r, ...z }), m.state.next(z));
      }
    },
    he = async (a) => (
      M(a, !0),
      await t.resolver(
        s,
        t.context,
        Vn(a || u.mount, n, t.criteriaMode, t.shouldUseNativeValidation),
      )
    ),
    de = async (a) => {
      const { errors: c } = await he(a);
      if ((M(a), a))
        for (const f of a) {
          const w = v(c, f);
          w ? N(r.errors, f, w) : B(r.errors, f);
        }
      else r.errors = c;
      return c;
    },
    ie = async (a, c, f = { valid: !0 }) => {
      for (const w in a) {
        const _ = a[w];
        if (_) {
          const { _f: p, ...z } = _;
          if (p) {
            const F = u.array.has(p.name),
              T = _._f && Fn(_._f);
            T && g.validatingFields && M([p.name], !0);
            const Y = await Yt(
              _,
              u.disabled,
              s,
              I,
              t.shouldUseNativeValidation && !c,
              F,
            );
            if (
              (T && g.validatingFields && M([p.name]),
              Y[p.name] && ((f.valid = !1), c || e.shouldUseNativeValidation))
            )
              break;
            !c &&
              (v(Y, p.name)
                ? F
                  ? xn(r.errors, Y, p.name)
                  : N(r.errors, p.name, Y[p.name])
                : B(r.errors, p.name));
          }
          !Q(z) && (await ie(z, c, f));
        }
      }
      return f.valid;
    },
    Re = () => {
      for (const a of u.unMount) {
        const c = v(n, a);
        c &&
          (c._f.refs ? c._f.refs.every((f) => !at(f)) : !at(c._f.ref)) &&
          nt(a);
      }
      u.unMount = new Set();
    },
    A = (a, c) => !t.disabled && (a && c && N(s, a, c), !fe(It(), o)),
    V = (a, c, f) =>
      ft(a, u, { ...(i.mount ? s : C(c) ? o : se(a) ? { [a]: c } : c) }, f, c),
    K = (a) => vt(v(i.mount ? s : o, a, t.shouldUnregister ? v(o, a, []) : [])),
    G = (a, c, f = {}) => {
      const w = v(n, a);
      let _ = c;
      if (w) {
        const p = w._f;
        p &&
          (!p.disabled && N(s, a, Vr(c, p)),
          (_ = Je(p.ref) && te(c) ? "" : c),
          Er(p.ref)
            ? [...p.ref.options].forEach(
                (z) => (z.selected = _.includes(z.value)),
              )
            : p.refs
              ? xe(p.ref)
                ? p.refs.forEach((z) => {
                    (!z.defaultChecked || !z.disabled) &&
                      (Array.isArray(_)
                        ? (z.checked = !!_.find((F) => F === z.value))
                        : (z.checked = _ === z.value || !!_));
                  })
                : p.refs.forEach((z) => (z.checked = z.value === _))
              : kt(p.ref)
                ? (p.ref.value = "")
                : ((p.ref.value = _),
                  p.ref.type || m.state.next({ name: a, values: J(s) })));
      }
      ((f.shouldDirty || f.shouldTouch) &&
        H(a, _, f.shouldTouch, f.shouldDirty, !0),
        f.shouldValidate && Ve(a));
    },
    ce = (a, c, f) => {
      for (const w in c) {
        if (!c.hasOwnProperty(w)) return;
        const _ = c[w],
          p = a + "." + w,
          z = v(n, p);
        (u.array.has(a) || W(_) || (z && !z._f)) && !ye(_)
          ? ce(p, _, f)
          : G(p, _, f);
      }
    },
    ne = (a, c, f = {}) => {
      const w = v(n, a),
        _ = u.array.has(a),
        p = J(c);
      (N(s, a, p),
        _
          ? (m.array.next({ name: a, values: J(s) }),
            (g.isDirty || g.dirtyFields || y.isDirty || y.dirtyFields) &&
              f.shouldDirty &&
              m.state.next({
                name: a,
                dirtyFields: $e(o, s),
                isDirty: A(a, p),
              }))
          : w && !w._f && !te(p)
            ? ce(a, p, f)
            : G(a, p, f),
        qt(a, u)
          ? m.state.next({ ...r, name: a, values: J(s) })
          : m.state.next({ name: i.mount ? a : void 0, values: J(s) }));
    },
    Ae = async (a) => {
      i.mount = !0;
      const c = a.target;
      let f = c.name,
        w = !0;
      const _ = v(n, f),
        p = (T) => {
          w =
            Number.isNaN(T) ||
            (ye(T) && isNaN(T.getTime())) ||
            fe(T, v(s, f, T));
        },
        z = Wt(t.mode),
        F = Wt(t.reValidateMode);
      if (_) {
        let T, Y;
        const ve = c.type ? Bt(_._f) : zr(a),
          me = a.type === Me.BLUR || a.type === Me.FOCUS_OUT,
          gn =
            (!Tn(_._f) && !t.resolver && !v(r.errors, f) && !_._f.deps) ||
            Dn(me, v(r.touchedFields, f), r.isSubmitted, F, z),
          it = qt(f, u, me);
        (N(s, f, ve),
          me
            ? (!c || !c.readOnly) && (_._f.onBlur && _._f.onBlur(a), l && l(0))
            : _._f.onChange && _._f.onChange(a));
        const ut = H(f, ve, me),
          vn = !Q(ut) || it;
        if ((!me && m.state.next({ name: f, type: a.type, values: J(s) }), gn))
          return (
            (g.isValid || y.isValid) &&
              (t.mode === "onBlur" ? me && j() : me || j()),
            vn && m.state.next({ name: f, ...(it ? {} : ut) })
          );
        if ((!me && it && m.state.next({ ...r }), t.resolver)) {
          const { errors: Rt } = await he([f]);
          if ((M([f]), p(ve), w)) {
            const yn = Gt(r.errors, n, f),
              jt = Gt(Rt, n, yn.name || f);
            ((T = jt.error), (f = jt.name), (Y = Q(Rt)));
          }
        } else
          (M([f], !0),
            (T = (await Yt(_, u.disabled, s, I, t.shouldUseNativeValidation))[
              f
            ]),
            M([f]),
            p(ve),
            w &&
              (T
                ? (Y = !1)
                : (g.isValid || y.isValid) && (Y = await ie(n, !0))));
        w &&
          (_._f.deps &&
            (!Array.isArray(_._f.deps) || _._f.deps.length > 0) &&
            Ve(_._f.deps),
          ae(f, Y, T, ut));
      }
    },
    Ie = (a, c) => {
      if (v(r.errors, c) && a.focus) return (a.focus(), 1);
    },
    Ve = async (a, c = {}) => {
      let f, w;
      const _ = Ne(a);
      if (t.resolver) {
        const p = await de(C(a) ? a : _);
        ((f = Q(p)), (w = a ? !_.some((z) => v(p, z)) : f));
      } else
        a
          ? ((w = (
              await Promise.all(
                _.map(async (p) => {
                  const z = v(n, p);
                  return await ie(z && z._f ? { [p]: z } : z);
                }),
              )
            ).every(Boolean)),
            !(!w && !r.isValid) && j())
          : (w = f = await ie(n));
      return (
        m.state.next({
          ...(!se(a) || ((g.isValid || y.isValid) && f !== r.isValid)
            ? {}
            : { name: a }),
          ...(t.resolver || !a ? { isValid: f } : {}),
          errors: r.errors,
        }),
        c.shouldFocus && !w && Pe(n, Ie, a ? _ : u.mount),
        w
      );
    },
    It = (a, c) => {
      let f = { ...(i.mount ? s : o) };
      return (
        c && (f = Or(c.dirtyFields ? r.dirtyFields : r.touchedFields, f)),
        C(a) ? f : se(a) ? v(f, a) : a.map((w) => v(f, w))
      );
    },
    Vt = (a, c) => ({
      invalid: !!v((c || r).errors, a),
      isDirty: !!v((c || r).dirtyFields, a),
      error: v((c || r).errors, a),
      isValidating: !!v(r.validatingFields, a),
      isTouched: !!v((c || r).touchedFields, a),
    }),
    ln = (a) => {
      (a && Ne(a).forEach((c) => B(r.errors, c)),
        m.state.next({ errors: a ? r.errors : {} }));
    },
    Ft = (a, c, f) => {
      const w = (v(n, a, { _f: {} })._f || {}).ref,
        _ = v(r.errors, a) || {},
        { ref: p, message: z, type: F, ...T } = _;
      (N(r.errors, a, { ...T, ...c, ref: w }),
        m.state.next({ name: a, errors: r.errors, isValid: !1 }),
        f && f.shouldFocus && w && w.focus && w.focus());
    },
    fn = (a, c) =>
      ee(a)
        ? m.state.subscribe({
            next: (f) => "values" in f && a(V(void 0, c), f),
          })
        : V(a, c, !0),
    Tt = (a) =>
      m.state.subscribe({
        next: (c) => {
          Pn(a.name, c.name, a.exact) &&
            Nn(c, a.formState || g, _n, a.reRenderRoot) &&
            a.callback({ values: { ...s }, ...r, ...c, defaultValues: o });
        },
      }).unsubscribe,
    dn = (a) => (
      (i.mount = !0),
      (y = { ...y, ...a.formState }),
      Tt({ ...a, formState: { ...b, ...a.formState } })
    ),
    nt = (a, c = {}) => {
      for (const f of a ? Ne(a) : u.mount)
        (u.mount.delete(f),
          u.array.delete(f),
          c.keepValue || (B(n, f), B(s, f)),
          !c.keepError && B(r.errors, f),
          !c.keepDirty && B(r.dirtyFields, f),
          !c.keepTouched && B(r.touchedFields, f),
          !c.keepIsValidating && B(r.validatingFields, f),
          !t.shouldUnregister && !c.keepDefaultValue && B(o, f));
      (m.state.next({ values: J(s) }),
        m.state.next({ ...r, ...(c.keepDirty ? { isDirty: A() } : {}) }),
        !c.keepIsValid && j());
    },
    Nt = ({ disabled: a, name: c }) => {
      if ((oe(a) && i.mount) || a || u.disabled.has(c)) {
        const _ = u.disabled.has(c) !== !!a;
        (a ? u.disabled.add(c) : u.disabled.delete(c),
          _ && i.mount && !i.action && j());
      }
    },
    ot = (a, c = {}) => {
      let f = v(n, a);
      const w = oe(c.disabled) || oe(t.disabled);
      return (
        N(n, a, {
          ...(f || {}),
          _f: {
            ...(f && f._f ? f._f : { ref: { name: a } }),
            name: a,
            mount: !0,
            ...c,
          },
        }),
        u.mount.add(a),
        f
          ? Nt({ disabled: oe(c.disabled) ? c.disabled : t.disabled, name: a })
          : S(a, !0, c.value),
        {
          ...(w ? { disabled: c.disabled || t.disabled } : {}),
          ...(t.progressive
            ? {
                required: !!c.required,
                min: Fe(c.min),
                max: Fe(c.max),
                minLength: Fe(c.minLength),
                maxLength: Fe(c.maxLength),
                pattern: Fe(c.pattern),
              }
            : {}),
          name: a,
          onChange: Ae,
          onBlur: Ae,
          ref: (_) => {
            if (_) {
              (ot(a, c), (f = v(n, a)));
              const p =
                  (C(_.value) &&
                    _.querySelectorAll &&
                    _.querySelectorAll("input,select,textarea")[0]) ||
                  _,
                z = On(p),
                F = f._f.refs || [];
              if (z ? F.find((T) => T === p) : p === f._f.ref) return;
              (N(n, a, {
                _f: {
                  ...f._f,
                  ...(z
                    ? {
                        refs: [
                          ...F.filter(at),
                          p,
                          ...(Array.isArray(v(o, a)) ? [{}] : []),
                        ],
                        ref: { type: p.type, name: a },
                      }
                    : { ref: p }),
                },
              }),
                S(a, !1, void 0, p));
            } else
              ((f = v(n, a, {})),
                f._f && (f._f.mount = !1),
                (t.shouldUnregister || c.shouldUnregister) &&
                  !($r(u.array, a) && i.action) &&
                  u.unMount.add(a));
          },
        }
      );
    },
    st = () => t.shouldFocusError && Pe(n, Ie, u.mount),
    hn = (a) => {
      oe(a) &&
        (m.state.next({ disabled: a }),
        Pe(
          n,
          (c, f) => {
            const w = v(n, f);
            w &&
              ((c.disabled = w._f.disabled || a),
              Array.isArray(w._f.refs) &&
                w._f.refs.forEach((_) => {
                  _.disabled = w._f.disabled || a;
                }));
          },
          0,
          !1,
        ));
    },
    Pt = (a, c) => async (f) => {
      let w;
      f && (f.preventDefault && f.preventDefault(), f.persist && f.persist());
      let _ = J(s);
      if ((m.state.next({ isSubmitting: !0 }), t.resolver)) {
        const { errors: p, values: z } = await he();
        (M(), (r.errors = p), (_ = J(z)));
      } else await ie(n);
      if (u.disabled.size) for (const p of u.disabled) B(_, p);
      if ((B(r.errors, "root"), Q(r.errors))) {
        m.state.next({ errors: {} });
        try {
          await a(_, f);
        } catch (p) {
          w = p;
        }
      } else (c && (await c({ ...r.errors }, f)), st(), setTimeout(st));
      if (
        (m.state.next({
          isSubmitted: !0,
          isSubmitting: !1,
          isSubmitSuccessful: Q(r.errors) && !w,
          submitCount: r.submitCount + 1,
          errors: r.errors,
        }),
        w)
      )
        throw w;
    },
    pn = (a, c = {}) => {
      v(n, a) &&
        (C(c.defaultValue)
          ? ne(a, J(v(o, a)))
          : (ne(a, c.defaultValue), N(o, a, J(c.defaultValue))),
        c.keepTouched || B(r.touchedFields, a),
        c.keepDirty ||
          (B(r.dirtyFields, a),
          (r.isDirty = c.defaultValue ? A(a, J(v(o, a))) : A())),
        c.keepError || (B(r.errors, a), g.isValid && j()),
        m.state.next({ ...r }));
    },
    Dt = (a, c = {}) => {
      const f = a ? J(a) : o,
        w = J(f),
        _ = Q(a),
        p = _ ? o : w;
      if ((c.keepDefaultValues || (o = f), !c.keepValues)) {
        if (c.keepDirtyValues) {
          const z = new Set([...u.mount, ...Object.keys($e(o, s))]);
          for (const F of Array.from(z)) {
            const T = v(r.dirtyFields, F),
              Y = v(s, F),
              ve = v(p, F);
            T && !C(Y) ? N(p, F, Y) : !T && !C(ve) && ne(F, ve);
          }
        } else {
          if (gt && C(a))
            for (const z of u.mount) {
              const F = v(n, z);
              if (F && F._f) {
                const T = Array.isArray(F._f.refs) ? F._f.refs[0] : F._f.ref;
                if (Je(T)) {
                  const Y = T.closest("form");
                  if (Y) {
                    Y.reset();
                    break;
                  }
                }
              }
            }
          if (c.keepFieldsRef) for (const z of u.mount) ne(z, v(p, z));
          else n = {};
        }
        ((s = t.shouldUnregister ? (c.keepDefaultValues ? J(o) : {}) : J(p)),
          m.array.next({ values: { ...p } }),
          m.state.next({ values: { ...p } }));
      }
      ((u = {
        mount: c.keepDirtyValues ? u.mount : new Set(),
        unMount: new Set(),
        array: new Set(),
        disabled: new Set(),
        watch: new Set(),
        watchAll: !1,
        focus: "",
      }),
        (i.mount =
          !g.isValid ||
          !!c.keepIsValid ||
          !!c.keepDirtyValues ||
          (!t.shouldUnregister && !Q(p))),
        (i.watch = !!t.shouldUnregister),
        (i.keepIsValid = !!c.keepIsValid),
        (i.action = !1),
        c.keepErrors || (r.errors = {}),
        m.state.next({
          submitCount: c.keepSubmitCount ? r.submitCount : 0,
          isDirty: _
            ? !1
            : c.keepDirty
              ? r.isDirty
              : !!(c.keepDefaultValues && !fe(a, o)),
          isSubmitted: c.keepIsSubmitted ? r.isSubmitted : !1,
          dirtyFields: _
            ? {}
            : c.keepDirtyValues
              ? c.keepDefaultValues && s
                ? $e(o, s)
                : r.dirtyFields
              : c.keepDefaultValues && a
                ? $e(o, a)
                : c.keepDirty
                  ? r.dirtyFields
                  : {},
          touchedFields: c.keepTouched ? r.touchedFields : {},
          errors: c.keepErrors ? r.errors : {},
          isSubmitSuccessful: c.keepIsSubmitSuccessful
            ? r.isSubmitSuccessful
            : !1,
          isSubmitting: !1,
          defaultValues: o,
        }));
    },
    Ct = (a, c) => Dt(ee(a) ? a(s) : a, { ...t.resetOptions, ...c }),
    mn = (a, c = {}) => {
      const f = v(n, a),
        w = f && f._f;
      if (w) {
        const _ = w.refs ? w.refs[0] : w.ref;
        _.focus &&
          setTimeout(() => {
            (_.focus(), c.shouldSelect && ee(_.select) && _.select());
          });
      }
    },
    _n = (a) => {
      r = { ...r, ...a };
    },
    xt = {
      control: {
        register: ot,
        unregister: nt,
        getFieldState: Vt,
        handleSubmit: Pt,
        setError: Ft,
        _subscribe: Tt,
        _runSchema: he,
        _updateIsValidating: M,
        _focusError: st,
        _getWatch: V,
        _getDirty: A,
        _setValid: j,
        _setFieldArray: O,
        _setDisabledField: Nt,
        _setErrors: $,
        _getFieldArray: K,
        _reset: Dt,
        _resetDefaultValues: () =>
          ee(t.defaultValues) &&
          t.defaultValues().then((a) => {
            (Ct(a, t.resetOptions), m.state.next({ isLoading: !1 }));
          }),
        _removeUnmounted: Re,
        _disableForm: hn,
        _subjects: m,
        _proxyFormState: g,
        get _fields() {
          return n;
        },
        get _formValues() {
          return s;
        },
        get _state() {
          return i;
        },
        set _state(a) {
          i = a;
        },
        get _defaultValues() {
          return o;
        },
        get _names() {
          return u;
        },
        set _names(a) {
          u = a;
        },
        get _formState() {
          return r;
        },
        get _options() {
          return t;
        },
        set _options(a) {
          t = { ...t, ...a };
        },
      },
      subscribe: dn,
      trigger: Ve,
      register: ot,
      handleSubmit: Pt,
      watch: fn,
      setValue: ne,
      getValues: It,
      reset: Ct,
      resetField: pn,
      clearErrors: ln,
      unregister: nt,
      setError: Ft,
      setFocus: mn,
      getFieldState: Vt,
    };
  return { ...xt, formControl: xt };
}
function Ea(e = {}) {
  const t = Z.useRef(void 0),
    r = Z.useRef(void 0),
    [n, o] = Z.useState({
      isDirty: !1,
      isValidating: !1,
      isLoading: ee(e.defaultValues),
      isSubmitted: !1,
      isSubmitting: !1,
      isSubmitSuccessful: !1,
      isValid: !1,
      submitCount: 0,
      dirtyFields: {},
      touchedFields: {},
      validatingFields: {},
      errors: e.errors || {},
      disabled: e.disabled || !1,
      isReady: !1,
      defaultValues: ee(e.defaultValues) ? void 0 : e.defaultValues,
    });
  if (!t.current)
    if (e.formControl)
      ((t.current = { ...e.formControl, formState: n }),
        e.defaultValues &&
          !ee(e.defaultValues) &&
          e.formControl.reset(e.defaultValues, e.resetOptions));
    else {
      const { formControl: i, ...u } = jn(e);
      t.current = { ...u, formState: n };
    }
  const s = t.current.control;
  return (
    (s._options = e),
    wt(() => {
      const i = s._subscribe({
        formState: s._proxyFormState,
        callback: () => o({ ...s._formState }),
        reRenderRoot: !0,
      });
      return (
        o((u) => ({ ...u, isReady: !0 })),
        (s._formState.isReady = !0),
        i
      );
    }, [s]),
    Z.useEffect(() => s._disableForm(e.disabled), [s, e.disabled]),
    Z.useEffect(() => {
      (e.mode && (s._options.mode = e.mode),
        e.reValidateMode && (s._options.reValidateMode = e.reValidateMode));
    }, [s, e.mode, e.reValidateMode]),
    Z.useEffect(() => {
      e.errors && (s._setErrors(e.errors), s._focusError());
    }, [s, e.errors]),
    Z.useEffect(() => {
      e.shouldUnregister && s._subjects.state.next({ values: s._getWatch() });
    }, [s, e.shouldUnregister]),
    Z.useEffect(() => {
      if (s._proxyFormState.isDirty) {
        const i = s._getDirty();
        i !== n.isDirty && s._subjects.state.next({ isDirty: i });
      }
    }, [s, n.isDirty]),
    Z.useEffect(() => {
      var i;
      e.values && !fe(e.values, r.current)
        ? (s._reset(e.values, {
            keepFieldsRef: !0,
            ...s._options.resetOptions,
          }),
          (!((i = s._options.resetOptions) === null || i === void 0) &&
            i.keepIsValid) ||
            s._setValid(),
          (r.current = e.values),
          o((u) => ({ ...u })))
        : s._resetDefaultValues();
    }, [s, e.values]),
    Z.useEffect(() => {
      (s._state.mount || (s._setValid(), (s._state.mount = !0)),
        s._state.watch &&
          ((s._state.watch = !1), s._subjects.state.next({ ...s._formState })),
        s._removeUnmounted());
    }),
    (t.current.formState = Z.useMemo(() => Zr(n, s), [s, n])),
    t.current
  );
}
const Xt = (e, t, r) => {
    if (e && "reportValidity" in e) {
      const n = v(r, t);
      (e.setCustomValidity((n && n.message) || ""), e.reportValidity());
    }
  },
  Un = (e, t) => {
    for (const r in t.fields) {
      const n = t.fields[r];
      n && n.ref && "reportValidity" in n.ref
        ? Xt(n.ref, r, e)
        : n && n.refs && n.refs.forEach((o) => Xt(o, r, e));
    }
  },
  Aa = (e, t) => {
    t.shouldUseNativeValidation && Un(e, t);
    const r = {};
    for (const n in e) {
      const o = v(t.fields, n),
        s = Object.assign(e[n] || {}, { ref: o && o.ref });
      if (Ln(t.names || Object.keys(e), n)) {
        const i = Object.assign({}, v(r, n));
        (N(i, "root", s), N(r, n, i));
      } else N(r, n, s);
    }
    return r;
  },
  Ln = (e, t) => {
    const r = Qt(t);
    return e.some((n) => Qt(n).match(`^${r}\\.\\d+`));
  };
function Qt(e) {
  return e.replace(/\]|\[/g, "");
}
function d(e, t, r) {
  function n(u, l) {
    if (
      (u._zod ||
        Object.defineProperty(u, "_zod", {
          value: { def: l, constr: i, traits: new Set() },
          enumerable: !1,
        }),
      u._zod.traits.has(e))
    )
      return;
    (u._zod.traits.add(e), t(u, l));
    const h = i.prototype,
      b = Object.keys(h);
    for (let g = 0; g < b.length; g++) {
      const y = b[g];
      y in u || (u[y] = h[y].bind(u));
    }
  }
  const o = r?.Parent ?? Object;
  class s extends o {}
  Object.defineProperty(s, "name", { value: e });
  function i(u) {
    var l;
    const h = r?.Parent ? new s() : this;
    (n(h, u), (l = h._zod).deferred ?? (l.deferred = []));
    for (const b of h._zod.deferred) b();
    return h;
  }
  return (
    Object.defineProperty(i, "init", { value: n }),
    Object.defineProperty(i, Symbol.hasInstance, {
      value: (u) =>
        r?.Parent && u instanceof r.Parent ? !0 : u?._zod?.traits?.has(e),
    }),
    Object.defineProperty(i, "name", { value: e }),
    i
  );
}
class Ze extends Error {
  constructor() {
    super(
      "Encountered Promise during synchronous parse. Use .parseAsync() instead.",
    );
  }
}
class Tr extends Error {
  constructor(t) {
    (super(`Encountered unidirectional transform during encode: ${t}`),
      (this.name = "ZodEncodeError"));
  }
}
const Nr = {};
function be(e) {
  return Nr;
}
function Pr(e) {
  const t = Object.values(e).filter((n) => typeof n == "number");
  return Object.entries(e)
    .filter(([n, o]) => t.indexOf(+n) === -1)
    .map(([n, o]) => o);
}
function pt(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function $t(e) {
  return {
    get value() {
      {
        const t = e();
        return (Object.defineProperty(this, "value", { value: t }), t);
      }
    },
  };
}
function St(e) {
  return e == null;
}
function Zt(e) {
  const t = e.startsWith("^") ? 1 : 0,
    r = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, r);
}
function Mn(e, t) {
  const r = (e.toString().split(".")[1] || "").length,
    n = t.toString();
  let o = (n.split(".")[1] || "").length;
  if (o === 0 && /\d?e-\d?/.test(n)) {
    const l = n.match(/\d?e-(\d?)/);
    l?.[1] && (o = Number.parseInt(l[1]));
  }
  const s = r > o ? r : o,
    i = Number.parseInt(e.toFixed(s).replace(".", "")),
    u = Number.parseInt(t.toFixed(s).replace(".", ""));
  return (i % u) / 10 ** s;
}
const er = Symbol("evaluating");
function P(e, t, r) {
  let n;
  Object.defineProperty(e, t, {
    get() {
      if (n !== er) return (n === void 0 && ((n = er), (n = r())), n);
    },
    set(o) {
      Object.defineProperty(e, t, { value: o });
    },
    configurable: !0,
  });
}
function ke(e, t, r) {
  Object.defineProperty(e, t, {
    value: r,
    writable: !0,
    enumerable: !0,
    configurable: !0,
  });
}
function _e(...e) {
  const t = {};
  for (const r of e) {
    const n = Object.getOwnPropertyDescriptors(r);
    Object.assign(t, n);
  }
  return Object.defineProperties({}, t);
}
function tr(e) {
  return JSON.stringify(e);
}
function Jn(e) {
  return e
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
const Dr =
  "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function We(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const Bn = $t(() => {
  if (typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    const e = Function;
    return (new e(""), !0);
  } catch {
    return !1;
  }
});
function De(e) {
  if (We(e) === !1) return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function") return !0;
  const r = t.prototype;
  return !(
    We(r) === !1 ||
    Object.prototype.hasOwnProperty.call(r, "isPrototypeOf") === !1
  );
}
function Cr(e) {
  return De(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const Wn = new Set(["string", "number", "symbol"]);
function Oe(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ge(e, t, r) {
  const n = new e._zod.constr(t ?? e._zod.def);
  return ((!t || r?.parent) && (n._zod.parent = e), n);
}
function k(e) {
  const t = e;
  if (!t) return {};
  if (typeof t == "string") return { error: () => t };
  if (t?.message !== void 0) {
    if (t?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return (
    delete t.message,
    typeof t.error == "string" ? { ...t, error: () => t.error } : t
  );
}
function Kn(e) {
  return Object.keys(e).filter(
    (t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional",
  );
}
const qn = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
};
function Gn(e, t) {
  const r = e._zod.def,
    n = r.checks;
  if (n && n.length > 0)
    throw new Error(
      ".pick() cannot be used on object schemas containing refinements",
    );
  const s = _e(e._zod.def, {
    get shape() {
      const i = {};
      for (const u in t) {
        if (!(u in r.shape)) throw new Error(`Unrecognized key: "${u}"`);
        t[u] && (i[u] = r.shape[u]);
      }
      return (ke(this, "shape", i), i);
    },
    checks: [],
  });
  return ge(e, s);
}
function Hn(e, t) {
  const r = e._zod.def,
    n = r.checks;
  if (n && n.length > 0)
    throw new Error(
      ".omit() cannot be used on object schemas containing refinements",
    );
  const s = _e(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape };
      for (const u in t) {
        if (!(u in r.shape)) throw new Error(`Unrecognized key: "${u}"`);
        t[u] && delete i[u];
      }
      return (ke(this, "shape", i), i);
    },
    checks: [],
  });
  return ge(e, s);
}
function Yn(e, t) {
  if (!De(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const r = e._zod.def.checks;
  if (r && r.length > 0) {
    const s = e._zod.def.shape;
    for (const i in t)
      if (Object.getOwnPropertyDescriptor(s, i) !== void 0)
        throw new Error(
          "Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.",
        );
  }
  const o = _e(e._zod.def, {
    get shape() {
      const s = { ...e._zod.def.shape, ...t };
      return (ke(this, "shape", s), s);
    },
  });
  return ge(e, o);
}
function Xn(e, t) {
  if (!De(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const r = _e(e._zod.def, {
    get shape() {
      const n = { ...e._zod.def.shape, ...t };
      return (ke(this, "shape", n), n);
    },
  });
  return ge(e, r);
}
function Qn(e, t) {
  const r = _e(e._zod.def, {
    get shape() {
      const n = { ...e._zod.def.shape, ...t._zod.def.shape };
      return (ke(this, "shape", n), n);
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: [],
  });
  return ge(e, r);
}
function eo(e, t, r) {
  const o = t._zod.def.checks;
  if (o && o.length > 0)
    throw new Error(
      ".partial() cannot be used on object schemas containing refinements",
    );
  const i = _e(t._zod.def, {
    get shape() {
      const u = t._zod.def.shape,
        l = { ...u };
      if (r)
        for (const h in r) {
          if (!(h in u)) throw new Error(`Unrecognized key: "${h}"`);
          r[h] &&
            (l[h] = e ? new e({ type: "optional", innerType: u[h] }) : u[h]);
        }
      else
        for (const h in u)
          l[h] = e ? new e({ type: "optional", innerType: u[h] }) : u[h];
      return (ke(this, "shape", l), l);
    },
    checks: [],
  });
  return ge(t, i);
}
function to(e, t, r) {
  const n = _e(t._zod.def, {
    get shape() {
      const o = t._zod.def.shape,
        s = { ...o };
      if (r)
        for (const i in r) {
          if (!(i in s)) throw new Error(`Unrecognized key: "${i}"`);
          r[i] && (s[i] = new e({ type: "nonoptional", innerType: o[i] }));
        }
      else
        for (const i in o)
          s[i] = new e({ type: "nonoptional", innerType: o[i] });
      return (ke(this, "shape", s), s);
    },
  });
  return ge(t, n);
}
function Se(e, t = 0) {
  if (e.aborted === !0) return !0;
  for (let r = t; r < e.issues.length; r++)
    if (e.issues[r]?.continue !== !0) return !0;
  return !1;
}
function xr(e, t) {
  return t.map((r) => {
    var n;
    return ((n = r).path ?? (n.path = []), r.path.unshift(e), r);
  });
}
function je(e) {
  return typeof e == "string" ? e : e?.message;
}
function we(e, t, r) {
  const n = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const o =
      je(e.inst?._zod.def?.error?.(e)) ??
      je(t?.error?.(e)) ??
      je(r.customError?.(e)) ??
      je(r.localeError?.(e)) ??
      "Invalid input";
    n.message = o;
  }
  return (
    delete n.inst,
    delete n.continue,
    t?.reportInput || delete n.input,
    n
  );
}
function Ot(e) {
  return Array.isArray(e)
    ? "array"
    : typeof e == "string"
      ? "string"
      : "unknown";
}
function Ce(...e) {
  const [t, r, n] = e;
  return typeof t == "string"
    ? { message: t, code: "custom", input: r, inst: n }
    : { ...t };
}
const Rr = (e, t) => {
    ((e.name = "$ZodError"),
      Object.defineProperty(e, "_zod", { value: e._zod, enumerable: !1 }),
      Object.defineProperty(e, "issues", { value: t, enumerable: !1 }),
      (e.message = JSON.stringify(t, pt, 2)),
      Object.defineProperty(e, "toString", {
        value: () => e.message,
        enumerable: !1,
      }));
  },
  jr = d("$ZodError", Rr),
  Ye = d("$ZodError", Rr, { Parent: Error });
function ro(e, t = (r) => r.message) {
  const r = {},
    n = [];
  for (const o of e.issues)
    o.path.length > 0
      ? ((r[o.path[0]] = r[o.path[0]] || []), r[o.path[0]].push(t(o)))
      : n.push(t(o));
  return { formErrors: n, fieldErrors: r };
}
function no(e, t = (r) => r.message) {
  const r = { _errors: [] },
    n = (o) => {
      for (const s of o.issues)
        if (s.code === "invalid_union" && s.errors.length)
          s.errors.map((i) => n({ issues: i }));
        else if (s.code === "invalid_key") n({ issues: s.issues });
        else if (s.code === "invalid_element") n({ issues: s.issues });
        else if (s.path.length === 0) r._errors.push(t(s));
        else {
          let i = r,
            u = 0;
          for (; u < s.path.length; ) {
            const l = s.path[u];
            (u === s.path.length - 1
              ? ((i[l] = i[l] || { _errors: [] }), i[l]._errors.push(t(s)))
              : (i[l] = i[l] || { _errors: [] }),
              (i = i[l]),
              u++);
          }
        }
    };
  return (n(e), r);
}
const Xe = (e) => (t, r, n, o) => {
    const s = n ? Object.assign(n, { async: !1 }) : { async: !1 },
      i = t._zod.run({ value: r, issues: [] }, s);
    if (i instanceof Promise) throw new Ze();
    if (i.issues.length) {
      const u = new (o?.Err ?? e)(i.issues.map((l) => we(l, s, be())));
      throw (Dr(u, o?.callee), u);
    }
    return i.value;
  },
  Ia = Xe(Ye),
  Qe = (e) => async (t, r, n, o) => {
    const s = n ? Object.assign(n, { async: !0 }) : { async: !0 };
    let i = t._zod.run({ value: r, issues: [] }, s);
    if ((i instanceof Promise && (i = await i), i.issues.length)) {
      const u = new (o?.Err ?? e)(i.issues.map((l) => we(l, s, be())));
      throw (Dr(u, o?.callee), u);
    }
    return i.value;
  },
  Va = Qe(Ye),
  et = (e) => (t, r, n) => {
    const o = n ? { ...n, async: !1 } : { async: !1 },
      s = t._zod.run({ value: r, issues: [] }, o);
    if (s instanceof Promise) throw new Ze();
    return s.issues.length
      ? {
          success: !1,
          error: new (e ?? jr)(s.issues.map((i) => we(i, o, be()))),
        }
      : { success: !0, data: s.value };
  },
  oo = et(Ye),
  tt = (e) => async (t, r, n) => {
    const o = n ? Object.assign(n, { async: !0 }) : { async: !0 };
    let s = t._zod.run({ value: r, issues: [] }, o);
    return (
      s instanceof Promise && (s = await s),
      s.issues.length
        ? { success: !1, error: new e(s.issues.map((i) => we(i, o, be()))) }
        : { success: !0, data: s.value }
    );
  },
  so = tt(Ye),
  io = (e) => (t, r, n) => {
    const o = n
      ? Object.assign(n, { direction: "backward" })
      : { direction: "backward" };
    return Xe(e)(t, r, o);
  },
  uo = (e) => (t, r, n) => Xe(e)(t, r, n),
  ao = (e) => async (t, r, n) => {
    const o = n
      ? Object.assign(n, { direction: "backward" })
      : { direction: "backward" };
    return Qe(e)(t, r, o);
  },
  co = (e) => async (t, r, n) => Qe(e)(t, r, n),
  lo = (e) => (t, r, n) => {
    const o = n
      ? Object.assign(n, { direction: "backward" })
      : { direction: "backward" };
    return et(e)(t, r, o);
  },
  fo = (e) => (t, r, n) => et(e)(t, r, n),
  ho = (e) => async (t, r, n) => {
    const o = n
      ? Object.assign(n, { direction: "backward" })
      : { direction: "backward" };
    return tt(e)(t, r, o);
  },
  po = (e) => async (t, r, n) => tt(e)(t, r, n),
  mo = /^[cC][^\s-]{8,}$/,
  _o = /^[0-9a-z]+$/,
  go = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,
  vo = /^[0-9a-vA-V]{20}$/,
  yo = /^[A-Za-z0-9]{27}$/,
  bo = /^[a-zA-Z0-9_-]{21}$/,
  wo =
    /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,
  ko =
    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  rr = (e) =>
    e
      ? new RegExp(
          `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`,
        )
      : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,
  zo =
    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
  $o = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function So() {
  return new RegExp($o, "u");
}
const Zo =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  Oo =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,
  Eo =
    /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,
  Ao =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  Io =
    /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,
  Ur = /^[A-Za-z0-9_-]*$/,
  Vo = /^\+[1-9]\d{6,14}$/,
  Lr =
    "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))",
  Fo = new RegExp(`^${Lr}$`);
function Mr(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number"
    ? e.precision === -1
      ? `${t}`
      : e.precision === 0
        ? `${t}:[0-5]\\d`
        : `${t}:[0-5]\\d\\.\\d{${e.precision}}`
    : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function To(e) {
  return new RegExp(`^${Mr(e)}$`);
}
function No(e) {
  const t = Mr({ precision: e.precision }),
    r = ["Z"];
  (e.local && r.push(""),
    e.offset && r.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)"));
  const n = `${t}(?:${r.join("|")})`;
  return new RegExp(`^${Lr}T(?:${n})$`);
}
const Po = (e) => {
    const t = e
      ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ""}}`
      : "[\\s\\S]*";
    return new RegExp(`^${t}$`);
  },
  Do = /^-?\d+$/,
  Co = /^-?\d+(?:\.\d+)?$/,
  xo = /^(?:true|false)$/i,
  Ro = /^[^A-Z]*$/,
  jo = /^[^a-z]*$/,
  re = d("$ZodCheck", (e, t) => {
    var r;
    (e._zod ?? (e._zod = {}),
      (e._zod.def = t),
      (r = e._zod).onattach ?? (r.onattach = []));
  }),
  Jr = { number: "number", bigint: "bigint", object: "date" },
  Br = d("$ZodCheckLessThan", (e, t) => {
    re.init(e, t);
    const r = Jr[typeof t.value];
    (e._zod.onattach.push((n) => {
      const o = n._zod.bag,
        s =
          (t.inclusive ? o.maximum : o.exclusiveMaximum) ??
          Number.POSITIVE_INFINITY;
      t.value < s &&
        (t.inclusive ? (o.maximum = t.value) : (o.exclusiveMaximum = t.value));
    }),
      (e._zod.check = (n) => {
        (t.inclusive ? n.value <= t.value : n.value < t.value) ||
          n.issues.push({
            origin: r,
            code: "too_big",
            maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
            input: n.value,
            inclusive: t.inclusive,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Wr = d("$ZodCheckGreaterThan", (e, t) => {
    re.init(e, t);
    const r = Jr[typeof t.value];
    (e._zod.onattach.push((n) => {
      const o = n._zod.bag,
        s =
          (t.inclusive ? o.minimum : o.exclusiveMinimum) ??
          Number.NEGATIVE_INFINITY;
      t.value > s &&
        (t.inclusive ? (o.minimum = t.value) : (o.exclusiveMinimum = t.value));
    }),
      (e._zod.check = (n) => {
        (t.inclusive ? n.value >= t.value : n.value > t.value) ||
          n.issues.push({
            origin: r,
            code: "too_small",
            minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
            input: n.value,
            inclusive: t.inclusive,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Uo = d("$ZodCheckMultipleOf", (e, t) => {
    (re.init(e, t),
      e._zod.onattach.push((r) => {
        var n;
        (n = r._zod.bag).multipleOf ?? (n.multipleOf = t.value);
      }),
      (e._zod.check = (r) => {
        if (typeof r.value != typeof t.value)
          throw new Error("Cannot mix number and bigint in multiple_of check.");
        (typeof r.value == "bigint"
          ? r.value % t.value === BigInt(0)
          : Mn(r.value, t.value) === 0) ||
          r.issues.push({
            origin: typeof r.value,
            code: "not_multiple_of",
            divisor: t.value,
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Lo = d("$ZodCheckNumberFormat", (e, t) => {
    (re.init(e, t), (t.format = t.format || "float64"));
    const r = t.format?.includes("int"),
      n = r ? "int" : "number",
      [o, s] = qn[t.format];
    (e._zod.onattach.push((i) => {
      const u = i._zod.bag;
      ((u.format = t.format),
        (u.minimum = o),
        (u.maximum = s),
        r && (u.pattern = Do));
    }),
      (e._zod.check = (i) => {
        const u = i.value;
        if (r) {
          if (!Number.isInteger(u)) {
            i.issues.push({
              expected: n,
              format: t.format,
              code: "invalid_type",
              continue: !1,
              input: u,
              inst: e,
            });
            return;
          }
          if (!Number.isSafeInteger(u)) {
            u > 0
              ? i.issues.push({
                  input: u,
                  code: "too_big",
                  maximum: Number.MAX_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: n,
                  inclusive: !0,
                  continue: !t.abort,
                })
              : i.issues.push({
                  input: u,
                  code: "too_small",
                  minimum: Number.MIN_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: n,
                  inclusive: !0,
                  continue: !t.abort,
                });
            return;
          }
        }
        (u < o &&
          i.issues.push({
            origin: "number",
            input: u,
            code: "too_small",
            minimum: o,
            inclusive: !0,
            inst: e,
            continue: !t.abort,
          }),
          u > s &&
            i.issues.push({
              origin: "number",
              input: u,
              code: "too_big",
              maximum: s,
              inclusive: !0,
              inst: e,
              continue: !t.abort,
            }));
      }));
  }),
  Mo = d("$ZodCheckMaxLength", (e, t) => {
    var r;
    (re.init(e, t),
      (r = e._zod.def).when ??
        (r.when = (n) => {
          const o = n.value;
          return !St(o) && o.length !== void 0;
        }),
      e._zod.onattach.push((n) => {
        const o = n._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        t.maximum < o && (n._zod.bag.maximum = t.maximum);
      }),
      (e._zod.check = (n) => {
        const o = n.value;
        if (o.length <= t.maximum) return;
        const i = Ot(o);
        n.issues.push({
          origin: i,
          code: "too_big",
          maximum: t.maximum,
          inclusive: !0,
          input: o,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  Jo = d("$ZodCheckMinLength", (e, t) => {
    var r;
    (re.init(e, t),
      (r = e._zod.def).when ??
        (r.when = (n) => {
          const o = n.value;
          return !St(o) && o.length !== void 0;
        }),
      e._zod.onattach.push((n) => {
        const o = n._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        t.minimum > o && (n._zod.bag.minimum = t.minimum);
      }),
      (e._zod.check = (n) => {
        const o = n.value;
        if (o.length >= t.minimum) return;
        const i = Ot(o);
        n.issues.push({
          origin: i,
          code: "too_small",
          minimum: t.minimum,
          inclusive: !0,
          input: o,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  Bo = d("$ZodCheckLengthEquals", (e, t) => {
    var r;
    (re.init(e, t),
      (r = e._zod.def).when ??
        (r.when = (n) => {
          const o = n.value;
          return !St(o) && o.length !== void 0;
        }),
      e._zod.onattach.push((n) => {
        const o = n._zod.bag;
        ((o.minimum = t.length), (o.maximum = t.length), (o.length = t.length));
      }),
      (e._zod.check = (n) => {
        const o = n.value,
          s = o.length;
        if (s === t.length) return;
        const i = Ot(o),
          u = s > t.length;
        n.issues.push({
          origin: i,
          ...(u
            ? { code: "too_big", maximum: t.length }
            : { code: "too_small", minimum: t.length }),
          inclusive: !0,
          exact: !0,
          input: n.value,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  rt = d("$ZodCheckStringFormat", (e, t) => {
    var r, n;
    (re.init(e, t),
      e._zod.onattach.push((o) => {
        const s = o._zod.bag;
        ((s.format = t.format),
          t.pattern &&
            (s.patterns ?? (s.patterns = new Set()),
            s.patterns.add(t.pattern)));
      }),
      t.pattern
        ? ((r = e._zod).check ??
          (r.check = (o) => {
            ((t.pattern.lastIndex = 0),
              !t.pattern.test(o.value) &&
                o.issues.push({
                  origin: "string",
                  code: "invalid_format",
                  format: t.format,
                  input: o.value,
                  ...(t.pattern ? { pattern: t.pattern.toString() } : {}),
                  inst: e,
                  continue: !t.abort,
                }));
          }))
        : ((n = e._zod).check ?? (n.check = () => {})));
  }),
  Wo = d("$ZodCheckRegex", (e, t) => {
    (rt.init(e, t),
      (e._zod.check = (r) => {
        ((t.pattern.lastIndex = 0),
          !t.pattern.test(r.value) &&
            r.issues.push({
              origin: "string",
              code: "invalid_format",
              format: "regex",
              input: r.value,
              pattern: t.pattern.toString(),
              inst: e,
              continue: !t.abort,
            }));
      }));
  }),
  Ko = d("$ZodCheckLowerCase", (e, t) => {
    (t.pattern ?? (t.pattern = Ro), rt.init(e, t));
  }),
  qo = d("$ZodCheckUpperCase", (e, t) => {
    (t.pattern ?? (t.pattern = jo), rt.init(e, t));
  }),
  Go = d("$ZodCheckIncludes", (e, t) => {
    re.init(e, t);
    const r = Oe(t.includes),
      n = new RegExp(
        typeof t.position == "number" ? `^.{${t.position}}${r}` : r,
      );
    ((t.pattern = n),
      e._zod.onattach.push((o) => {
        const s = o._zod.bag;
        (s.patterns ?? (s.patterns = new Set()), s.patterns.add(n));
      }),
      (e._zod.check = (o) => {
        o.value.includes(t.includes, t.position) ||
          o.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "includes",
            includes: t.includes,
            input: o.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Ho = d("$ZodCheckStartsWith", (e, t) => {
    re.init(e, t);
    const r = new RegExp(`^${Oe(t.prefix)}.*`);
    (t.pattern ?? (t.pattern = r),
      e._zod.onattach.push((n) => {
        const o = n._zod.bag;
        (o.patterns ?? (o.patterns = new Set()), o.patterns.add(r));
      }),
      (e._zod.check = (n) => {
        n.value.startsWith(t.prefix) ||
          n.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "starts_with",
            prefix: t.prefix,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Yo = d("$ZodCheckEndsWith", (e, t) => {
    re.init(e, t);
    const r = new RegExp(`.*${Oe(t.suffix)}$`);
    (t.pattern ?? (t.pattern = r),
      e._zod.onattach.push((n) => {
        const o = n._zod.bag;
        (o.patterns ?? (o.patterns = new Set()), o.patterns.add(r));
      }),
      (e._zod.check = (n) => {
        n.value.endsWith(t.suffix) ||
          n.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "ends_with",
            suffix: t.suffix,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Xo = d("$ZodCheckOverwrite", (e, t) => {
    (re.init(e, t),
      (e._zod.check = (r) => {
        r.value = t.tx(r.value);
      }));
  });
class Qo {
  constructor(t = []) {
    ((this.content = []), (this.indent = 0), this && (this.args = t));
  }
  indented(t) {
    ((this.indent += 1), t(this), (this.indent -= 1));
  }
  write(t) {
    if (typeof t == "function") {
      (t(this, { execution: "sync" }), t(this, { execution: "async" }));
      return;
    }
    const n = t
        .split(
          `
`,
        )
        .filter((i) => i),
      o = Math.min(...n.map((i) => i.length - i.trimStart().length)),
      s = n.map((i) => i.slice(o)).map((i) => " ".repeat(this.indent * 2) + i);
    for (const i of s) this.content.push(i);
  }
  compile() {
    const t = Function,
      r = this?.args,
      o = [...(this?.content ?? [""]).map((s) => `  ${s}`)];
    return new t(
      ...r,
      o.join(`
`),
    );
  }
}
const es = { major: 4, minor: 3, patch: 6 },
  U = d("$ZodType", (e, t) => {
    var r;
    (e ?? (e = {}),
      (e._zod.def = t),
      (e._zod.bag = e._zod.bag || {}),
      (e._zod.version = es));
    const n = [...(e._zod.def.checks ?? [])];
    e._zod.traits.has("$ZodCheck") && n.unshift(e);
    for (const o of n) for (const s of o._zod.onattach) s(e);
    if (n.length === 0)
      ((r = e._zod).deferred ?? (r.deferred = []),
        e._zod.deferred?.push(() => {
          e._zod.run = e._zod.parse;
        }));
    else {
      const o = (i, u, l) => {
          let h = Se(i),
            b;
          for (const g of u) {
            if (g._zod.def.when) {
              if (!g._zod.def.when(i)) continue;
            } else if (h) continue;
            const y = i.issues.length,
              m = g._zod.check(i);
            if (m instanceof Promise && l?.async === !1) throw new Ze();
            if (b || m instanceof Promise)
              b = (b ?? Promise.resolve()).then(async () => {
                (await m, i.issues.length !== y && (h || (h = Se(i, y))));
              });
            else {
              if (i.issues.length === y) continue;
              h || (h = Se(i, y));
            }
          }
          return b ? b.then(() => i) : i;
        },
        s = (i, u, l) => {
          if (Se(i)) return ((i.aborted = !0), i);
          const h = o(u, n, l);
          if (h instanceof Promise) {
            if (l.async === !1) throw new Ze();
            return h.then((b) => e._zod.parse(b, l));
          }
          return e._zod.parse(h, l);
        };
      e._zod.run = (i, u) => {
        if (u.skipChecks) return e._zod.parse(i, u);
        if (u.direction === "backward") {
          const h = e._zod.parse(
            { value: i.value, issues: [] },
            { ...u, skipChecks: !0 },
          );
          return h instanceof Promise ? h.then((b) => s(b, i, u)) : s(h, i, u);
        }
        const l = e._zod.parse(i, u);
        if (l instanceof Promise) {
          if (u.async === !1) throw new Ze();
          return l.then((h) => o(h, n, u));
        }
        return o(l, n, u);
      };
    }
    P(e, "~standard", () => ({
      validate: (o) => {
        try {
          const s = oo(e, o);
          return s.success ? { value: s.data } : { issues: s.error?.issues };
        } catch {
          return so(e, o).then((i) =>
            i.success ? { value: i.data } : { issues: i.error?.issues },
          );
        }
      },
      vendor: "zod",
      version: 1,
    }));
  }),
  Et = d("$ZodString", (e, t) => {
    (U.init(e, t),
      (e._zod.pattern =
        [...(e?._zod.bag?.patterns ?? [])].pop() ?? Po(e._zod.bag)),
      (e._zod.parse = (r, n) => {
        if (t.coerce)
          try {
            r.value = String(r.value);
          } catch {}
        return (
          typeof r.value == "string" ||
            r.issues.push({
              expected: "string",
              code: "invalid_type",
              input: r.value,
              inst: e,
            }),
          r
        );
      }));
  }),
  x = d("$ZodStringFormat", (e, t) => {
    (rt.init(e, t), Et.init(e, t));
  }),
  ts = d("$ZodGUID", (e, t) => {
    (t.pattern ?? (t.pattern = ko), x.init(e, t));
  }),
  rs = d("$ZodUUID", (e, t) => {
    if (t.version) {
      const n = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[
        t.version
      ];
      if (n === void 0) throw new Error(`Invalid UUID version: "${t.version}"`);
      t.pattern ?? (t.pattern = rr(n));
    } else t.pattern ?? (t.pattern = rr());
    x.init(e, t);
  }),
  ns = d("$ZodEmail", (e, t) => {
    (t.pattern ?? (t.pattern = zo), x.init(e, t));
  }),
  os = d("$ZodURL", (e, t) => {
    (x.init(e, t),
      (e._zod.check = (r) => {
        try {
          const n = r.value.trim(),
            o = new URL(n);
          (t.hostname &&
            ((t.hostname.lastIndex = 0),
            t.hostname.test(o.hostname) ||
              r.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid hostname",
                pattern: t.hostname.source,
                input: r.value,
                inst: e,
                continue: !t.abort,
              })),
            t.protocol &&
              ((t.protocol.lastIndex = 0),
              t.protocol.test(
                o.protocol.endsWith(":") ? o.protocol.slice(0, -1) : o.protocol,
              ) ||
                r.issues.push({
                  code: "invalid_format",
                  format: "url",
                  note: "Invalid protocol",
                  pattern: t.protocol.source,
                  input: r.value,
                  inst: e,
                  continue: !t.abort,
                })),
            t.normalize ? (r.value = o.href) : (r.value = n));
          return;
        } catch {
          r.issues.push({
            code: "invalid_format",
            format: "url",
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  }),
  ss = d("$ZodEmoji", (e, t) => {
    (t.pattern ?? (t.pattern = So()), x.init(e, t));
  }),
  is = d("$ZodNanoID", (e, t) => {
    (t.pattern ?? (t.pattern = bo), x.init(e, t));
  }),
  us = d("$ZodCUID", (e, t) => {
    (t.pattern ?? (t.pattern = mo), x.init(e, t));
  }),
  as = d("$ZodCUID2", (e, t) => {
    (t.pattern ?? (t.pattern = _o), x.init(e, t));
  }),
  cs = d("$ZodULID", (e, t) => {
    (t.pattern ?? (t.pattern = go), x.init(e, t));
  }),
  ls = d("$ZodXID", (e, t) => {
    (t.pattern ?? (t.pattern = vo), x.init(e, t));
  }),
  fs = d("$ZodKSUID", (e, t) => {
    (t.pattern ?? (t.pattern = yo), x.init(e, t));
  }),
  ds = d("$ZodISODateTime", (e, t) => {
    (t.pattern ?? (t.pattern = No(t)), x.init(e, t));
  }),
  hs = d("$ZodISODate", (e, t) => {
    (t.pattern ?? (t.pattern = Fo), x.init(e, t));
  }),
  ps = d("$ZodISOTime", (e, t) => {
    (t.pattern ?? (t.pattern = To(t)), x.init(e, t));
  }),
  ms = d("$ZodISODuration", (e, t) => {
    (t.pattern ?? (t.pattern = wo), x.init(e, t));
  }),
  _s = d("$ZodIPv4", (e, t) => {
    (t.pattern ?? (t.pattern = Zo), x.init(e, t), (e._zod.bag.format = "ipv4"));
  }),
  gs = d("$ZodIPv6", (e, t) => {
    (t.pattern ?? (t.pattern = Oo),
      x.init(e, t),
      (e._zod.bag.format = "ipv6"),
      (e._zod.check = (r) => {
        try {
          new URL(`http://[${r.value}]`);
        } catch {
          r.issues.push({
            code: "invalid_format",
            format: "ipv6",
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  }),
  vs = d("$ZodCIDRv4", (e, t) => {
    (t.pattern ?? (t.pattern = Eo), x.init(e, t));
  }),
  ys = d("$ZodCIDRv6", (e, t) => {
    (t.pattern ?? (t.pattern = Ao),
      x.init(e, t),
      (e._zod.check = (r) => {
        const n = r.value.split("/");
        try {
          if (n.length !== 2) throw new Error();
          const [o, s] = n;
          if (!s) throw new Error();
          const i = Number(s);
          if (`${i}` !== s) throw new Error();
          if (i < 0 || i > 128) throw new Error();
          new URL(`http://[${o}]`);
        } catch {
          r.issues.push({
            code: "invalid_format",
            format: "cidrv6",
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  });
function Kr(e) {
  if (e === "") return !0;
  if (e.length % 4 !== 0) return !1;
  try {
    return (atob(e), !0);
  } catch {
    return !1;
  }
}
const bs = d("$ZodBase64", (e, t) => {
  (t.pattern ?? (t.pattern = Io),
    x.init(e, t),
    (e._zod.bag.contentEncoding = "base64"),
    (e._zod.check = (r) => {
      Kr(r.value) ||
        r.issues.push({
          code: "invalid_format",
          format: "base64",
          input: r.value,
          inst: e,
          continue: !t.abort,
        });
    }));
});
function ws(e) {
  if (!Ur.test(e)) return !1;
  const t = e.replace(/[-_]/g, (n) => (n === "-" ? "+" : "/")),
    r = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return Kr(r);
}
const ks = d("$ZodBase64URL", (e, t) => {
    (t.pattern ?? (t.pattern = Ur),
      x.init(e, t),
      (e._zod.bag.contentEncoding = "base64url"),
      (e._zod.check = (r) => {
        ws(r.value) ||
          r.issues.push({
            code: "invalid_format",
            format: "base64url",
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  zs = d("$ZodE164", (e, t) => {
    (t.pattern ?? (t.pattern = Vo), x.init(e, t));
  });
function $s(e, t = null) {
  try {
    const r = e.split(".");
    if (r.length !== 3) return !1;
    const [n] = r;
    if (!n) return !1;
    const o = JSON.parse(atob(n));
    return !(
      ("typ" in o && o?.typ !== "JWT") ||
      !o.alg ||
      (t && (!("alg" in o) || o.alg !== t))
    );
  } catch {
    return !1;
  }
}
const Ss = d("$ZodJWT", (e, t) => {
    (x.init(e, t),
      (e._zod.check = (r) => {
        $s(r.value, t.alg) ||
          r.issues.push({
            code: "invalid_format",
            format: "jwt",
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  qr = d("$ZodNumber", (e, t) => {
    (U.init(e, t),
      (e._zod.pattern = e._zod.bag.pattern ?? Co),
      (e._zod.parse = (r, n) => {
        if (t.coerce)
          try {
            r.value = Number(r.value);
          } catch {}
        const o = r.value;
        if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o))
          return r;
        const s =
          typeof o == "number"
            ? Number.isNaN(o)
              ? "NaN"
              : Number.isFinite(o)
                ? void 0
                : "Infinity"
            : void 0;
        return (
          r.issues.push({
            expected: "number",
            code: "invalid_type",
            input: o,
            inst: e,
            ...(s ? { received: s } : {}),
          }),
          r
        );
      }));
  }),
  Zs = d("$ZodNumberFormat", (e, t) => {
    (Lo.init(e, t), qr.init(e, t));
  }),
  Os = d("$ZodBoolean", (e, t) => {
    (U.init(e, t),
      (e._zod.pattern = xo),
      (e._zod.parse = (r, n) => {
        if (t.coerce)
          try {
            r.value = !!r.value;
          } catch {}
        const o = r.value;
        return (
          typeof o == "boolean" ||
            r.issues.push({
              expected: "boolean",
              code: "invalid_type",
              input: o,
              inst: e,
            }),
          r
        );
      }));
  }),
  Es = d("$ZodUnknown", (e, t) => {
    (U.init(e, t), (e._zod.parse = (r) => r));
  }),
  As = d("$ZodNever", (e, t) => {
    (U.init(e, t),
      (e._zod.parse = (r, n) => (
        r.issues.push({
          expected: "never",
          code: "invalid_type",
          input: r.value,
          inst: e,
        }),
        r
      )));
  });
function nr(e, t, r) {
  (e.issues.length && t.issues.push(...xr(r, e.issues)),
    (t.value[r] = e.value));
}
const Is = d("$ZodArray", (e, t) => {
  (U.init(e, t),
    (e._zod.parse = (r, n) => {
      const o = r.value;
      if (!Array.isArray(o))
        return (
          r.issues.push({
            expected: "array",
            code: "invalid_type",
            input: o,
            inst: e,
          }),
          r
        );
      r.value = Array(o.length);
      const s = [];
      for (let i = 0; i < o.length; i++) {
        const u = o[i],
          l = t.element._zod.run({ value: u, issues: [] }, n);
        l instanceof Promise ? s.push(l.then((h) => nr(h, r, i))) : nr(l, r, i);
      }
      return s.length ? Promise.all(s).then(() => r) : r;
    }));
});
function Ke(e, t, r, n, o) {
  if (e.issues.length) {
    if (o && !(r in n)) return;
    t.issues.push(...xr(r, e.issues));
  }
  e.value === void 0 ? r in n && (t.value[r] = void 0) : (t.value[r] = e.value);
}
function Gr(e) {
  const t = Object.keys(e.shape);
  for (const n of t)
    if (!e.shape?.[n]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${n}": expected a Zod schema`);
  const r = Kn(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(r),
  };
}
function Hr(e, t, r, n, o, s) {
  const i = [],
    u = o.keySet,
    l = o.catchall._zod,
    h = l.def.type,
    b = l.optout === "optional";
  for (const g in t) {
    if (u.has(g)) continue;
    if (h === "never") {
      i.push(g);
      continue;
    }
    const y = l.run({ value: t[g], issues: [] }, n);
    y instanceof Promise
      ? e.push(y.then((m) => Ke(m, r, g, t, b)))
      : Ke(y, r, g, t, b);
  }
  return (
    i.length &&
      r.issues.push({ code: "unrecognized_keys", keys: i, input: t, inst: s }),
    e.length ? Promise.all(e).then(() => r) : r
  );
}
const Vs = d("$ZodObject", (e, t) => {
    if ((U.init(e, t), !Object.getOwnPropertyDescriptor(t, "shape")?.get)) {
      const u = t.shape;
      Object.defineProperty(t, "shape", {
        get: () => {
          const l = { ...u };
          return (Object.defineProperty(t, "shape", { value: l }), l);
        },
      });
    }
    const n = $t(() => Gr(t));
    P(e._zod, "propValues", () => {
      const u = t.shape,
        l = {};
      for (const h in u) {
        const b = u[h]._zod;
        if (b.values) {
          l[h] ?? (l[h] = new Set());
          for (const g of b.values) l[h].add(g);
        }
      }
      return l;
    });
    const o = We,
      s = t.catchall;
    let i;
    e._zod.parse = (u, l) => {
      i ?? (i = n.value);
      const h = u.value;
      if (!o(h))
        return (
          u.issues.push({
            expected: "object",
            code: "invalid_type",
            input: h,
            inst: e,
          }),
          u
        );
      u.value = {};
      const b = [],
        g = i.shape;
      for (const y of i.keys) {
        const m = g[y],
          I = m._zod.optout === "optional",
          E = m._zod.run({ value: h[y], issues: [] }, l);
        E instanceof Promise
          ? b.push(E.then((j) => Ke(j, u, y, h, I)))
          : Ke(E, u, y, h, I);
      }
      return s
        ? Hr(b, h, u, l, n.value, e)
        : b.length
          ? Promise.all(b).then(() => u)
          : u;
    };
  }),
  Fs = d("$ZodObjectJIT", (e, t) => {
    Vs.init(e, t);
    const r = e._zod.parse,
      n = $t(() => Gr(t)),
      o = (y) => {
        const m = new Qo(["shape", "payload", "ctx"]),
          I = n.value,
          E = (D) => {
            const $ = tr(D);
            return `shape[${$}]._zod.run({ value: input[${$}], issues: [] }, ctx)`;
          };
        m.write("const input = payload.value;");
        const j = Object.create(null);
        let M = 0;
        for (const D of I.keys) j[D] = `key_${M++}`;
        m.write("const newResult = {};");
        for (const D of I.keys) {
          const $ = j[D],
            S = tr(D),
            ae = y[D]?._zod?.optout === "optional";
          (m.write(`const ${$} = ${E(D)};`),
            ae
              ? m.write(`
        if (${$}.issues.length) {
          if (${S} in input) {
            payload.issues = payload.issues.concat(${$}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${S}, ...iss.path] : [${S}]
            })));
          }
        }
        
        if (${$}.value === undefined) {
          if (${S} in input) {
            newResult[${S}] = undefined;
          }
        } else {
          newResult[${S}] = ${$}.value;
        }
        
      `)
              : m.write(`
        if (${$}.issues.length) {
          payload.issues = payload.issues.concat(${$}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${S}, ...iss.path] : [${S}]
          })));
        }
        
        if (${$}.value === undefined) {
          if (${S} in input) {
            newResult[${S}] = undefined;
          }
        } else {
          newResult[${S}] = ${$}.value;
        }
        
      `));
        }
        (m.write("payload.value = newResult;"), m.write("return payload;"));
        const O = m.compile();
        return (D, $) => O(y, D, $);
      };
    let s;
    const i = We,
      u = !Nr.jitless,
      h = u && Bn.value,
      b = t.catchall;
    let g;
    e._zod.parse = (y, m) => {
      g ?? (g = n.value);
      const I = y.value;
      return i(I)
        ? u && h && m?.async === !1 && m.jitless !== !0
          ? (s || (s = o(t.shape)),
            (y = s(y, m)),
            b ? Hr([], I, y, m, g, e) : y)
          : r(y, m)
        : (y.issues.push({
            expected: "object",
            code: "invalid_type",
            input: I,
            inst: e,
          }),
          y);
    };
  });
function or(e, t, r, n) {
  for (const s of e) if (s.issues.length === 0) return ((t.value = s.value), t);
  const o = e.filter((s) => !Se(s));
  return o.length === 1
    ? ((t.value = o[0].value), o[0])
    : (t.issues.push({
        code: "invalid_union",
        input: t.value,
        inst: r,
        errors: e.map((s) => s.issues.map((i) => we(i, n, be()))),
      }),
      t);
}
const Ts = d("$ZodUnion", (e, t) => {
    (U.init(e, t),
      P(e._zod, "optin", () =>
        t.options.some((o) => o._zod.optin === "optional")
          ? "optional"
          : void 0,
      ),
      P(e._zod, "optout", () =>
        t.options.some((o) => o._zod.optout === "optional")
          ? "optional"
          : void 0,
      ),
      P(e._zod, "values", () => {
        if (t.options.every((o) => o._zod.values))
          return new Set(t.options.flatMap((o) => Array.from(o._zod.values)));
      }),
      P(e._zod, "pattern", () => {
        if (t.options.every((o) => o._zod.pattern)) {
          const o = t.options.map((s) => s._zod.pattern);
          return new RegExp(`^(${o.map((s) => Zt(s.source)).join("|")})$`);
        }
      }));
    const r = t.options.length === 1,
      n = t.options[0]._zod.run;
    e._zod.parse = (o, s) => {
      if (r) return n(o, s);
      let i = !1;
      const u = [];
      for (const l of t.options) {
        const h = l._zod.run({ value: o.value, issues: [] }, s);
        if (h instanceof Promise) (u.push(h), (i = !0));
        else {
          if (h.issues.length === 0) return h;
          u.push(h);
        }
      }
      return i ? Promise.all(u).then((l) => or(l, o, e, s)) : or(u, o, e, s);
    };
  }),
  Ns = d("$ZodIntersection", (e, t) => {
    (U.init(e, t),
      (e._zod.parse = (r, n) => {
        const o = r.value,
          s = t.left._zod.run({ value: o, issues: [] }, n),
          i = t.right._zod.run({ value: o, issues: [] }, n);
        return s instanceof Promise || i instanceof Promise
          ? Promise.all([s, i]).then(([l, h]) => sr(r, l, h))
          : sr(r, s, i);
      }));
  });
function mt(e, t) {
  if (e === t) return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (De(e) && De(t)) {
    const r = Object.keys(t),
      n = Object.keys(e).filter((s) => r.indexOf(s) !== -1),
      o = { ...e, ...t };
    for (const s of n) {
      const i = mt(e[s], t[s]);
      if (!i.valid)
        return { valid: !1, mergeErrorPath: [s, ...i.mergeErrorPath] };
      o[s] = i.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length) return { valid: !1, mergeErrorPath: [] };
    const r = [];
    for (let n = 0; n < e.length; n++) {
      const o = e[n],
        s = t[n],
        i = mt(o, s);
      if (!i.valid)
        return { valid: !1, mergeErrorPath: [n, ...i.mergeErrorPath] };
      r.push(i.data);
    }
    return { valid: !0, data: r };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function sr(e, t, r) {
  const n = new Map();
  let o;
  for (const u of t.issues)
    if (u.code === "unrecognized_keys") {
      o ?? (o = u);
      for (const l of u.keys) (n.has(l) || n.set(l, {}), (n.get(l).l = !0));
    } else e.issues.push(u);
  for (const u of r.issues)
    if (u.code === "unrecognized_keys")
      for (const l of u.keys) (n.has(l) || n.set(l, {}), (n.get(l).r = !0));
    else e.issues.push(u);
  const s = [...n].filter(([, u]) => u.l && u.r).map(([u]) => u);
  if ((s.length && o && e.issues.push({ ...o, keys: s }), Se(e))) return e;
  const i = mt(t.value, r.value);
  if (!i.valid)
    throw new Error(
      `Unmergable intersection. Error path: ${JSON.stringify(i.mergeErrorPath)}`,
    );
  return ((e.value = i.data), e);
}
const Ps = d("$ZodEnum", (e, t) => {
    U.init(e, t);
    const r = Pr(t.entries),
      n = new Set(r);
    ((e._zod.values = n),
      (e._zod.pattern = new RegExp(
        `^(${r
          .filter((o) => Wn.has(typeof o))
          .map((o) => (typeof o == "string" ? Oe(o) : o.toString()))
          .join("|")})$`,
      )),
      (e._zod.parse = (o, s) => {
        const i = o.value;
        return (
          n.has(i) ||
            o.issues.push({
              code: "invalid_value",
              values: r,
              input: i,
              inst: e,
            }),
          o
        );
      }));
  }),
  Ds = d("$ZodLiteral", (e, t) => {
    if ((U.init(e, t), t.values.length === 0))
      throw new Error("Cannot create literal schema with no valid values");
    const r = new Set(t.values);
    ((e._zod.values = r),
      (e._zod.pattern = new RegExp(
        `^(${t.values.map((n) => (typeof n == "string" ? Oe(n) : n ? Oe(n.toString()) : String(n))).join("|")})$`,
      )),
      (e._zod.parse = (n, o) => {
        const s = n.value;
        return (
          r.has(s) ||
            n.issues.push({
              code: "invalid_value",
              values: t.values,
              input: s,
              inst: e,
            }),
          n
        );
      }));
  }),
  Cs = d("$ZodTransform", (e, t) => {
    (U.init(e, t),
      (e._zod.parse = (r, n) => {
        if (n.direction === "backward") throw new Tr(e.constructor.name);
        const o = t.transform(r.value, r);
        if (n.async)
          return (o instanceof Promise ? o : Promise.resolve(o)).then(
            (i) => ((r.value = i), r),
          );
        if (o instanceof Promise) throw new Ze();
        return ((r.value = o), r);
      }));
  });
function ir(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
const Yr = d("$ZodOptional", (e, t) => {
    (U.init(e, t),
      (e._zod.optin = "optional"),
      (e._zod.optout = "optional"),
      P(e._zod, "values", () =>
        t.innerType._zod.values
          ? new Set([...t.innerType._zod.values, void 0])
          : void 0,
      ),
      P(e._zod, "pattern", () => {
        const r = t.innerType._zod.pattern;
        return r ? new RegExp(`^(${Zt(r.source)})?$`) : void 0;
      }),
      (e._zod.parse = (r, n) => {
        if (t.innerType._zod.optin === "optional") {
          const o = t.innerType._zod.run(r, n);
          return o instanceof Promise
            ? o.then((s) => ir(s, r.value))
            : ir(o, r.value);
        }
        return r.value === void 0 ? r : t.innerType._zod.run(r, n);
      }));
  }),
  xs = d("$ZodExactOptional", (e, t) => {
    (Yr.init(e, t),
      P(e._zod, "values", () => t.innerType._zod.values),
      P(e._zod, "pattern", () => t.innerType._zod.pattern),
      (e._zod.parse = (r, n) => t.innerType._zod.run(r, n)));
  }),
  Rs = d("$ZodNullable", (e, t) => {
    (U.init(e, t),
      P(e._zod, "optin", () => t.innerType._zod.optin),
      P(e._zod, "optout", () => t.innerType._zod.optout),
      P(e._zod, "pattern", () => {
        const r = t.innerType._zod.pattern;
        return r ? new RegExp(`^(${Zt(r.source)}|null)$`) : void 0;
      }),
      P(e._zod, "values", () =>
        t.innerType._zod.values
          ? new Set([...t.innerType._zod.values, null])
          : void 0,
      ),
      (e._zod.parse = (r, n) =>
        r.value === null ? r : t.innerType._zod.run(r, n)));
  }),
  js = d("$ZodDefault", (e, t) => {
    (U.init(e, t),
      (e._zod.optin = "optional"),
      P(e._zod, "values", () => t.innerType._zod.values),
      (e._zod.parse = (r, n) => {
        if (n.direction === "backward") return t.innerType._zod.run(r, n);
        if (r.value === void 0) return ((r.value = t.defaultValue), r);
        const o = t.innerType._zod.run(r, n);
        return o instanceof Promise ? o.then((s) => ur(s, t)) : ur(o, t);
      }));
  });
function ur(e, t) {
  return (e.value === void 0 && (e.value = t.defaultValue), e);
}
const Us = d("$ZodPrefault", (e, t) => {
    (U.init(e, t),
      (e._zod.optin = "optional"),
      P(e._zod, "values", () => t.innerType._zod.values),
      (e._zod.parse = (r, n) => (
        n.direction === "backward" ||
          (r.value === void 0 && (r.value = t.defaultValue)),
        t.innerType._zod.run(r, n)
      )));
  }),
  Ls = d("$ZodNonOptional", (e, t) => {
    (U.init(e, t),
      P(e._zod, "values", () => {
        const r = t.innerType._zod.values;
        return r ? new Set([...r].filter((n) => n !== void 0)) : void 0;
      }),
      (e._zod.parse = (r, n) => {
        const o = t.innerType._zod.run(r, n);
        return o instanceof Promise ? o.then((s) => ar(s, e)) : ar(o, e);
      }));
  });
function ar(e, t) {
  return (
    !e.issues.length &&
      e.value === void 0 &&
      e.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: e.value,
        inst: t,
      }),
    e
  );
}
const Ms = d("$ZodCatch", (e, t) => {
    (U.init(e, t),
      P(e._zod, "optin", () => t.innerType._zod.optin),
      P(e._zod, "optout", () => t.innerType._zod.optout),
      P(e._zod, "values", () => t.innerType._zod.values),
      (e._zod.parse = (r, n) => {
        if (n.direction === "backward") return t.innerType._zod.run(r, n);
        const o = t.innerType._zod.run(r, n);
        return o instanceof Promise
          ? o.then(
              (s) => (
                (r.value = s.value),
                s.issues.length &&
                  ((r.value = t.catchValue({
                    ...r,
                    error: { issues: s.issues.map((i) => we(i, n, be())) },
                    input: r.value,
                  })),
                  (r.issues = [])),
                r
              ),
            )
          : ((r.value = o.value),
            o.issues.length &&
              ((r.value = t.catchValue({
                ...r,
                error: { issues: o.issues.map((s) => we(s, n, be())) },
                input: r.value,
              })),
              (r.issues = [])),
            r);
      }));
  }),
  Js = d("$ZodPipe", (e, t) => {
    (U.init(e, t),
      P(e._zod, "values", () => t.in._zod.values),
      P(e._zod, "optin", () => t.in._zod.optin),
      P(e._zod, "optout", () => t.out._zod.optout),
      P(e._zod, "propValues", () => t.in._zod.propValues),
      (e._zod.parse = (r, n) => {
        if (n.direction === "backward") {
          const s = t.out._zod.run(r, n);
          return s instanceof Promise
            ? s.then((i) => Ue(i, t.in, n))
            : Ue(s, t.in, n);
        }
        const o = t.in._zod.run(r, n);
        return o instanceof Promise
          ? o.then((s) => Ue(s, t.out, n))
          : Ue(o, t.out, n);
      }));
  });
function Ue(e, t, r) {
  return e.issues.length
    ? ((e.aborted = !0), e)
    : t._zod.run({ value: e.value, issues: e.issues }, r);
}
const Bs = d("$ZodReadonly", (e, t) => {
  (U.init(e, t),
    P(e._zod, "propValues", () => t.innerType._zod.propValues),
    P(e._zod, "values", () => t.innerType._zod.values),
    P(e._zod, "optin", () => t.innerType?._zod?.optin),
    P(e._zod, "optout", () => t.innerType?._zod?.optout),
    (e._zod.parse = (r, n) => {
      if (n.direction === "backward") return t.innerType._zod.run(r, n);
      const o = t.innerType._zod.run(r, n);
      return o instanceof Promise ? o.then(cr) : cr(o);
    }));
});
function cr(e) {
  return ((e.value = Object.freeze(e.value)), e);
}
const Ws = d("$ZodCustom", (e, t) => {
  (re.init(e, t),
    U.init(e, t),
    (e._zod.parse = (r, n) => r),
    (e._zod.check = (r) => {
      const n = r.value,
        o = t.fn(n);
      if (o instanceof Promise) return o.then((s) => lr(s, r, n, e));
      lr(o, r, n, e);
    }));
});
function lr(e, t, r, n) {
  if (!e) {
    const o = {
      code: "custom",
      input: r,
      inst: n,
      path: [...(n._zod.def.path ?? [])],
      continue: !n._zod.def.abort,
    };
    (n._zod.def.params && (o.params = n._zod.def.params), t.issues.push(Ce(o)));
  }
}
var fr;
class Ks {
  constructor() {
    ((this._map = new WeakMap()), (this._idmap = new Map()));
  }
  add(t, ...r) {
    const n = r[0];
    return (
      this._map.set(t, n),
      n && typeof n == "object" && "id" in n && this._idmap.set(n.id, t),
      this
    );
  }
  clear() {
    return ((this._map = new WeakMap()), (this._idmap = new Map()), this);
  }
  remove(t) {
    const r = this._map.get(t);
    return (
      r && typeof r == "object" && "id" in r && this._idmap.delete(r.id),
      this._map.delete(t),
      this
    );
  }
  get(t) {
    const r = t._zod.parent;
    if (r) {
      const n = { ...(this.get(r) ?? {}) };
      delete n.id;
      const o = { ...n, ...this._map.get(t) };
      return Object.keys(o).length ? o : void 0;
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function qs() {
  return new Ks();
}
(fr = globalThis).__zod_globalRegistry ?? (fr.__zod_globalRegistry = qs());
const Te = globalThis.__zod_globalRegistry;
function Gs(e, t) {
  return new e({ type: "string", ...k(t) });
}
function Xr(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function dr(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function Hs(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function Ys(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...k(t),
  });
}
function Xs(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...k(t),
  });
}
function Qs(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...k(t),
  });
}
function ei(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function ti(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function ri(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function ni(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function oi(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function si(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function ii(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function ui(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function ai(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function ci(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function li(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function fi(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function di(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function hi(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function pi(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function mi(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...k(t),
  });
}
function _i(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...k(t),
  });
}
function gi(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...k(t),
  });
}
function vi(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...k(t),
  });
}
function yi(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...k(t),
  });
}
function bi(e, t) {
  return new e({ type: "number", checks: [], ...k(t) });
}
function wi(e, t) {
  return new e({ type: "number", coerce: !0, checks: [], ...k(t) });
}
function ki(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...k(t),
  });
}
function zi(e, t) {
  return new e({ type: "boolean", ...k(t) });
}
function $i(e) {
  return new e({ type: "unknown" });
}
function Si(e, t) {
  return new e({ type: "never", ...k(t) });
}
function hr(e, t) {
  return new Br({ check: "less_than", ...k(t), value: e, inclusive: !1 });
}
function ct(e, t) {
  return new Br({ check: "less_than", ...k(t), value: e, inclusive: !0 });
}
function pr(e, t) {
  return new Wr({ check: "greater_than", ...k(t), value: e, inclusive: !1 });
}
function lt(e, t) {
  return new Wr({ check: "greater_than", ...k(t), value: e, inclusive: !0 });
}
function mr(e, t) {
  return new Uo({ check: "multiple_of", ...k(t), value: e });
}
function Qr(e, t) {
  return new Mo({ check: "max_length", ...k(t), maximum: e });
}
function qe(e, t) {
  return new Jo({ check: "min_length", ...k(t), minimum: e });
}
function en(e, t) {
  return new Bo({ check: "length_equals", ...k(t), length: e });
}
function Zi(e, t) {
  return new Wo({
    check: "string_format",
    format: "regex",
    ...k(t),
    pattern: e,
  });
}
function Oi(e) {
  return new Ko({ check: "string_format", format: "lowercase", ...k(e) });
}
function Ei(e) {
  return new qo({ check: "string_format", format: "uppercase", ...k(e) });
}
function Ai(e, t) {
  return new Go({
    check: "string_format",
    format: "includes",
    ...k(t),
    includes: e,
  });
}
function Ii(e, t) {
  return new Ho({
    check: "string_format",
    format: "starts_with",
    ...k(t),
    prefix: e,
  });
}
function Vi(e, t) {
  return new Yo({
    check: "string_format",
    format: "ends_with",
    ...k(t),
    suffix: e,
  });
}
function Ee(e) {
  return new Xo({ check: "overwrite", tx: e });
}
function Fi(e) {
  return Ee((t) => t.normalize(e));
}
function Ti() {
  return Ee((e) => e.trim());
}
function Ni() {
  return Ee((e) => e.toLowerCase());
}
function Pi() {
  return Ee((e) => e.toUpperCase());
}
function Di() {
  return Ee((e) => Jn(e));
}
function Ci(e, t, r) {
  return new e({ type: "array", element: t, ...k(r) });
}
function xi(e, t, r) {
  return new e({ type: "custom", check: "custom", fn: t, ...k(r) });
}
function Ri(e) {
  const t = ji(
    (r) => (
      (r.addIssue = (n) => {
        if (typeof n == "string") r.issues.push(Ce(n, r.value, t._zod.def));
        else {
          const o = n;
          (o.fatal && (o.continue = !1),
            o.code ?? (o.code = "custom"),
            o.input ?? (o.input = r.value),
            o.inst ?? (o.inst = t),
            o.continue ?? (o.continue = !t._zod.def.abort),
            r.issues.push(Ce(o)));
        }
      }),
      e(r.value, r)
    ),
  );
  return t;
}
function ji(e, t) {
  const r = new re({ check: "custom", ...k(t) });
  return ((r._zod.check = e), r);
}
function tn(e) {
  let t = e?.target ?? "draft-2020-12";
  return (
    t === "draft-4" && (t = "draft-04"),
    t === "draft-7" && (t = "draft-07"),
    {
      processors: e.processors ?? {},
      metadataRegistry: e?.metadata ?? Te,
      target: t,
      unrepresentable: e?.unrepresentable ?? "throw",
      override: e?.override ?? (() => {}),
      io: e?.io ?? "output",
      counter: 0,
      seen: new Map(),
      cycles: e?.cycles ?? "ref",
      reused: e?.reused ?? "inline",
      external: e?.external ?? void 0,
    }
  );
}
function q(e, t, r = { path: [], schemaPath: [] }) {
  var n;
  const o = e._zod.def,
    s = t.seen.get(e);
  if (s)
    return (
      s.count++,
      r.schemaPath.includes(e) && (s.cycle = r.path),
      s.schema
    );
  const i = { schema: {}, count: 1, cycle: void 0, path: r.path };
  t.seen.set(e, i);
  const u = e._zod.toJSONSchema?.();
  if (u) i.schema = u;
  else {
    const b = { ...r, schemaPath: [...r.schemaPath, e], path: r.path };
    if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, i.schema, b);
    else {
      const y = i.schema,
        m = t.processors[o.type];
      if (!m)
        throw new Error(
          `[toJSONSchema]: Non-representable type encountered: ${o.type}`,
        );
      m(e, t, y, b);
    }
    const g = e._zod.parent;
    g && (i.ref || (i.ref = g), q(g, t, b), (t.seen.get(g).isParent = !0));
  }
  const l = t.metadataRegistry.get(e);
  return (
    l && Object.assign(i.schema, l),
    t.io === "input" &&
      X(e) &&
      (delete i.schema.examples, delete i.schema.default),
    t.io === "input" &&
      i.schema._prefault &&
      ((n = i.schema).default ?? (n.default = i.schema._prefault)),
    delete i.schema._prefault,
    t.seen.get(e).schema
  );
}
function rn(e, t) {
  const r = e.seen.get(t);
  if (!r) throw new Error("Unprocessed schema. This is a bug in Zod.");
  const n = new Map();
  for (const i of e.seen.entries()) {
    const u = e.metadataRegistry.get(i[0])?.id;
    if (u) {
      const l = n.get(u);
      if (l && l !== i[0])
        throw new Error(
          `Duplicate schema id "${u}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`,
        );
      n.set(u, i[0]);
    }
  }
  const o = (i) => {
      const u = e.target === "draft-2020-12" ? "$defs" : "definitions";
      if (e.external) {
        const g = e.external.registry.get(i[0])?.id,
          y = e.external.uri ?? ((I) => I);
        if (g) return { ref: y(g) };
        const m = i[1].defId ?? i[1].schema.id ?? `schema${e.counter++}`;
        return (
          (i[1].defId = m),
          { defId: m, ref: `${y("__shared")}#/${u}/${m}` }
        );
      }
      if (i[1] === r) return { ref: "#" };
      const h = `#/${u}/`,
        b = i[1].schema.id ?? `__schema${e.counter++}`;
      return { defId: b, ref: h + b };
    },
    s = (i) => {
      if (i[1].schema.$ref) return;
      const u = i[1],
        { ref: l, defId: h } = o(i);
      ((u.def = { ...u.schema }), h && (u.defId = h));
      const b = u.schema;
      for (const g in b) delete b[g];
      b.$ref = l;
    };
  if (e.cycles === "throw")
    for (const i of e.seen.entries()) {
      const u = i[1];
      if (u.cycle)
        throw new Error(`Cycle detected: #/${u.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const i of e.seen.entries()) {
    const u = i[1];
    if (t === i[0]) {
      s(i);
      continue;
    }
    if (e.external) {
      const h = e.external.registry.get(i[0])?.id;
      if (t !== i[0] && h) {
        s(i);
        continue;
      }
    }
    if (e.metadataRegistry.get(i[0])?.id) {
      s(i);
      continue;
    }
    if (u.cycle) {
      s(i);
      continue;
    }
    if (u.count > 1 && e.reused === "ref") {
      s(i);
      continue;
    }
  }
}
function nn(e, t) {
  const r = e.seen.get(t);
  if (!r) throw new Error("Unprocessed schema. This is a bug in Zod.");
  const n = (i) => {
    const u = e.seen.get(i);
    if (u.ref === null) return;
    const l = u.def ?? u.schema,
      h = { ...l },
      b = u.ref;
    if (((u.ref = null), b)) {
      n(b);
      const y = e.seen.get(b),
        m = y.schema;
      if (
        (m.$ref &&
        (e.target === "draft-07" ||
          e.target === "draft-04" ||
          e.target === "openapi-3.0")
          ? ((l.allOf = l.allOf ?? []), l.allOf.push(m))
          : Object.assign(l, m),
        Object.assign(l, h),
        i._zod.parent === b)
      )
        for (const E in l)
          E === "$ref" || E === "allOf" || E in h || delete l[E];
      if (m.$ref && y.def)
        for (const E in l)
          E === "$ref" ||
            E === "allOf" ||
            (E in y.def &&
              JSON.stringify(l[E]) === JSON.stringify(y.def[E]) &&
              delete l[E]);
    }
    const g = i._zod.parent;
    if (g && g !== b) {
      n(g);
      const y = e.seen.get(g);
      if (y?.schema.$ref && ((l.$ref = y.schema.$ref), y.def))
        for (const m in l)
          m === "$ref" ||
            m === "allOf" ||
            (m in y.def &&
              JSON.stringify(l[m]) === JSON.stringify(y.def[m]) &&
              delete l[m]);
    }
    e.override({ zodSchema: i, jsonSchema: l, path: u.path ?? [] });
  };
  for (const i of [...e.seen.entries()].reverse()) n(i[0]);
  const o = {};
  if (
    (e.target === "draft-2020-12"
      ? (o.$schema = "https://json-schema.org/draft/2020-12/schema")
      : e.target === "draft-07"
        ? (o.$schema = "http://json-schema.org/draft-07/schema#")
        : e.target === "draft-04"
          ? (o.$schema = "http://json-schema.org/draft-04/schema#")
          : e.target,
    e.external?.uri)
  ) {
    const i = e.external.registry.get(t)?.id;
    if (!i) throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(i);
  }
  Object.assign(o, r.def ?? r.schema);
  const s = e.external?.defs ?? {};
  for (const i of e.seen.entries()) {
    const u = i[1];
    u.def && u.defId && (s[u.defId] = u.def);
  }
  e.external ||
    (Object.keys(s).length > 0 &&
      (e.target === "draft-2020-12" ? (o.$defs = s) : (o.definitions = s)));
  try {
    const i = JSON.parse(JSON.stringify(o));
    return (
      Object.defineProperty(i, "~standard", {
        value: {
          ...t["~standard"],
          jsonSchema: {
            input: Ge(t, "input", e.processors),
            output: Ge(t, "output", e.processors),
          },
        },
        enumerable: !1,
        writable: !1,
      }),
      i
    );
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function X(e, t) {
  const r = t ?? { seen: new Set() };
  if (r.seen.has(e)) return !1;
  r.seen.add(e);
  const n = e._zod.def;
  if (n.type === "transform") return !0;
  if (n.type === "array") return X(n.element, r);
  if (n.type === "set") return X(n.valueType, r);
  if (n.type === "lazy") return X(n.getter(), r);
  if (
    n.type === "promise" ||
    n.type === "optional" ||
    n.type === "nonoptional" ||
    n.type === "nullable" ||
    n.type === "readonly" ||
    n.type === "default" ||
    n.type === "prefault"
  )
    return X(n.innerType, r);
  if (n.type === "intersection") return X(n.left, r) || X(n.right, r);
  if (n.type === "record" || n.type === "map")
    return X(n.keyType, r) || X(n.valueType, r);
  if (n.type === "pipe") return X(n.in, r) || X(n.out, r);
  if (n.type === "object") {
    for (const o in n.shape) if (X(n.shape[o], r)) return !0;
    return !1;
  }
  if (n.type === "union") {
    for (const o of n.options) if (X(o, r)) return !0;
    return !1;
  }
  if (n.type === "tuple") {
    for (const o of n.items) if (X(o, r)) return !0;
    return !!(n.rest && X(n.rest, r));
  }
  return !1;
}
const Ui =
    (e, t = {}) =>
    (r) => {
      const n = tn({ ...r, processors: t });
      return (q(e, n), rn(n, e), nn(n, e));
    },
  Ge =
    (e, t, r = {}) =>
    (n) => {
      const { libraryOptions: o, target: s } = n ?? {},
        i = tn({ ...(o ?? {}), target: s, io: t, processors: r });
      return (q(e, i), rn(i, e), nn(i, e));
    },
  Li = {
    guid: "uuid",
    url: "uri",
    datetime: "date-time",
    json_string: "json-string",
    regex: "",
  },
  Mi = (e, t, r, n) => {
    const o = r;
    o.type = "string";
    const {
      minimum: s,
      maximum: i,
      format: u,
      patterns: l,
      contentEncoding: h,
    } = e._zod.bag;
    if (
      (typeof s == "number" && (o.minLength = s),
      typeof i == "number" && (o.maxLength = i),
      u &&
        ((o.format = Li[u] ?? u),
        o.format === "" && delete o.format,
        u === "time" && delete o.format),
      h && (o.contentEncoding = h),
      l && l.size > 0)
    ) {
      const b = [...l];
      b.length === 1
        ? (o.pattern = b[0].source)
        : b.length > 1 &&
          (o.allOf = [
            ...b.map((g) => ({
              ...(t.target === "draft-07" ||
              t.target === "draft-04" ||
              t.target === "openapi-3.0"
                ? { type: "string" }
                : {}),
              pattern: g.source,
            })),
          ]);
    }
  },
  Ji = (e, t, r, n) => {
    const o = r,
      {
        minimum: s,
        maximum: i,
        format: u,
        multipleOf: l,
        exclusiveMaximum: h,
        exclusiveMinimum: b,
      } = e._zod.bag;
    (typeof u == "string" && u.includes("int")
      ? (o.type = "integer")
      : (o.type = "number"),
      typeof b == "number" &&
        (t.target === "draft-04" || t.target === "openapi-3.0"
          ? ((o.minimum = b), (o.exclusiveMinimum = !0))
          : (o.exclusiveMinimum = b)),
      typeof s == "number" &&
        ((o.minimum = s),
        typeof b == "number" &&
          t.target !== "draft-04" &&
          (b >= s ? delete o.minimum : delete o.exclusiveMinimum)),
      typeof h == "number" &&
        (t.target === "draft-04" || t.target === "openapi-3.0"
          ? ((o.maximum = h), (o.exclusiveMaximum = !0))
          : (o.exclusiveMaximum = h)),
      typeof i == "number" &&
        ((o.maximum = i),
        typeof h == "number" &&
          t.target !== "draft-04" &&
          (h <= i ? delete o.maximum : delete o.exclusiveMaximum)),
      typeof l == "number" && (o.multipleOf = l));
  },
  Bi = (e, t, r, n) => {
    r.type = "boolean";
  },
  Wi = (e, t, r, n) => {
    r.not = {};
  },
  Ki = (e, t, r, n) => {},
  qi = (e, t, r, n) => {
    const o = e._zod.def,
      s = Pr(o.entries);
    (s.every((i) => typeof i == "number") && (r.type = "number"),
      s.every((i) => typeof i == "string") && (r.type = "string"),
      (r.enum = s));
  },
  Gi = (e, t, r, n) => {
    const o = e._zod.def,
      s = [];
    for (const i of o.values)
      if (i === void 0) {
        if (t.unrepresentable === "throw")
          throw new Error(
            "Literal `undefined` cannot be represented in JSON Schema",
          );
      } else if (typeof i == "bigint") {
        if (t.unrepresentable === "throw")
          throw new Error(
            "BigInt literals cannot be represented in JSON Schema",
          );
        s.push(Number(i));
      } else s.push(i);
    if (s.length !== 0)
      if (s.length === 1) {
        const i = s[0];
        ((r.type = i === null ? "null" : typeof i),
          t.target === "draft-04" || t.target === "openapi-3.0"
            ? (r.enum = [i])
            : (r.const = i));
      } else
        (s.every((i) => typeof i == "number") && (r.type = "number"),
          s.every((i) => typeof i == "string") && (r.type = "string"),
          s.every((i) => typeof i == "boolean") && (r.type = "boolean"),
          s.every((i) => i === null) && (r.type = "null"),
          (r.enum = s));
  },
  Hi = (e, t, r, n) => {
    if (t.unrepresentable === "throw")
      throw new Error("Custom types cannot be represented in JSON Schema");
  },
  Yi = (e, t, r, n) => {
    if (t.unrepresentable === "throw")
      throw new Error("Transforms cannot be represented in JSON Schema");
  },
  Xi = (e, t, r, n) => {
    const o = r,
      s = e._zod.def,
      { minimum: i, maximum: u } = e._zod.bag;
    (typeof i == "number" && (o.minItems = i),
      typeof u == "number" && (o.maxItems = u),
      (o.type = "array"),
      (o.items = q(s.element, t, { ...n, path: [...n.path, "items"] })));
  },
  Qi = (e, t, r, n) => {
    const o = r,
      s = e._zod.def;
    ((o.type = "object"), (o.properties = {}));
    const i = s.shape;
    for (const h in i)
      o.properties[h] = q(i[h], t, {
        ...n,
        path: [...n.path, "properties", h],
      });
    const u = new Set(Object.keys(i)),
      l = new Set(
        [...u].filter((h) => {
          const b = s.shape[h]._zod;
          return t.io === "input" ? b.optin === void 0 : b.optout === void 0;
        }),
      );
    (l.size > 0 && (o.required = Array.from(l)),
      s.catchall?._zod.def.type === "never"
        ? (o.additionalProperties = !1)
        : s.catchall
          ? s.catchall &&
            (o.additionalProperties = q(s.catchall, t, {
              ...n,
              path: [...n.path, "additionalProperties"],
            }))
          : t.io === "output" && (o.additionalProperties = !1));
  },
  eu = (e, t, r, n) => {
    const o = e._zod.def,
      s = o.inclusive === !1,
      i = o.options.map((u, l) =>
        q(u, t, { ...n, path: [...n.path, s ? "oneOf" : "anyOf", l] }),
      );
    s ? (r.oneOf = i) : (r.anyOf = i);
  },
  tu = (e, t, r, n) => {
    const o = e._zod.def,
      s = q(o.left, t, { ...n, path: [...n.path, "allOf", 0] }),
      i = q(o.right, t, { ...n, path: [...n.path, "allOf", 1] }),
      u = (h) => "allOf" in h && Object.keys(h).length === 1,
      l = [...(u(s) ? s.allOf : [s]), ...(u(i) ? i.allOf : [i])];
    r.allOf = l;
  },
  ru = (e, t, r, n) => {
    const o = e._zod.def,
      s = q(o.innerType, t, n),
      i = t.seen.get(e);
    t.target === "openapi-3.0"
      ? ((i.ref = o.innerType), (r.nullable = !0))
      : (r.anyOf = [s, { type: "null" }]);
  },
  nu = (e, t, r, n) => {
    const o = e._zod.def;
    q(o.innerType, t, n);
    const s = t.seen.get(e);
    s.ref = o.innerType;
  },
  ou = (e, t, r, n) => {
    const o = e._zod.def;
    q(o.innerType, t, n);
    const s = t.seen.get(e);
    ((s.ref = o.innerType),
      (r.default = JSON.parse(JSON.stringify(o.defaultValue))));
  },
  su = (e, t, r, n) => {
    const o = e._zod.def;
    q(o.innerType, t, n);
    const s = t.seen.get(e);
    ((s.ref = o.innerType),
      t.io === "input" &&
        (r._prefault = JSON.parse(JSON.stringify(o.defaultValue))));
  },
  iu = (e, t, r, n) => {
    const o = e._zod.def;
    q(o.innerType, t, n);
    const s = t.seen.get(e);
    s.ref = o.innerType;
    let i;
    try {
      i = o.catchValue(void 0);
    } catch {
      throw new Error("Dynamic catch values are not supported in JSON Schema");
    }
    r.default = i;
  },
  uu = (e, t, r, n) => {
    const o = e._zod.def,
      s =
        t.io === "input"
          ? o.in._zod.def.type === "transform"
            ? o.out
            : o.in
          : o.out;
    q(s, t, n);
    const i = t.seen.get(e);
    i.ref = s;
  },
  au = (e, t, r, n) => {
    const o = e._zod.def;
    q(o.innerType, t, n);
    const s = t.seen.get(e);
    ((s.ref = o.innerType), (r.readOnly = !0));
  },
  on = (e, t, r, n) => {
    const o = e._zod.def;
    q(o.innerType, t, n);
    const s = t.seen.get(e);
    s.ref = o.innerType;
  },
  cu = d("ZodISODateTime", (e, t) => {
    (ds.init(e, t), R.init(e, t));
  });
function lu(e) {
  return _i(cu, e);
}
const fu = d("ZodISODate", (e, t) => {
  (hs.init(e, t), R.init(e, t));
});
function du(e) {
  return gi(fu, e);
}
const hu = d("ZodISOTime", (e, t) => {
  (ps.init(e, t), R.init(e, t));
});
function pu(e) {
  return vi(hu, e);
}
const mu = d("ZodISODuration", (e, t) => {
  (ms.init(e, t), R.init(e, t));
});
function _u(e) {
  return yi(mu, e);
}
const gu = (e, t) => {
    (jr.init(e, t),
      (e.name = "ZodError"),
      Object.defineProperties(e, {
        format: { value: (r) => no(e, r) },
        flatten: { value: (r) => ro(e, r) },
        addIssue: {
          value: (r) => {
            (e.issues.push(r), (e.message = JSON.stringify(e.issues, pt, 2)));
          },
        },
        addIssues: {
          value: (r) => {
            (e.issues.push(...r),
              (e.message = JSON.stringify(e.issues, pt, 2)));
          },
        },
        isEmpty: {
          get() {
            return e.issues.length === 0;
          },
        },
      }));
  },
  ue = d("ZodError", gu, { Parent: Error }),
  vu = Xe(ue),
  yu = Qe(ue),
  bu = et(ue),
  wu = tt(ue),
  ku = io(ue),
  zu = uo(ue),
  $u = ao(ue),
  Su = co(ue),
  Zu = lo(ue),
  Ou = fo(ue),
  Eu = ho(ue),
  Au = po(ue),
  L = d(
    "ZodType",
    (e, t) => (
      U.init(e, t),
      Object.assign(e["~standard"], {
        jsonSchema: { input: Ge(e, "input"), output: Ge(e, "output") },
      }),
      (e.toJSONSchema = Ui(e, {})),
      (e.def = t),
      (e.type = t.type),
      Object.defineProperty(e, "_def", { value: t }),
      (e.check = (...r) =>
        e.clone(
          _e(t, {
            checks: [
              ...(t.checks ?? []),
              ...r.map((n) =>
                typeof n == "function"
                  ? {
                      _zod: {
                        check: n,
                        def: { check: "custom" },
                        onattach: [],
                      },
                    }
                  : n,
              ),
            ],
          }),
          { parent: !0 },
        )),
      (e.with = e.check),
      (e.clone = (r, n) => ge(e, r, n)),
      (e.brand = () => e),
      (e.register = (r, n) => (r.add(e, n), e)),
      (e.parse = (r, n) => vu(e, r, n, { callee: e.parse })),
      (e.safeParse = (r, n) => bu(e, r, n)),
      (e.parseAsync = async (r, n) => yu(e, r, n, { callee: e.parseAsync })),
      (e.safeParseAsync = async (r, n) => wu(e, r, n)),
      (e.spa = e.safeParseAsync),
      (e.encode = (r, n) => ku(e, r, n)),
      (e.decode = (r, n) => zu(e, r, n)),
      (e.encodeAsync = async (r, n) => $u(e, r, n)),
      (e.decodeAsync = async (r, n) => Su(e, r, n)),
      (e.safeEncode = (r, n) => Zu(e, r, n)),
      (e.safeDecode = (r, n) => Ou(e, r, n)),
      (e.safeEncodeAsync = async (r, n) => Eu(e, r, n)),
      (e.safeDecodeAsync = async (r, n) => Au(e, r, n)),
      (e.refine = (r, n) => e.check(za(r, n))),
      (e.superRefine = (r) => e.check($a(r))),
      (e.overwrite = (r) => e.check(Ee(r))),
      (e.optional = () => yr(e)),
      (e.exactOptional = () => la(e)),
      (e.nullable = () => br(e)),
      (e.nullish = () => yr(br(e))),
      (e.nonoptional = (r) => _a(e, r)),
      (e.array = () => Qu(e)),
      (e.or = (r) => ra([e, r])),
      (e.and = (r) => oa(e, r)),
      (e.transform = (r) => wr(e, aa(r))),
      (e.default = (r) => ha(e, r)),
      (e.prefault = (r) => ma(e, r)),
      (e.catch = (r) => va(e, r)),
      (e.pipe = (r) => wr(e, r)),
      (e.readonly = () => wa(e)),
      (e.describe = (r) => {
        const n = e.clone();
        return (Te.add(n, { description: r }), n);
      }),
      Object.defineProperty(e, "description", {
        get() {
          return Te.get(e)?.description;
        },
        configurable: !0,
      }),
      (e.meta = (...r) => {
        if (r.length === 0) return Te.get(e);
        const n = e.clone();
        return (Te.add(n, r[0]), n);
      }),
      (e.isOptional = () => e.safeParse(void 0).success),
      (e.isNullable = () => e.safeParse(null).success),
      (e.apply = (r) => r(e)),
      e
    ),
  ),
  sn = d("_ZodString", (e, t) => {
    (Et.init(e, t),
      L.init(e, t),
      (e._zod.processJSONSchema = (n, o, s) => Mi(e, n, o)));
    const r = e._zod.bag;
    ((e.format = r.format ?? null),
      (e.minLength = r.minimum ?? null),
      (e.maxLength = r.maximum ?? null),
      (e.regex = (...n) => e.check(Zi(...n))),
      (e.includes = (...n) => e.check(Ai(...n))),
      (e.startsWith = (...n) => e.check(Ii(...n))),
      (e.endsWith = (...n) => e.check(Vi(...n))),
      (e.min = (...n) => e.check(qe(...n))),
      (e.max = (...n) => e.check(Qr(...n))),
      (e.length = (...n) => e.check(en(...n))),
      (e.nonempty = (...n) => e.check(qe(1, ...n))),
      (e.lowercase = (n) => e.check(Oi(n))),
      (e.uppercase = (n) => e.check(Ei(n))),
      (e.trim = () => e.check(Ti())),
      (e.normalize = (...n) => e.check(Fi(...n))),
      (e.toLowerCase = () => e.check(Ni())),
      (e.toUpperCase = () => e.check(Pi())),
      (e.slugify = () => e.check(Di())));
  }),
  Iu = d("ZodString", (e, t) => {
    (Et.init(e, t),
      sn.init(e, t),
      (e.email = (r) => e.check(Xr(un, r))),
      (e.url = (r) => e.check(ei(Vu, r))),
      (e.jwt = (r) => e.check(mi(Wu, r))),
      (e.emoji = (r) => e.check(ti(Fu, r))),
      (e.guid = (r) => e.check(dr(_r, r))),
      (e.uuid = (r) => e.check(Hs(Le, r))),
      (e.uuidv4 = (r) => e.check(Ys(Le, r))),
      (e.uuidv6 = (r) => e.check(Xs(Le, r))),
      (e.uuidv7 = (r) => e.check(Qs(Le, r))),
      (e.nanoid = (r) => e.check(ri(Tu, r))),
      (e.guid = (r) => e.check(dr(_r, r))),
      (e.cuid = (r) => e.check(ni(Nu, r))),
      (e.cuid2 = (r) => e.check(oi(Pu, r))),
      (e.ulid = (r) => e.check(si(Du, r))),
      (e.base64 = (r) => e.check(di(Mu, r))),
      (e.base64url = (r) => e.check(hi(Ju, r))),
      (e.xid = (r) => e.check(ii(Cu, r))),
      (e.ksuid = (r) => e.check(ui(xu, r))),
      (e.ipv4 = (r) => e.check(ai(Ru, r))),
      (e.ipv6 = (r) => e.check(ci(ju, r))),
      (e.cidrv4 = (r) => e.check(li(Uu, r))),
      (e.cidrv6 = (r) => e.check(fi(Lu, r))),
      (e.e164 = (r) => e.check(pi(Bu, r))),
      (e.datetime = (r) => e.check(lu(r))),
      (e.date = (r) => e.check(du(r))),
      (e.time = (r) => e.check(pu(r))),
      (e.duration = (r) => e.check(_u(r))));
  });
function Fa(e) {
  return Gs(Iu, e);
}
const R = d("ZodStringFormat", (e, t) => {
    (x.init(e, t), sn.init(e, t));
  }),
  un = d("ZodEmail", (e, t) => {
    (ns.init(e, t), R.init(e, t));
  });
function Ta(e) {
  return Xr(un, e);
}
const _r = d("ZodGUID", (e, t) => {
    (ts.init(e, t), R.init(e, t));
  }),
  Le = d("ZodUUID", (e, t) => {
    (rs.init(e, t), R.init(e, t));
  }),
  Vu = d("ZodURL", (e, t) => {
    (os.init(e, t), R.init(e, t));
  }),
  Fu = d("ZodEmoji", (e, t) => {
    (ss.init(e, t), R.init(e, t));
  }),
  Tu = d("ZodNanoID", (e, t) => {
    (is.init(e, t), R.init(e, t));
  }),
  Nu = d("ZodCUID", (e, t) => {
    (us.init(e, t), R.init(e, t));
  }),
  Pu = d("ZodCUID2", (e, t) => {
    (as.init(e, t), R.init(e, t));
  }),
  Du = d("ZodULID", (e, t) => {
    (cs.init(e, t), R.init(e, t));
  }),
  Cu = d("ZodXID", (e, t) => {
    (ls.init(e, t), R.init(e, t));
  }),
  xu = d("ZodKSUID", (e, t) => {
    (fs.init(e, t), R.init(e, t));
  }),
  Ru = d("ZodIPv4", (e, t) => {
    (_s.init(e, t), R.init(e, t));
  }),
  ju = d("ZodIPv6", (e, t) => {
    (gs.init(e, t), R.init(e, t));
  }),
  Uu = d("ZodCIDRv4", (e, t) => {
    (vs.init(e, t), R.init(e, t));
  }),
  Lu = d("ZodCIDRv6", (e, t) => {
    (ys.init(e, t), R.init(e, t));
  }),
  Mu = d("ZodBase64", (e, t) => {
    (bs.init(e, t), R.init(e, t));
  }),
  Ju = d("ZodBase64URL", (e, t) => {
    (ks.init(e, t), R.init(e, t));
  }),
  Bu = d("ZodE164", (e, t) => {
    (zs.init(e, t), R.init(e, t));
  }),
  Wu = d("ZodJWT", (e, t) => {
    (Ss.init(e, t), R.init(e, t));
  }),
  At = d("ZodNumber", (e, t) => {
    (qr.init(e, t),
      L.init(e, t),
      (e._zod.processJSONSchema = (n, o, s) => Ji(e, n, o)),
      (e.gt = (n, o) => e.check(pr(n, o))),
      (e.gte = (n, o) => e.check(lt(n, o))),
      (e.min = (n, o) => e.check(lt(n, o))),
      (e.lt = (n, o) => e.check(hr(n, o))),
      (e.lte = (n, o) => e.check(ct(n, o))),
      (e.max = (n, o) => e.check(ct(n, o))),
      (e.int = (n) => e.check(gr(n))),
      (e.safe = (n) => e.check(gr(n))),
      (e.positive = (n) => e.check(pr(0, n))),
      (e.nonnegative = (n) => e.check(lt(0, n))),
      (e.negative = (n) => e.check(hr(0, n))),
      (e.nonpositive = (n) => e.check(ct(0, n))),
      (e.multipleOf = (n, o) => e.check(mr(n, o))),
      (e.step = (n, o) => e.check(mr(n, o))),
      (e.finite = () => e));
    const r = e._zod.bag;
    ((e.minValue =
      Math.max(
        r.minimum ?? Number.NEGATIVE_INFINITY,
        r.exclusiveMinimum ?? Number.NEGATIVE_INFINITY,
      ) ?? null),
      (e.maxValue =
        Math.min(
          r.maximum ?? Number.POSITIVE_INFINITY,
          r.exclusiveMaximum ?? Number.POSITIVE_INFINITY,
        ) ?? null),
      (e.isInt =
        (r.format ?? "").includes("int") ||
        Number.isSafeInteger(r.multipleOf ?? 0.5)),
      (e.isFinite = !0),
      (e.format = r.format ?? null));
  });
function Na(e) {
  return bi(At, e);
}
const Ku = d("ZodNumberFormat", (e, t) => {
  (Zs.init(e, t), At.init(e, t));
});
function gr(e) {
  return ki(Ku, e);
}
const qu = d("ZodBoolean", (e, t) => {
  (Os.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => Bi(e, r, n)));
});
function Pa(e) {
  return zi(qu, e);
}
const Gu = d("ZodUnknown", (e, t) => {
  (Es.init(e, t), L.init(e, t), (e._zod.processJSONSchema = (r, n, o) => Ki()));
});
function vr() {
  return $i(Gu);
}
const Hu = d("ZodNever", (e, t) => {
  (As.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => Wi(e, r, n)));
});
function Yu(e) {
  return Si(Hu, e);
}
const Xu = d("ZodArray", (e, t) => {
  (Is.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => Xi(e, r, n, o)),
    (e.element = t.element),
    (e.min = (r, n) => e.check(qe(r, n))),
    (e.nonempty = (r) => e.check(qe(1, r))),
    (e.max = (r, n) => e.check(Qr(r, n))),
    (e.length = (r, n) => e.check(en(r, n))),
    (e.unwrap = () => e.element));
});
function Qu(e, t) {
  return Ci(Xu, e, t);
}
const ea = d("ZodObject", (e, t) => {
  (Fs.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => Qi(e, r, n, o)),
    P(e, "shape", () => t.shape),
    (e.keyof = () => sa(Object.keys(e._zod.def.shape))),
    (e.catchall = (r) => e.clone({ ...e._zod.def, catchall: r })),
    (e.passthrough = () => e.clone({ ...e._zod.def, catchall: vr() })),
    (e.loose = () => e.clone({ ...e._zod.def, catchall: vr() })),
    (e.strict = () => e.clone({ ...e._zod.def, catchall: Yu() })),
    (e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 })),
    (e.extend = (r) => Yn(e, r)),
    (e.safeExtend = (r) => Xn(e, r)),
    (e.merge = (r) => Qn(e, r)),
    (e.pick = (r) => Gn(e, r)),
    (e.omit = (r) => Hn(e, r)),
    (e.partial = (...r) => eo(an, e, r[0])),
    (e.required = (...r) => to(cn, e, r[0])));
});
function Da(e, t) {
  const r = { type: "object", shape: e ?? {}, ...k(t) };
  return new ea(r);
}
const ta = d("ZodUnion", (e, t) => {
  (Ts.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => eu(e, r, n, o)),
    (e.options = t.options));
});
function ra(e, t) {
  return new ta({ type: "union", options: e, ...k(t) });
}
const na = d("ZodIntersection", (e, t) => {
  (Ns.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => tu(e, r, n, o)));
});
function oa(e, t) {
  return new na({ type: "intersection", left: e, right: t });
}
const _t = d("ZodEnum", (e, t) => {
  (Ps.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (n, o, s) => qi(e, n, o)),
    (e.enum = t.entries),
    (e.options = Object.values(t.entries)));
  const r = new Set(Object.keys(t.entries));
  ((e.extract = (n, o) => {
    const s = {};
    for (const i of n)
      if (r.has(i)) s[i] = t.entries[i];
      else throw new Error(`Key ${i} not found in enum`);
    return new _t({ ...t, checks: [], ...k(o), entries: s });
  }),
    (e.exclude = (n, o) => {
      const s = { ...t.entries };
      for (const i of n)
        if (r.has(i)) delete s[i];
        else throw new Error(`Key ${i} not found in enum`);
      return new _t({ ...t, checks: [], ...k(o), entries: s });
    }));
});
function sa(e, t) {
  const r = Array.isArray(e) ? Object.fromEntries(e.map((n) => [n, n])) : e;
  return new _t({ type: "enum", entries: r, ...k(t) });
}
const ia = d("ZodLiteral", (e, t) => {
  (Ds.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => Gi(e, r, n)),
    (e.values = new Set(t.values)),
    Object.defineProperty(e, "value", {
      get() {
        if (t.values.length > 1)
          throw new Error(
            "This schema contains multiple valid literal values. Use `.values` instead.",
          );
        return t.values[0];
      },
    }));
});
function Ca(e, t) {
  return new ia({
    type: "literal",
    values: Array.isArray(e) ? e : [e],
    ...k(t),
  });
}
const ua = d("ZodTransform", (e, t) => {
  (Cs.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => Yi(e, r)),
    (e._zod.parse = (r, n) => {
      if (n.direction === "backward") throw new Tr(e.constructor.name);
      r.addIssue = (s) => {
        if (typeof s == "string") r.issues.push(Ce(s, r.value, t));
        else {
          const i = s;
          (i.fatal && (i.continue = !1),
            i.code ?? (i.code = "custom"),
            i.input ?? (i.input = r.value),
            i.inst ?? (i.inst = e),
            r.issues.push(Ce(i)));
        }
      };
      const o = t.transform(r.value, r);
      return o instanceof Promise
        ? o.then((s) => ((r.value = s), r))
        : ((r.value = o), r);
    }));
});
function aa(e) {
  return new ua({ type: "transform", transform: e });
}
const an = d("ZodOptional", (e, t) => {
  (Yr.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => on(e, r, n, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function yr(e) {
  return new an({ type: "optional", innerType: e });
}
const ca = d("ZodExactOptional", (e, t) => {
  (xs.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => on(e, r, n, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function la(e) {
  return new ca({ type: "optional", innerType: e });
}
const fa = d("ZodNullable", (e, t) => {
  (Rs.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => ru(e, r, n, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function br(e) {
  return new fa({ type: "nullable", innerType: e });
}
const da = d("ZodDefault", (e, t) => {
  (js.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => ou(e, r, n, o)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeDefault = e.unwrap));
});
function ha(e, t) {
  return new da({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Cr(t);
    },
  });
}
const pa = d("ZodPrefault", (e, t) => {
  (Us.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => su(e, r, n, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function ma(e, t) {
  return new pa({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Cr(t);
    },
  });
}
const cn = d("ZodNonOptional", (e, t) => {
  (Ls.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => nu(e, r, n, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function _a(e, t) {
  return new cn({ type: "nonoptional", innerType: e, ...k(t) });
}
const ga = d("ZodCatch", (e, t) => {
  (Ms.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => iu(e, r, n, o)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeCatch = e.unwrap));
});
function va(e, t) {
  return new ga({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t,
  });
}
const ya = d("ZodPipe", (e, t) => {
  (Js.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => uu(e, r, n, o)),
    (e.in = t.in),
    (e.out = t.out));
});
function wr(e, t) {
  return new ya({ type: "pipe", in: e, out: t });
}
const ba = d("ZodReadonly", (e, t) => {
  (Bs.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => au(e, r, n, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function wa(e) {
  return new ba({ type: "readonly", innerType: e });
}
const ka = d("ZodCustom", (e, t) => {
  (Ws.init(e, t),
    L.init(e, t),
    (e._zod.processJSONSchema = (r, n, o) => Hi(e, r)));
});
function za(e, t = {}) {
  return xi(ka, e, t);
}
function $a(e) {
  return Ri(e);
}
function xa(e) {
  return wi(At, e);
}
export {
  jr as $,
  Oa as C,
  sa as _,
  xa as a,
  Pa as b,
  Qu as c,
  Un as d,
  Ta as e,
  Aa as f,
  Va as g,
  Zn as h,
  Ca as l,
  Na as n,
  Da as o,
  Ia as p,
  Fa as s,
  Ea as u,
};
