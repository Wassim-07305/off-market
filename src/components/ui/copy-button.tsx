import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  className?: string;
  iconClassName?: string;
  successMessage?: string;
}

export function CopyButton({
  value,
  className,
  iconClassName,
  successMessage,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(value, { successMessage });
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [value, successMessage]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      title={copied ? "Copié !" : "Copier"}
    >
      {copied ? (
        <Check className={cn("h-4 w-4 text-emerald-500", iconClassName)} />
      ) : (
        <Copy className={cn("h-4 w-4", iconClassName)} />
      )}
    </button>
  );
}

interface CopyableTextProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
  successMessage?: string;
}

export function CopyableText({
  value,
  children,
  className,
  successMessage,
}: CopyableTextProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span>{children ?? value}</span>
      <CopyButton value={value} successMessage={successMessage} />
    </span>
  );
}
