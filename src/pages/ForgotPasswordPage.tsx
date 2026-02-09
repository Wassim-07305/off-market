import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { OffMarketLogo } from '@/components/ui/OffMarketLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const forgotPasswordSchema = z.object({
  email: z.email('Adresse email invalide'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsSubmitting(true)
    try {
      await resetPassword(data.email)
      setEmailSent(true)
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
            Reinitialisation du mot de passe
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mot de passe oublie</CardTitle>
            <CardDescription>
              {emailSent
                ? 'Un email de reinitialisation a ete envoye'
                : 'Entrez votre email pour recevoir un lien de reinitialisation'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-md bg-muted p-4 text-center">
                  <Mail className="mx-auto mb-2 h-10 w-10 text-primary" />
                  <p className="text-sm text-foreground">
                    Si un compte est associe a cette adresse, vous recevrez un
                    email avec les instructions pour reinitialiser votre mot de
                    passe.
                  </p>
                </div>

                <Link to="/login">
                  <Button variant="secondary" className="w-full" icon={<ArrowLeft className="h-4 w-4" />}>
                    Retour a la connexion
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="vous@exemple.com"
                  icon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button
                  type="submit"
                  loading={isSubmitting}
                  icon={<Send className="h-4 w-4" />}
                  className="w-full"
                >
                  Envoyer le lien
                </Button>

                <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  Retour a la connexion
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
