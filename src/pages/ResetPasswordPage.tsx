import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Lock, Check, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { OffMarketLogo } from '@/components/ui/OffMarketLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const resetSchema = z.object({
  password: z.string().min(6, 'Minimum 6 caractères'),
  confirmPassword: z.string().min(6, 'Confirmation requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type ResetFormData = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  })

  async function onSubmit(data: ResetFormData) {
    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })
      if (error) throw error
      setSuccess(true)
      toast.success('Mot de passe mis à jour avec succès')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <OffMarketLogo size={48} showText textClassName="text-2xl text-foreground" />
          <p className="mt-3 text-muted-foreground">
            Nouveau mot de passe
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Réinitialiser le mot de passe</CardTitle>
            <CardDescription>
              {success
                ? 'Votre mot de passe a été mis à jour'
                : 'Choisissez un nouveau mot de passe pour votre compte'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-md bg-emerald-50 p-4 text-center">
                  <Check className="mx-auto mb-2 h-10 w-10 text-emerald-600" />
                  <p className="text-sm text-foreground">
                    Votre mot de passe a été réinitialisé avec succès.
                    Vous pouvez maintenant vous connecter.
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => navigate('/login')}
                  icon={<ArrowLeft className="h-4 w-4" />}
                >
                  Aller à la connexion
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  icon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="Répétez le mot de passe"
                  icon={<Lock className="h-4 w-4" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <Button
                  type="submit"
                  loading={isSubmitting}
                  icon={<Lock className="h-4 w-4" />}
                  className="w-full"
                >
                  Réinitialiser
                </Button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
