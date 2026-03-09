"use client";

interface TypingIndicatorProps {
  typingUsers: Array<{ userId: string; fullName: string }>;
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const names =
    typingUsers.length === 1
      ? typingUsers[0].fullName
      : typingUsers.length === 2
        ? `${typingUsers[0].fullName} et ${typingUsers[1].fullName}`
        : `${typingUsers[0].fullName} et ${typingUsers.length - 1} autres`;

  const verb = typingUsers.length === 1 ? "ecrit" : "ecrivent";

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 min-h-[28px]">
      <div className="flex items-center gap-[3px]">
        <span className="w-[5px] h-[5px] rounded-full bg-primary/60 animate-[typing-dot_1.4s_ease-in-out_infinite]" />
        <span className="w-[5px] h-[5px] rounded-full bg-primary/60 animate-[typing-dot_1.4s_ease-in-out_0.2s_infinite]" />
        <span className="w-[5px] h-[5px] rounded-full bg-primary/60 animate-[typing-dot_1.4s_ease-in-out_0.4s_infinite]" />
      </div>
      <span className="text-xs text-muted-foreground">
        <strong className="font-medium text-foreground/70">{names}</strong> {verb}...
      </span>
    </div>
  );
}
