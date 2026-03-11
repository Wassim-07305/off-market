import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Target,
  Briefcase,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { OffMarketLogo } from '@/components/ui/OffMarketLogo'
import { cn } from '@/lib/utils'
import { usePageTitle } from '@/hooks/usePageTitle'

// ── Types ────────────────────────────────────────────────────

interface OnboardingData {
  fullName: string
  phone: string
  activity: string
  experience: string
  currentRevenue: string
  goal: string
  challenges: string[]
  source: string
}

const INITIAL_DATA: OnboardingData = {
  fullName: '',
  phone: '',
  activity: '',
  experience: '',
  currentRevenue: '',
  goal: '',
  challenges: [],
  source: '',
}

// ── Options ──────────────────────────────────────────────────

const ACTIVITY_OPTIONS = [
  'Coach / Consultant',
  'Freelance (dev, design, marketing…)',
  'Formateur / Infopreneur',
  'Commercial indépendant',
  'Autre',
]

const EXPERIENCE_OPTIONS = [
  'Moins de 6 mois',
  '6 mois – 1 an',
  '1 – 3 ans',
  'Plus de 3 ans',
]

const REVENUE_OPTIONS = [
  'Moins de 2 000 €/mois',
  '2 000 – 5 000 €/mois',
  '5 000 – 10 000 €/mois',
  'Plus de 10 000 €/mois',
]

const GOAL_OPTIONS = [
  'Atteindre 5 000 €/mois',
  'Atteindre 10 000 €/mois',
  'Dépasser 10 000 €/mois',
  'Structurer mon activité',
]

const CHALLENGE_OPTIONS = [
  'Trouver des clients',
  'Organiser mon temps',
  'Closer les ventes',
  'Fixer mes prix',
  'Créer du contenu',
  'Tenir un suivi régulier',
]

const SOURCE_OPTIONS = [
  'Instagram',
  'Bouche à oreille',
  'Recommandation',
  'LinkedIn',
  'Recherche Google',
  'Autre',
]

// ── Composant Step ───────────────────────────────────────────

const STEPS = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'activite', label: 'Activité', icon: Briefcase },
  { id: 'objectifs', label: 'Objectifs', icon: Target },
  { id: 'bienvenue', label: 'C\'est parti !', icon: Rocket },
]

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const isActive = i === currentStep
        const isDone = i < currentStep

        return (
          <div key={step.id} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={cn(
                  'h-px w-6 sm:w-10 transition-colors duration-300',
                  isDone ? 'bg-red-400' : 'bg-border'
                )}
              />
            )}
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300',
                isActive
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : isDone
                    ? 'bg-red-100 text-red-600'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {isDone ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 text-left cursor-pointer',
        selected
          ? 'border-red-400 bg-red-50 text-red-700 shadow-sm'
          : 'border-border bg-white text-foreground hover:border-red-200 hover:bg-red-50/30'
      )}
    >
      {label}
    </button>
  )
}

function MultiSelectButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer',
        selected
          ? 'border-red-400 bg-red-50 text-red-700 shadow-sm'
          : 'border-border bg-white text-foreground hover:border-red-200 hover:bg-red-50/30'
      )}
    >
      <div
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200',
          selected
            ? 'border-red-500 bg-red-500'
            : 'border-border'
        )}
      >
        {selected && <Check className="h-3 w-3 text-white" />}
      </div>
      {label}
    </button>
  )
}

// ── Page principale ──────────────────────────────────────────

