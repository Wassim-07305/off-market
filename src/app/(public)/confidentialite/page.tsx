import Link from "next/link";

export default function ConfidentialitePage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">
          Politique de Confidentialité
        </h1>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">
          Données collectées
        </h2>
        <p className="text-white/70 leading-relaxed">
          Dans le cadre de l&apos;utilisation de la plateforme Off-Market, nous
          collectons les données personnelles suivantes :
        </p>
        <ul className="list-disc list-inside text-white/70 leading-relaxed mt-2 space-y-1">
          <li>Nom et prénom</li>
          <li>Adresse email</li>
          <li>Données de coaching (objectifs, progression, notes de session)</li>
          <li>Données d&apos;utilisation de la plateforme</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">
          Finalités
        </h2>
        <p className="text-white/70 leading-relaxed">
          Vos données personnelles sont collectées et traitées pour les
          finalités suivantes :
        </p>
        <ul className="list-disc list-inside text-white/70 leading-relaxed mt-2 space-y-1">
          <li>
            Gestion de la relation client (suivi de votre accompagnement,
            communication avec votre coach)
          </li>
          <li>
            Amélioration des services (analyse de l&apos;utilisation de la
            plateforme, personnalisation de l&apos;expérience)
          </li>
          <li>Envoi de communications relatives à votre accompagnement</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">
          Durée de conservation
        </h2>
        <p className="text-white/70 leading-relaxed">
          Vos données personnelles sont conservées pendant la durée de votre
          accompagnement et jusqu&apos;à 3 ans après la fin de la relation
          contractuelle, conformément aux obligations légales en vigueur.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">
          Vos droits
        </h2>
        <p className="text-white/70 leading-relaxed">
          Conformément au RGPD, vous disposez des droits suivants sur vos
          données personnelles :
        </p>
        <ul className="list-disc list-inside text-white/70 leading-relaxed mt-2 space-y-1">
          <li>Droit d&apos;accès : obtenir une copie de vos données</li>
          <li>
            Droit de rectification : corriger des données inexactes ou
            incomplètes
          </li>
          <li>
            Droit de suppression : demander l&apos;effacement de vos données
          </li>
          <li>
            Droit à la portabilité : recevoir vos données dans un format
            structuré
          </li>
        </ul>
        <p className="text-white/70 leading-relaxed mt-2">
          Pour exercer ces droits, contactez-nous à{" "}
          <a
            href="mailto:contact@off-market.fr"
            className="text-primary hover:text-primary-hover transition-colors"
          >
            contact@off-market.fr
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">Cookies</h2>
        <p className="text-white/70 leading-relaxed">
          La plateforme Off-Market utilise des cookies strictement nécessaires au
          fonctionnement du service (authentification, préférences utilisateur).
          Aucun cookie publicitaire ou de suivi tiers n&apos;est utilisé.
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
