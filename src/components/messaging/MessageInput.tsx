import { useRef, useState } from 'react'
import { Paperclip, Send, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface MessageInputProps {
  onSend: (content?: string, fileUrl?: string, fileName?: string) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({ onSend, disabled = false, placeholder = 'Écrire un message...' }: MessageInputProps) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }

  const handleSend = async () => {
    const trimmedText = text.trim()
    if (!trimmedText && !file) return

    if (file) {
      setUploading(true)
      try {
        const ext = file.name.split('.').pop()
        const path = `messages/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('files').upload(path, file)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('files').getPublicUrl(path)
        onSend(trimmedText || undefined, urlData.publicUrl, file.name)
      } catch {
        toast.error('Erreur lors de l\'upload du fichier')
        setUploading(false)
        return
      }
      setUploading(false)
    } else {
      onSend(trimmedText)
    }

    setText('')
    setFile(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 10 Mo')
        return
      }
      setFile(selected)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const canSend = (text.trim().length > 0 || file) && !uploading && !disabled

  return (
    <div className="border-t border-border bg-white px-4 py-3">
      {file && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
          <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-foreground">{file.name}</span>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className={cn(
            'shrink-0 rounded-lg p-2 text-muted-foreground transition-colors',
            'hover:bg-muted hover:text-foreground',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            adjustTextareaHeight()
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || uploading}
          rows={1}
          className={cn(
            'max-h-[150px] min-h-[36px] flex-1 resize-none rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'shrink-0 rounded-xl p-2 transition-all',
            canSend
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
