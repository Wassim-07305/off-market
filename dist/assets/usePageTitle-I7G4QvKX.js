import { r } from "./vendor-react-Cci7g3Cb.js";
function f(t) {
  r.useEffect(() => {
    const e = document.title;
    return (
      (document.title = t ? `${t} — Off-Market` : "Off-Market"),
      () => {
        document.title = e;
      }
    );
  }, [t]);
}
export { f as u };
