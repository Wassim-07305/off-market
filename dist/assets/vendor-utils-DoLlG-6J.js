import { R as kt } from "./vendor-react-Cci7g3Cb.js";
const At = (t) => {
    let e;
    const n = new Set(),
      r = (c, b) => {
        const S = typeof c == "function" ? c(e) : c;
        if (!Object.is(S, e)) {
          const R = e;
          ((e =
            (b ?? (typeof S != "object" || S === null))
              ? S
              : Object.assign({}, e, S)),
            n.forEach((Q) => Q(e, R)));
        }
      },
      a = () => e,
      h = {
        setState: r,
        getState: a,
        getInitialState: () => x,
        subscribe: (c) => (n.add(c), () => n.delete(c)),
      },
      x = (e = t(r, a, h));
    return h;
  },
  ae = (t) => (t ? At(t) : At),
  ie = (t) => t;
function se(t, e = ie) {
  const n = kt.useSyncExternalStore(
    t.subscribe,
    kt.useCallback(() => e(t.getState()), [t, e]),
    kt.useCallback(() => e(t.getInitialState()), [t, e]),
  );
  return (kt.useDebugValue(n), n);
}
const oe = (t) => {
    const e = ae(t),
      n = (r) => se(e, r);
    return (Object.assign(n, e), n);
  },
  Hn = (t) => oe,
  Qt = 6048e5,
  ue = 864e5,
  $t = 6e4,
  Gt = 36e5,
  Dt = 43200,
  qt = 1440,
  jt = Symbol.for("constructDateFrom");
function B(t, e) {
  return typeof t == "function"
    ? t(e)
    : t && typeof t == "object" && jt in t
      ? t[jt](e)
      : t instanceof Date
        ? new t.constructor(e)
        : new Date(e);
}
function W(t, e) {
  return B(e || t, t);
}
function Jt(t, e, n) {
  const r = W(t, n?.in);
  return isNaN(e) ? B(t, NaN) : (e && r.setDate(r.getDate() + e), r);
}
function Un(t, e, n) {
  const r = W(t, n?.in);
  if (isNaN(e)) return B(t, NaN);
  if (!e) return r;
  const a = r.getDate(),
    u = B(t, r.getTime());
  u.setMonth(r.getMonth() + e + 1, 0);
  const l = u.getDate();
  return a >= l ? u : (r.setFullYear(u.getFullYear(), u.getMonth(), a), r);
}
let ce = {};
function _t() {
  return ce;
}
function ut(t, e) {
  const n = _t(),
    r =
      e?.weekStartsOn ??
      e?.locale?.options?.weekStartsOn ??
      n.weekStartsOn ??
      n.locale?.options?.weekStartsOn ??
      0,
    a = W(t, e?.in),
    u = a.getDay(),
    l = (u < r ? 7 : 0) + u - r;
  return (a.setDate(a.getDate() - l), a.setHours(0, 0, 0, 0), a);
}
function Mt(t, e) {
  return ut(t, { ...e, weekStartsOn: 1 });
}
function Kt(t, e) {
  const n = W(t, e?.in),
    r = n.getFullYear(),
    a = B(n, 0);
  (a.setFullYear(r + 1, 0, 4), a.setHours(0, 0, 0, 0));
  const u = Mt(a),
    l = B(n, 0);
  (l.setFullYear(r, 0, 4), l.setHours(0, 0, 0, 0));
  const h = Mt(l);
  return n.getTime() >= u.getTime()
    ? r + 1
    : n.getTime() >= h.getTime()
      ? r
      : r - 1;
}
function xt(t) {
  const e = W(t),
    n = new Date(
      Date.UTC(
        e.getFullYear(),
        e.getMonth(),
        e.getDate(),
        e.getHours(),
        e.getMinutes(),
        e.getSeconds(),
        e.getMilliseconds(),
      ),
    );
  return (n.setUTCFullYear(e.getFullYear()), +t - +n);
}
function lt(t, ...e) {
  const n = B.bind(null, t || e.find((r) => typeof r == "object"));
  return e.map(n);
}
function Et(t, e) {
  const n = W(t, e?.in);
  return (n.setHours(0, 0, 0, 0), n);
}
function de(t, e, n) {
  const [r, a] = lt(n?.in, t, e),
    u = Et(r),
    l = Et(a),
    h = +u - xt(u),
    x = +l - xt(l);
  return Math.round((h - x) / ue);
}
function fe(t, e) {
  const n = Kt(t, e),
    r = B(t, 0);
  return (r.setFullYear(n, 0, 4), r.setHours(0, 0, 0, 0), Mt(r));
}
function he(t, e, n) {
  return Jt(t, e * 7, n);
}
function Ot(t, e) {
  const n = +W(t) - +W(e);
  return n < 0 ? -1 : n > 0 ? 1 : n;
}
function Tt(t) {
  return B(t, Date.now());
}
function Vt(t, e, n) {
  const [r, a] = lt(n?.in, t, e);
  return +Et(r) == +Et(a);
}
function le(t) {
  return (
    t instanceof Date ||
    (typeof t == "object" &&
      Object.prototype.toString.call(t) === "[object Date]")
  );
}
function me(t) {
  return !((!le(t) && typeof t != "number") || isNaN(+W(t)));
}
function ge(t, e, n) {
  const [r, a] = lt(n?.in, t, e),
    u = r.getFullYear() - a.getFullYear(),
    l = r.getMonth() - a.getMonth();
  return u * 12 + l;
}
function pe(t) {
  return (e) => {
    const r = (t ? Math[t] : Math.trunc)(e);
    return r === 0 ? 0 : r;
  };
}
function ye(t, e) {
  return +W(t) - +W(e);
}
function we(t, e) {
  const n = W(t, e?.in);
  return (n.setHours(23, 59, 59, 999), n);
}
function be(t, e) {
  const n = W(t, e?.in),
    r = n.getMonth();
  return (
    n.setFullYear(n.getFullYear(), r + 1, 0),
    n.setHours(23, 59, 59, 999),
    n
  );
}
function _e(t, e) {
  const n = W(t, e?.in);
  return +we(n, e) == +be(n, e);
}
function ke(t, e, n) {
  const [r, a, u] = lt(n?.in, t, t, e),
    l = Ot(a, u),
    h = Math.abs(ge(a, u));
  if (h < 1) return 0;
  (a.getMonth() === 1 && a.getDate() > 27 && a.setDate(30),
    a.setMonth(a.getMonth() - l * h));
  let x = Ot(a, u) === -l;
  _e(r) && h === 1 && Ot(r, u) === 1 && (x = !1);
  const c = l * (h - +x);
  return c === 0 ? 0 : c;
}
function De(t, e, n) {
  const r = ye(t, e) / 1e3;
  return pe(n?.roundingMethod)(r);
}
function zn(t, e) {
  const n = W(t, e?.in);
  return (n.setDate(1), n.setHours(0, 0, 0, 0), n);
}
function ve(t, e) {
  const n = W(t, e?.in);
  return (n.setFullYear(n.getFullYear(), 0, 1), n.setHours(0, 0, 0, 0), n);
}
function Xn(t, e) {
  const n = e?.weekStartsOn,
    r = W(t, e?.in),
    a = r.getDay(),
    u = (a < n ? -7 : 0) + 6 - (a - n);
  return (r.setDate(r.getDate() + u), r.setHours(23, 59, 59, 999), r);
}
const Oe = {
    lessThanXSeconds: {
      one: "less than a second",
      other: "less than {{count}} seconds",
    },
    xSeconds: { one: "1 second", other: "{{count}} seconds" },
    halfAMinute: "half a minute",
    lessThanXMinutes: {
      one: "less than a minute",
      other: "less than {{count}} minutes",
    },
    xMinutes: { one: "1 minute", other: "{{count}} minutes" },
    aboutXHours: { one: "about 1 hour", other: "about {{count}} hours" },
    xHours: { one: "1 hour", other: "{{count}} hours" },
    xDays: { one: "1 day", other: "{{count}} days" },
    aboutXWeeks: { one: "about 1 week", other: "about {{count}} weeks" },
    xWeeks: { one: "1 week", other: "{{count}} weeks" },
    aboutXMonths: { one: "about 1 month", other: "about {{count}} months" },
    xMonths: { one: "1 month", other: "{{count}} months" },
    aboutXYears: { one: "about 1 year", other: "about {{count}} years" },
    xYears: { one: "1 year", other: "{{count}} years" },
    overXYears: { one: "over 1 year", other: "over {{count}} years" },
    almostXYears: { one: "almost 1 year", other: "almost {{count}} years" },
  },
  Se = (t, e, n) => {
    let r;
    const a = Oe[t];
    return (
      typeof a == "string"
        ? (r = a)
        : e === 1
          ? (r = a.one)
          : (r = a.other.replace("{{count}}", e.toString())),
      n?.addSuffix
        ? n.comparison && n.comparison > 0
          ? "in " + r
          : r + " ago"
        : r
    );
  };
function Wt(t) {
  return (e = {}) => {
    const n = e.width ? String(e.width) : t.defaultWidth;
    return t.formats[n] || t.formats[t.defaultWidth];
  };
}
const Me = {
    full: "EEEE, MMMM do, y",
    long: "MMMM do, y",
    medium: "MMM d, y",
    short: "MM/dd/yyyy",
  },
  xe = {
    full: "h:mm:ss a zzzz",
    long: "h:mm:ss a z",
    medium: "h:mm:ss a",
    short: "h:mm a",
  },
  Ee = {
    full: "{{date}} 'at' {{time}}",
    long: "{{date}} 'at' {{time}}",
    medium: "{{date}}, {{time}}",
    short: "{{date}}, {{time}}",
  },
  Te = {
    date: Wt({ formats: Me, defaultWidth: "full" }),
    time: Wt({ formats: xe, defaultWidth: "full" }),
    dateTime: Wt({ formats: Ee, defaultWidth: "full" }),
  },
  Ce = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: "P",
  },
  Pe = (t, e, n, r) => Ce[t];
