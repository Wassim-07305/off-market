if (!self.define) {
  let s,
    e = {};
  const l = (l, i) => (
    (l = new URL(l + ".js", i).href),
    e[l] ||
      new Promise((e) => {
        if ("document" in self) {
          const s = document.createElement("script");
          ((s.src = l), (s.onload = e), document.head.appendChild(s));
        } else ((s = l), importScripts(l), e());
      }).then(() => {
        let s = e[l];
        if (!s) throw new Error(`Module ${l} didn’t register its module`);
        return s;
      })
  );
  self.define = (i, n) => {
    const r =
      s ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (e[r]) return;
    let a = {};
    const u = (s) => l(s, r),
      t = { module: { uri: r }, exports: a, require: u };
    e[r] = Promise.all(i.map((s) => t[s] || u(s))).then((s) => (n(...s), a));
  };
}
define(["./workbox-8c29f6e4"], function (s) {
  "use strict";
  (self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: "registerSW.js", revision: "1872c500de691dce40960bb85481de07" },
        { url: "index.html", revision: "bbaa2046b4303c865a3f1ad94364e8df" },
        { url: "assets/zod-COY_rf8d.js", revision: null },
        { url: "assets/vendor-utils-DoLlG-6J.js", revision: null },
        { url: "assets/vendor-ui-DDdrexJZ.js", revision: null },
        { url: "assets/vendor-supabase-BZ0N5lZN.js", revision: null },
        { url: "assets/vendor-react-Cci7g3Cb.js", revision: null },
        { url: "assets/vendor-query-sBpsl8Kt.js", revision: null },
        { url: "assets/vendor-forms-Ct2mZ2NL.js", revision: null },
        { url: "assets/vendor-dnd-DrANF9GG.js", revision: null },
        { url: "assets/vendor-charts-KMfjFgec.js", revision: null },
        { url: "assets/useUsers-BngZVZxm.js", revision: null },
        { url: "assets/useSetterActivities-CkfYxyYw.js", revision: null },
        { url: "assets/usePageTitle-I7G4QvKX.js", revision: null },
        { url: "assets/useLeads-TuKFlYpV.js", revision: null },
        { url: "assets/useForms-BjBbdMcT.js", revision: null },
        { url: "assets/useFinances-lbLdW7J9.js", revision: null },
        { url: "assets/useEleves-Dg_0NJBt.js", revision: null },
        { url: "assets/useClients-oFN0czBK.js", revision: null },
        { url: "assets/useCallCalendar-B0TAFn5Z.js", revision: null },
        { url: "assets/textarea-D7qrlVHg.js", revision: null },
        { url: "assets/tabs-oT6f7FFv.js", revision: null },
        { url: "assets/select-E7QvXrZc.js", revision: null },
        { url: "assets/search-input-dECf1iQ_.js", revision: null },
        { url: "assets/pagination-DHo4QjB2.js", revision: null },
        { url: "assets/modal-DBBZDXoW.js", revision: null },
        { url: "assets/input-B9vrc6Q3.js", revision: null },
        { url: "assets/index-Ddu5uNF-.js", revision: null },
        { url: "assets/index-DY9GA2La.js", revision: null },
        { url: "assets/index-CJI37ux1.css", revision: null },
        { url: "assets/forms-zLivl21i.js", revision: null },
        { url: "assets/empty-state-BFSeK4Tv.js", revision: null },
        { url: "assets/data-table-BDFYi4Le.js", revision: null },
        { url: "assets/csv-DLhVFTuh.js", revision: null },
        { url: "assets/constants-IBlSVYu1.js", revision: null },
        { url: "assets/confirm-dialog-BnX-zJNl.js", revision: null },
        { url: "assets/checkbox-yH1R51Jo.js", revision: null },
        { url: "assets/card-Dkj99_H3.js", revision: null },
        { url: "assets/button-DlbP8VPc.js", revision: null },
        { url: "assets/badge-CFrXqKTx.js", revision: null },
        { url: "assets/UsersPage-C1auPKrV.js", revision: null },
        { url: "assets/TimeFilter-DReAdz3P.js", revision: null },
        { url: "assets/SocialContentPage-DK8dQxdT.js", revision: null },
        { url: "assets/SocialContentBoard-CgMPzRRP.js", revision: null },
        { url: "assets/SettingsPage-vlQSLngi.js", revision: null },
        { url: "assets/SetterActivityPage-wO8b7RJJ.js", revision: null },
        { url: "assets/RitualsPage-DlcBOol-.js", revision: null },
        { url: "assets/ResetPasswordPage-DkAgcVYn.js", revision: null },
        { url: "assets/RegisterPage-DlJyzc13.js", revision: null },
        { url: "assets/OnboardingPage-TDQ8P0N7.js", revision: null },
        { url: "assets/NotFoundPage-C9ss4URw.js", revision: null },
        { url: "assets/MessagingPage-Cv1FYQ-9.js", revision: null },
        { url: "assets/LoginPage-CJU5l2c4.js", revision: null },
        { url: "assets/LeadsPage-2C5yTWWf.js", revision: null },
        { url: "assets/JournalPage-B3jb7PIj.js", revision: null },
        { url: "assets/InstagramPostStatsTable-CI2aEuiC.js", revision: null },
        { url: "assets/InstagramPage-CESb072P.js", revision: null },
        { url: "assets/GamificationPage-C_-Zh_JR.js", revision: null },
        { url: "assets/FormsPage-ByN1HTeV.js", revision: null },
        { url: "assets/FormationsPage-Bdfavd24.js", revision: null },
        { url: "assets/FormationFormModal-BKpgB3Tb.js", revision: null },
        { url: "assets/FormationDetailPage-CP6CJVen.js", revision: null },
        { url: "assets/FormEditorPage-yh6a4o00.js", revision: null },
        { url: "assets/ForgotPasswordPage-CGv1hYBm.js", revision: null },
        { url: "assets/FinancesPage-BbQZ_u4P.js", revision: null },
        { url: "assets/FeedPage-BiEPd39_.js", revision: null },
        { url: "assets/DocumentationPage-CFF32rKa.js", revision: null },
        { url: "assets/DashboardPage-BVLa6xkX.js", revision: null },
        { url: "assets/ContractsPage-uhC8K2CP.js", revision: null },
        { url: "assets/CoachingPage-CqG2sGbr.js", revision: null },
        { url: "assets/CloserCallsTable-B1oI979D.js", revision: null },
        { url: "assets/CloserCallsPage-B2UqlgIh.js", revision: null },
        { url: "assets/ClientsPage-Cs4tgvmz.js", revision: null },
        { url: "assets/ClientsManagePage-DdVHb-Q4.js", revision: null },
        { url: "assets/ClientDetailPage-DeZgir7s.js", revision: null },
        { url: "assets/CallCalendarPage-BKxvxE6g.js", revision: null },
        { url: "assets/CSVImportModal-DBes1YXg.js", revision: null },
        { url: "assets/CSMLandingPage-Nf_ym6gg.js", revision: null },
        { url: "assets/AnalyticsPage-CLJoIHzy.js", revision: null },
        { url: "assets/AIAssistantPage-bi6r1bpl.js", revision: null },
        {
          url: "Slides-Alexia/index.html",
          revision: "7a4fc73559a7d0afd3d200f84b377e84",
        },
        { url: "favicon.svg", revision: "1aaa9b46c5f25c6b6a1008342d1e8091" },
        {
          url: "pwa-192x192.svg",
          revision: "55fb94a625e0585ad739a5c1e7590ca0",
        },
        {
          url: "pwa-512x512.svg",
          revision: "8321c6a292eb0bbf7c3a4df9dff3b430",
        },
        {
          url: "manifest.webmanifest",
          revision: "463c574b1230dff407f60fa13817a62d",
        },
      ],
      {},
    ),
    s.cleanupOutdatedCaches(),
    s.registerRoute(
      new s.NavigationRoute(s.createHandlerBoundToURL("index.html")),
    ));
});
