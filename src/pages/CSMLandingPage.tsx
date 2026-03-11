import { Briefcase, Calendar, Phone, TrendingUp, Users, Euro, Gift, CheckCircle } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function CSMLandingPage() {
  usePageTitle('Recrutement CSM')
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2 text-amber-300">
            <Briefcase className="h-4 w-4" />
            <span className="text-sm font-medium">Recrutement en cours</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Customer Success Manager
            <span className="mt-2 block text-amber-400">(Coach Business)</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300 sm:text-xl">
            Rejoins l'équipe Off-Market et accompagne <strong className="text-white">10 nouveaux clients</strong> vers leur succès entrepreneurial.
          </p>
        </div>
      </header>

      {/* Video Section */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          Découvre ton futur rôle en vidéo
        </h2>
        <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
          <div className="aspect-video">
            <iframe
              src="https://www.tella.tv/video/recrutement-votre-futur-role-de-csm-chez-off-market-6n3n/embed?b=0&title=0&a=1&loop=0&autoPlay=false&t=0&muted=0&wt=0"
              className="h-full w-full"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
              title="Recrutement - Votre futur rôle de CSM chez Off-Market"
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Ta Mission
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                Accompagner 10 nouveaux clients
              </h3>
              <p className="text-slate-600">
                Tu seras responsable de l'accompagnement personnalisé de <strong>10 nouveaux clients</strong> dans leur parcours de formation et de développement business.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                Les faire réussir
              </h3>
              <p className="text-slate-600">
                Ton objectif principal : que chacun de tes 10 nouveaux clients atteigne ses objectifs et obtienne des résultats concrets.
              </p>
            </div>
          </div>

          {/* Calls Schedule */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <Phone className="h-8 w-8" />
              <h3 className="text-2xl font-bold">Planning des Calls</h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                <div className="mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-300" />
                  <span className="font-semibold text-amber-300">Mois 1</span>
                </div>
                <p className="text-3xl font-bold">1 call/semaine</p>
                <p className="mt-1 text-sm text-blue-100">Onboarding intensif</p>
              </div>

              <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
                <div className="mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-300" />
                  <span className="font-semibold text-amber-300">Mois 2 à 4</span>
                </div>
                <p className="text-3xl font-bold">1 call/2 semaines</p>
                <p className="mt-1 text-sm text-blue-100">Suivi régulier</p>
              </div>

              <div className="rounded-xl bg-white/20 p-6 backdrop-blur">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span className="font-semibold text-green-300">Total</span>
                </div>
                <p className="text-3xl font-bold">10 calls</p>
                <p className="mt-1 text-sm text-blue-100">Par client accompagné</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rémunération Section */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Rémunération
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Euro className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                Rémunération de base
              </h3>
              <p className="text-slate-600">
                Une rémunération attractive pour l'accompagnement de tes 10 nouveaux clients, versée mensuellement.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                Bonus Upsell
              </h3>
              <div className="mb-3 rounded-lg bg-white px-4 py-3 shadow-sm">
                <p className="text-3xl font-bold text-amber-600">500€ cash</p>
                <p className="text-sm text-slate-600">par client qui prend l'Upsell</p>
              </div>
              <p className="text-slate-600">
                Pour chaque client parmi tes 10 nouveaux clients qui décide de prendre l'Upsell, tu reçois un bonus de <strong className="text-amber-600">500€</strong> en cash.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-16 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
            Prêt(e) à accompagner tes 10 nouveaux clients ?
          </h2>
          <p className="mb-8 text-lg text-slate-300">
            Rejoins l'équipe Off-Market et participe à la réussite de nos clients.
          </p>
          <a
            href="mailto:recrutement@offmarket.fr?subject=Candidature CSM"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-lg font-semibold text-slate-900 transition-colors hover:bg-amber-400"
          >
            Postuler maintenant
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 text-center text-slate-400">
        <p>&copy; {new Date().getFullYear()} Off-Market. Tous droits réservés.</p>
      </footer>
    </div>
  )
}