function yt(t) {
  return (e, n) => {
    const r = n?.context ? String(n.context) : "standalone";
    let a;
    if (r === "formatting" && t.formattingValues) {
      const l = t.defaultFormattingWidth || t.defaultWidth,
        h = n?.width ? String(n.width) : l;
      a = t.formattingValues[h] || t.formattingValues[l];
    } else {
      const l = t.defaultWidth,
        h = n?.width ? String(n.width) : t.defaultWidth;
      a = t.values[h] || t.values[l];
    }
    const u = t.argumentCallback ? t.argumentCallback(e) : e;
    return a[u];
  };
}
const Re = {
    narrow: ["B", "A"],
    abbreviated: ["BC", "AD"],
    wide: ["Before Christ", "Anno Domini"],
  },
  We = {
    narrow: ["1", "2", "3", "4"],
    abbreviated: ["Q1", "Q2", "Q3", "Q4"],
    wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"],
  },
  Fe = {
    narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    abbreviated: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    wide: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  Ie = {
    narrow: ["S", "M", "T", "W", "T", "F", "S"],
    short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    wide: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  },
  Ne = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night",
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night",
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night",
    },
  },
  Ye = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night",
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night",
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night",
    },
  },
  Le = (t, e) => {
    const n = Number(t),
      r = n % 100;
    if (r > 20 || r < 10)
      switch (r % 10) {
        case 1:
          return n + "st";
        case 2:
          return n + "nd";
        case 3:
          return n + "rd";
      }
    return n + "th";
  },
  Ae = {
    ordinalNumber: Le,
    era: yt({ values: Re, defaultWidth: "wide" }),
    quarter: yt({
      values: We,
      defaultWidth: "wide",
      argumentCallback: (t) => t - 1,
    }),
    month: yt({ values: Fe, defaultWidth: "wide" }),
    day: yt({ values: Ie, defaultWidth: "wide" }),
    dayPeriod: yt({
      values: Ne,
      defaultWidth: "wide",
      formattingValues: Ye,
      defaultFormattingWidth: "wide",
    }),
  };
function wt(t) {
  return (e, n = {}) => {
    const r = n.width,
      a = (r && t.matchPatterns[r]) || t.matchPatterns[t.defaultMatchWidth],
      u = e.match(a);
    if (!u) return null;
    const l = u[0],
      h = (r && t.parsePatterns[r]) || t.parsePatterns[t.defaultParseWidth],
      x = Array.isArray(h) ? je(h, (S) => S.test(l)) : qe(h, (S) => S.test(l));
    let c;
    ((c = t.valueCallback ? t.valueCallback(x) : x),
      (c = n.valueCallback ? n.valueCallback(c) : c));
    const b = e.slice(l.length);
    return { value: c, rest: b };
  };
}
function qe(t, e) {
  for (const n in t)
    if (Object.prototype.hasOwnProperty.call(t, n) && e(t[n])) return n;
}
function je(t, e) {
  for (let n = 0; n < t.length; n++) if (e(t[n])) return n;
}
function He(t) {
  return (e, n = {}) => {
    const r = e.match(t.matchPattern);
    if (!r) return null;
    const a = r[0],
      u = e.match(t.parsePattern);
    if (!u) return null;
    let l = t.valueCallback ? t.valueCallback(u[0]) : u[0];
    l = n.valueCallback ? n.valueCallback(l) : l;
    const h = e.slice(a.length);
    return { value: l, rest: h };
  };
}
const Ue = /^(\d+)(th|st|nd|rd)?/i,
  ze = /\d+/i,
  Xe = {
    narrow: /^(b|a)/i,
    abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
    wide: /^(before christ|before common era|anno domini|common era)/i,
  },
  Be = { any: [/^b/i, /^(a|c)/i] },
  Qe = {
    narrow: /^[1234]/i,
    abbreviated: /^q[1234]/i,
    wide: /^[1234](th|st|nd|rd)? quarter/i,
  },
  $e = { any: [/1/i, /2/i, /3/i, /4/i] },
  Ge = {
    narrow: /^[jfmasond]/i,
    abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i,
  },
  Je = {
    narrow: [
      /^j/i,
      /^f/i,
      /^m/i,
      /^a/i,
      /^m/i,
      /^j/i,
      /^j/i,
      /^a/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i,
    ],
    any: [
      /^ja/i,
      /^f/i,
      /^mar/i,
      /^ap/i,
      /^may/i,
      /^jun/i,
      /^jul/i,
      /^au/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i,
    ],
  },
  Ke = {
    narrow: /^[smtwf]/i,
    short: /^(su|mo|tu|we|th|fr|sa)/i,
    abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
    wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i,
  },
  Ve = {
    narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
    any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i],
  },
  Ze = {
    narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
    any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i,
  },
  tn = {
    any: {
      am: /^a/i,
      pm: /^p/i,
      midnight: /^mi/i,
      noon: /^no/i,
      morning: /morning/i,
      afternoon: /afternoon/i,
      evening: /evening/i,
      night: /night/i,
    },
  },
  en = {
    ordinalNumber: He({
      matchPattern: Ue,
      parsePattern: ze,
      valueCallback: (t) => parseInt(t, 10),
    }),
    era: wt({
      matchPatterns: Xe,
      defaultMatchWidth: "wide",
      parsePatterns: Be,
      defaultParseWidth: "any",
    }),
    quarter: wt({
      matchPatterns: Qe,
      defaultMatchWidth: "wide",
      parsePatterns: $e,
      defaultParseWidth: "any",
      valueCallback: (t) => t + 1,
    }),
    month: wt({
      matchPatterns: Ge,
      defaultMatchWidth: "wide",
      parsePatterns: Je,
      defaultParseWidth: "any",
    }),
    day: wt({
      matchPatterns: Ke,
      defaultMatchWidth: "wide",
      parsePatterns: Ve,
      defaultParseWidth: "any",
    }),
    dayPeriod: wt({
      matchPatterns: Ze,
      defaultMatchWidth: "any",
      parsePatterns: tn,
      defaultParseWidth: "any",
    }),
  },
  Zt = {
    code: "en-US",
    formatDistance: Se,
    formatLong: Te,
    formatRelative: Pe,
    localize: Ae,
    match: en,
    options: { weekStartsOn: 0, firstWeekContainsDate: 1 },
  };
