interface TypingIndicatorProps {
  typingUsers: { userId: string; fullName: string }[]
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  const names = typingUsers.map((u) => u.fullName.split(' ')[0])
  let text: string

  if (names.length === 1) {
    text = `${names[0]} écrit`
  } else if (names.length === 2) {
    text = `${names[0]} et ${names[1]} écrivent`
  } else {
    text = `${names[0]} et ${names.length - 1} autres écrivent`
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      <div className="flex gap-0.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-muted-foreground">{text}...</span>
    </div>
  )
}
