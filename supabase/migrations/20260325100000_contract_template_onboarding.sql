-- Migration: Insert le template "Contrat d'Accompagnement — Programme Système Off-Market"
-- 30 articles complets avec placeholders {{variable}}

INSERT INTO contract_templates (title, content, variables, is_active, created_by)
VALUES (
  'Contrat d''Accompagnement — Programme Système Off-Market',
  E'<div class="contract">

<h1>CONTRAT D''ACCOMPAGNEMENT</h1>
<h2 class="contract-subtitle">Programme Système Off-Market</h2>

<section class="parties">
<h2>ENTRE LES SOUSSIGNÉS</h2>

<div class="partie">
<p><strong>LE PRESTATAIRE :</strong></p>
<p>Get Your Goals Co.<br/>
Adresse : Plaisance du Touch<br/>
Ci-après dénommé « le Prestataire »</p>
</div>

<div class="partie">
<p><strong>LE CLIENT :</strong></p>
<p>{{client_name}}<br/>
Adresse : {{client_address}}<br/>
{{client_city}}<br/>
Ci-après dénommé « le Client »</p>
</div>

<p>Ci-après désignés ensemble « les Parties » et individuellement « une Partie ».</p>
</section>

<section class="article">
<h2>Article 1 – OBJET</h2>
<p>Le présent contrat a pour objet de définir les conditions dans lesquelles le Prestataire s''engage à fournir au Client un accompagnement stratégique dans le cadre du Programme Système Off-Market.</p>
<p>Cet accompagnement vise à permettre au Client d''atteindre les objectifs suivants :</p>
<ul>
<li>Créer son propre marché et se positionner comme référence dans son domaine</li>
<li>Construire une offre premium à forte valeur perçue</li>
<li>Mettre en place une communication authentique et impactante</li>
<li>Développer un contenu stratégique sur LinkedIn et Instagram</li>
<li>Mettre en œuvre une stratégie d''acquisition par la valeur</li>
<li>Maîtriser la conversion pré-sale pour transformer les prospects en clients</li>
</ul>
</section>

<section class="article">
<h2>Article 2 – DURÉE</h2>
<p>Le présent contrat est conclu pour une durée ferme de <strong>120 jours</strong> (cent vingt jours) à compter de la date de signature.</p>
<p>Cette durée est incompressible et ne peut faire l''objet d''aucune réduction, sauf accord écrit des deux Parties ou application des dispositions prévues aux articles 14 et 15 du présent contrat.</p>
</section>

<section class="article">
<h2>Article 3 – DESCRIPTION DES PRESTATIONS</h2>
<p>Le Programme Système Off-Market comprend les 7 modules suivants :</p>

<div class="module">
<p><strong>Module 1 – Création de marché</strong></p>
<p>Identification et structuration d''un positionnement unique permettant au Client de créer son propre marché, sans concurrence directe. Travail sur l''identité de marque, la proposition de valeur et la différenciation stratégique.</p>
</div>

<div class="module">
<p><strong>Module 2 – Offre Off-Market</strong></p>
<p>Conception d''une offre premium irrésistible, structurée pour maximiser la valeur perçue et le prix de vente. Définition du packaging, du pricing et des garanties associées.</p>
</div>

<div class="module">
<p><strong>Module 3 – Communication</strong></p>
<p>Mise en place d''une stratégie de communication authentique et cohérente sur l''ensemble des canaux. Travail sur le storytelling, le personal branding et la création d''une communauté engagée.</p>
</div>

<div class="module">
<p><strong>Module 4 – Contenu LinkedIn / Instagram</strong></p>
<p>Stratégie de contenu spécifique à chaque plateforme. Création de calendriers éditoriaux, formats de posts performants, techniques d''engagement et d''algorithme. Production de contenu à forte valeur ajoutée.</p>
</div>

<div class="module">
<p><strong>Module 5 – Acquisition par la valeur</strong></p>
<p>Mise en œuvre de stratégies d''acquisition organique basées sur l''apport de valeur. Techniques de prospection douce, lead nurturing et construction de relations durables avec les prospects.</p>
</div>

<div class="module">
<p><strong>Module 6 – Conversion Pré-sale</strong></p>
<p>Maîtrise du processus de conversion avant-vente. Scripts d''appels, gestion des objections, techniques de closing éthique et mise en place d''un tunnel de conversion optimisé.</p>
</div>

<div class="module">
<p><strong>Module 7 – Suivi, accompagnement et support</strong></p>
<p>Accompagnement continu tout au long du programme. Sessions de coaching individuelles et collectives, support par messagerie, revues de performance et ajustements stratégiques réguliers.</p>
</div>
</section>

<section class="article">
<h2>Article 4 – CONDITIONS D''ACCÈS</h2>
<p>L''accès au Programme est conditionné à :</p>
<ul>
<li>La signature du présent contrat par le Client</li>
<li>Le règlement intégral ou la mise en place de l''échéancier de paiement convenu</li>
<li>La fourniture par le Client des informations nécessaires au démarrage de l''accompagnement</li>
</ul>
<p>Le Prestataire se réserve le droit de refuser ou de suspendre l''accès au Programme en cas de non-respect de ces conditions.</p>
</section>

<section class="article">
<h2>Article 5 – CALENDRIER D''EXÉCUTION</h2>
<p>Le programme se déroule sur une période de 120 jours selon un calendrier défini conjointement entre le Prestataire et le Client lors de la session de lancement.</p>
<p>Ce calendrier inclut :</p>
<ul>
<li>Les sessions de coaching individuelles (fréquence et durée définies au démarrage)</li>
<li>Les sessions de coaching collectives</li>
<li>Les deadlines de livraison des travaux et exercices</li>
<li>Les points d''étape et revues de performance</li>
</ul>
<p>Le Client s''engage à respecter le calendrier établi. Tout retard imputable au Client ne pourra donner lieu à une prolongation du programme sans accord écrit du Prestataire.</p>
</section>

<section class="article">
<h2>Article 6 – PRIX ET MODALITÉS DE PAIEMENT</h2>
<p>Le prix total de l''accompagnement est fixé à <strong>3 500 EUR TTC</strong> (trois mille cinq cents euros toutes taxes comprises).</p>
<p>Le règlement s''effectue par virement bancaire aux coordonnées suivantes :</p>
<ul>
<li><strong>Titulaire :</strong> Get Your Goals Co.</li>
<li><strong>IBAN :</strong> FR76 1741 8000 0100 0119 1847 379</li>
<li><strong>BIC :</strong> SNNNFR22XXX</li>
</ul>
<p>Les modalités de paiement (comptant ou échelonné) sont définies d''un commun accord entre les Parties et précisées dans l''annexe financière jointe au présent contrat.</p>
<p>En cas de retard de paiement, des pénalités de retard seront appliquées conformément aux dispositions légales en vigueur.</p>
</section>

<section class="article">
<h2>Article 7 – GARANTIE DE RÉSULTAT</h2>
<p>Le Prestataire s''engage à mettre en œuvre tous les moyens nécessaires pour permettre au Client d''atteindre un chiffre d''affaires de <strong>10 000 EUR par mois</strong> dans un délai de 120 jours à compter du début du programme.</p>
<p>Cette garantie est soumise au respect <strong>strict et cumulatif</strong> des conditions suivantes par le Client :</p>
<ul>
<li>Participation assidue à l''ensemble des sessions de coaching prévues au calendrier</li>
<li>Réalisation de l''intégralité des exercices et travaux demandés dans les délais impartis</li>
<li>Application rigoureuse des stratégies et recommandations fournies par le Prestataire</li>
<li>Disponibilité et réactivité dans les échanges avec le Prestataire</li>
<li>Respect du calendrier d''exécution défini à l''article 5</li>
<li>Investissement personnel minimum de 2 heures par jour dans la mise en œuvre du programme</li>
</ul>
<p>En cas de non-atteinte de l''objectif malgré le respect de l''ensemble de ces conditions, le Prestataire s''engage à prolonger l''accompagnement gratuitement jusqu''à l''atteinte de l''objectif, dans la limite de 60 jours supplémentaires.</p>
<p>Le non-respect de l''une quelconque des conditions ci-dessus par le Client libère le Prestataire de toute obligation au titre de la présente garantie.</p>
</section>

<section class="article">
<h2>Article 8 – OBLIGATIONS DU PRESTATAIRE</h2>
<p>Le Prestataire s''engage à :</p>
<ul>
<li>Fournir un accompagnement professionnel, personnalisé et de qualité</li>
<li>Mettre à disposition du Client l''ensemble des ressources pédagogiques prévues dans le programme</li>
<li>Assurer un suivi régulier et un support réactif pendant toute la durée du contrat</li>
<li>Respecter les horaires et la fréquence des sessions convenus</li>
<li>Adapter les conseils et stratégies à la situation spécifique du Client</li>
<li>Informer le Client de toute difficulté pouvant impacter le bon déroulement du programme</li>
</ul>
</section>

<section class="article">
<h2>Article 9 – OBLIGATIONS DU CLIENT</h2>
<p>Le Client s''engage à :</p>
<ul>
<li>Participer activement et assidûment à l''ensemble des sessions prévues</li>
<li>Réaliser les exercices, travaux et mises en œuvre dans les délais convenus</li>
<li>Appliquer les stratégies et recommandations du Prestataire de bonne foi</li>
<li>Fournir au Prestataire toutes les informations nécessaires au bon déroulement de l''accompagnement</li>
<li>Signaler sans délai toute difficulté rencontrée dans la mise en œuvre du programme</li>
<li>Respecter les conditions de paiement prévues à l''article 6</li>
<li>Adopter un comportement respectueux et constructif dans le cadre du programme</li>
</ul>
</section>

<section class="article">
<h2>Article 10 – LIMITES DE RESPONSABILITÉ</h2>
<p>Le Prestataire ne saurait être tenu responsable :</p>
<ul>
<li>Des résultats commerciaux du Client, ceux-ci dépendant de facteurs multiples et notamment de l''implication personnelle du Client</li>
<li>De tout dommage indirect, y compris les pertes de chiffre d''affaires, de bénéfices ou de clientèle</li>
<li>Des décisions prises par le Client sur la base des conseils prodigués, le Client restant seul décisionnaire de sa stratégie commerciale</li>
<li>De tout manquement du Client à ses propres obligations légales et réglementaires</li>
</ul>
<p>En tout état de cause, la responsabilité totale du Prestataire au titre du présent contrat ne saurait excéder le montant total des sommes effectivement perçues au titre du présent contrat.</p>
</section>

<section class="article">
<h2>Article 11 – COMPORTEMENT / NON-DÉNIGREMENT</h2>
<p>Les Parties s''engagent mutuellement à :</p>
<ul>
<li>Maintenir un comportement respectueux et professionnel tout au long de la relation contractuelle et au-delà</li>
<li>S''abstenir de tout acte de dénigrement, diffamation ou propos portant atteinte à la réputation de l''autre Partie</li>
<li>Ne pas publier de commentaires ou avis négatifs sur les réseaux sociaux, plateformes d''avis ou tout autre support accessible au public, sans avoir préalablement tenté un règlement amiable conformément à l''article 26</li>
</ul>
<p>Tout manquement à cette obligation pourra donner lieu à des dommages et intérêts, sans préjudice des autres recours disponibles.</p>
</section>

<section class="article">
<h2>Article 12 – CONFIDENTIALITÉ</h2>
<p>Chaque Partie s''engage à maintenir strictement confidentielles toutes les informations de nature confidentielle, qu''elles soient techniques, commerciales, financières ou stratégiques, communiquées par l''autre Partie dans le cadre du présent contrat.</p>
<p>Cette obligation de confidentialité s''applique pendant toute la durée du contrat et pendant une période de <strong>5 ans</strong> (cinq ans) suivant sa résiliation ou son expiration.</p>
<p>Sont notamment considérées comme confidentielles :</p>
<ul>
<li>Les méthodes, stratégies et outils propriétaires du Prestataire</li>
<li>Les informations personnelles et commerciales du Client</li>
<li>Les contenus pédagogiques et supports de formation</li>
<li>Les résultats et données de performance</li>
<li>Les conditions financières du présent contrat</li>
</ul>
<p>Cette obligation ne s''applique pas aux informations qui sont ou deviennent publiques sans faute de la Partie réceptrice, ou qui doivent être divulguées en vertu d''une obligation légale ou réglementaire.</p>
</section>

<section class="article">
<h2>Article 13 – PROPRIÉTÉ INTELLECTUELLE</h2>
<p>L''ensemble des contenus, méthodes, outils, supports pédagogiques, frameworks et méthodologies utilisés dans le cadre du Programme Système Off-Market restent la propriété exclusive du Prestataire.</p>
<p>Le Client bénéficie d''un droit d''utilisation personnel, non exclusif et non transférable, limité à la durée du programme et à ses besoins propres.</p>
<p>Il est strictement interdit au Client de :</p>
<ul>
<li>Reproduire, copier ou dupliquer les contenus et supports fournis</li>
<li>Partager, diffuser ou transmettre ces contenus à des tiers</li>
<li>Utiliser les méthodes et stratégies du Prestataire pour créer un programme concurrent</li>
<li>Enregistrer les sessions de coaching sans autorisation préalable écrite du Prestataire</li>
</ul>
<p>Toute violation de cette clause pourra entraîner la résiliation immédiate du contrat sans remboursement, ainsi que des poursuites judiciaires.</p>
</section>

<section class="article">
<h2>Article 14 – RÉTRACTATION</h2>
<p>Conformément aux dispositions du Code de la consommation, le Client dispose d''un droit de rétractation de <strong>14 jours</strong> (quatorze jours) à compter de la date de signature du présent contrat.</p>
<p>Pour exercer ce droit, le Client doit notifier sa décision par courrier recommandé avec accusé de réception ou par e-mail avec accusé de réception à l''adresse du Prestataire.</p>
<p>En cas de rétractation dans le délai imparti, le Prestataire procédera au remboursement intégral des sommes versées dans un délai de 14 jours suivant la réception de la notification.</p>
<p>Si le Client a expressément demandé le commencement de la prestation avant l''expiration du délai de rétractation et exerce néanmoins son droit de rétractation, il sera redevable d''un montant proportionnel aux prestations effectivement fournies.</p>
</section>

<section class="article">
<h2>Article 15 – RÉSILIATION ANTICIPÉE</h2>
<p>Le présent contrat peut être résilié de manière anticipée dans les cas suivants :</p>
<ul>
<li><strong>Par le Prestataire :</strong> en cas de manquement grave du Client à ses obligations contractuelles, après mise en demeure restée infructueuse pendant 15 jours. Dans ce cas, aucun remboursement ne sera dû.</li>
<li><strong>Par le Client :</strong> en cas de manquement grave du Prestataire à ses obligations, après mise en demeure restée infructueuse pendant 15 jours. Dans ce cas, un remboursement prorata temporis sera effectué.</li>
<li><strong>D''un commun accord :</strong> les Parties peuvent convenir de mettre fin au contrat à tout moment, les conditions financières de la résiliation étant alors définies d''un commun accord.</li>
</ul>
<p>La résiliation prend effet à la date de réception de la notification de résiliation par l''autre Partie.</p>
</section>

<section class="article">
<h2>Article 16 – FORCE MAJEURE</h2>
<p>Aucune Partie ne sera tenue responsable de l''inexécution ou du retard dans l''exécution de ses obligations contractuelles si cette inexécution ou ce retard résulte d''un cas de force majeure tel que défini par l''article 1218 du Code civil.</p>
<p>En cas de force majeure, la Partie affectée en informera l''autre Partie dans les plus brefs délais. Les obligations des Parties seront suspendues pendant la durée de l''événement de force majeure.</p>
<p>Si l''événement de force majeure se prolonge au-delà de 30 jours, chaque Partie pourra résilier le contrat par notification écrite, sans indemnité. Un remboursement prorata temporis sera alors effectué au bénéfice du Client.</p>
</section>

<section class="article">
<h2>Article 17 – INTERRUPTIONS TEMPORAIRES</h2>
<p>En cas d''impossibilité temporaire pour l''une des Parties de respecter le calendrier prévu (maladie, congés, obligations personnelles impératives), celle-ci en informera l''autre Partie dans les plus brefs délais.</p>
<p>Les sessions manquées pourront être reportées d''un commun accord, dans la limite d''un report maximum de 15 jours par session.</p>
<p>Au-delà de 3 reports consécutifs imputables au Client, le Prestataire se réserve le droit de considérer que le Client ne remplit plus ses obligations et d''appliquer les dispositions de l''article 15.</p>
</section>

<section class="article">
<h2>Article 18 – DONNÉES PERSONNELLES / RGPD</h2>
<p>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, le Prestataire s''engage à :</p>
<ul>
<li>Collecter et traiter les données personnelles du Client uniquement dans le cadre de l''exécution du présent contrat</li>
<li>Ne pas communiquer les données personnelles du Client à des tiers sans son consentement préalable</li>
<li>Mettre en œuvre les mesures de sécurité appropriées pour protéger les données personnelles</li>
<li>Conserver les données personnelles du Client pendant une durée maximale de <strong>3 ans</strong> à compter de la fin du contrat</li>
<li>Supprimer ou restituer les données personnelles à la demande du Client</li>
</ul>
<p>Le Client dispose d''un droit d''accès, de rectification, d''effacement, de portabilité et d''opposition sur ses données personnelles. Ces droits peuvent être exercés en contactant le Prestataire à l''adresse : <strong>contact@get-your-goals.fr</strong></p>
</section>

<section class="article">
<h2>Article 19 – UTILISATION TÉMOIGNAGES</h2>
<p>Le Client autorise le Prestataire à utiliser son témoignage, ses résultats et son retour d''expérience à des fins promotionnelles et commerciales, sous réserve de son accord préalable sur le contenu exact du témoignage.</p>
<p>Cette autorisation comprend la diffusion sur les supports suivants : site internet, réseaux sociaux, supports marketing, présentations commerciales.</p>
<p>Le Client peut retirer cette autorisation à tout moment par notification écrite au Prestataire. Le retrait prendra effet dans un délai de 30 jours suivant la réception de la notification.</p>
</section>

<section class="article">
<h2>Article 20 – CESSION ET SOUS-TRAITANCE</h2>
<p>Le présent contrat est conclu <em>intuitu personae</em>. Le Client ne peut céder tout ou partie de ses droits et obligations au titre du présent contrat sans l''accord préalable écrit du Prestataire.</p>
<p>Le Prestataire se réserve le droit de sous-traiter tout ou partie des prestations à des intervenants qualifiés de son choix, sous sa responsabilité et sans modification des conditions du présent contrat.</p>
</section>

<section class="article">
<h2>Article 21 – MODIFICATIONS DU CONTRAT</h2>
<p>Toute modification du présent contrat devra faire l''objet d''un avenant écrit signé par les deux Parties.</p>
<p>Aucune modification verbale ou tacite ne sera opposable aux Parties.</p>
</section>

<section class="article">
<h2>Article 22 – NULLITÉ PARTIELLE</h2>
<p>Si l''une quelconque des clauses du présent contrat est déclarée nulle ou inapplicable par une juridiction compétente, les autres clauses conserveront leur plein effet.</p>
<p>Les Parties s''engagent à négocier de bonne foi une clause de remplacement ayant un effet économique aussi proche que possible de la clause annulée.</p>
</section>

<section class="article">
<h2>Article 23 – NON-RENONCIATION</h2>
<p>Le fait pour l''une des Parties de ne pas se prévaloir d''un manquement de l''autre Partie à l''une quelconque des obligations du présent contrat ne saurait être interprété comme une renonciation à s''en prévaloir ultérieurement.</p>
</section>

<section class="article">
<h2>Article 24 – INTÉGRALITÉ DU CONTRAT</h2>
<p>Le présent contrat, y compris ses annexes, constitue l''intégralité de l''accord entre les Parties et remplace tout accord, arrangement ou engagement antérieur, écrit ou verbal, relatif à son objet.</p>
</section>

<section class="article">
<h2>Article 25 – CLAUSE PÉNALE</h2>
<p>En cas de manquement par le Client à l''une de ses obligations essentielles au titre du présent contrat (notamment les obligations de paiement ou de confidentialité), le Client sera redevable, à titre de clause pénale, d''une indemnité forfaitaire égale à <strong>20 %</strong> (vingt pour cent) du montant total du contrat.</p>
<p>Cette indemnité est due de plein droit, sans mise en demeure préalable, et sans préjudice de tous dommages et intérêts complémentaires que le Prestataire pourrait réclamer.</p>
</section>

<section class="article">
<h2>Article 26 – MÉDIATION / RÈGLEMENT AMIABLE</h2>
<p>En cas de litige relatif à l''interprétation ou à l''exécution du présent contrat, les Parties s''engagent à rechercher une solution amiable avant toute action judiciaire.</p>
<p>À cet effet, la Partie la plus diligente adressera à l''autre une notification écrite exposant le différend. Les Parties disposeront d''un délai de 30 jours à compter de cette notification pour trouver un accord amiable.</p>
<p>À défaut d''accord amiable, les Parties pourront recourir à un médiateur de la consommation conformément aux dispositions du Code de la consommation.</p>
</section>

<section class="article">
<h2>Article 27 – LOI APPLICABLE</h2>
<p>Le présent contrat est régi par la <strong>loi française</strong>.</p>
<p>Toute question relative à sa validité, son interprétation ou son exécution sera tranchée conformément au droit français.</p>
</section>

<section class="article">
<h2>Article 28 – JURIDICTION COMPÉTENTE</h2>
<p>En cas de litige non résolu par voie amiable ou de médiation, les tribunaux compétents du ressort du siège social du Prestataire seront seuls compétents pour connaître du différend.</p>
</section>

<section class="article">
<h2>Article 29 – SIGNATURE ÉLECTRONIQUE</h2>
<p>Conformément aux articles 1366 et 1367 du Code civil, les Parties reconnaissent que la signature électronique du présent contrat a la même valeur juridique qu''une signature manuscrite.</p>
<p>Les Parties acceptent expressément que le présent contrat puisse être signé par voie électronique et que cette signature constitue la preuve de leur consentement aux obligations qui en découlent.</p>
</section>

<section class="article">
<h2>Article 30 – ANNEXES CONTRACTUELLES</h2>
<p>Les annexes suivantes font partie intégrante du présent contrat :</p>
<ul>
<li>Annexe 1 : Calendrier d''exécution détaillé</li>
<li>Annexe 2 : Conditions financières et échéancier de paiement</li>
<li>Annexe 3 : Descriptif détaillé des modules du programme</li>
</ul>
<p>En cas de contradiction entre le corps du contrat et une annexe, les dispositions du corps du contrat prévaudront.</p>
</section>

<section class="signature">
<p>Fait à Plaisance du Touch, le {{date}}</p>
<p>En deux exemplaires originaux.</p>

<div class="signature-block">
<div class="signature-party">
<p><strong>Pour le Prestataire</strong></p>
<p>Get Your Goals Co.</p>
<p><em>Lu et approuvé</em></p>
<p class="signature-line">Signature : ___________________________</p>
</div>

<div class="signature-party">
<p><strong>Le Client</strong></p>
<p>{{client_name}}</p>
<p><em>Lu et approuvé</em></p>
<p class="signature-line">Signature : ___________________________</p>
</div>
</div>
</section>

</div>',
  '[
    {"key": "client_name", "label": "Nom et Prénom", "type": "text"},
    {"key": "client_address", "label": "Adresse", "type": "text"},
    {"key": "client_city", "label": "Code postal et Ville", "type": "text"},
    {"key": "date", "label": "Date de signature", "type": "date"}
  ]'::jsonb,
  true,
  NULL
);
