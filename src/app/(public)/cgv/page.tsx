import Link from "next/link";

export default function CGVPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">
          Conditions Générales de Vente
        </h1>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">Objet</h2>
        <p className="text-white/70 leading-relaxed">
          Off-Market est une plateforme d&apos;accompagnement destinée aux
          freelances et coaches souhaitant développer leur activité. Les
          présentes Conditions Générales de Vente (CGV) régissent les relations
          contractuelles entre Off-Market SAS et ses utilisateurs.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">
          Services
        </h2>
        <p className="text-white/70 leading-relaxed">
          Off-Market propose les services suivants :
        </p>
        <ul className="list-disc list-inside text-white/70 leading-relaxed mt-2 space-y-1">
          <li>Formation en ligne (modules vidéo, exercices, livrables)</li>
          <li>Coaching individuel avec un coach dédié</li>
          <li>Outils de gestion (CRM, pipeline commercial, contrats)</li>
          <li>Communauté privée de freelances et coaches</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">Tarifs</h2>
        <p className="text-white/70 leading-relaxed">
          Les tarifs de l&apos;accompagnement Off-Market sont communiqués sur
          candidature. L&apos;accès à la plateforme est conditionné à la
          validation de la candidature par notre équipe.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">
          Paiement
        </h2>
        <p className="text-white/70 leading-relaxed">
          Le paiement s&apos;effectue par carte bancaire ou virement bancaire.
          Les modalités de paiement (comptant ou échelonné) sont définies lors de
          la validation de la candidature et précisées dans le contrat
          d&apos;accompagnement.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">
          Droit de rétractation
        </h2>
        <p className="text-white/70 leading-relaxed">
          Conformément au Code de la consommation, vous disposez d&apos;un délai
          de 14 jours à compter de la souscription pour exercer votre droit de
          rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
          Pour exercer ce droit, contactez-nous à contact@off-market.fr.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">
          Responsabilité
        </h2>
        <p className="text-white/70 leading-relaxed">
          Off-Market met à disposition des outils, formations et un
          accompagnement personnalisé pour aider ses utilisateurs à développer
          leur activité. Cependant, Off-Market ne garantit pas de résultats
          spécifiques. Les résultats dépendent de l&apos;implication et des
          actions de chaque utilisateur.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">
          Droit applicable
        </h2>
        <p className="text-white/70 leading-relaxed">
          Les présentes CGV sont soumises au droit français. En cas de litige,
          les parties s&apos;engagent à rechercher une solution amiable. À
          défaut, les tribunaux de Paris seront seuls compétents.
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
