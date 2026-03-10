import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageSquare, Plus, SendHorizontal, Bot, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { formatRelativeDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import {
  useConversations,
  useConversationMessages,
  useCreateConversation,
  useSendMessage,
  useDeleteConversation,
} from '@/hooks/useAIChat'
import type { AIConversation } from '@/types/database'
import { usePageTitle } from '@/hooks/usePageTitle'

function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn('flex gap-3', i % 2 === 0 ? 'justify-end' : 'justify-start')}
        >
          {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
          <div className={cn('flex flex-col gap-1.5', i % 2 === 0 ? 'items-end' : 'items-start')}>
            <Skeleton className="h-4 w-20" />
            <Skeleton className={cn('h-16 rounded-2xl', i % 2 === 0 ? 'w-64' : 'w-72')} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ConversationSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <Skeleton className="h-4 w-4 rounded shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AIAssistantPage() {
  usePageTitle('Assistant IA')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: conversations, isLoading: conversationsLoading } = useConversations()
  const { data: messages, isLoading: messagesLoading } = useConversationMessages(selectedId)
  const createConversation = useCreateConversation()
  const sendMessage = useSendMessage()
  const deleteConversation = useDeleteConversation()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleNewConversation = async () => {
    try {
      const conversation = await createConversation.mutateAsync(undefined)
      setSelectedId(conversation.id)
      setShowSidebar(false)
      textareaRef.current?.focus()
    } catch {
      toast.error('Impossible de créer la conversation.')
    }
  }

  const handleSelectConversation = (conversation: AIConversation) => {
    setSelectedId(conversation.id)
    setShowSidebar(false)
  }

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await deleteConversation.mutateAsync(id)
      if (selectedId === id) {
        setSelectedId(null)
      }
    } catch {
      toast.error('Impossible de supprimer la conversation.')
    }
  }

  const handleSend = async () => {
    const content = input.trim()
    if (!content || !selectedId || sendMessage.isPending) return

    setInput('')
    try {
      await sendMessage.mutateAsync({ conversationId: selectedId, content })
    } catch {
      toast.error('Erreur lors de l\'envoi du message.')
      setInput(content)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-border/50 bg-white shadow-sm">
      {/* Sidebar */}
      <div
        className={cn(
          'flex flex-col border-r border-border/50 bg-muted/20',
          'w-full md:w-80 md:min-w-[320px] shrink-0',
          // Mobile : afficher/masquer
          showSidebar ? 'flex' : 'hidden md:flex'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="text-base font-semibold text-foreground">Conversations</h2>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={handleNewConversation}
            loading={createConversation.isPending}
          >
            Nouvelle
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <ConversationSkeleton />
          ) : !conversations?.length ? (
            <EmptyState
              icon={<MessageSquare className="h-6 w-6" />}
              title="Aucune conversation"
              description="Commencez une nouvelle conversation avec l'assistant IA."
              className="py-12"
            />
          ) : (
            <div className="flex flex-col gap-0.5 p-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-3 text-left',
                    'transition-all duration-150 cursor-pointer',
                    'hover:bg-muted/60',
                    selectedId === conversation.id
                      ? 'bg-primary/5 border border-primary/20 text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conversation.title || 'Nouvelle conversation'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeDate(conversation.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                    className={cn(
                      'shrink-0 rounded-md p-1.5',
                      'text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10',
                      'opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div
        className={cn(
          'flex flex-col flex-1 min-w-0',
          !showSidebar ? 'flex' : 'hidden md:flex'
        )}
      >
        {selectedId ? (
          <>
            {/* Header mobile : retour */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 md:hidden">
              <button
                onClick={() => setShowSidebar(true)}
                className="rounded-lg p-1.5 hover:bg-muted/60 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Assistant IA</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {messagesLoading ? (
                <MessageSkeleton />
              ) : !messages?.length ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-base font-semibold text-foreground">
                      Comment puis-je vous aider ?
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
                      Posez-moi vos questions sur vos clients, vos leads, vos performances ou toute
                      autre information de votre CRM.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 p-4 md:p-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3 max-w-[85%] md:max-w-[75%]',
                        message.role === 'user' ? 'ml-auto' : 'mr-auto'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'flex flex-col gap-1',
                          message.role === 'user' ? 'items-end' : 'items-start'
                        )}
                      >
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted/60 text-foreground border border-border/50 rounded-bl-md'
                          )}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <span className="text-[11px] text-muted-foreground/60 px-1">
                          {formatRelativeDate(message.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="border-t border-border/50 bg-white p-4">
              <div className="flex items-end gap-3">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre message..."
                  autoGrow
                  className="min-h-[44px] max-h-[160px] resize-none rounded-xl border-border/60 bg-muted/20 focus:bg-white"
                />
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleSend}
                  disabled={!input.trim() || sendMessage.isPending}
                  loading={sendMessage.isPending}
                  icon={<SendHorizontal className="h-4 w-4" />}
                  className="shrink-0 rounded-xl"
                />
              </div>
              <p className="text-[11px] text-muted-foreground/50 mt-2 text-center">
                L&apos;assistant IA peut faire des erreurs. Vérifiez les informations importantes.
              </p>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Bot className="h-6 w-6" />}
            title="Sélectionnez une conversation"
            description="Choisissez une conversation existante ou créez-en une nouvelle pour commencer."
            action={
              <Button
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={handleNewConversation}
                loading={createConversation.isPending}
              >
                Nouvelle conversation
              </Button>
            }
            className="h-full"
          />
        )}
      </div>
    </div>
  )
}
