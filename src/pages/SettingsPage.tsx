import { useState, useCallback } from 'react'
import { User, Lock, Bell, Camera, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile } from '@/hooks/useUsers'
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useNotificationPreferences'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TabsList, TabsContent } from '@/components/ui/tabs'
import { getInitials } from '@/lib/utils'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/database'
import type { NotificationPreferences } from '@/types/database'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nom requis'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Mot de passe actuel requis'),
  newPassword: z.string().min(6, 'Minimum 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmation requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const updateProfile = useUpdateProfile()
  const [activeTab, setActiveTab] = useState('profile')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [passwordChanging, setPasswordChanging] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return
    await updateProfile.mutateAsync({ id: user.id, ...data })
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordChanging(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })
      if (error) throw error
      toast.success('Mot de passe mis a jour')
      resetPassword()
    } catch {
      toast.error('Erreur lors du changement de mot de passe')
    } finally {
      setPasswordChanging(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setAvatarUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await updateProfile.mutateAsync({ id: user.id, avatar_url: publicUrl })
      toast.success('Photo de profil mise a jour')
    } catch {
      toast.error('Erreur lors du telechargement')
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Parametres</h1>
        <p className="text-sm text-muted-foreground">Gerez votre profil et vos preferences</p>
      </div>

      <TabsList
        tabs={[
          { value: 'profile', label: <><User className="mr-2 h-4 w-4" />Profil</> },
          { value: 'security', label: <><Lock className="mr-2 h-4 w-4" />Securite</> },
          { value: 'notifications', label: <><Bell className="mr-2 h-4 w-4" />Notifications</> },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <TabsContent value="profile" activeValue={activeTab} className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Avatar card */}
            <Card>
              <CardHeader>
                <CardTitle>Photo de profil</CardTitle>
                <CardDescription>Cliquez pour modifier</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <label className="relative cursor-pointer group">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl font-bold text-primary ring-4 ring-primary/10 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(profile?.full_name ?? 'U')
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                </label>
                <p className="mt-3 text-sm font-medium text-foreground">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
                {avatarUploading && (
                  <p className="mt-2 text-xs text-primary">Telechargement...</p>
                )}
              </CardContent>
            </Card>

            {/* Profile form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez a jour vos informations</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                  <Input
                    label="Nom complet"
                    {...registerProfile('full_name')}
                    error={profileErrors.full_name?.message}
                  />
                  <Input
                    label="Email"
                    value={profile?.email ?? ''}
                    disabled
                    className="opacity-60"
                  />
                  <Input
                    label="Telephone"
                    {...registerProfile('phone')}
                    placeholder="+33 6 00 00 00 00"
                    error={profileErrors.phone?.message}
                  />
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      loading={updateProfile.isPending}
                      disabled={!profileDirty}
                      icon={<Check className="h-4 w-4" />}
                    >
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
      </TabsContent>

      <TabsContent value="security" activeValue={activeTab} className="mt-6">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>Utilisez un mot de passe fort et unique</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <Input
                  label="Mot de passe actuel"
                  type="password"
                  {...registerPassword('currentPassword')}
                  error={passwordErrors.currentPassword?.message}
                />
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  {...registerPassword('newPassword')}
                  error={passwordErrors.newPassword?.message}
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  {...registerPassword('confirmPassword')}
                  error={passwordErrors.confirmPassword?.message}
                />
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    loading={passwordChanging}
                    icon={<Lock className="h-4 w-4" />}
                  >
                    Mettre a jour
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
      </TabsContent>

      <TabsContent value="notifications" activeValue={activeTab} className="mt-6">
          <NotificationsTab />
      </TabsContent>
    </div>
  )
}

const NOTIFICATION_ITEMS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: 'new_messages', label: 'Nouveaux messages', description: 'Recevoir une notification pour chaque nouveau message' },
  { key: 'new_leads', label: 'Nouveaux leads', description: 'Être notifié quand un nouveau lead est ajouté' },
  { key: 'call_reminders', label: 'Rappels de calls', description: 'Recevoir un rappel avant chaque call planifié' },
  { key: 'formation_progress', label: 'Progression formations', description: 'Notifications sur la progression des formations' },
]

function NotificationsTab() {
  const { data: prefs, isLoading } = useNotificationPreferences()
  const updatePrefs = useUpdateNotificationPreferences()

  const currentPrefs = prefs ?? DEFAULT_NOTIFICATION_PREFERENCES

  const handleToggle = useCallback(
    (key: keyof NotificationPreferences) => {
      updatePrefs.mutate({ ...currentPrefs, [key]: !currentPrefs[key] })
    },
    [currentPrefs, updatePrefs]
  )

  if (isLoading) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Préférences de notifications</CardTitle>
          <CardDescription>Choisissez les notifications que vous souhaitez recevoir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Préférences de notifications</CardTitle>
        <CardDescription>Choisissez les notifications que vous souhaitez recevoir</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {NOTIFICATION_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <button
                type="button"
                disabled={updatePrefs.isPending}
                onClick={() => handleToggle(item.key)}
                className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
                  currentPrefs[item.key] ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    currentPrefs[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
