import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-600/10 flex items-center justify-center">
          <span className="text-3xl font-bold text-red-600">404</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Page introuvable
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            La page que vous recherchez n&apos;existe pas ou a ete deplacee.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
