import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">
          Mentions Légales
        </h1>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">
          Éditeur du site
        </h2>
        <p className="text-white/70 leading-relaxed">
          Off-Market SAS
          <br />
          [Adresse du siège social]
          <br />
          RCS [Ville] — SIRET [numéro]
          <br />
          Directrice de la publication : Alexia Laneau
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">
          Hébergement
        </h2>
        <p className="text-white/70 leading-relaxed">
          Vercel Inc.
          <br />
          440 N Barranca Ave #4133
          <br />
          Covina, CA 91723, États-Unis
          <br />
          Site web : https://vercel.com
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">Contact</h2>
        <p className="text-white/70 leading-relaxed">
          Pour toute question ou réclamation, vous pouvez nous contacter à
          l&apos;adresse suivante :
          <br />
          <a
            href="mailto:contact@off-market.fr"
            className="text-primary hover:text-primary-hover transition-colors"
          >
            contact@off-market.fr
          </a>
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">CNIL</h2>
        <p className="text-white/70 leading-relaxed">
          Conformément à la loi « Informatique et Libertés » du 6 janvier 1978
          modifiée et au Règlement Général sur la Protection des Données (RGPD),
          vous disposez de droits d&apos;accès, de rectification et de
          suppression de vos données personnelles. Pour exercer ces droits,
          contactez-nous à contact@off-market.fr ou consultez notre{" "}
          <Link
            href="/confidentialite"
            className="text-primary hover:text-primary-hover transition-colors"
          >
            politique de confidentialité
          </Link>
          .
        </p>

        <div className="mt-12">
          <Link
            href="/"
            className="text-primary hover:text-primary-hover transition-colors"
          >
            &larr; Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
