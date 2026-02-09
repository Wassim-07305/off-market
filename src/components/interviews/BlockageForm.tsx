import { useState } from 'react'
import { ArrowRight, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BLOCKAGE_CATEGORIES } from '@/lib/constants'
import { useCreateBlockage } from '@/hooks/useInterviews'
import type { BlockageFormData } from '@/types/forms'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface BlockageFormProps {
  interviewId: string
  memberId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const CATEGORY_OPTIONS = BLOCKAGE_CATEGORIES.map((c) => ({
  value: c,
  label: c.charAt(0).toUpperCase() + c.slice(1),
}))

const WHY_LABELS = [
  'Pourquoi ? (1)',
  'Pourquoi ? (2)',
  'Pourquoi ? (3)',
  'Pourquoi ? (4)',
  'Pourquoi ? (5)',
]

type WhyField = 'why_1' | 'why_2' | 'why_3' | 'why_4' | 'why_5'
const WHY_FIELDS: WhyField[] = ['why_1', 'why_2', 'why_3', 'why_4', 'why_5']

export function BlockageForm({ interviewId, memberId, onSuccess, onCancel }: BlockageFormProps) {
  const createBlockage = useCreateBlockage()

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<BlockageFormData>>({
    interview_id: interviewId,
    member_id: memberId,
    category: undefined,
    problem: '',
    why_1: '',
    why_2: '',
    why_3: '',
    why_4: '',
    why_5: '',
    root_cause: '',
    decided_action: '',
    result: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Step 0: Category + Problem
  // Steps 1-5: Why 1 through 5
  // Step 6: Root cause + Decided action
  const totalSteps = 7

  const canAdvance = () => {
    if (currentStep === 0) {
      return !!formData.problem?.trim()
    }
    if (currentStep >= 1 && currentStep <= 5) {
      const whyField = WHY_FIELDS[currentStep - 1]
      return !!formData[whyField]?.trim()
    }
    return true
  }

  const advanceStep = () => {
    if (currentStep === 0 && !formData.problem?.trim()) {
      setErrors({ problem: 'Le problème est requis' })
      return
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const skipToRootCause = () => {
    setCurrentStep(6)
  }

  const handleSubmit = async () => {
    if (!formData.problem?.trim()) {
      setErrors({ problem: 'Le problème est requis' })
      return
    }

    const payload: BlockageFormData = {
      interview_id: interviewId,
      member_id: memberId,
      category: formData.category as BlockageFormData['category'],
      problem: formData.problem!,
      why_1: formData.why_1 || '',
      why_2: formData.why_2 || '',
      why_3: formData.why_3 || '',
      why_4: formData.why_4 || '',
      why_5: formData.why_5 || '',
      root_cause: formData.root_cause || '',
      decided_action: formData.decided_action || '',
      result: formData.result || '',
    }

    await createBlockage.mutateAsync(payload)
    onSuccess?.()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Step 0: Category + Problem */}
      <div className="flex flex-col gap-3">
        <Select
          label="Catégorie"
          options={CATEGORY_OPTIONS}
          value={formData.category ?? ''}
          onChange={(val) => updateField('category', val)}
          placeholder="Sélectionner une catégorie"
        />
        <Textarea
          label="Problème identifié"
          placeholder="Décrivez le problème..."
          value={formData.problem ?? ''}
          onChange={(e) => updateField('problem', e.target.value)}
          error={errors.problem}
          autoGrow
        />
        {currentStep === 0 && (
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={advanceStep}
              disabled={!formData.problem?.trim()}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Continuer
            </Button>
          </div>
        )}
      </div>

      {/* Steps 1-5: Why chain - progressive disclosure */}
      {Array.from({ length: 5 }).map((_, index) => {
        const stepNumber = index + 1
        if (currentStep < stepNumber) return null

        const whyField = WHY_FIELDS[index]
        const isCurrentWhyStep = currentStep === stepNumber

        return (
          <div
            key={whyField}
            className={cn(
              'rounded-lg border border-border bg-secondary/30 p-4',
              'animate-in fade-in-0 slide-in-from-bottom-2'
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {stepNumber}
              </span>
              <span className="text-sm font-medium text-foreground">
                {WHY_LABELS[index]}
              </span>
            </div>
            <Textarea
              placeholder={`Pourquoi ce ${index === 0 ? 'problème' : 'constat'} ?`}
              value={formData[whyField] ?? ''}
              onChange={(e) => updateField(whyField, e.target.value)}
              autoGrow
              className="min-h-[60px]"
            />
            {isCurrentWhyStep && (
              <div className="mt-2 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipToRootCause}
                  icon={<SkipForward className="h-4 w-4" />}
                >
                  Passer à la cause racine
                </Button>
                <Button
                  size="sm"
                  onClick={advanceStep}
                  disabled={!canAdvance()}
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  {stepNumber === 5 ? 'Cause racine' : 'Suivant'}
                </Button>
              </div>
            )}
          </div>
        )
      })}

      {/* Step 6: Root cause + Decided action */}
      {currentStep >= 6 && (
        <div
          className={cn(
            'rounded-lg border border-primary/20 bg-primary/5 p-4',
            'animate-in fade-in-0 slide-in-from-bottom-2'
          )}
        >
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            Conclusion
          </h4>
          <div className="flex flex-col gap-3">
            <Textarea
              label="Cause racine identifiée"
              placeholder="Quelle est la cause racine du problème ?"
              value={formData.root_cause ?? ''}
              onChange={(e) => updateField('root_cause', e.target.value)}
              autoGrow
            />
            <Textarea
              label="Action décidée"
              placeholder="Quelle action a été décidée ?"
              value={formData.decided_action ?? ''}
              onChange={(e) => updateField('decided_action', e.target.value)}
              autoGrow
            />
          </div>
          <div className="mt-4 flex items-center justify-end gap-3">
            {onCancel && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onCancel}
                disabled={createBlockage.isPending}
              >
                Annuler
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSubmit}
              loading={createBlockage.isPending}
            >
              Enregistrer le blocage
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
