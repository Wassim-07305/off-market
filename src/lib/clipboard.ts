import { toast } from 'sonner'

/**
 * Copy text to clipboard and show a toast notification
 */
export async function copyToClipboard(
  text: string,
  options?: {
    successMessage?: string
    errorMessage?: string
    silent?: boolean
  }
): Promise<boolean> {
  const {
    successMessage = 'Copié dans le presse-papiers',
    errorMessage = 'Échec de la copie',
    silent = false,
  } = options ?? {}

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      textArea.remove()
    }

    if (!silent) {
      toast.success(successMessage)
    }
    return true
  } catch {
    if (!silent) {
      toast.error(errorMessage)
    }
    return false
  }
}

/**
 * Copy formatted content (like email or phone)
 */
export async function copyEmail(email: string): Promise<boolean> {
  return copyToClipboard(email, {
    successMessage: `Email "${email}" copié`,
  })
}

export async function copyPhone(phone: string): Promise<boolean> {
  return copyToClipboard(phone, {
    successMessage: `Téléphone "${phone}" copié`,
  })
}

export async function copyLink(url: string): Promise<boolean> {
  return copyToClipboard(url, {
    successMessage: 'Lien copié',
  })
}
