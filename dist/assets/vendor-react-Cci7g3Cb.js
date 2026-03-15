function Ve(e, t) {
  for (var n = 0; n < t.length; n++) {
    const r = t[n];
    if (typeof r != "string" && !Array.isArray(r)) {
      for (const i in r)
        if (i !== "default" && !(i in e)) {
          const s = Object.getOwnPropertyDescriptor(r, i);
          s &&
            Object.defineProperty(
              e,
              i,
              s.get ? s : { enumerable: !0, get: () => r[i] },
            );
        }
    }
  }
  return Object.freeze(
    Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
  );
}
function be(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default")
    ? e.default
    : e;
}
var oe = { exports: {} },
  m = {};
var ge;
function Ke() {
  if (ge) return m;
  ge = 1;
  var e = Symbol.for("react.transitional.element"),
    t = Symbol.for("react.portal"),
    n = Symbol.for("react.fragment"),
    r = Symbol.for("react.strict_mode"),
    i = Symbol.for("react.profiler"),
    s = Symbol.for("react.consumer"),
    u = Symbol.for("react.context"),
    p = Symbol.for("react.forward_ref"),
    l = Symbol.for("react.suspense"),
    o = Symbol.for("react.memo"),
    f = Symbol.for("react.lazy"),
    h = Symbol.for("react.activity"),
    E = Symbol.iterator;
  function O(a) {
    return a === null || typeof a != "object"
      ? null
      : ((a = (E && a[E]) || a["@@iterator"]),
        typeof a == "function" ? a : null);
  }
  var P = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {},
    },
    C = Object.assign,
    v = {};
  function S(a, c, y) {
    ((this.props = a),
      (this.context = c),
      (this.refs = v),
      (this.updater = y || P));
  }
  ((S.prototype.isReactComponent = {}),
    (S.prototype.setState = function (a, c) {
      if (typeof a != "object" && typeof a != "function" && a != null)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables.",
        );
      this.updater.enqueueSetState(this, a, c, "setState");
    }),
    (S.prototype.forceUpdate = function (a) {
      this.updater.enqueueForceUpdate(this, a, "forceUpdate");
    }));
  function R() {}
  R.prototype = S.prototype;
  function x(a, c, y) {
    ((this.props = a),
      (this.context = c),
      (this.refs = v),
      (this.updater = y || P));
  }
  var b = (x.prototype = new R());
  ((b.constructor = x), C(b, S.prototype), (b.isPureReactComponent = !0));
  var j = Array.isArray;
  function B() {}
  var T = { H: null, A: null, T: null, S: null },
    H = Object.prototype.hasOwnProperty;
  function V(a, c, y) {
    var g = y.ref;
    return {
      $$typeof: e,
      type: a,
      key: c,
      ref: g !== void 0 ? g : null,
      props: y,
    };
  }
  function K(a, c) {
    return V(a.type, c, a.props);
  }
  function G(a) {
    return typeof a == "object" && a !== null && a.$$typeof === e;
  }
  function We(a) {
    var c = { "=": "=0", ":": "=2" };
    return (
      "$" +
      a.replace(/[=:]/g, function (y) {
        return c[y];
      })
    );
  }
  var ve = /\/+/g;
  function ae(a, c) {
    return typeof a == "object" && a !== null && a.key != null
      ? We("" + a.key)
      : c.toString(36);
  }
  function ze(a) {
    switch (a.status) {
      case "fulfilled":
        return a.value;
      case "rejected":
        throw a.reason;
      default:
        switch (
          (typeof a.status == "string"
            ? a.then(B, B)
            : ((a.status = "pending"),
              a.then(
                function (c) {
                  a.status === "pending" &&
                    ((a.status = "fulfilled"), (a.value = c));
                },
                function (c) {
                  a.status === "pending" &&
                    ((a.status = "rejected"), (a.reason = c));
                },
              )),
          a.status)
        ) {
          case "fulfilled":
            return a.value;
          case "rejected":
            throw a.reason;
        }
    }
    throw a;
  }
  function W(a, c, y, g, _) {
    var w = typeof a;
    (w === "undefined" || w === "boolean") && (a = null);
    var L = !1;
    if (a === null) L = !0;
    else
      switch (w) {
        case "bigint":
        case "string":
        case "number":
          L = !0;
          break;
        case "object":
          switch (a.$$typeof) {
            case e:
            case t:
              L = !0;
              break;
            case f:
              return ((L = a._init), W(L(a._payload), c, y, g, _));
          }
      }
    if (L)
      return (
        (_ = _(a)),
        (L = g === "" ? "." + ae(a, 0) : g),
        j(_)
          ? ((y = ""),
            L != null && (y = L.replace(ve, "$&/") + "/"),
            W(_, c, y, "", function (qe) {
              return qe;
            }))
          : _ != null &&
            (G(_) &&
              (_ = K(
                _,
                y +
                  (_.key == null || (a && a.key === _.key)
                    ? ""
                    : ("" + _.key).replace(ve, "$&/") + "/") +
                  L,
              )),
            c.push(_)),
        1
      );
    L = 0;
    var I = g === "" ? "." : g + ":";
    if (j(a))
      for (var U = 0; U < a.length; U++)
        ((g = a[U]), (w = I + ae(g, U)), (L += W(g, c, y, w, _)));
    else if (((U = O(a)), typeof U == "function"))
      for (a = U.call(a), U = 0; !(g = a.next()).done; )
        ((g = g.value), (w = I + ae(g, U++)), (L += W(g, c, y, w, _)));
    else if (w === "object") {
      if (typeof a.then == "function") return W(ze(a), c, y, g, _);
      throw (
        (c = String(a)),
        Error(
          "Objects are not valid as a React child (found: " +
            (c === "[object Object]"
              ? "object with keys {" + Object.keys(a).join(", ") + "}"
              : c) +
            "). If you meant to render a collection of children, use an array instead.",
        )
      );
    }
    return L;
  }
  function Q(a, c, y) {
    if (a == null) return a;
    var g = [],
      _ = 0;
    return (
      W(a, g, "", "", function (w) {
        return c.call(y, w, _++);
      }),
      g
    );
  }
  function Ye(a) {
    if (a._status === -1) {
      var c = a._result;
      ((c = c()),
        c.then(
          function (y) {
            (a._status === 0 || a._status === -1) &&
              ((a._status = 1), (a._result = y));
          },
          function (y) {
            (a._status === 0 || a._status === -1) &&
              ((a._status = 2), (a._result = y));
          },
        ),
        a._status === -1 && ((a._status = 0), (a._result = c)));
    }
    if (a._status === 1) return a._result.default;
    throw a._result;
  }
  var me =
      typeof reportError == "function"
        ? reportError
        : function (a) {
            if (
              typeof window == "object" &&
              typeof window.ErrorEvent == "function"
            ) {
              var c = new window.ErrorEvent("error", {
                bubbles: !0,
                cancelable: !0,
                message:
                  typeof a == "object" &&
                  a !== null &&
                  typeof a.message == "string"
                    ? String(a.message)
                    : String(a),
                error: a,
              });
              if (!window.dispatchEvent(c)) return;
            } else if (
              typeof process == "object" &&
              typeof process.emit == "function"
            ) {
              process.emit("uncaughtException", a);
              return;
            }
            console.error(a);
          },
    Fe = {
      map: Q,
      forEach: function (a, c, y) {
        Q(
          a,
          function () {
            c.apply(this, arguments);
          },
          y,
        );
      },
      count: function (a) {
        var c = 0;
        return (
          Q(a, function () {
            c++;
          }),
          c
        );
      },
      toArray: function (a) {
        return (
          Q(a, function (c) {
            return c;
          }) || []
        );
      },
      only: function (a) {
        if (!G(a))
          throw Error(
            "React.Children.only expected to receive a single React element child.",
          );
        return a;
      },
    };
  return (
    (m.Activity = h),
    (m.Children = Fe),
    (m.Component = S),
    (m.Fragment = n),
    (m.Profiler = i),
    (m.PureComponent = x),
    (m.StrictMode = r),
    (m.Suspense = l),
    (m.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = T),
    (m.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function (a) {
        return T.H.useMemoCache(a);
      },
    }),
    (m.cache = function (a) {
      return function () {
        return a.apply(null, arguments);
      };
    }),
    (m.cacheSignal = function () {
      return null;
    }),
    (m.cloneElement = function (a, c, y) {
      if (a == null)
        throw Error(
          "The argument must be a React element, but you passed " + a + ".",
        );
      var g = C({}, a.props),
        _ = a.key;
      if (c != null)
        for (w in (c.key !== void 0 && (_ = "" + c.key), c))
          !H.call(c, w) ||
            w === "key" ||
            w === "__self" ||
            w === "__source" ||
            (w === "ref" && c.ref === void 0) ||
            (g[w] = c[w]);
      var w = arguments.length - 2;
      if (w === 1) g.children = y;
      else if (1 < w) {
        for (var L = Array(w), I = 0; I < w; I++) L[I] = arguments[I + 2];
        g.children = L;
      }
      return V(a.type, _, g);
    }),
    (m.createContext = function (a) {
      return (
        (a = {
          $$typeof: u,
          _currentValue: a,
          _currentValue2: a,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
        }),
        (a.Provider = a),
        (a.Consumer = { $$typeof: s, _context: a }),
        a
      );
    }),
    (m.createElement = function (a, c, y) {
      var g,
        _ = {},
        w = null;
      if (c != null)
        for (g in (c.key !== void 0 && (w = "" + c.key), c))
          H.call(c, g) &&
            g !== "key" &&
            g !== "__self" &&
            g !== "__source" &&
            (_[g] = c[g]);
      var L = arguments.length - 2;
      if (L === 1) _.children = y;
      else if (1 < L) {
        for (var I = Array(L), U = 0; U < L; U++) I[U] = arguments[U + 2];
        _.children = I;
      }
      if (a && a.defaultProps)
        for (g in ((L = a.defaultProps), L)) _[g] === void 0 && (_[g] = L[g]);
      return V(a, w, _);
    }),
    (m.createRef = function () {
      return { current: null };
    }),
    (m.forwardRef = function (a) {
      return { $$typeof: p, render: a };
    }),
    (m.isValidElement = G),
    (m.lazy = function (a) {
      return { $$typeof: f, _payload: { _status: -1, _result: a }, _init: Ye };
    }),
    (m.memo = function (a, c) {
      return { $$typeof: o, type: a, compare: c === void 0 ? null : c };
    }),
    (m.startTransition = function (a) {
      var c = T.T,
        y = {};
      T.T = y;
      try {
        var g = a(),
          _ = T.S;
        (_ !== null && _(y, g),
          typeof g == "object" &&
            g !== null &&
            typeof g.then == "function" &&
            g.then(B, me));
      } catch (w) {
        me(w);
      } finally {
        (c !== null && y.types !== null && (c.types = y.types), (T.T = c));
      }
    }),
    (m.unstable_useCacheRefresh = function () {
      return T.H.useCacheRefresh();
    }),
    (m.use = function (a) {
      return T.H.use(a);
    }),
    (m.useActionState = function (a, c, y) {
      return T.H.useActionState(a, c, y);
    }),
    (m.useCallback = function (a, c) {
      return T.H.useCallback(a, c);
    }),
    (m.useContext = function (a) {
      return T.H.useContext(a);
    }),
    (m.useDebugValue = function () {}),
    (m.useDeferredValue = function (a, c) {
      return T.H.useDeferredValue(a, c);
    }),
    (m.useEffect = function (a, c) {
      return T.H.useEffect(a, c);
    }),
    (m.useEffectEvent = function (a) {
      return T.H.useEffectEvent(a);
    }),
    (m.useId = function () {
      return T.H.useId();
    }),
    (m.useImperativeHandle = function (a, c, y) {
      return T.H.useImperativeHandle(a, c, y);
    }),
    (m.useInsertionEffect = function (a, c) {
      return T.H.useInsertionEffect(a, c);
    }),
    (m.useLayoutEffect = function (a, c) {
      return T.H.useLayoutEffect(a, c);
    }),
    (m.useMemo = function (a, c) {
      return T.H.useMemo(a, c);
    }),
    (m.useOptimistic = function (a, c) {
      return T.H.useOptimistic(a, c);
    }),
    (m.useReducer = function (a, c, y) {
      return T.H.useReducer(a, c, y);
    }),
    (m.useRef = function (a) {
      return T.H.useRef(a);
    }),
    (m.useState = function (a) {
      return T.H.useState(a);
    }),
    (m.useSyncExternalStore = function (a, c, y) {
      return T.H.useSyncExternalStore(a, c, y);
    }),
    (m.useTransition = function () {
      return T.H.useTransition();
    }),
    (m.version = "19.2.4"),
    m
  );
}
var ye;
function Le() {
  return (ye || ((ye = 1), (oe.exports = Ke())), oe.exports);
}
var d = Le();
const Ge = be(d),
  Je = Ve({ __proto__: null, default: Ge }, [d]);
