import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { OffMarketLogo } from '@/components/ui/OffMarketLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
    email: z.email('Adresse email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
    confirmPassword: z.string(),
  })
  .check(
    (ctx) => {
      if (ctx.value.password !== ctx.value.confirmPassword) {
        ctx.issues.push({
          input: ctx.value.confirmPassword,
          code: 'custom',
          message: 'Les mots de passe ne correspondent pas',
          path: ['confirmPassword'],
        })
      }
    }
  )

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormData) {
    setIsSubmitting(true)
    try {
      await signUp(data.email, data.password, data.full_name)
      toast.success('Compte créé avec succès !')
      navigate('/', { replace: true })
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
            Créez votre compte pour commencer
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>
              Remplissez le formulaire pour créer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Nom complet"
                type="text"
                placeholder="Jean Dupont"
                icon={<User className="h-4 w-4" />}
                error={errors.full_name?.message}
                {...register('full_name')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="vous@exemple.com"
                icon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 caracteres"
                icon={<Lock className="h-4 w-4" />}
                iconRight={
                  <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirmer le mot de passe"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Retapez votre mot de passe"
                icon={<Lock className="h-4 w-4" />}
                iconRight={
                  <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                loading={isSubmitting}
                icon={<UserPlus className="h-4 w-4" />}
                className="w-full"
              >
                Créer mon compte
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Deja un compte ?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Se connecter
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
