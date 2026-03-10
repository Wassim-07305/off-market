import { useSocialContent } from '@/hooks/useSocialContent'
import { SocialContentBoard } from '@/components/social/SocialContentBoard'

interface ClientSocialProps {
  clientId: string
}

export function ClientSocial({ clientId }: ClientSocialProps) {
  const { data, isLoading } = useSocialContent({ client_id: clientId })
  return <SocialContentBoard data={data ?? []} isLoading={isLoading} />
}