var ie = { exports: {} },
  A = {};
var Ee;
function Xe() {
  if (Ee) return A;
  Ee = 1;
  var e = Le();
  function t(l) {
    var o = "https://react.dev/errors/" + l;
    if (1 < arguments.length) {
      o += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var f = 2; f < arguments.length; f++)
        o += "&args[]=" + encodeURIComponent(arguments[f]);
    }
    return (
      "Minified React error #" +
      l +
      "; visit " +
      o +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  function n() {}
  var r = {
      d: {
        f: n,
        r: function () {
          throw Error(t(522));
        },
        D: n,
        C: n,
        L: n,
        m: n,
        X: n,
        S: n,
        M: n,
      },
      p: 0,
      findDOMNode: null,
    },
    i = Symbol.for("react.portal");
  function s(l, o, f) {
    var h =
      3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: i,
      key: h == null ? null : "" + h,
      children: l,
      containerInfo: o,
      implementation: f,
    };
  }
  var u = e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function p(l, o) {
    if (l === "font") return "";
    if (typeof o == "string") return o === "use-credentials" ? o : "";
  }
  return (
    (A.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = r),
    (A.createPortal = function (l, o) {
      var f =
        2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!o || (o.nodeType !== 1 && o.nodeType !== 9 && o.nodeType !== 11))
        throw Error(t(299));
      return s(l, o, null, f);
    }),
    (A.flushSync = function (l) {
      var o = u.T,
        f = r.p;
      try {
        if (((u.T = null), (r.p = 2), l)) return l();
      } finally {
        ((u.T = o), (r.p = f), r.d.f());
      }
    }),
    (A.preconnect = function (l, o) {
      typeof l == "string" &&
        (o
          ? ((o = o.crossOrigin),
            (o =
              typeof o == "string"
                ? o === "use-credentials"
                  ? o
                  : ""
                : void 0))
          : (o = null),
        r.d.C(l, o));
    }),
    (A.prefetchDNS = function (l) {
      typeof l == "string" && r.d.D(l);
    }),
    (A.preinit = function (l, o) {
      if (typeof l == "string" && o && typeof o.as == "string") {
        var f = o.as,
          h = p(f, o.crossOrigin),
          E = typeof o.integrity == "string" ? o.integrity : void 0,
          O = typeof o.fetchPriority == "string" ? o.fetchPriority : void 0;
        f === "style"
          ? r.d.S(l, typeof o.precedence == "string" ? o.precedence : void 0, {
              crossOrigin: h,
              integrity: E,
              fetchPriority: O,
            })
          : f === "script" &&
            r.d.X(l, {
              crossOrigin: h,
              integrity: E,
              fetchPriority: O,
              nonce: typeof o.nonce == "string" ? o.nonce : void 0,
            });
      }
    }),
    (A.preinitModule = function (l, o) {
      if (typeof l == "string")
        if (typeof o == "object" && o !== null) {
          if (o.as == null || o.as === "script") {
            var f = p(o.as, o.crossOrigin);
            r.d.M(l, {
              crossOrigin: f,
              integrity: typeof o.integrity == "string" ? o.integrity : void 0,
              nonce: typeof o.nonce == "string" ? o.nonce : void 0,
            });
          }
        } else o == null && r.d.M(l);
    }),
    (A.preload = function (l, o) {
      if (
        typeof l == "string" &&
        typeof o == "object" &&
        o !== null &&
        typeof o.as == "string"
      ) {
        var f = o.as,
          h = p(f, o.crossOrigin);
        r.d.L(l, f, {
          crossOrigin: h,
          integrity: typeof o.integrity == "string" ? o.integrity : void 0,
          nonce: typeof o.nonce == "string" ? o.nonce : void 0,
          type: typeof o.type == "string" ? o.type : void 0,
          fetchPriority:
            typeof o.fetchPriority == "string" ? o.fetchPriority : void 0,
          referrerPolicy:
            typeof o.referrerPolicy == "string" ? o.referrerPolicy : void 0,
          imageSrcSet:
            typeof o.imageSrcSet == "string" ? o.imageSrcSet : void 0,
          imageSizes: typeof o.imageSizes == "string" ? o.imageSizes : void 0,
          media: typeof o.media == "string" ? o.media : void 0,
        });
      }
    }),
    (A.preloadModule = function (l, o) {
      if (typeof l == "string")
        if (o) {
          var f = p(o.as, o.crossOrigin);
          r.d.m(l, {
            as: typeof o.as == "string" && o.as !== "script" ? o.as : void 0,
            crossOrigin: f,
            integrity: typeof o.integrity == "string" ? o.integrity : void 0,
          });
        } else r.d.m(l);
    }),
    (A.requestFormReset = function (l) {
      r.d.r(l);
    }),
    (A.unstable_batchedUpdates = function (l, o) {
      return l(o);
    }),
    (A.useFormState = function (l, o, f) {
      return u.H.useFormState(l, o, f);
    }),
    (A.useFormStatus = function () {
      return u.H.useHostTransitionStatus();
    }),
    (A.version = "19.2.4"),
    A
  );
}
var _e;
function Qe() {
  if (_e) return ie.exports;
  _e = 1;
  function e() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e);
      } catch (t) {
        console.error(t);
      }
  }
  return (e(), (ie.exports = Xe()), ie.exports);
}
var Ze = Qe();
const on = be(Ze);
function J() {
  return (
    (J = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    J.apply(this, arguments)
  );
}
var k;
(function (e) {
  ((e.Pop = "POP"), (e.Push = "PUSH"), (e.Replace = "REPLACE"));
})(k || (k = {}));
const Ce = "popstate";
function et(e) {
  e === void 0 && (e = {});
  function t(r, i) {
    let { pathname: s, search: u, hash: p } = r.location;
    return se(
      "",
      { pathname: s, search: u, hash: p },
      (i.state && i.state.usr) || null,
      (i.state && i.state.key) || "default",
    );
  }
  function n(r, i) {
    return typeof i == "string" ? i : Z(i);
  }
  return nt(t, n, null, e);
}
function N(e, t) {
  if (e === !1 || e === null || typeof e > "u") throw new Error(t);
}
function de(e, t) {
  if (!e) {
    typeof console < "u" && console.warn(t);
    try {
      throw new Error(t);
    } catch {}
  }
}
function tt() {
  return Math.random().toString(36).substr(2, 8);
}
function Re(e, t) {
  return { usr: e.state, key: e.key, idx: t };
}
function se(e, t, n, r) {
  return (
    n === void 0 && (n = null),
    J(
      { pathname: typeof e == "string" ? e : e.pathname, search: "", hash: "" },
      typeof t == "string" ? Y(t) : t,
      { state: n, key: (t && t.key) || r || tt() },
    )
  );
}
function Z(e) {
  let { pathname: t = "/", search: n = "", hash: r = "" } = e;
  return (
    n && n !== "?" && (t += n.charAt(0) === "?" ? n : "?" + n),
    r && r !== "#" && (t += r.charAt(0) === "#" ? r : "#" + r),
    t
  );
}
function Y(e) {
  let t = {};
  if (e) {
    let n = e.indexOf("#");
    n >= 0 && ((t.hash = e.substr(n)), (e = e.substr(0, n)));
    let r = e.indexOf("?");
    (r >= 0 && ((t.search = e.substr(r)), (e = e.substr(0, r))),
      e && (t.pathname = e));
  }
  return t;
}
function nt(e, t, n, r) {
  r === void 0 && (r = {});
  let { window: i = document.defaultView, v5Compat: s = !1 } = r,
    u = i.history,
    p = k.Pop,
    l = null,
    o = f();
  o == null && ((o = 0), u.replaceState(J({}, u.state, { idx: o }), ""));
  function f() {
    return (u.state || { idx: null }).idx;
  }
  function h() {
    p = k.Pop;
    let v = f(),
      S = v == null ? null : v - o;
    ((o = v), l && l({ action: p, location: C.location, delta: S }));
  }
  function E(v, S) {
    p = k.Push;
    let R = se(C.location, v, S);
    o = f() + 1;
    let x = Re(R, o),
      b = C.createHref(R);
    try {
      u.pushState(x, "", b);
    } catch (j) {
      if (j instanceof DOMException && j.name === "DataCloneError") throw j;
      i.location.assign(b);
    }
    s && l && l({ action: p, location: C.location, delta: 1 });
  }
  function O(v, S) {
    p = k.Replace;
    let R = se(C.location, v, S);
    o = f();
    let x = Re(R, o),
      b = C.createHref(R);
    (u.replaceState(x, "", b),
      s && l && l({ action: p, location: C.location, delta: 0 }));
  }
  function P(v) {
    let S = i.location.origin !== "null" ? i.location.origin : i.location.href,
      R = typeof v == "string" ? v : Z(v);
    return (
      (R = R.replace(/ $/, "%20")),
      N(
        S,
        "No window.location.(origin|href) available to create URL for href: " +
          R,
      ),
      new URL(R, S)
    );
  }
  let C = {
    get action() {
      return p;
    },
    get location() {
      return e(i, u);
    },
    listen(v) {
      if (l) throw new Error("A history only accepts one active listener");
      return (
        i.addEventListener(Ce, h),
        (l = v),
        () => {
          (i.removeEventListener(Ce, h), (l = null));
        }
      );
    },
    createHref(v) {
      return t(i, v);
    },
    createURL: P,
    encodeLocation(v) {
      let S = P(v);
      return { pathname: S.pathname, search: S.search, hash: S.hash };
    },
    push: E,
    replace: O,
    go(v) {
      return u.go(v);
    },
  };
  return C;
}
var Pe;
(function (e) {
  ((e.data = "data"),
    (e.deferred = "deferred"),
    (e.redirect = "redirect"),
    (e.error = "error"));
})(Pe || (Pe = {}));
function rt(e, t, n) {
  return (n === void 0 && (n = "/"), at(e, t, n));
}
function at(e, t, n, r) {
  let i = typeof t == "string" ? Y(t) : t,
    s = z(i.pathname || "/", n);
  if (s == null) return null;
  let u = Ne(e);
  ot(u);
  let p = null;
  for (let l = 0; p == null && l < u.length; ++l) {
    let o = mt(s);
    p = ht(u[l], o);
  }
  return p;
}
function Ne(e, t, n, r) {
  (t === void 0 && (t = []),
    n === void 0 && (n = []),
    r === void 0 && (r = ""));
  let i = (s, u, p) => {
    let l = {
      relativePath: p === void 0 ? s.path || "" : p,
      caseSensitive: s.caseSensitive === !0,
      childrenIndex: u,
      route: s,
    };
    l.relativePath.startsWith("/") &&
      (N(
        l.relativePath.startsWith(r),
        'Absolute route path "' +
          l.relativePath +
          '" nested under path ' +
          ('"' + r + '" is not valid. An absolute child route path ') +
          "must start with the combined path of all its parent routes.",
      ),
      (l.relativePath = l.relativePath.slice(r.length)));
    let o = D([r, l.relativePath]),
      f = n.concat(l);
    (s.children &&
      s.children.length > 0 &&
      (N(
        s.index !== !0,
        "Index routes must not have child routes. Please remove " +
          ('all child routes from route path "' + o + '".'),
      ),
      Ne(s.children, t, f, o)),
      !(s.path == null && !s.index) &&
        t.push({ path: o, score: dt(o, s.index), routesMeta: f }));
  };
  return (
    e.forEach((s, u) => {
      var p;
      if (s.path === "" || !((p = s.path) != null && p.includes("?"))) i(s, u);
      else for (let l of Ae(s.path)) i(s, u, l);
    }),
    t
  );
}
function Ae(e) {
  let t = e.split("/");
  if (t.length === 0) return [];
  let [n, ...r] = t,
    i = n.endsWith("?"),
    s = n.replace(/\?$/, "");
  if (r.length === 0) return i ? [s, ""] : [s];
  let u = Ae(r.join("/")),
    p = [];
  return (
    p.push(...u.map((l) => (l === "" ? s : [s, l].join("/")))),
    i && p.push(...u),
    p.map((l) => (e.startsWith("/") && l === "" ? "/" : l))
  );
}
function ot(e) {
  e.sort((t, n) =>
    t.score !== n.score
      ? n.score - t.score
      : pt(
          t.routesMeta.map((r) => r.childrenIndex),
          n.routesMeta.map((r) => r.childrenIndex),
        ),
  );
}
const it = /^:[\w-]+$/,
  lt = 3,
  st = 2,
  ut = 1,
  ct = 10,
  ft = -2,
  Se = (e) => e === "*";
function dt(e, t) {
  let n = e.split("/"),
    r = n.length;
  return (
    n.some(Se) && (r += ft),
    t && (r += st),
    n
      .filter((i) => !Se(i))
      .reduce((i, s) => i + (it.test(s) ? lt : s === "" ? ut : ct), r)
  );
}
function pt(e, t) {
  return e.length === t.length && e.slice(0, -1).every((r, i) => r === t[i])
    ? e[e.length - 1] - t[t.length - 1]
    : 0;
}
function ht(e, t, n) {
  let { routesMeta: r } = e,
    i = {},
    s = "/",
    u = [];
  for (let p = 0; p < r.length; ++p) {
    let l = r[p],
      o = p === r.length - 1,
      f = s === "/" ? t : t.slice(s.length) || "/",
      h = ue(
        { path: l.relativePath, caseSensitive: l.caseSensitive, end: o },
        f,
      ),
      E = l.route;
    if (!h) return null;
    (Object.assign(i, h.params),
      u.push({
        params: i,
        pathname: D([s, h.pathname]),
        pathnameBase: Ct(D([s, h.pathnameBase])),
        route: E,
      }),
      h.pathnameBase !== "/" && (s = D([s, h.pathnameBase])));
  }
  return u;
}
function ue(e, t) {
  typeof e == "string" && (e = { path: e, caseSensitive: !1, end: !0 });
  let [n, r] = vt(e.path, e.caseSensitive, e.end),
    i = t.match(n);
  if (!i) return null;
  let s = i[0],
    u = s.replace(/(.)\/+$/, "$1"),
    p = i.slice(1);
  return {
    params: r.reduce((o, f, h) => {
      let { paramName: E, isOptional: O } = f;
      if (E === "*") {
        let C = p[h] || "";
        u = s.slice(0, s.length - C.length).replace(/(.)\/+$/, "$1");
      }
      const P = p[h];
      return (
        O && !P ? (o[E] = void 0) : (o[E] = (P || "").replace(/%2F/g, "/")),
        o
      );
    }, {}),
    pathname: s,
    pathnameBase: u,
    pattern: e,
  };
}
function vt(e, t, n) {
  (t === void 0 && (t = !1),
    n === void 0 && (n = !0),
    de(
      e === "*" || !e.endsWith("*") || e.endsWith("/*"),
      'Route path "' +
        e +
        '" will be treated as if it were ' +
        ('"' + e.replace(/\*$/, "/*") + '" because the `*` character must ') +
        "always follow a `/` in the pattern. To get rid of this warning, " +
        ('please change the route path to "' + e.replace(/\*$/, "/*") + '".'),
    ));
  let r = [],
    i =
      "^" +
      e
        .replace(/\/*\*?$/, "")
        .replace(/^\/*/, "/")
        .replace(/[\\.*+^${}|()[\]]/g, "\\$&")
        .replace(
          /\/:([\w-]+)(\?)?/g,
          (u, p, l) => (
            r.push({ paramName: p, isOptional: l != null }),
            l ? "/?([^\\/]+)?" : "/([^\\/]+)"
          ),
        );
  return (
    e.endsWith("*")
      ? (r.push({ paramName: "*" }),
        (i += e === "*" || e === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$"))
      : n
        ? (i += "\\/*$")
        : e !== "" && e !== "/" && (i += "(?:(?=\\/|$))"),
    [new RegExp(i, t ? void 0 : "i"), r]
  );
}
function mt(e) {
  try {
    return e
      .split("/")
      .map((t) => decodeURIComponent(t).replace(/\//g, "%2F"))
      .join("/");
  } catch (t) {
    return (
      de(
        !1,
        'The URL path "' +
          e +
          '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent ' +
          ("encoding (" + t + ")."),
      ),
      e
    );
  }
}
function z(e, t) {
  if (t === "/") return e;
  if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
  let n = t.endsWith("/") ? t.length - 1 : t.length,
    r = e.charAt(n);
  return r && r !== "/" ? null : e.slice(n) || "/";
}
const gt = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  yt = (e) => gt.test(e);
function Et(e, t) {
  t === void 0 && (t = "/");
  let {
      pathname: n,
      search: r = "",
      hash: i = "",
    } = typeof e == "string" ? Y(e) : e,
    s;
  if (n)
    if (yt(n)) s = n;
    else {
      if (n.includes("//")) {
        let u = n;
        ((n = n.replace(/\/\/+/g, "/")),
          de(
            !1,
            "Pathnames cannot have embedded double slashes - normalizing " +
              (u + " -> " + n),
          ));
      }
      n.startsWith("/") ? (s = xe(n.substring(1), "/")) : (s = xe(n, t));
    }
  else s = t;
  return { pathname: s, search: Rt(r), hash: Pt(i) };
}
function xe(e, t) {
  let n = t.replace(/\/+$/, "").split("/");
  return (
    e.split("/").forEach((i) => {
      i === ".." ? n.length > 1 && n.pop() : i !== "." && n.push(i);
    }),
    n.length > 1 ? n.join("/") : "/"
  );
}
function le(e, t, n, r) {
  return (
    "Cannot include a '" +
    e +
    "' character in a manually specified " +
    ("`to." +
      t +
      "` field [" +
      JSON.stringify(r) +
      "].  Please separate it out to the ") +
    ("`to." + n + "` field. Alternatively you may provide the full path as ") +
    'a string in <Link to="..."> and the router will parse it for you.'
  );
}
function _t(e) {
  return e.filter(
    (t, n) => n === 0 || (t.route.path && t.route.path.length > 0),
  );
}
function pe(e, t) {
  let n = _t(e);
  return t
    ? n.map((r, i) => (i === n.length - 1 ? r.pathname : r.pathnameBase))
    : n.map((r) => r.pathnameBase);
}
function he(e, t, n, r) {
  r === void 0 && (r = !1);
  let i;
  typeof e == "string"
    ? (i = Y(e))
    : ((i = J({}, e)),
      N(
        !i.pathname || !i.pathname.includes("?"),
        le("?", "pathname", "search", i),
      ),
      N(
        !i.pathname || !i.pathname.includes("#"),
        le("#", "pathname", "hash", i),
      ),
      N(!i.search || !i.search.includes("#"), le("#", "search", "hash", i)));
  let s = e === "" || i.pathname === "",
    u = s ? "/" : i.pathname,
    p;
  if (u == null) p = n;
  else {
    let h = t.length - 1;
    if (!r && u.startsWith("..")) {
      let E = u.split("/");
      for (; E[0] === ".."; ) (E.shift(), (h -= 1));
      i.pathname = E.join("/");
    }
    p = h >= 0 ? t[h] : "/";
  }
  let l = Et(i, p),
    o = u && u !== "/" && u.endsWith("/"),
    f = (s || u === ".") && n.endsWith("/");
  return (!l.pathname.endsWith("/") && (o || f) && (l.pathname += "/"), l);
}
const D = (e) => e.join("/").replace(/\/\/+/g, "/"),
  Ct = (e) => e.replace(/\/+$/, "").replace(/^\/*/, "/"),
  Rt = (e) => (!e || e === "?" ? "" : e.startsWith("?") ? e : "?" + e),
  Pt = (e) => (!e || e === "#" ? "" : e.startsWith("#") ? e : "#" + e);
function St(e) {
  return (
    e != null &&
    typeof e.status == "number" &&
    typeof e.statusText == "string" &&
    typeof e.internal == "boolean" &&
    "data" in e
  );
}
const Ue = ["post", "put", "patch", "delete"];
new Set(Ue);
const xt = ["get", ...Ue];
new Set(xt);
function X() {
  return (
    (X = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    X.apply(this, arguments)
  );
}
const te = d.createContext(null),
  je = d.createContext(null),
  M = d.createContext(null),
  ne = d.createContext(null),
  $ = d.createContext({ outlet: null, matches: [], isDataRoute: !1 }),
  Ie = d.createContext(null);
function Tt(e, t) {
  let { relative: n } = t === void 0 ? {} : t;
  F() || N(!1);
  let { basename: r, navigator: i } = d.useContext(M),
    { hash: s, pathname: u, search: p } = re(e, { relative: n }),
    l = u;
  return (
    r !== "/" && (l = u === "/" ? r : D([r, u])),
    i.createHref({ pathname: l, search: p, hash: s })
  );
}
function F() {
  return d.useContext(ne) != null;
}
function q() {
  return (F() || N(!1), d.useContext(ne).location);
}
function $e(e) {
  d.useContext(M).static || d.useLayoutEffect(e);
}
function Me() {
  let { isDataRoute: e } = d.useContext($);
  return e ? Ht() : wt();
}
function wt() {
  F() || N(!1);
  let e = d.useContext(te),
    { basename: t, future: n, navigator: r } = d.useContext(M),
    { matches: i } = d.useContext($),
    { pathname: s } = q(),
    u = JSON.stringify(pe(i, n.v7_relativeSplatPath)),
    p = d.useRef(!1);
  return (
    $e(() => {
      p.current = !0;
    }),
    d.useCallback(
      function (o, f) {
        if ((f === void 0 && (f = {}), !p.current)) return;
        if (typeof o == "number") {
          r.go(o);
          return;
        }
        let h = he(o, JSON.parse(u), s, f.relative === "path");
        (e == null &&
          t !== "/" &&
          (h.pathname = h.pathname === "/" ? t : D([t, h.pathname])),
          (f.replace ? r.replace : r.push)(h, f.state, f));
      },
      [t, r, u, s, e],
    )
  );
}
const Ot = d.createContext(null);
function bt(e) {
  let t = d.useContext($).outlet;
  return t && d.createElement(Ot.Provider, { value: e }, t);
}
function ln() {
  let { matches: e } = d.useContext($),
    t = e[e.length - 1];
  return t ? t.params : {};
}
function re(e, t) {
  let { relative: n } = t === void 0 ? {} : t,
    { future: r } = d.useContext(M),
    { matches: i } = d.useContext($),
    { pathname: s } = q(),
    u = JSON.stringify(pe(i, r.v7_relativeSplatPath));
  return d.useMemo(() => he(e, JSON.parse(u), s, n === "path"), [e, u, s, n]);
}
function Lt(e, t) {
  return Nt(e, t);
}
function Nt(e, t, n, r) {
  F() || N(!1);
  let { navigator: i } = d.useContext(M),
    { matches: s } = d.useContext($),
    u = s[s.length - 1],
    p = u ? u.params : {};
  u && u.pathname;
  let l = u ? u.pathnameBase : "/";
  u && u.route;
  let o = q(),
    f;
  if (t) {
    var h;
    let v = typeof t == "string" ? Y(t) : t;
    (l === "/" || ((h = v.pathname) != null && h.startsWith(l)) || N(!1),
      (f = v));
  } else f = o;
  let E = f.pathname || "/",
    O = E;
  if (l !== "/") {
    let v = l.replace(/^\//, "").split("/");
    O = "/" + E.replace(/^\//, "").split("/").slice(v.length).join("/");
  }
  let P = rt(e, { pathname: O }),
    C = $t(
      P &&
        P.map((v) =>
          Object.assign({}, v, {
            params: Object.assign({}, p, v.params),
            pathname: D([
              l,
              i.encodeLocation
                ? i.encodeLocation(v.pathname).pathname
                : v.pathname,
            ]),
            pathnameBase:
              v.pathnameBase === "/"
                ? l
                : D([
                    l,
                    i.encodeLocation
                      ? i.encodeLocation(v.pathnameBase).pathname
                      : v.pathnameBase,
                  ]),
          }),
        ),
      s,
      n,
      r,
    );
  return t && C
    ? d.createElement(
        ne.Provider,
        {
          value: {
            location: X(
              {
                pathname: "/",
                search: "",
                hash: "",
                state: null,
                key: "default",
              },
              f,
            ),
            navigationType: k.Pop,
          },
        },
        C,
      )
    : C;
}
function At() {
  let e = Bt(),
    t = St(e)
      ? e.status + " " + e.statusText
      : e instanceof Error
        ? e.message
        : JSON.stringify(e),
    n = e instanceof Error ? e.stack : null,
    i = { padding: "0.5rem", backgroundColor: "rgba(200,200,200, 0.5)" };
  return d.createElement(
    d.Fragment,
    null,
    d.createElement("h2", null, "Unexpected Application Error!"),
    d.createElement("h3", { style: { fontStyle: "italic" } }, t),
    n ? d.createElement("pre", { style: i }, n) : null,
    null,
  );
}
const Ut = d.createElement(At, null);
class jt extends d.Component {
  constructor(t) {
    (super(t),
      (this.state = {
        location: t.location,
        revalidation: t.revalidation,
        error: t.error,
      }));
  }
  static getDerivedStateFromError(t) {
    return { error: t };
  }
  static getDerivedStateFromProps(t, n) {
    return n.location !== t.location ||
      (n.revalidation !== "idle" && t.revalidation === "idle")
      ? { error: t.error, location: t.location, revalidation: t.revalidation }
      : {
          error: t.error !== void 0 ? t.error : n.error,
          location: n.location,
          revalidation: t.revalidation || n.revalidation,
        };
  }
  componentDidCatch(t, n) {
    console.error(
      "React Router caught the following error during render",
      t,
      n,
    );
  }
  render() {
    return this.state.error !== void 0
      ? d.createElement(
          $.Provider,
          { value: this.props.routeContext },
          d.createElement(Ie.Provider, {
            value: this.state.error,
            children: this.props.component,
          }),
        )
      : this.props.children;
  }
}
function It(e) {
  let { routeContext: t, match: n, children: r } = e,
    i = d.useContext(te);
  return (
    i &&
      i.static &&
      i.staticContext &&
      (n.route.errorElement || n.route.ErrorBoundary) &&
      (i.staticContext._deepestRenderedBoundaryId = n.route.id),
    d.createElement($.Provider, { value: t }, r)
  );
}
function $t(e, t, n, r) {
  var i;
  if (
    (t === void 0 && (t = []),
    n === void 0 && (n = null),
    r === void 0 && (r = null),
    e == null)
  ) {
    var s;
    if (!n) return null;
    if (n.errors) e = n.matches;
    else if (
      (s = r) != null &&
      s.v7_partialHydration &&
      t.length === 0 &&
      !n.initialized &&
      n.matches.length > 0
    )
      e = n.matches;
    else return null;
  }
  let u = e,
    p = (i = n) == null ? void 0 : i.errors;
  if (p != null) {
    let f = u.findIndex((h) => h.route.id && p?.[h.route.id] !== void 0);
    (f >= 0 || N(!1), (u = u.slice(0, Math.min(u.length, f + 1))));
  }
  let l = !1,
    o = -1;
  if (n && r && r.v7_partialHydration)
    for (let f = 0; f < u.length; f++) {
      let h = u[f];
      if (
        ((h.route.HydrateFallback || h.route.hydrateFallbackElement) && (o = f),
        h.route.id)
      ) {
        let { loaderData: E, errors: O } = n,
          P =
            h.route.loader &&
            E[h.route.id] === void 0 &&
            (!O || O[h.route.id] === void 0);
        if (h.route.lazy || P) {
          ((l = !0), o >= 0 ? (u = u.slice(0, o + 1)) : (u = [u[0]]));
          break;
        }
      }
    }
  return u.reduceRight((f, h, E) => {
    let O,
      P = !1,
      C = null,
      v = null;
    n &&
      ((O = p && h.route.id ? p[h.route.id] : void 0),
      (C = h.route.errorElement || Ut),
      l &&
        (o < 0 && E === 0
          ? (Wt("route-fallback"), (P = !0), (v = null))
          : o === E &&
            ((P = !0), (v = h.route.hydrateFallbackElement || null))));
    let S = t.concat(u.slice(0, E + 1)),
      R = () => {
        let x;
        return (
          O
            ? (x = C)
            : P
              ? (x = v)
              : h.route.Component
                ? (x = d.createElement(h.route.Component, null))
                : h.route.element
                  ? (x = h.route.element)
                  : (x = f),
          d.createElement(It, {
            match: h,
            routeContext: { outlet: f, matches: S, isDataRoute: n != null },
            children: x,
          })
        );
      };
    return n && (h.route.ErrorBoundary || h.route.errorElement || E === 0)
      ? d.createElement(jt, {
          location: n.location,
          revalidation: n.revalidation,
          component: C,
          error: O,
          children: R(),
          routeContext: { outlet: null, matches: S, isDataRoute: !0 },
        })
      : R();
  }, null);
}
var ke = (function (e) {
    return (
      (e.UseBlocker = "useBlocker"),
      (e.UseRevalidator = "useRevalidator"),
      (e.UseNavigateStable = "useNavigate"),
      e
    );
  })(ke || {}),
  De = (function (e) {
    return (
      (e.UseBlocker = "useBlocker"),
      (e.UseLoaderData = "useLoaderData"),
      (e.UseActionData = "useActionData"),
      (e.UseRouteError = "useRouteError"),
      (e.UseNavigation = "useNavigation"),
      (e.UseRouteLoaderData = "useRouteLoaderData"),
      (e.UseMatches = "useMatches"),
      (e.UseRevalidator = "useRevalidator"),
      (e.UseNavigateStable = "useNavigate"),
      (e.UseRouteId = "useRouteId"),
      e
    );
  })(De || {});
function Mt(e) {
  let t = d.useContext(te);
  return (t || N(!1), t);
}
function kt(e) {
  let t = d.useContext(je);
  return (t || N(!1), t);
}
function Dt(e) {
  let t = d.useContext($);
  return (t || N(!1), t);
}
function Be(e) {
  let t = Dt(),
    n = t.matches[t.matches.length - 1];
  return (n.route.id || N(!1), n.route.id);
}
function Bt() {
  var e;
  let t = d.useContext(Ie),
    n = kt(),
    r = Be();
  return t !== void 0 ? t : (e = n.errors) == null ? void 0 : e[r];
}
function Ht() {
  let { router: e } = Mt(ke.UseNavigateStable),
    t = Be(De.UseNavigateStable),
    n = d.useRef(!1);
  return (
    $e(() => {
      n.current = !0;
    }),
    d.useCallback(
      function (i, s) {
        (s === void 0 && (s = {}),
          n.current &&
            (typeof i == "number"
              ? e.navigate(i)
              : e.navigate(i, X({ fromRouteId: t }, s))));
      },
      [e, t],
    )
  );
}
const Te = {};
function Wt(e, t, n) {
  Te[e] || (Te[e] = !0);
}
function zt(e, t) {
  (e?.v7_startTransition, e?.v7_relativeSplatPath);
}
function sn(e) {
  let { to: t, replace: n, state: r, relative: i } = e;
  F() || N(!1);
  let { future: s, static: u } = d.useContext(M),
    { matches: p } = d.useContext($),
    { pathname: l } = q(),
    o = Me(),
    f = he(t, pe(p, s.v7_relativeSplatPath), l, i === "path"),
    h = JSON.stringify(f);
  return (
    d.useEffect(
      () => o(JSON.parse(h), { replace: n, state: r, relative: i }),
      [o, h, i, n, r],
    ),
    null
  );
}
function un(e) {
  return bt(e.context);
}
function Yt(e) {
  N(!1);
}
function Ft(e) {
  let {
    basename: t = "/",
    children: n = null,
    location: r,
    navigationType: i = k.Pop,
    navigator: s,
    static: u = !1,
    future: p,
  } = e;
  F() && N(!1);
  let l = t.replace(/^\/*/, "/"),
    o = d.useMemo(
      () => ({
        basename: l,
        navigator: s,
        static: u,
        future: X({ v7_relativeSplatPath: !1 }, p),
      }),
      [l, p, s, u],
    );
  typeof r == "string" && (r = Y(r));
  let {
      pathname: f = "/",
      search: h = "",
      hash: E = "",
      state: O = null,
      key: P = "default",
    } = r,
    C = d.useMemo(() => {
      let v = z(f, l);
      return v == null
        ? null
        : {
            location: { pathname: v, search: h, hash: E, state: O, key: P },
            navigationType: i,
          };
    }, [l, f, h, E, O, P, i]);
  return C == null
    ? null
    : d.createElement(
        M.Provider,
        { value: o },
        d.createElement(ne.Provider, { children: n, value: C }),
      );
}
function cn(e) {
  let { children: t, location: n } = e;
  return Lt(ce(t), n);
}
new Promise(() => {});
function ce(e, t) {
  t === void 0 && (t = []);
  let n = [];
  return (
    d.Children.forEach(e, (r, i) => {
      if (!d.isValidElement(r)) return;
      let s = [...t, i];
      if (r.type === d.Fragment) {
        n.push.apply(n, ce(r.props.children, s));
        return;
      }
      (r.type !== Yt && N(!1), !r.props.index || !r.props.children || N(!1));
      let u = {
        id: r.props.id || s.join("-"),
        caseSensitive: r.props.caseSensitive,
        element: r.props.element,
        Component: r.props.Component,
        index: r.props.index,
        path: r.props.path,
        loader: r.props.loader,
        action: r.props.action,
        errorElement: r.props.errorElement,
        ErrorBoundary: r.props.ErrorBoundary,
        hasErrorBoundary:
          r.props.ErrorBoundary != null || r.props.errorElement != null,
        shouldRevalidate: r.props.shouldRevalidate,
        handle: r.props.handle,
        lazy: r.props.lazy,
      };
      (r.props.children && (u.children = ce(r.props.children, s)), n.push(u));
    }),
    n
  );
}
function ee() {
  return (
    (ee = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    ee.apply(this, arguments)
  );
}
function He(e, t) {
  if (e == null) return {};
  var n = {},
    r = Object.keys(e),
    i,
    s;
  for (s = 0; s < r.length; s++)
    ((i = r[s]), !(t.indexOf(i) >= 0) && (n[i] = e[i]));
  return n;
}
function qt(e) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}
function Vt(e, t) {
  return e.button === 0 && (!t || t === "_self") && !qt(e);
}
const Kt = [
    "onClick",
    "relative",
    "reloadDocument",
    "replace",
    "state",
    "target",
    "to",
    "preventScrollReset",
    "viewTransition",
  ],
  Gt = [
    "aria-current",
    "caseSensitive",
    "className",
    "end",
    "style",
    "to",
    "viewTransition",
    "children",
  ],
  Jt = "6";
try {
  window.__reactRouterVersion = Jt;
} catch {}
const Xt = d.createContext({ isTransitioning: !1 }),
  Qt = "startTransition",
  we = Je[Qt];
function fn(e) {
  let { basename: t, children: n, future: r, window: i } = e,
    s = d.useRef();
  s.current == null && (s.current = et({ window: i, v5Compat: !0 }));
  let u = s.current,
    [p, l] = d.useState({ action: u.action, location: u.location }),
    { v7_startTransition: o } = r || {},
    f = d.useCallback(
      (h) => {
        o && we ? we(() => l(h)) : l(h);
      },
      [l, o],
    );
  return (
    d.useLayoutEffect(() => u.listen(f), [u, f]),
    d.useEffect(() => zt(r), [r]),
    d.createElement(Ft, {
      basename: t,
      children: n,
      location: p.location,
      navigationType: p.action,
      navigator: u,
      future: r,
    })
  );
}
const Zt =
    typeof window < "u" &&
    typeof window.document < "u" &&
    typeof window.document.createElement < "u",
  en = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  tn = d.forwardRef(function (t, n) {
    let {
        onClick: r,
        relative: i,
        reloadDocument: s,
        replace: u,
        state: p,
        target: l,
        to: o,
        preventScrollReset: f,
        viewTransition: h,
      } = t,
      E = He(t, Kt),
      { basename: O } = d.useContext(M),
      P,
      C = !1;
    if (typeof o == "string" && en.test(o) && ((P = o), Zt))
      try {
        let x = new URL(window.location.href),
          b = o.startsWith("//") ? new URL(x.protocol + o) : new URL(o),
          j = z(b.pathname, O);
        b.origin === x.origin && j != null
          ? (o = j + b.search + b.hash)
          : (C = !0);
      } catch {}
    let v = Tt(o, { relative: i }),
      S = rn(o, {
        replace: u,
        state: p,
        target: l,
        preventScrollReset: f,
        relative: i,
        viewTransition: h,
      });
    function R(x) {
      (r && r(x), x.defaultPrevented || S(x));
    }
    return d.createElement(
      "a",
      ee({}, E, { href: P || v, onClick: C || s ? r : R, ref: n, target: l }),
    );
  }),
  dn = d.forwardRef(function (t, n) {
    let {
        "aria-current": r = "page",
        caseSensitive: i = !1,
        className: s = "",
        end: u = !1,
        style: p,
        to: l,
        viewTransition: o,
        children: f,
      } = t,
      h = He(t, Gt),
      E = re(l, { relative: h.relative }),
      O = q(),
      P = d.useContext(je),
      { navigator: C, basename: v } = d.useContext(M),
      S = P != null && an(E) && o === !0,
      R = C.encodeLocation ? C.encodeLocation(E).pathname : E.pathname,
      x = O.pathname,
      b =
        P && P.navigation && P.navigation.location
          ? P.navigation.location.pathname
          : null;
    (i ||
      ((x = x.toLowerCase()),
      (b = b ? b.toLowerCase() : null),
      (R = R.toLowerCase())),
      b && v && (b = z(b, v) || b));
    const j = R !== "/" && R.endsWith("/") ? R.length - 1 : R.length;
    let B = x === R || (!u && x.startsWith(R) && x.charAt(j) === "/"),
      T =
        b != null &&
        (b === R || (!u && b.startsWith(R) && b.charAt(R.length) === "/")),
      H = { isActive: B, isPending: T, isTransitioning: S },
      V = B ? r : void 0,
      K;
    typeof s == "function"
      ? (K = s(H))
      : (K = [
          s,
          B ? "active" : null,
          T ? "pending" : null,
          S ? "transitioning" : null,
        ]
          .filter(Boolean)
          .join(" "));
    let G = typeof p == "function" ? p(H) : p;
    return d.createElement(
      tn,
      ee({}, h, {
        "aria-current": V,
        className: K,
        ref: n,
        style: G,
        to: l,
        viewTransition: o,
      }),
      typeof f == "function" ? f(H) : f,
    );
  });
var fe;
(function (e) {
  ((e.UseScrollRestoration = "useScrollRestoration"),
    (e.UseSubmit = "useSubmit"),
    (e.UseSubmitFetcher = "useSubmitFetcher"),
    (e.UseFetcher = "useFetcher"),
    (e.useViewTransitionState = "useViewTransitionState"));
})(fe || (fe = {}));
var Oe;
(function (e) {
  ((e.UseFetcher = "useFetcher"),
    (e.UseFetchers = "useFetchers"),
    (e.UseScrollRestoration = "useScrollRestoration"));
})(Oe || (Oe = {}));
function nn(e) {
  let t = d.useContext(te);
  return (t || N(!1), t);
}
function rn(e, t) {
  let {
      target: n,
      replace: r,
      state: i,
      preventScrollReset: s,
      relative: u,
      viewTransition: p,
    } = t === void 0 ? {} : t,
    l = Me(),
    o = q(),
    f = re(e, { relative: u });
  return d.useCallback(
    (h) => {
      if (Vt(h, n)) {
        h.preventDefault();
        let E = r !== void 0 ? r : Z(o) === Z(f);
        l(e, {
          replace: E,
          state: i,
          preventScrollReset: s,
          relative: u,
          viewTransition: p,
        });
      }
    },
    [o, l, f, r, i, n, e, s, u, p],
  );
}
function an(e, t) {
  t === void 0 && (t = {});
  let n = d.useContext(Xt);
  n == null && N(!1);
  let { basename: r } = nn(fe.useViewTransitionState),
    i = re(e, { relative: t.relative });
  if (!n.isTransitioning) return !1;
  let s = z(n.currentLocation.pathname, r) || n.currentLocation.pathname,
    u = z(n.nextLocation.pathname, r) || n.nextLocation.pathname;
  return ue(i.pathname, u) != null || ue(i.pathname, s) != null;
}
export {
  fn as B,
  tn as L,
  dn as N,
  un as O,
  Ge as R,
  on as a,
  Le as b,
  Ze as c,
  Je as d,
  Qe as e,
  Me as f,
  be as g,
  sn as h,
  cn as i,
  Yt as j,
  ln as k,
  d as r,
  q as u,
};
