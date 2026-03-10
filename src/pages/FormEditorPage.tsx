import { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Type,
  Hash,
  Mail,
  AlignLeft,
  ListChecks,
  CircleDot,
  ToggleLeft,
  Calendar,
  Upload,
  Star,
  ChevronDown,
  ChevronUp,
  Settings2,
  Inbox,
  Download,
} from 'lucide-react'
import {
  useFormWithFields,
  useFormSubmissions,
  useUpdateForm,
  useCreateFormField,
  useUpdateFormField,
  useDeleteFormField,
} from '@/hooks/useForms'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { TabsList, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn, formatDate } from '@/lib/utils'
import { exportToCSV } from '@/lib/csv'
import type { FormField } from '@/types/database'
import { usePageTitle } from '@/hooks/usePageTitle'

// ── Types de champ disponibles ───────────────────────────────

const FIELD_TYPES = [
  { value: 'text', label: 'Texte court', icon: Type },
  { value: 'textarea', label: 'Texte long', icon: AlignLeft },
  { value: 'number', label: 'Nombre', icon: Hash },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'select', label: 'Liste déroulante', icon: ListChecks },
  { value: 'radio', label: 'Choix unique', icon: CircleDot },
  { value: 'checkbox', label: 'Cases à cocher', icon: ToggleLeft },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'file', label: 'Fichier', icon: Upload },
  { value: 'rating', label: 'Évaluation', icon: Star },
] as const

type FieldType = (typeof FIELD_TYPES)[number]['value']

function getFieldIcon(type: string) {
  return FIELD_TYPES.find((ft) => ft.value === type)?.icon ?? Type
}

function getFieldLabel(type: string) {
  return FIELD_TYPES.find((ft) => ft.value === type)?.label ?? type
}

// ── Composant éditeur de champ ───────────────────────────────