function nn(t, e) {
  const n = W(t, e?.in);
  return de(n, ve(n)) + 1;
}
function rn(t, e) {
  const n = W(t, e?.in),
    r = +Mt(n) - +fe(n);
  return Math.round(r / Qt) + 1;
}
function te(t, e) {
  const n = W(t, e?.in),
    r = n.getFullYear(),
    a = _t(),
    u =
      e?.firstWeekContainsDate ??
      e?.locale?.options?.firstWeekContainsDate ??
      a.firstWeekContainsDate ??
      a.locale?.options?.firstWeekContainsDate ??
      1,
    l = B(e?.in || t, 0);
  (l.setFullYear(r + 1, 0, u), l.setHours(0, 0, 0, 0));
  const h = ut(l, e),
    x = B(e?.in || t, 0);
  (x.setFullYear(r, 0, u), x.setHours(0, 0, 0, 0));
  const c = ut(x, e);
  return +n >= +h ? r + 1 : +n >= +c ? r : r - 1;
}
function an(t, e) {
  const n = _t(),
    r =
      e?.firstWeekContainsDate ??
      e?.locale?.options?.firstWeekContainsDate ??
      n.firstWeekContainsDate ??
      n.locale?.options?.firstWeekContainsDate ??
      1,
    a = te(t, e),
    u = B(e?.in || t, 0);
  return (u.setFullYear(a, 0, r), u.setHours(0, 0, 0, 0), ut(u, e));
}
function sn(t, e) {
  const n = W(t, e?.in),
    r = +ut(n, e) - +an(n, e);
  return Math.round(r / Qt) + 1;
}
function E(t, e) {
  const n = t < 0 ? "-" : "",
    r = Math.abs(t).toString().padStart(e, "0");
  return n + r;
}
const st = {
    y(t, e) {
      const n = t.getFullYear(),
        r = n > 0 ? n : 1 - n;
      return E(e === "yy" ? r % 100 : r, e.length);
    },
    M(t, e) {
      const n = t.getMonth();
      return e === "M" ? String(n + 1) : E(n + 1, 2);
    },
    d(t, e) {
      return E(t.getDate(), e.length);
    },
    a(t, e) {
      const n = t.getHours() / 12 >= 1 ? "pm" : "am";
      switch (e) {
        case "a":
        case "aa":
          return n.toUpperCase();
        case "aaa":
          return n;
        case "aaaaa":
          return n[0];
        default:
          return n === "am" ? "a.m." : "p.m.";
      }
    },
    h(t, e) {
      return E(t.getHours() % 12 || 12, e.length);
    },
    H(t, e) {
      return E(t.getHours(), e.length);
    },
    m(t, e) {
      return E(t.getMinutes(), e.length);
    },
    s(t, e) {
      return E(t.getSeconds(), e.length);
    },
    S(t, e) {
      const n = e.length,
        r = t.getMilliseconds(),
        a = Math.trunc(r * Math.pow(10, n - 3));
      return E(a, e.length);
    },
  },
  ht = {
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
  },
  Ht = {
    G: function (t, e, n) {
      const r = t.getFullYear() > 0 ? 1 : 0;
      switch (e) {
        case "G":
        case "GG":
        case "GGG":
          return n.era(r, { width: "abbreviated" });
        case "GGGGG":
          return n.era(r, { width: "narrow" });
        default:
          return n.era(r, { width: "wide" });
      }
    },
    y: function (t, e, n) {
      if (e === "yo") {
        const r = t.getFullYear(),
          a = r > 0 ? r : 1 - r;
        return n.ordinalNumber(a, { unit: "year" });
      }
      return st.y(t, e);
    },
    Y: function (t, e, n, r) {
      const a = te(t, r),
        u = a > 0 ? a : 1 - a;
      if (e === "YY") {
        const l = u % 100;
        return E(l, 2);
      }
      return e === "Yo" ? n.ordinalNumber(u, { unit: "year" }) : E(u, e.length);
    },
    R: function (t, e) {
      const n = Kt(t);
      return E(n, e.length);
    },
    u: function (t, e) {
      const n = t.getFullYear();
      return E(n, e.length);
    },
    Q: function (t, e, n) {
      const r = Math.ceil((t.getMonth() + 1) / 3);
      switch (e) {
        case "Q":
          return String(r);
        case "QQ":
          return E(r, 2);
        case "Qo":
          return n.ordinalNumber(r, { unit: "quarter" });
        case "QQQ":
          return n.quarter(r, { width: "abbreviated", context: "formatting" });
        case "QQQQQ":
          return n.quarter(r, { width: "narrow", context: "formatting" });
        default:
          return n.quarter(r, { width: "wide", context: "formatting" });
      }
    },
    q: function (t, e, n) {
      const r = Math.ceil((t.getMonth() + 1) / 3);
      switch (e) {
        case "q":
          return String(r);
        case "qq":
          return E(r, 2);
        case "qo":
          return n.ordinalNumber(r, { unit: "quarter" });
        case "qqq":
          return n.quarter(r, { width: "abbreviated", context: "standalone" });
        case "qqqqq":
          return n.quarter(r, { width: "narrow", context: "standalone" });
        default:
          return n.quarter(r, { width: "wide", context: "standalone" });
      }
    },
    M: function (t, e, n) {
      const r = t.getMonth();
      switch (e) {
        case "M":
        case "MM":
          return st.M(t, e);
        case "Mo":
          return n.ordinalNumber(r + 1, { unit: "month" });
        case "MMM":
          return n.month(r, { width: "abbreviated", context: "formatting" });
        case "MMMMM":
          return n.month(r, { width: "narrow", context: "formatting" });
        default:
          return n.month(r, { width: "wide", context: "formatting" });
      }
    },
    L: function (t, e, n) {
      const r = t.getMonth();
      switch (e) {
        case "L":
          return String(r + 1);
        case "LL":
          return E(r + 1, 2);
        case "Lo":
          return n.ordinalNumber(r + 1, { unit: "month" });
        case "LLL":
          return n.month(r, { width: "abbreviated", context: "standalone" });
        case "LLLLL":
          return n.month(r, { width: "narrow", context: "standalone" });
        default:
          return n.month(r, { width: "wide", context: "standalone" });
      }
    },
    w: function (t, e, n, r) {
      const a = sn(t, r);
      return e === "wo" ? n.ordinalNumber(a, { unit: "week" }) : E(a, e.length);
    },
    I: function (t, e, n) {
      const r = rn(t);
      return e === "Io" ? n.ordinalNumber(r, { unit: "week" }) : E(r, e.length);
    },
    d: function (t, e, n) {
      return e === "do"
        ? n.ordinalNumber(t.getDate(), { unit: "date" })
        : st.d(t, e);
    },
    D: function (t, e, n) {
      const r = nn(t);
      return e === "Do"
        ? n.ordinalNumber(r, { unit: "dayOfYear" })
        : E(r, e.length);
    },
    E: function (t, e, n) {
      const r = t.getDay();
      switch (e) {
        case "E":
        case "EE":
        case "EEE":
          return n.day(r, { width: "abbreviated", context: "formatting" });
        case "EEEEE":
          return n.day(r, { width: "narrow", context: "formatting" });
        case "EEEEEE":
          return n.day(r, { width: "short", context: "formatting" });
        default:
          return n.day(r, { width: "wide", context: "formatting" });
      }
    },
    e: function (t, e, n, r) {
      const a = t.getDay(),
        u = (a - r.weekStartsOn + 8) % 7 || 7;
      switch (e) {
        case "e":
          return String(u);
        case "ee":
          return E(u, 2);
        case "eo":
          return n.ordinalNumber(u, { unit: "day" });
        case "eee":
          return n.day(a, { width: "abbreviated", context: "formatting" });
        case "eeeee":
          return n.day(a, { width: "narrow", context: "formatting" });
        case "eeeeee":
          return n.day(a, { width: "short", context: "formatting" });
        default:
          return n.day(a, { width: "wide", context: "formatting" });
      }
    },
    c: function (t, e, n, r) {
      const a = t.getDay(),
        u = (a - r.weekStartsOn + 8) % 7 || 7;
      switch (e) {
        case "c":
          return String(u);
        case "cc":
          return E(u, e.length);
        case "co":
          return n.ordinalNumber(u, { unit: "day" });
        case "ccc":
          return n.day(a, { width: "abbreviated", context: "standalone" });
        case "ccccc":
          return n.day(a, { width: "narrow", context: "standalone" });
        case "cccccc":
          return n.day(a, { width: "short", context: "standalone" });
        default:
          return n.day(a, { width: "wide", context: "standalone" });
      }
    },
    i: function (t, e, n) {
      const r = t.getDay(),
        a = r === 0 ? 7 : r;
      switch (e) {
        case "i":
          return String(a);
        case "ii":
          return E(a, e.length);
        case "io":
          return n.ordinalNumber(a, { unit: "day" });
        case "iii":
          return n.day(r, { width: "abbreviated", context: "formatting" });
        case "iiiii":
          return n.day(r, { width: "narrow", context: "formatting" });
        case "iiiiii":
          return n.day(r, { width: "short", context: "formatting" });
        default:
          return n.day(r, { width: "wide", context: "formatting" });
      }
    },
    a: function (t, e, n) {
      const a = t.getHours() / 12 >= 1 ? "pm" : "am";
      switch (e) {
        case "a":
        case "aa":
          return n.dayPeriod(a, {
            width: "abbreviated",
            context: "formatting",
          });
        case "aaa":
          return n
            .dayPeriod(a, { width: "abbreviated", context: "formatting" })
            .toLowerCase();
        case "aaaaa":
          return n.dayPeriod(a, { width: "narrow", context: "formatting" });
        default:
          return n.dayPeriod(a, { width: "wide", context: "formatting" });
      }
    },
    b: function (t, e, n) {
      const r = t.getHours();
      let a;
      switch (
        (r === 12
          ? (a = ht.noon)
          : r === 0
            ? (a = ht.midnight)
            : (a = r / 12 >= 1 ? "pm" : "am"),
        e)
      ) {
        case "b":
        case "bb":
          return n.dayPeriod(a, {
            width: "abbreviated",
            context: "formatting",
          });
        case "bbb":
          return n
            .dayPeriod(a, { width: "abbreviated", context: "formatting" })
            .toLowerCase();
        case "bbbbb":
          return n.dayPeriod(a, { width: "narrow", context: "formatting" });
        default:
          return n.dayPeriod(a, { width: "wide", context: "formatting" });
      }
    },
    B: function (t, e, n) {
      const r = t.getHours();
      let a;
      switch (
        (r >= 17
          ? (a = ht.evening)
          : r >= 12
            ? (a = ht.afternoon)
            : r >= 4
              ? (a = ht.morning)
              : (a = ht.night),
        e)
      ) {
        case "B":
        case "BB":
        case "BBB":
          return n.dayPeriod(a, {
            width: "abbreviated",
            context: "formatting",
          });
        case "BBBBB":
          return n.dayPeriod(a, { width: "narrow", context: "formatting" });
        default:
          return n.dayPeriod(a, { width: "wide", context: "formatting" });
      }
    },
    h: function (t, e, n) {
      if (e === "ho") {
        let r = t.getHours() % 12;
        return (r === 0 && (r = 12), n.ordinalNumber(r, { unit: "hour" }));
      }
      return st.h(t, e);
    },
    H: function (t, e, n) {
      return e === "Ho"
        ? n.ordinalNumber(t.getHours(), { unit: "hour" })
        : st.H(t, e);
    },
    K: function (t, e, n) {
      const r = t.getHours() % 12;
      return e === "Ko" ? n.ordinalNumber(r, { unit: "hour" }) : E(r, e.length);
    },
    k: function (t, e, n) {
      let r = t.getHours();
      return (
        r === 0 && (r = 24),
        e === "ko" ? n.ordinalNumber(r, { unit: "hour" }) : E(r, e.length)
      );
    },
    m: function (t, e, n) {
      return e === "mo"
        ? n.ordinalNumber(t.getMinutes(), { unit: "minute" })
        : st.m(t, e);
    },
    s: function (t, e, n) {
      return e === "so"
        ? n.ordinalNumber(t.getSeconds(), { unit: "second" })
        : st.s(t, e);
    },
    S: function (t, e) {
      return st.S(t, e);
    },
    X: function (t, e, n) {
      const r = t.getTimezoneOffset();
      if (r === 0) return "Z";
      switch (e) {
        case "X":
          return zt(r);
        case "XXXX":
        case "XX":
          return ot(r);
        default:
          return ot(r, ":");
      }
    },
    x: function (t, e, n) {
      const r = t.getTimezoneOffset();
      switch (e) {
        case "x":
          return zt(r);
        case "xxxx":
        case "xx":
          return ot(r);
        default:
          return ot(r, ":");
      }
    },
    O: function (t, e, n) {
      const r = t.getTimezoneOffset();
      switch (e) {
        case "O":
        case "OO":
        case "OOO":
          return "GMT" + Ut(r, ":");
        default:
          return "GMT" + ot(r, ":");
      }
    },
    z: function (t, e, n) {
      const r = t.getTimezoneOffset();
      switch (e) {
        case "z":
        case "zz":
        case "zzz":
          return "GMT" + Ut(r, ":");
        default:
          return "GMT" + ot(r, ":");
      }
    },
    t: function (t, e, n) {
      const r = Math.trunc(+t / 1e3);
      return E(r, e.length);
    },
    T: function (t, e, n) {
      return E(+t, e.length);
    },
  };