export default function OnboardingPage() {
  usePageTitle('Bienvenue')
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const setProfile = useAuthStore((s) => s.setProfile)

  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    ...INITIAL_DATA,
    fullName: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
  })
  const [submitting, setSubmitting] = useState(false)

  const updateField = useCallback(
    <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const toggleChallenge = useCallback((challenge: string) => {
    setData((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter((c) => c !== challenge)
        : [...prev.challenges, challenge],
    }))
  }, [])

  const canNext = () => {
    switch (step) {
      case 0:
        return data.fullName.trim().length >= 2
      case 1:
        return data.activity !== '' && data.experience !== ''
      case 2:
        return data.goal !== '' && data.challenges.length > 0
      case 3:
        return true
      default:
        return false
    }
  }

  const handleComplete = async () => {
    if (submitting) return
    setSubmitting(true)

    try {
      // Mettre à jour le profil
      const updates: Record<string, unknown> = {
        full_name: data.fullName.trim(),
        onboarding_completed: true,
      }
      if (data.phone.trim()) {
        updates.phone = data.phone.trim()
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile?.id)

      if (profileError) throw profileError

      // Sauvegarder les réponses d'onboarding
      const responses = [
        { step: 'activity', data: { activity: data.activity, experience: data.experience } },
        { step: 'revenue', data: { currentRevenue: data.currentRevenue } },
        { step: 'goals', data: { goal: data.goal, challenges: data.challenges } },
        { step: 'source', data: { source: data.source } },
      ]

      // Tenter de sauvegarder les réponses (non-bloquant si la table n'existe pas encore)
      try {
        await supabase
          .from('onboarding_responses')
          .insert(responses.map((r) => ({ ...r, user_id: profile?.id, data: r.data })))
      } catch {
        // Table peut ne pas encore exister
      }

      // Mettre à jour le store
      if (profile) {
        setProfile({ ...profile, full_name: data.fullName.trim(), onboarding_completed: true })
      }

      toast.success('Bienvenue sur Off-Market ! 🎉')
      navigate('/', { replace: true })
    } catch {
      toast.error('Une erreur est survenue. Réessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
    else handleComplete()
  }

  const prev = () => {
    if (step > 0) setStep(step - 1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-red-50/20">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <OffMarketLogo size={32} showText textClassName="text-foreground" />
        <span className="text-xs text-muted-foreground">
          Étape {step + 1} / {STEPS.length}
        </span>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-12">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <div className="mb-10 flex justify-center">
            <StepIndicator currentStep={step} />
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {step === 0 && (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Bienvenue sur Off-Market
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Faisons connaissance pour personnaliser votre expérience.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Votre nom complet
                      </label>
                      <input
                        type="text"
                        value={data.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        placeholder="Prénom Nom"
                        className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Téléphone <span className="text-muted-foreground">(optionnel)</span>
                      </label>
                      <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+33 6 00 00 00 00"
                        className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Votre activité
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Aidez-nous à comprendre votre situation actuelle.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Quel est votre métier ?
                      </label>
                      <div className="grid gap-2">
                        {ACTIVITY_OPTIONS.map((opt) => (
                          <OptionButton
                            key={opt}
                            label={opt}
                            selected={data.activity === opt}
                            onClick={() => updateField('activity', opt)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Depuis combien de temps ?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {EXPERIENCE_OPTIONS.map((opt) => (
                          <OptionButton
                            key={opt}
                            label={opt}
                            selected={data.experience === opt}
                            onClick={() => updateField('experience', opt)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        CA mensuel actuel
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {REVENUE_OPTIONS.map((opt) => (
                          <OptionButton
                            key={opt}
                            label={opt}
                            selected={data.currentRevenue === opt}
                            onClick={() => updateField('currentRevenue', opt)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Vos objectifs
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Définissons ensemble ce que vous voulez accomplir.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Votre objectif principal
                      </label>
                      <div className="grid gap-2">
                        {GOAL_OPTIONS.map((opt) => (
                          <OptionButton
                            key={opt}
                            label={opt}
                            selected={data.goal === opt}
                            onClick={() => updateField('goal', opt)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Vos défis actuels <span className="text-muted-foreground">(plusieurs choix possibles)</span>
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {CHALLENGE_OPTIONS.map((opt) => (
                          <MultiSelectButton
                            key={opt}
                            label={opt}
                            selected={data.challenges.includes(opt)}
                            onClick={() => toggleChallenge(opt)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Comment nous avez-vous connu ?
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {SOURCE_OPTIONS.map((opt) => (
                          <OptionButton
                            key={opt}
                            label={opt}
                            selected={data.source === opt}
                            onClick={() => updateField('source', opt)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 shadow-xl shadow-red-500/25">
                    <Rocket className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Tout est prêt, {data.fullName.split(' ')[0]} !
                  </h2>
                  <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
                    Votre espace Off-Market est configuré. Explorez votre dashboard,
                    découvrez les formations, et commencez à suivre votre progression
                    vers {data.goal ? data.goal.toLowerCase() : 'vos objectifs'}.
                  </p>

                  <div className="mt-8 grid w-full max-w-sm gap-3 text-left">
                    {[
                      { icon: '📊', text: 'Dashboard personnalisé' },
                      { icon: '🎓', text: 'Formations accessibles' },
                      { icon: '💬', text: 'Messagerie avec votre coach' },
                      { icon: '🏆', text: 'Système de progression' },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="flex items-center gap-3 rounded-xl border border-border/50 bg-white px-4 py-3 shadow-sm"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-medium text-foreground">{item.text}</span>
                        <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between">
            {step > 0 ? (
              <button
                onClick={prev}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Retour
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={next}
              disabled={!canNext() || submitting}
              className={cn(
                'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer',
                'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25',
                'hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
              )}
            >
              {submitting ? (
                'Chargement...'
              ) : step === STEPS.length - 1 ? (
                <>
                  Accéder à mon espace
                  <Rocket className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continuer
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