function FieldEditor({
  field,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  field: FormField
  index: number
  total: number
  onUpdate: (id: string, data: Partial<FormField>) => void
  onDelete: (id: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const Icon = getFieldIcon(field.field_type)
  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.field_type)
  const optionsList = (field.options as { choices?: string[] })?.choices ?? []

  return (
    <Card className={cn('group transition-all', expanded && 'ring-2 ring-primary/20')}>
      <CardContent className="p-0">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {field.label || 'Sans titre'}
            </p>
            <p className="text-xs text-muted-foreground">
              {getFieldLabel(field.field_type)}
              {field.is_required && ' • Obligatoire'}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onMoveUp() }}
              disabled={index === 0}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMoveDown() }}
              disabled={index === total - 1}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(field.id) }}
              className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expanded editor */}
        {expanded && (
          <div className="border-t border-border/50 px-4 py-4 space-y-4">
            {/* Label */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Libellé du champ
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                placeholder="Ex: Votre nom complet"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Description <span className="text-muted-foreground/60">(optionnel)</span>
              </label>
              <input
                type="text"
                value={field.description ?? ''}
                onChange={(e) => onUpdate(field.id, { description: e.target.value || null })}
                placeholder="Texte d'aide sous le champ"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Placeholder */}
            {!['checkbox', 'radio', 'file', 'rating'].includes(field.field_type) && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={field.placeholder ?? ''}
                  onChange={(e) => onUpdate(field.id, { placeholder: e.target.value || null })}
                  placeholder="Texte indicatif"
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {/* Options (pour select/radio/checkbox) */}
            {hasOptions && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Options <span className="text-muted-foreground/60">(une par ligne)</span>
                </label>
                <textarea
                  value={optionsList.join('\n')}
                  onChange={(e) => {
                    const choices = e.target.value.split('\n')
                    onUpdate(field.id, { options: { choices } })
                  }}
                  placeholder={'Option 1\nOption 2\nOption 3'}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            )}

            {/* Toggle obligatoire */}
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Champ obligatoire</p>
                <p className="text-xs text-muted-foreground">Le répondant devra remplir ce champ</p>
              </div>
              <button
                onClick={() => onUpdate(field.id, { is_required: !field.is_required })}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors cursor-pointer',
                  field.is_required ? 'bg-primary' : 'bg-border'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                    field.is_required ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Panneau d'aperçu ─────────────────────────────────────────

function FormPreview({ fields, title }: { fields: FormField[]; title: string }) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-foreground">{title || 'Sans titre'}</h3>
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Aucun champ ajouté</p>
      ) : (
        fields.map((field) => {
          const options = (field.options as { choices?: string[] })?.choices ?? []

          return (
            <div key={field.id} className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                {field.label || 'Sans titre'}
                {field.is_required && <span className="ml-1 text-destructive">*</span>}
              </label>
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}

              {field.field_type === 'textarea' ? (
                <textarea
                  disabled
                  placeholder={field.placeholder ?? ''}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm resize-none"
                />
              ) : field.field_type === 'select' ? (
                <select disabled className="h-10 w-full rounded-lg border border-border bg-muted/20 px-3 text-sm">
                  <option>{field.placeholder || 'Sélectionner...'}</option>
                  {options.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              ) : field.field_type === 'radio' ? (
                <div className="space-y-2">
                  {options.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-foreground">
                      <input type="radio" disabled className="h-4 w-4" />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : field.field_type === 'checkbox' ? (
                <div className="space-y-2">
                  {options.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" disabled className="h-4 w-4 rounded" />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : field.field_type === 'rating' ? (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-6 w-6 text-muted-foreground/30" />
                  ))}
                </div>
              ) : field.field_type === 'file' ? (
                <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
                  <Upload className="mr-2 h-4 w-4" />
                  Glisser un fichier ici
                </div>
              ) : (
                <input
                  type={field.field_type === 'email' ? 'email' : field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
                  disabled
                  placeholder={field.placeholder ?? ''}
                  className="h-10 w-full rounded-lg border border-border bg-muted/20 px-3 text-sm"
                />
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

// ── Onglet Réponses ──────────────────────────────────────────

function SubmissionsTab({ formId, fields }: { formId: string; fields: FormField[] }) {
  const { data: result, isLoading } = useFormSubmissions(formId)
  const submissions = result?.data ?? []
  const count = result?.count ?? 0

  const handleExport = useCallback(() => {
    if (submissions.length === 0) return

    const columns: { key: string; label: string }[] = [
      { key: '_date', label: 'Date' },
      ...fields.map((f) => ({ key: f.id, label: f.label || f.field_type })),
    ]

    const rows = submissions.map((s) => {
      const row: Record<string, string> = {
        _date: formatDate(s.submitted_at),
      }
      for (const field of fields) {
        const val = (s.answers as Record<string, unknown>)?.[field.id]
        row[field.id] = val != null ? String(val) : ''
      }
      return row
    })

    exportToCSV(rows, columns as { key: keyof typeof rows[number]; label: string }[], `formulaire-reponses`)
  }, [submissions, fields])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="h-6 w-6" />}
        title="Aucune réponse"
        description="Les réponses à ce formulaire apparaîtront ici."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {count} réponse{count > 1 ? 's' : ''}
        </p>
        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="h-4 w-4" />}
          onClick={handleExport}
        >
          Exporter CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/40 bg-muted/30">
            <tr>
              <th className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Date</th>
              {fields.map((field) => (
                <th key={field.id} className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap max-w-48">
                  {field.label || field.field_type}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(submission.submitted_at)}
                </td>
                {fields.map((field) => {
                  const value = (submission.answers as Record<string, unknown>)?.[field.id]
                  const display = value == null
                    ? '—'
                    : Array.isArray(value)
                      ? (value as string[]).join(', ')
                      : String(value)

                  return (
                    <td key={field.id} className="px-4 py-3 text-foreground max-w-48 truncate">
                      {display}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Page principale ──────────────────────────────────────────

export default function FormEditorPage() {
  usePageTitle('Éditeur de formulaire')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: form, isLoading } = useFormWithFields(id)
  const updateForm = useUpdateForm()
  const createField = useCreateFormField()
  const updateField = useUpdateFormField()
  const deleteField = useDeleteFormField()

  const [activeTab, setActiveTab] = useState('editeur')
  const [title, setTitle] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Sync title/description from loaded form
  const effectiveTitle = title ?? form?.title ?? ''
  const effectiveDescription = description ?? form?.description ?? ''
  const fields = useMemo(() => form?.fields ?? [], [form?.fields])

  const handleSave = useCallback(async () => {
    if (!id) return
    try {
      await updateForm.mutateAsync({
        id,
        title: effectiveTitle,
        description: effectiveDescription || null,
      })
    } catch {
      // toast is handled by hook
    }
  }, [id, effectiveTitle, effectiveDescription, updateForm])

  const handlePublish = useCallback(async () => {
    if (!id) return
    const newStatus = form?.status === 'publié' ? 'brouillon' : 'publié'
    try {
      await updateForm.mutateAsync({ id, status: newStatus })
    } catch {
      // handled by hook
    }
  }, [id, form?.status, updateForm])

  const handleAddField = useCallback(async (fieldType: FieldType) => {
    if (!id) return
    try {
      await createField.mutateAsync({
        form_id: id,
        field_type: fieldType,
        label: '',
        description: null,
        placeholder: null,
        is_required: false,
        options: ['select', 'radio', 'checkbox'].includes(fieldType)
          ? { choices: ['Option 1', 'Option 2'] }
          : null,
        validation: null,
        conditional_logic: null,
        sort_order: fields.length,
      })
    } catch {
      // handled by hook
    }
  }, [id, fields.length, createField])

  const handleUpdateField = useCallback((fieldId: string, data: Partial<FormField>) => {
    updateField.mutate({ id: fieldId, ...data })
  }, [updateField])

  const handleDeleteField = useCallback(() => {
    if (!deleteConfirm || !id) return
    deleteField.mutate({ id: deleteConfirm, formId: id })
    setDeleteConfirm(null)
  }, [deleteConfirm, id, deleteField])

  const handleMoveField = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const swapIndex = direction === 'up' ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= fields.length) return

      const fieldA = fields[index]
      const fieldB = fields[swapIndex]
      updateField.mutate({ id: fieldA.id, sort_order: fieldB.sort_order })
      updateField.mutate({ id: fieldB.id, sort_order: fieldA.sort_order })
    },
    [fields, updateField]
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!form) {
    return (
      <EmptyState
        icon={<Settings2 className="h-6 w-6" />}
        title="Formulaire introuvable"
        description="Ce formulaire n'existe pas ou a été supprimé."
        action={
          <Button variant="secondary" onClick={() => navigate('/formulaires')}>
            Retour aux formulaires
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/formulaires')}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Éditeur de formulaire</h1>
              <Badge
                className={cn(
                  form.status === 'publié'
                    ? 'bg-green-100 text-green-700'
                    : form.status === 'fermé'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                )}
              >
                {form.status === 'publié' ? 'Publié' : form.status === 'fermé' ? 'Fermé' : 'Brouillon'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePublish}
            loading={updateForm.isPending}
          >
            {form.status === 'publié' ? 'Dépublier' : 'Publier'}
          </Button>
          <Button
            size="sm"
            icon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            loading={updateForm.isPending}
          >
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <TabsList
        tabs={[
          { value: 'editeur', label: 'Éditeur' },
          { value: 'apercu', label: 'Aperçu' },
          { value: 'reponses', label: 'Réponses' },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <TabsContent value="apercu" activeValue={activeTab}>
        <Card>
          <CardContent className="p-6 sm:p-8">
            <FormPreview fields={fields} title={effectiveTitle} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reponses" activeValue={activeTab}>
        <SubmissionsTab formId={id!} fields={fields} />
      </TabsContent>

      <TabsContent value="editeur" activeValue={activeTab}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Titre & description */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Titre du formulaire
                  </label>
                  <input
                    type="text"
                    value={effectiveTitle}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Formulaire de satisfaction"
                    className="h-11 w-full rounded-xl border border-border bg-white px-4 text-base font-semibold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Description <span className="text-muted-foreground/60">(optionnel)</span>
                  </label>
                  <textarea
                    value={effectiveDescription}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez l'objectif de ce formulaire..."
                    rows={2}
                    className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Liste des champs */}
            {fields.length === 0 ? (
              <EmptyState
                icon={<ListChecks className="h-6 w-6" />}
                title="Aucun champ"
                description="Ajoutez des champs depuis le panneau à droite pour construire votre formulaire."
              />
            ) : (
              <div className="space-y-3">
                {fields.map((field, i) => (
                  <FieldEditor
                    key={field.id}
                    field={field}
                    index={i}
                    total={fields.length}
                    onUpdate={handleUpdateField}
                    onDelete={(fieldId) => setDeleteConfirm(fieldId)}
                    onMoveUp={() => handleMoveField(i, 'up')}
                    onMoveDown={() => handleMoveField(i, 'down')}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Panneau latéral — Ajouter un champ */}
          <div className="space-y-4">
            <Card className="sticky top-6">
              <CardContent className="p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un champ
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {FIELD_TYPES.map((ft) => {
                    const Icon = ft.icon
                    return (
                      <button
                        key={ft.value}
                        onClick={() => handleAddField(ft.value)}
                        disabled={createField.isPending}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-white p-3',
                          'text-xs font-medium text-muted-foreground',
                          'transition-all duration-150 cursor-pointer',
                          'hover:border-primary/30 hover:bg-primary/5 hover:text-primary',
                          'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {ft.label}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Stats rapides */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Résumé
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Champs</span>
                    <span className="font-medium text-foreground">{fields.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Obligatoires</span>
                    <span className="font-medium text-foreground">
                      {fields.filter((f) => f.is_required).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge
                      className={cn(
                        'text-[10px]',
                        form.status === 'publié'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {form.status === 'publié' ? 'Publié' : 'Brouillon'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* Confirm delete field */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteField}
        title="Supprimer le champ"
        description="Êtes-vous sûr de vouloir supprimer ce champ ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="destructive"
      />
    </div>
  )
}