function Ut(t, e = "") {
  const n = t > 0 ? "-" : "+",
    r = Math.abs(t),
    a = Math.trunc(r / 60),
    u = r % 60;
  return u === 0 ? n + String(a) : n + String(a) + e + E(u, 2);
}
function zt(t, e) {
  return t % 60 === 0 ? (t > 0 ? "-" : "+") + E(Math.abs(t) / 60, 2) : ot(t, e);
}
function ot(t, e = "") {
  const n = t > 0 ? "-" : "+",
    r = Math.abs(t),
    a = E(Math.trunc(r / 60), 2),
    u = E(r % 60, 2);
  return n + a + e + u;
}
const Xt = (t, e) => {
    switch (t) {
      case "P":
        return e.date({ width: "short" });
      case "PP":
        return e.date({ width: "medium" });
      case "PPP":
        return e.date({ width: "long" });
      default:
        return e.date({ width: "full" });
    }
  },
  ee = (t, e) => {
    switch (t) {
      case "p":
        return e.time({ width: "short" });
      case "pp":
        return e.time({ width: "medium" });
      case "ppp":
        return e.time({ width: "long" });
      default:
        return e.time({ width: "full" });
    }
  },
  on = (t, e) => {
    const n = t.match(/(P+)(p+)?/) || [],
      r = n[1],
      a = n[2];
    if (!a) return Xt(t, e);
    let u;
    switch (r) {
      case "P":
        u = e.dateTime({ width: "short" });
        break;
      case "PP":
        u = e.dateTime({ width: "medium" });
        break;
      case "PPP":
        u = e.dateTime({ width: "long" });
        break;
      default:
        u = e.dateTime({ width: "full" });
        break;
    }
    return u.replace("{{date}}", Xt(r, e)).replace("{{time}}", ee(a, e));
  },
  un = { p: ee, P: on },
  cn = /^D+$/,
  dn = /^Y+$/,
  fn = ["D", "DD", "YY", "YYYY"];
function hn(t) {
  return cn.test(t);
}
function ln(t) {
  return dn.test(t);
}
function mn(t, e, n) {
  const r = gn(t, e, n);
  if ((console.warn(r), fn.includes(t))) throw new RangeError(r);
}
function gn(t, e, n) {
  const r = t[0] === "Y" ? "years" : "days of the month";
  return `Use \`${t.toLowerCase()}\` instead of \`${t}\` (in \`${e}\`) for formatting ${r} to the input \`${n}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}
const pn = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,
  yn = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,
  wn = /^'([^]*?)'?$/,
  bn = /''/g,
  _n = /[a-zA-Z]/;
function Bn(t, e, n) {
  const r = _t(),
    a = n?.locale ?? r.locale ?? Zt,
    u =
      n?.firstWeekContainsDate ??
      n?.locale?.options?.firstWeekContainsDate ??
      r.firstWeekContainsDate ??
      r.locale?.options?.firstWeekContainsDate ??
      1,
    l =
      n?.weekStartsOn ??
      n?.locale?.options?.weekStartsOn ??
      r.weekStartsOn ??
      r.locale?.options?.weekStartsOn ??
      0,
    h = W(t, n?.in);
  if (!me(h)) throw new RangeError("Invalid time value");
  let x = e
    .match(yn)
    .map((b) => {
      const S = b[0];
      if (S === "p" || S === "P") {
        const R = un[S];
        return R(b, a.formatLong);
      }
      return b;
    })
    .join("")
    .match(pn)
    .map((b) => {
      if (b === "''") return { isToken: !1, value: "'" };
      const S = b[0];
      if (S === "'") return { isToken: !1, value: kn(b) };
      if (Ht[S]) return { isToken: !0, value: b };
      if (S.match(_n))
        throw new RangeError(
          "Format string contains an unescaped latin alphabet character `" +
            S +
            "`",
        );
      return { isToken: !1, value: b };
    });
  a.localize.preprocessor && (x = a.localize.preprocessor(h, x));
  const c = { firstWeekContainsDate: u, weekStartsOn: l, locale: a };
  return x
    .map((b) => {
      if (!b.isToken) return b.value;
      const S = b.value;
      ((!n?.useAdditionalWeekYearTokens && ln(S)) ||
        (!n?.useAdditionalDayOfYearTokens && hn(S))) &&
        mn(S, e, String(t));
      const R = Ht[S[0]];
      return R(h, S, a.localize, c);
    })
    .join("");
}
function kn(t) {
  const e = t.match(wn);
  return e ? e[1].replace(bn, "'") : t;
}
function Dn(t, e, n) {
  const r = _t(),
    a = n?.locale ?? r.locale ?? Zt,
    u = 2520,
    l = Ot(t, e);
  if (isNaN(l)) throw new RangeError("Invalid time value");
  const h = Object.assign({}, n, { addSuffix: n?.addSuffix, comparison: l }),
    [x, c] = lt(n?.in, ...(l > 0 ? [e, t] : [t, e])),
    b = De(c, x),
    S = (xt(c) - xt(x)) / 1e3,
    R = Math.round((b - S) / 60);
  let Q;
  if (R < 2)
    return n?.includeSeconds
      ? b < 5
        ? a.formatDistance("lessThanXSeconds", 5, h)
        : b < 10
          ? a.formatDistance("lessThanXSeconds", 10, h)
          : b < 20
            ? a.formatDistance("lessThanXSeconds", 20, h)
            : b < 40
              ? a.formatDistance("halfAMinute", 0, h)
              : b < 60
                ? a.formatDistance("lessThanXMinutes", 1, h)
                : a.formatDistance("xMinutes", 1, h)
      : R === 0
        ? a.formatDistance("lessThanXMinutes", 1, h)
        : a.formatDistance("xMinutes", R, h);
  if (R < 45) return a.formatDistance("xMinutes", R, h);
  if (R < 90) return a.formatDistance("aboutXHours", 1, h);
  if (R < qt) {
    const G = Math.round(R / 60);
    return a.formatDistance("aboutXHours", G, h);
  } else {
    if (R < u) return a.formatDistance("xDays", 1, h);
    if (R < Dt) {
      const G = Math.round(R / qt);
      return a.formatDistance("xDays", G, h);
    } else if (R < Dt * 2)
      return ((Q = Math.round(R / Dt)), a.formatDistance("aboutXMonths", Q, h));
  }
  if (((Q = ke(c, x)), Q < 12)) {
    const G = Math.round(R / Dt);
    return a.formatDistance("xMonths", G, h);
  } else {
    const G = Q % 12,
      ct = Math.trunc(Q / 12);
    return G < 3
      ? a.formatDistance("aboutXYears", ct, h)
      : G < 9
        ? a.formatDistance("overXYears", ct, h)
        : a.formatDistance("almostXYears", ct + 1, h);
  }
}
function Qn(t, e) {
  return Dn(t, Tt(t), e);
}
function vn(t, e, n) {
  const [r, a] = lt(n?.in, t, e);
  return +ut(r, n) == +ut(a, n);
}
function $n(t, e) {
  return vn(B(t, t), Tt(t), e);
}
function Gn(t, e) {
  return Vt(B(t, t), Tt(t));
}
function On(t, e, n) {
  return Jt(t, -1, n);
}
function Jn(t, e) {
  return Vt(B(t, t), On(Tt(t)));
}
function Kn(t, e) {
  const n = () => B(e?.in, NaN),
    a = En(t);
  let u;
  if (a.date) {
    const c = Tn(a.date, 2);
    u = Cn(c.restDateString, c.year);
  }
  if (!u || isNaN(+u)) return n();
  const l = +u;
  let h = 0,
    x;
  if (a.time && ((h = Pn(a.time)), isNaN(h))) return n();
  if (a.timezone) {
    if (((x = Rn(a.timezone)), isNaN(x))) return n();
  } else {
    const c = new Date(l + h),
      b = W(0, e?.in);
    return (
      b.setFullYear(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate()),
      b.setHours(
        c.getUTCHours(),
        c.getUTCMinutes(),
        c.getUTCSeconds(),
        c.getUTCMilliseconds(),
      ),
      b
    );
  }
  return W(l + h + x, e?.in);
}
const vt = {
    dateTimeDelimiter: /[T ]/,
    timeZoneDelimiter: /[Z ]/i,
    timezone: /([Z+-].*)$/,
  },
  Sn = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/,
  Mn =
    /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/,
  xn = /^([+-])(\d{2})(?::?(\d{2}))?$/;
