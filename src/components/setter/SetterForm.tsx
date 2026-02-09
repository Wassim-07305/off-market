import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { setterActivitySchema } from '@/types/forms'
import type { SetterActivityFormData } from '@/types/forms'
import { useUpsertSetterActivity } from '@/hooks/useSetterActivities'
import { useClients } from '@/hooks/useClients'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

export function SetterForm() {
  const { user } = useAuth()
  const upsertActivity = useUpsertSetterActivity()
  const { data: clientsData } = useClients()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetterActivityFormData>({
    resolver: zodResolver(setterActivitySchema) as any,
    defaultValues: {
      client_id: '',
      date: new Date().toISOString().split('T')[0],
      messages_sent: 0,
      notes: '',
    },
  })

  const watchedClientId = watch('client_id')

  const onSubmit = async (data: SetterActivityFormData) => {
    if (!user?.id) return
    await upsertActivity.mutateAsync({
      ...data,
      user_id: user.id,
      notes: data.notes || null,
    } as SetterActivityFormData & { user_id: string })
    reset({
      client_id: '',
      date: new Date().toISOString().split('T')[0],
      messages_sent: 0,
      notes: '',
    })
  }

  const clientOptions = (clientsData?.data ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Enregistrer l'activité du jour</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Client"
              options={clientOptions}
              value={watchedClientId}
              onChange={(val) => setValue('client_id', val)}
              error={errors.client_id?.message}
            />
            <Input
              label="Messages envoyés"
              type="number"
              min="0"
              {...register('messages_sent')}
              error={errors.messages_sent?.message}
            />
            <Input
              label="Date"
              type="date"
              {...register('date')}
              error={errors.date?.message}
            />
          </div>

          <Textarea
            label="Notes (optionnel)"
            placeholder="Remarques sur l'activité du jour..."
            {...register('notes')}
            error={errors.notes?.message}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={isSubmitting}
              icon={<Send className="h-4 w-4" />}
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