function En(t) {
  const e = {},
    n = t.split(vt.dateTimeDelimiter);
  let r;
  if (n.length > 2) return e;
  if (
    (/:/.test(n[0])
      ? (r = n[0])
      : ((e.date = n[0]),
        (r = n[1]),
        vt.timeZoneDelimiter.test(e.date) &&
          ((e.date = t.split(vt.timeZoneDelimiter)[0]),
          (r = t.substr(e.date.length, t.length)))),
    r)
  ) {
    const a = vt.timezone.exec(r);
    a ? ((e.time = r.replace(a[1], "")), (e.timezone = a[1])) : (e.time = r);
  }
  return e;
}
function Tn(t, e) {
  const n = new RegExp(
      "^(?:(\\d{4}|[+-]\\d{" +
        (4 + e) +
        "})|(\\d{2}|[+-]\\d{" +
        (2 + e) +
        "})$)",
    ),
    r = t.match(n);
  if (!r) return { year: NaN, restDateString: "" };
  const a = r[1] ? parseInt(r[1]) : null,
    u = r[2] ? parseInt(r[2]) : null;
  return {
    year: u === null ? a : u * 100,
    restDateString: t.slice((r[1] || r[2]).length),
  };
}
function Cn(t, e) {
  if (e === null) return new Date(NaN);
  const n = t.match(Sn);
  if (!n) return new Date(NaN);
  const r = !!n[4],
    a = bt(n[1]),
    u = bt(n[2]) - 1,
    l = bt(n[3]),
    h = bt(n[4]),
    x = bt(n[5]) - 1;
  if (r) return Yn(e, h, x) ? Wn(e, h, x) : new Date(NaN);
  {
    const c = new Date(0);
    return !In(e, u, l) || !Nn(e, a)
      ? new Date(NaN)
      : (c.setUTCFullYear(e, u, Math.max(a, l)), c);
  }
}
function bt(t) {
  return t ? parseInt(t) : 1;
}
function Pn(t) {
  const e = t.match(Mn);
  if (!e) return NaN;
  const n = Ft(e[1]),
    r = Ft(e[2]),
    a = Ft(e[3]);
  return Ln(n, r, a) ? n * Gt + r * $t + a * 1e3 : NaN;
}
function Ft(t) {
  return (t && parseFloat(t.replace(",", "."))) || 0;
}
function Rn(t) {
  if (t === "Z") return 0;
  const e = t.match(xn);
  if (!e) return 0;
  const n = e[1] === "+" ? -1 : 1,
    r = parseInt(e[2]),
    a = (e[3] && parseInt(e[3])) || 0;
  return An(r, a) ? n * (r * Gt + a * $t) : NaN;
}
function Wn(t, e, n) {
  const r = new Date(0);
  r.setUTCFullYear(t, 0, 4);
  const a = r.getUTCDay() || 7,
    u = (e - 1) * 7 + n + 1 - a;
  return (r.setUTCDate(r.getUTCDate() + u), r);
}
const Fn = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function ne(t) {
  return t % 400 === 0 || (t % 4 === 0 && t % 100 !== 0);
}
function In(t, e, n) {
  return e >= 0 && e <= 11 && n >= 1 && n <= (Fn[e] || (ne(t) ? 29 : 28));
}
function Nn(t, e) {
  return e >= 1 && e <= (ne(t) ? 366 : 365);
}
function Yn(t, e, n) {
  return e >= 1 && e <= 53 && n >= 0 && n <= 6;
}
function Ln(t, e, n) {
  return t === 24
    ? e === 0 && n === 0
    : n >= 0 && n < 60 && e >= 0 && e < 60 && t >= 0 && t < 25;
}
function An(t, e) {
  return e >= 0 && e <= 59;
}
function Vn(t, e, n) {
  return he(t, -1, n);
}
var St = { exports: {} };
var qn = St.exports,
  Bt;
function Zn() {
  return (
    Bt ||
      ((Bt = 1),
      (function (t, e) {
        ((n, r) => {
          t.exports = r();
        })(qn, function n() {
          var r =
              typeof self < "u"
                ? self
                : typeof window < "u"
                  ? window
                  : r !== void 0
                    ? r
                    : {},
            a,
            u = !r.document && !!r.postMessage,
            l = r.IS_PAPA_WORKER || !1,
            h = {},
            x = 0,
            c = {};
          function b(i) {
            ((this._handle = null),
              (this._finished = !1),
              (this._completed = !1),
              (this._halted = !1),
              (this._input = null),
              (this._baseIndex = 0),
              (this._partialLine = ""),
              (this._rowCount = 0),
              (this._start = 0),
              (this._nextChunk = null),
              (this.isFirstChunk = !0),
              (this._completeResults = { data: [], errors: [], meta: {} }),
              function (s) {
                var o = Pt(s);
                ((o.chunkSize = parseInt(o.chunkSize)),
                  s.step || s.chunk || (o.chunkSize = null),
                  (this._handle = new ct(o)),
                  ((this._handle.streamer = this)._config = o));
              }.call(this, i),
              (this.parseChunk = function (s, o) {
                var f = parseInt(this._config.skipFirstNLines) || 0;
                if (this.isFirstChunk && 0 < f) {
                  let _ = this._config.newline;
                  (_ ||
                    ((d = this._config.quoteChar || '"'),
                    (_ = this._handle.guessLineEndings(s, d))),
                    (s = [...s.split(_).slice(f)].join(_)));
                }
                (this.isFirstChunk &&
                  C(this._config.beforeFirstChunk) &&
                  (d = this._config.beforeFirstChunk(s)) !== void 0 &&
                  (s = d),
                  (this.isFirstChunk = !1),
                  (this._halted = !1));
                var f = this._partialLine + s,
                  d =
                    ((this._partialLine = ""),
                    this._handle.parse(f, this._baseIndex, !this._finished));
                if (!this._handle.paused() && !this._handle.aborted()) {
                  if (
                    ((s = d.meta.cursor),
                    (f =
                      (this._finished ||
                        ((this._partialLine = f.substring(s - this._baseIndex)),
                        (this._baseIndex = s)),
                      d && d.data && (this._rowCount += d.data.length),
                      this._finished ||
                        (this._config.preview &&
                          this._rowCount >= this._config.preview))),
                    l)
                  )
                    r.postMessage({
                      results: d,
                      workerId: c.WORKER_ID,
                      finished: f,
                    });
                  else if (C(this._config.chunk) && !o) {
                    if (
                      (this._config.chunk(d, this._handle),
                      this._handle.paused() || this._handle.aborted())
                    )
                      return void (this._halted = !0);
                    this._completeResults = d = void 0;
                  }
                  return (
                    this._config.step ||
                      this._config.chunk ||
                      ((this._completeResults.data =
                        this._completeResults.data.concat(d.data)),
                      (this._completeResults.errors =
                        this._completeResults.errors.concat(d.errors)),
                      (this._completeResults.meta = d.meta)),
                    this._completed ||
                      !f ||
                      !C(this._config.complete) ||
                      (d && d.meta.aborted) ||
                      (this._config.complete(
                        this._completeResults,
                        this._input,
                      ),
                      (this._completed = !0)),
                    f || (d && d.meta.paused) || this._nextChunk(),
                    d
                  );
                }
                this._halted = !0;
              }),
              (this._sendError = function (s) {
                C(this._config.error)
                  ? this._config.error(s)
                  : l &&
                    this._config.error &&
                    r.postMessage({
                      workerId: c.WORKER_ID,
                      error: s,
                      finished: !1,
                    });
              }));
          }
          function S(i) {
            var s;
            ((i = i || {}).chunkSize || (i.chunkSize = c.RemoteChunkSize),
              b.call(this, i),
              (this._nextChunk = u
                ? function () {
                    (this._readChunk(), this._chunkLoaded());
                  }
                : function () {
                    this._readChunk();
                  }),
              (this.stream = function (o) {
                ((this._input = o), this._nextChunk());
              }),
              (this._readChunk = function () {
                if (this._finished) this._chunkLoaded();
                else {
                  if (
                    ((s = new XMLHttpRequest()),
                    this._config.withCredentials &&
                      (s.withCredentials = this._config.withCredentials),
                    u ||
                      ((s.onload = at(this._chunkLoaded, this)),
                      (s.onerror = at(this._chunkError, this))),
                    s.open(
                      this._config.downloadRequestBody ? "POST" : "GET",
                      this._input,
                      !u,
                    ),
                    this._config.downloadRequestHeaders)
                  ) {
                    var o,
                      f = this._config.downloadRequestHeaders;
                    for (o in f) s.setRequestHeader(o, f[o]);
                  }
                  var d;
                  this._config.chunkSize &&
                    ((d = this._start + this._config.chunkSize - 1),
                    s.setRequestHeader(
                      "Range",
                      "bytes=" + this._start + "-" + d,
                    ));
                  try {
                    s.send(this._config.downloadRequestBody);
                  } catch (_) {
                    this._chunkError(_.message);
                  }
                  u && s.status === 0 && this._chunkError();
                }
              }),
              (this._chunkLoaded = function () {
                s.readyState === 4 &&
                  (s.status < 200 || 400 <= s.status
                    ? this._chunkError()
                    : ((this._start +=
                        this._config.chunkSize || s.responseText.length),
                      (this._finished =
                        !this._config.chunkSize ||
                        this._start >=
                          ((o) =>
                            (o = o.getResponseHeader("Content-Range")) !== null
                              ? parseInt(o.substring(o.lastIndexOf("/") + 1))
                              : -1)(s)),
                      this.parseChunk(s.responseText)));
              }),
              (this._chunkError = function (o) {
                ((o = s.statusText || o), this._sendError(new Error(o)));
              }));
          }
          function R(i) {
            ((i = i || {}).chunkSize || (i.chunkSize = c.LocalChunkSize),
              b.call(this, i));
            var s,
              o,
              f = typeof FileReader < "u";
            ((this.stream = function (d) {
              ((this._input = d),
                (o = d.slice || d.webkitSlice || d.mozSlice),
                f
                  ? (((s = new FileReader()).onload = at(
                      this._chunkLoaded,
                      this,
                    )),
                    (s.onerror = at(this._chunkError, this)))
                  : (s = new FileReaderSync()),
                this._nextChunk());
            }),
              (this._nextChunk = function () {
                this._finished ||
                  (this._config.preview &&
                    !(this._rowCount < this._config.preview)) ||
                  this._readChunk();
              }),
              (this._readChunk = function () {
                var d = this._input,
                  _ =
                    (this._config.chunkSize &&
                      ((_ = Math.min(
                        this._start + this._config.chunkSize,
                        this._input.size,
                      )),
                      (d = o.call(d, this._start, _))),
                    s.readAsText(d, this._config.encoding));
                f || this._chunkLoaded({ target: { result: _ } });
              }),
              (this._chunkLoaded = function (d) {
                ((this._start += this._config.chunkSize),
                  (this._finished =
                    !this._config.chunkSize || this._start >= this._input.size),
                  this.parseChunk(d.target.result));
              }),
              (this._chunkError = function () {
                this._sendError(s.error);
              }));
          }
          function Q(i) {
            var s;
            (b.call(this, (i = i || {})),
              (this.stream = function (o) {
                return ((s = o), this._nextChunk());
              }),
              (this._nextChunk = function () {
                var o, f;
                if (!this._finished)
                  return (
                    (o = this._config.chunkSize),
                    (s = o
                      ? ((f = s.substring(0, o)), s.substring(o))
                      : ((f = s), "")),
                    (this._finished = !s),
                    this.parseChunk(f)
                  );
              }));
          }
          function G(i) {
            b.call(this, (i = i || {}));
            var s = [],
              o = !0,
              f = !1;
            ((this.pause = function () {
              (b.prototype.pause.apply(this, arguments), this._input.pause());
            }),
              (this.resume = function () {
                (b.prototype.resume.apply(this, arguments),
                  this._input.resume());
              }),
              (this.stream = function (d) {
                ((this._input = d),
                  this._input.on("data", this._streamData),
                  this._input.on("end", this._streamEnd),
                  this._input.on("error", this._streamError));
              }),
              (this._checkIsFinished = function () {
                f && s.length === 1 && (this._finished = !0);
              }),
              (this._nextChunk = function () {
                (this._checkIsFinished(),
                  s.length ? this.parseChunk(s.shift()) : (o = !0));
              }),
              (this._streamData = at(function (d) {
                try {
                  (s.push(
                    typeof d == "string"
                      ? d
                      : d.toString(this._config.encoding),
                  ),
                    o &&
                      ((o = !1),
                      this._checkIsFinished(),
                      this.parseChunk(s.shift())));
                } catch (_) {
                  this._streamError(_);
                }
              }, this)),
              (this._streamError = at(function (d) {
                (this._streamCleanUp(), this._sendError(d));
              }, this)),
              (this._streamEnd = at(function () {
                (this._streamCleanUp(), (f = !0), this._streamData(""));
              }, this)),
              (this._streamCleanUp = at(function () {
                (this._input.removeListener("data", this._streamData),
                  this._input.removeListener("end", this._streamEnd),
                  this._input.removeListener("error", this._streamError));
              }, this)));
          }
          function ct(i) {
            var s,
              o,
              f,
              d,
              _ = Math.pow(2, 53),
              A = -_,
              J = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,
              K =
                /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,
              k = this,
              I = 0,
              g = 0,
              z = !1,
              y = !1,
              D = [],
              m = { data: [], errors: [], meta: {} };
            function q(v) {
              return i.skipEmptyLines === "greedy"
                ? v.join("").trim() === ""
                : v.length === 1 && v[0].length === 0;
            }
            function L() {
              if (
                (m &&
                  f &&
                  (V(
                    "Delimiter",
                    "UndetectableDelimiter",
                    "Unable to auto-detect delimiting character; defaulted to '" +
                      c.DefaultDelimiter +
                      "'",
                  ),
                  (f = !1)),
                i.skipEmptyLines &&
                  (m.data = m.data.filter(function (p) {
                    return !q(p);
                  })),
                U())
              ) {
                let p = function (Y, j) {
                  (C(i.transformHeader) && (Y = i.transformHeader(Y, j)),
                    D.push(Y));
                };
                if (m)
                  if (Array.isArray(m.data[0])) {
                    for (var v = 0; U() && v < m.data.length; v++)
                      m.data[v].forEach(p);
                    m.data.splice(0, 1);
                  } else m.data.forEach(p);
              }
              function M(p, Y) {
                for (var j = i.header ? {} : [], T = 0; T < p.length; T++) {
                  var P = T,
                    O = p[T],
                    O = ((Z, w) =>
                      ((F) => (
                        i.dynamicTypingFunction &&
                          i.dynamicTyping[F] === void 0 &&
                          (i.dynamicTyping[F] = i.dynamicTypingFunction(F)),
                        (i.dynamicTyping[F] || i.dynamicTyping) === !0
                      ))(Z)
                        ? w === "true" ||
                          w === "TRUE" ||
                          (w !== "false" &&
                            w !== "FALSE" &&
                            (((F) => {
                              if (
                                J.test(F) &&
                                ((F = parseFloat(F)), A < F && F < _)
                              )
                                return 1;
                            })(w)
                              ? parseFloat(w)
                              : K.test(w)
                                ? new Date(w)
                                : w === ""
                                  ? null
                                  : w))
                        : w)(
                      (P = i.header
                        ? T >= D.length
                          ? "__parsed_extra"
                          : D[T]
                        : P),
                      (O = i.transform ? i.transform(O, P) : O),
                    );
                  P === "__parsed_extra"
                    ? ((j[P] = j[P] || []), j[P].push(O))
                    : (j[P] = O);
                }
                return (
                  i.header &&
                    (T > D.length
                      ? V(
                          "FieldMismatch",
                          "TooManyFields",
                          "Too many fields: expected " +
                            D.length +
                            " fields but parsed " +
                            T,
                          g + Y,
                        )
                      : T < D.length &&
                        V(
                          "FieldMismatch",
                          "TooFewFields",
                          "Too few fields: expected " +
                            D.length +
                            " fields but parsed " +
                            T,
                          g + Y,
                        )),
                  j
                );
              }
              var N;
              m &&
                (i.header || i.dynamicTyping || i.transform) &&
                ((N = 1),
                !m.data.length || Array.isArray(m.data[0])
                  ? ((m.data = m.data.map(M)), (N = m.data.length))
                  : (m.data = M(m.data, 0)),
                i.header && m.meta && (m.meta.fields = D),
                (g += N));
            }
            function U() {
              return i.header && D.length === 0;
            }
            function V(v, M, N, p) {
              ((v = { type: v, code: M, message: N }),
                p !== void 0 && (v.row = p),
                m.errors.push(v));
            }
            (C(i.step) &&
              ((d = i.step),
              (i.step = function (v) {
                ((m = v),
                  U()
                    ? L()
                    : (L(),
                      m.data.length !== 0 &&
                        ((I += v.data.length),
                        i.preview && I > i.preview
                          ? o.abort()
                          : ((m.data = m.data[0]), d(m, k)))));
              })),
              (this.parse = function (v, M, N) {
                var p = i.quoteChar || '"',
                  p =
                    (i.newline || (i.newline = this.guessLineEndings(v, p)),
                    (f = !1),
                    i.delimiter
                      ? C(i.delimiter) &&
                        ((i.delimiter = i.delimiter(v)),
                        (m.meta.delimiter = i.delimiter))
                      : ((p = ((Y, j, T, P, O) => {
                          var Z, w, F, it;
                          O = O || [
                            ",",
                            "	",
                            "|",
                            ";",
                            c.RECORD_SEP,
                            c.UNIT_SEP,
                          ];
                          for (var dt = 0; dt < O.length; dt++) {
                            for (
                              var tt,
                                gt = O[dt],
                                X = 0,
                                et = 0,
                                H = 0,
                                $ =
                                  ((F = void 0),
                                  new Ct({
                                    comments: P,
                                    delimiter: gt,
                                    newline: j,
                                    preview: 10,
                                  }).parse(Y)),
                                rt = 0;
                              rt < $.data.length;
                              rt++
                            )
                              T && q($.data[rt])
                                ? H++
                                : ((tt = $.data[rt].length),
                                  (et += tt),
                                  F === void 0
                                    ? (F = tt)
                                    : 0 < tt &&
                                      ((X += Math.abs(tt - F)), (F = tt)));
                            (0 < $.data.length && (et /= $.data.length - H),
                              (w === void 0 || X <= w) &&
                                (it === void 0 || it < et) &&
                                1.99 < et &&
                                ((w = X), (Z = gt), (it = et)));
                          }
                          return {
                            successful: !!(i.delimiter = Z),
                            bestDelimiter: Z,
                          };
                        })(
                          v,
                          i.newline,
                          i.skipEmptyLines,
                          i.comments,
                          i.delimitersToGuess,
                        )).successful
                          ? (i.delimiter = p.bestDelimiter)
                          : ((f = !0), (i.delimiter = c.DefaultDelimiter)),
                        (m.meta.delimiter = i.delimiter)),
                    Pt(i));
                return (
                  i.preview && i.header && p.preview++,
                  (s = v),
                  (o = new Ct(p)),
                  (m = o.parse(s, M, N)),
                  L(),
                  z ? { meta: { paused: !0 } } : m || { meta: { paused: !1 } }
                );
              }),
              (this.paused = function () {
                return z;
              }),
              (this.pause = function () {
                ((z = !0),
                  o.abort(),
                  (s = C(i.chunk) ? "" : s.substring(o.getCharIndex())));
              }),
              (this.resume = function () {
                k.streamer._halted
                  ? ((z = !1), k.streamer.parseChunk(s, !0))
                  : setTimeout(k.resume, 3);
              }),
              (this.aborted = function () {
                return y;
              }),
              (this.abort = function () {
                ((y = !0),
                  o.abort(),
                  (m.meta.aborted = !0),
                  C(i.complete) && i.complete(m),
                  (s = ""));
              }),
              (this.guessLineEndings = function (Y, p) {
                Y = Y.substring(0, 1048576);
                var p = new RegExp(mt(p) + "([^]*?)" + mt(p), "gm"),
                  N = (Y = Y.replace(p, "")).split("\r"),
                  p = Y.split(`
`),
                  Y = 1 < p.length && p[0].length < N[0].length;
                if (N.length === 1 || Y)
                  return `
`;
                for (var j = 0, T = 0; T < N.length; T++)
                  N[T][0] ===
                    `
` && j++;
                return j >= N.length / 2
                  ? `\r
`
                  : "\r";
              }));
          }
          function mt(i) {
            return i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          }
          function Ct(i) {
            var s = (i = i || {}).delimiter,
              o = i.newline,
              f = i.comments,
              d = i.step,
              _ = i.preview,
              A = i.fastMode,
              J = null,
              K = !1,
              k = i.quoteChar == null ? '"' : i.quoteChar,
              I = k;
            if (
              (i.escapeChar !== void 0 && (I = i.escapeChar),
              (typeof s != "string" || -1 < c.BAD_DELIMITERS.indexOf(s)) &&
                (s = ","),
              f === s)
            )
              throw new Error("Comment character same as delimiter");
            (f === !0
              ? (f = "#")
              : (typeof f != "string" || -1 < c.BAD_DELIMITERS.indexOf(f)) &&
                (f = !1),
              o !==
                `
` &&
                o !== "\r" &&
                o !==
                  `\r
` &&
                (o = `
`));
            var g = 0,
              z = !1;
            ((this.parse = function (y, D, m) {
              if (typeof y != "string")
                throw new Error("Input must be a string");
              var q = y.length,
                L = s.length,
                U = o.length,
                V = f.length,
                v = C(d),
                M = [],
                N = [],
                p = [],
                Y = (g = 0);
              if (!y) return X();
              if (A || (A !== !1 && y.indexOf(k) === -1)) {
                for (var j = y.split(o), T = 0; T < j.length; T++) {
                  if (((p = j[T]), (g += p.length), T !== j.length - 1))
                    g += o.length;
                  else if (m) return X();
                  if (!f || p.substring(0, V) !== f) {
                    if (v) {
                      if (((M = []), it(p.split(s)), et(), z)) return X();
                    } else it(p.split(s));
                    if (_ && _ <= T) return ((M = M.slice(0, _)), X(!0));
                  }
                }
                return X();
              }
              for (
                var P = y.indexOf(s, g),
                  O = y.indexOf(o, g),
                  Z = new RegExp(mt(I) + mt(k), "g"),
                  w = y.indexOf(k, g);
                ;
              )
                if (y[g] === k)
                  for (w = g, g++; ; ) {
                    if ((w = y.indexOf(k, w + 1)) === -1)
                      return (
                        m ||
                          N.push({
                            type: "Quotes",
                            code: "MissingQuotes",
                            message: "Quoted field unterminated",
                            row: M.length,
                            index: g,
                          }),
                        tt()
                      );
                    if (w === q - 1) return tt(y.substring(g, w).replace(Z, k));
                    if (k === I && y[w + 1] === I) w++;
                    else if (k === I || w === 0 || y[w - 1] !== I) {
                      P !== -1 && P < w + 1 && (P = y.indexOf(s, w + 1));
                      var F = dt(
                        (O =
                          O !== -1 && O < w + 1 ? y.indexOf(o, w + 1) : O) ===
                          -1
                          ? P
                          : Math.min(P, O),
                      );
                      if (y.substr(w + 1 + F, L) === s) {
                        (p.push(y.substring(g, w).replace(Z, k)),
                          y[(g = w + 1 + F + L)] !== k && (w = y.indexOf(k, g)),
                          (P = y.indexOf(s, g)),
                          (O = y.indexOf(o, g)));
                        break;
                      }
                      if (
                        ((F = dt(O)),
                        y.substring(w + 1 + F, w + 1 + F + U) === o)
                      ) {
                        if (
                          (p.push(y.substring(g, w).replace(Z, k)),
                          gt(w + 1 + F + U),
                          (P = y.indexOf(s, g)),
                          (w = y.indexOf(k, g)),
                          v && (et(), z))
                        )
                          return X();
                        if (_ && M.length >= _) return X(!0);
                        break;
                      }
                      (N.push({
                        type: "Quotes",
                        code: "InvalidQuotes",
                        message: "Trailing quote on quoted field is malformed",
                        row: M.length,
                        index: g,
                      }),
                        w++);
                    }
                  }
                else if (f && p.length === 0 && y.substring(g, g + V) === f) {
                  if (O === -1) return X();
                  ((g = O + U), (O = y.indexOf(o, g)), (P = y.indexOf(s, g)));
                } else if (P !== -1 && (P < O || O === -1))
                  (p.push(y.substring(g, P)),
                    (g = P + L),
                    (P = y.indexOf(s, g)));
                else {
                  if (O === -1) break;
                  if ((p.push(y.substring(g, O)), gt(O + U), v && (et(), z)))
                    return X();
                  if (_ && M.length >= _) return X(!0);
                }
              return tt();
              function it(H) {
                (M.push(H), (Y = g));
              }
              function dt(H) {
                var $ = 0;
                return ($ =
                  H !== -1 && (H = y.substring(w + 1, H)) && H.trim() === ""
                    ? H.length
                    : $);
              }
              function tt(H) {
                return (
                  m ||
                    (H === void 0 && (H = y.substring(g)),
                    p.push(H),
                    (g = q),
                    it(p),
                    v && et()),
                  X()
                );
              }
              function gt(H) {
                ((g = H), it(p), (p = []), (O = y.indexOf(o, g)));
              }
              function X(H) {
                if (i.header && !D && M.length && !K) {
                  var $ = M[0],
                    rt = Object.create(null),
                    Rt = new Set($);
                  let Yt = !1;
                  for (let ft = 0; ft < $.length; ft++) {
                    let nt = $[ft];
                    if (
                      rt[
                        (nt = C(i.transformHeader)
                          ? i.transformHeader(nt, ft)
                          : nt)
                      ]
                    ) {
                      let pt,
                        Lt = rt[nt];
                      for (; (pt = nt + "_" + Lt), Lt++, Rt.has(pt); );
                      (Rt.add(pt),
                        ($[ft] = pt),
                        rt[nt]++,
                        (Yt = !0),
                        ((J = J === null ? {} : J)[pt] = nt));
                    } else ((rt[nt] = 1), ($[ft] = nt));
                    Rt.add(nt);
                  }
                  (Yt && console.warn("Duplicate headers found and renamed."),
                    (K = !0));
                }
                return {
                  data: M,
                  errors: N,
                  meta: {
                    delimiter: s,
                    linebreak: o,
                    aborted: z,
                    truncated: !!H,
                    cursor: Y + (D || 0),
                    renamedHeaders: J,
                  },
                };
              }
              function et() {
                (d(X()), (M = []), (N = []));
              }
            }),
              (this.abort = function () {
                z = !0;
              }),
              (this.getCharIndex = function () {
                return g;
              }));
          }
          function re(i) {
            var s = i.data,
              o = h[s.workerId],
              f = !1;
            if (s.error) o.userError(s.error, s.file);
            else if (s.results && s.results.data) {
              var d = {
                abort: function () {
                  ((f = !0),
                    It(s.workerId, {
                      data: [],
                      errors: [],
                      meta: { aborted: !0 },
                    }));
                },
                pause: Nt,
                resume: Nt,
              };
              if (C(o.userStep)) {
                for (
                  var _ = 0;
                  _ < s.results.data.length &&
                  (o.userStep(
                    {
                      data: s.results.data[_],
                      errors: s.results.errors,
                      meta: s.results.meta,
                    },
                    d,
                  ),
                  !f);
                  _++
                );
                delete s.results;
              } else
                C(o.userChunk) &&
                  (o.userChunk(s.results, d, s.file), delete s.results);
            }
            s.finished && !f && It(s.workerId, s.results);
          }
          function It(i, s) {
            var o = h[i];
            (C(o.userComplete) && o.userComplete(s),
              o.terminate(),
              delete h[i]);
          }
          function Nt() {
            throw new Error("Not implemented.");
          }
          function Pt(i) {
            if (typeof i != "object" || i === null) return i;
            var s,
              o = Array.isArray(i) ? [] : {};
            for (s in i) o[s] = Pt(i[s]);
            return o;
          }
          function at(i, s) {
            return function () {
              i.apply(s, arguments);
            };
          }
          function C(i) {
            return typeof i == "function";
          }
          return (
            (c.parse = function (i, s) {
              var o = (s = s || {}).dynamicTyping || !1;
              if (
                (C(o) && ((s.dynamicTypingFunction = o), (o = {})),
                (s.dynamicTyping = o),
                (s.transform = !!C(s.transform) && s.transform),
                !s.worker || !c.WORKERS_SUPPORTED)
              )
                return (
                  (o = null),
                  c.NODE_STREAM_INPUT,
                  typeof i == "string"
                    ? ((i = ((f) =>
                        f.charCodeAt(0) !== 65279 ? f : f.slice(1))(i)),
                      (o = new (s.download ? S : Q)(s)))
                    : i.readable === !0 && C(i.read) && C(i.on)
                      ? (o = new G(s))
                      : ((r.File && i instanceof File) ||
                          i instanceof Object) &&
                        (o = new R(s)),
                  o.stream(i)
                );
              (((o = (() => {
                var f;
                return (
                  !!c.WORKERS_SUPPORTED &&
                  ((f = (() => {
                    var d = r.URL || r.webkitURL || null,
                      _ = n.toString();
                    return (
                      c.BLOB_URL ||
                      (c.BLOB_URL = d.createObjectURL(
                        new Blob(
                          [
                            "var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ",
                            "(",
                            _,
                            ")();",
                          ],
                          { type: "text/javascript" },
                        ),
                      ))
                    );
                  })()),
                  ((f = new r.Worker(f)).onmessage = re),
                  (f.id = x++),
                  (h[f.id] = f))
                );
              })()).userStep = s.step),
                (o.userChunk = s.chunk),
                (o.userComplete = s.complete),
                (o.userError = s.error),
                (s.step = C(s.step)),
                (s.chunk = C(s.chunk)),
                (s.complete = C(s.complete)),
                (s.error = C(s.error)),
                delete s.worker,
                o.postMessage({ input: i, config: s, workerId: o.id }));
            }),
            (c.unparse = function (i, s) {
              var o = !1,
                f = !0,
                d = ",",
                _ = `\r
`,
                A = '"',
                J = A + A,
                K = !1,
                k = null,
                I = !1,
                g =
                  ((() => {
                    if (typeof s == "object") {
                      if (
                        (typeof s.delimiter != "string" ||
                          c.BAD_DELIMITERS.filter(function (D) {
                            return s.delimiter.indexOf(D) !== -1;
                          }).length ||
                          (d = s.delimiter),
                        (typeof s.quotes != "boolean" &&
                          typeof s.quotes != "function" &&
                          !Array.isArray(s.quotes)) ||
                          (o = s.quotes),
                        (typeof s.skipEmptyLines != "boolean" &&
                          typeof s.skipEmptyLines != "string") ||
                          (K = s.skipEmptyLines),
                        typeof s.newline == "string" && (_ = s.newline),
                        typeof s.quoteChar == "string" && (A = s.quoteChar),
                        typeof s.header == "boolean" && (f = s.header),
                        Array.isArray(s.columns))
                      ) {
                        if (s.columns.length === 0)
                          throw new Error("Option columns is empty");
                        k = s.columns;
                      }
                      (s.escapeChar !== void 0 && (J = s.escapeChar + A),
                        s.escapeFormulae instanceof RegExp
                          ? (I = s.escapeFormulae)
                          : typeof s.escapeFormulae == "boolean" &&
                            s.escapeFormulae &&
                            (I = /^[=+\-@\t\r].*$/));
                    }
                  })(),
                  new RegExp(mt(A), "g"));
              if (
                (typeof i == "string" && (i = JSON.parse(i)), Array.isArray(i))
              ) {
                if (!i.length || Array.isArray(i[0])) return z(null, i, K);
                if (typeof i[0] == "object")
                  return z(k || Object.keys(i[0]), i, K);
              } else if (typeof i == "object")
                return (
                  typeof i.data == "string" && (i.data = JSON.parse(i.data)),
                  Array.isArray(i.data) &&
                    (i.fields || (i.fields = (i.meta && i.meta.fields) || k),
                    i.fields ||
                      (i.fields = Array.isArray(i.data[0])
                        ? i.fields
                        : typeof i.data[0] == "object"
                          ? Object.keys(i.data[0])
                          : []),
                    Array.isArray(i.data[0]) ||
                      typeof i.data[0] == "object" ||
                      (i.data = [i.data])),
                  z(i.fields || [], i.data || [], K)
                );
              throw new Error("Unable to serialize unrecognized input");
              function z(D, m, q) {
                var L = "",
                  U =
                    (typeof D == "string" && (D = JSON.parse(D)),
                    typeof m == "string" && (m = JSON.parse(m)),
                    Array.isArray(D) && 0 < D.length),
                  V = !Array.isArray(m[0]);
                if (U && f) {
                  for (var v = 0; v < D.length; v++)
                    (0 < v && (L += d), (L += y(D[v], v)));
                  0 < m.length && (L += _);
                }
                for (var M = 0; M < m.length; M++) {
                  var N = (U ? D : m[M]).length,
                    p = !1,
                    Y = U ? Object.keys(m[M]).length === 0 : m[M].length === 0;
                  if (
                    (q &&
                      !U &&
                      (p =
                        q === "greedy"
                          ? m[M].join("").trim() === ""
                          : m[M].length === 1 && m[M][0].length === 0),
                    q === "greedy" && U)
                  ) {
                    for (var j = [], T = 0; T < N; T++) {
                      var P = V ? D[T] : T;
                      j.push(m[M][P]);
                    }
                    p = j.join("").trim() === "";
                  }
                  if (!p) {
                    for (var O = 0; O < N; O++) {
                      0 < O && !Y && (L += d);
                      var Z = U && V ? D[O] : O;
                      L += y(m[M][Z], O);
                    }
                    M < m.length - 1 && (!q || (0 < N && !Y)) && (L += _);
                  }
                }
                return L;
              }
              function y(D, m) {
                var q, L;
                return D == null
                  ? ""
                  : D.constructor === Date
                    ? JSON.stringify(D).slice(1, 25)
                    : ((L = !1),
                      I &&
                        typeof D == "string" &&
                        I.test(D) &&
                        ((D = "'" + D), (L = !0)),
                      (q = D.toString().replace(g, J)),
                      (L =
                        L ||
                        o === !0 ||
                        (typeof o == "function" && o(D, m)) ||
                        (Array.isArray(o) && o[m]) ||
                        ((U, V) => {
                          for (var v = 0; v < V.length; v++)
                            if (-1 < U.indexOf(V[v])) return !0;
                          return !1;
                        })(q, c.BAD_DELIMITERS) ||
                        -1 < q.indexOf(d) ||
                        q.charAt(0) === " " ||
                        q.charAt(q.length - 1) === " ")
                        ? A + q + A
                        : q);
              }
            }),
            (c.RECORD_SEP = ""),
            (c.UNIT_SEP = ""),
            (c.BYTE_ORDER_MARK = "\uFEFF"),
            (c.BAD_DELIMITERS = [
              "\r",
              `
`,
              '"',
              c.BYTE_ORDER_MARK,
            ]),
            (c.WORKERS_SUPPORTED = !u && !!r.Worker),
            (c.NODE_STREAM_INPUT = 1),
            (c.LocalChunkSize = 10485760),
            (c.RemoteChunkSize = 5242880),
            (c.DefaultDelimiter = ","),
            (c.Parser = Ct),
            (c.ParserHandle = ct),
            (c.NetworkStreamer = S),
            (c.FileStreamer = R),
            (c.StringStreamer = Q),
            (c.ReadableStreamStreamer = G),
            r.jQuery &&
              ((a = r.jQuery).fn.parse = function (i) {
                var s = i.config || {},
                  o = [];
                return (
                  this.each(function (_) {
                    if (
                      !(
                        a(this).prop("tagName").toUpperCase() === "INPUT" &&
                        a(this).attr("type").toLowerCase() === "file" &&
                        r.FileReader
                      ) ||
                      !this.files ||
                      this.files.length === 0
                    )
                      return !0;
                    for (var A = 0; A < this.files.length; A++)
                      o.push({
                        file: this.files[A],
                        inputElem: this,
                        instanceConfig: a.extend({}, s),
                      });
                  }),
                  f(),
                  this
                );
                function f() {
                  if (o.length === 0) C(i.complete) && i.complete();
                  else {
                    var _,
                      A,
                      J,
                      K,
                      k = o[0];
                    if (C(i.before)) {
                      var I = i.before(k.file, k.inputElem);
                      if (typeof I == "object") {
                        if (I.action === "abort")
                          return (
                            (_ = "AbortError"),
                            (A = k.file),
                            (J = k.inputElem),
                            (K = I.reason),
                            void (C(i.error) && i.error({ name: _ }, A, J, K))
                          );
                        if (I.action === "skip") return void d();
                        typeof I.config == "object" &&
                          (k.instanceConfig = a.extend(
                            k.instanceConfig,
                            I.config,
                          ));
                      } else if (I === "skip") return void d();
                    }
                    var g = k.instanceConfig.complete;
                    ((k.instanceConfig.complete = function (z) {
                      (C(g) && g(z, k.file, k.inputElem), d());
                    }),
                      c.parse(k.file, k.instanceConfig));
                  }
                }
                function d() {
                  (o.splice(0, 1), f());
                }
              }),
            l &&
              (r.onmessage = function (i) {
                ((i = i.data),
                  c.WORKER_ID === void 0 && i && (c.WORKER_ID = i.workerId),
                  typeof i.input == "string"
                    ? r.postMessage({
                        workerId: c.WORKER_ID,
                        results: c.parse(i.input, i.config),
                        finished: !0,
                      })
                    : ((r.File && i.input instanceof File) ||
                        i.input instanceof Object) &&
                      (i = c.parse(i.input, i.config)) &&
                      r.postMessage({
                        workerId: c.WORKER_ID,
                        results: i,
                        finished: !0,
                      }));
              }),
            ((S.prototype = Object.create(b.prototype)).constructor = S),
            ((R.prototype = Object.create(b.prototype)).constructor = R),
            ((Q.prototype = Object.create(Q.prototype)).constructor = Q),
            ((G.prototype = Object.create(b.prototype)).constructor = G),
            c
          );
        });
      })(St)),
    St.exports
  );
}
export {
  yt as a,
  Wt as b,
  Hn as c,
  wt as d,
  He as e,
  Bn as f,
  Qn as g,
  Jn as h,
  Gn as i,
  $n as j,
  ut as k,
  Jt as l,
  Vt as m,
  Xn as n,
  Vn as o,
  Kn as p,
  he as q,
  Un as r,
  zn as s,
  Zn as t,
};
