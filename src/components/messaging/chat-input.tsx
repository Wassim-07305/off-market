"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useChannelMembers } from "@/hooks/use-channels";
import { EmojiPicker } from "./emoji-picker";
import { VoiceRecorder } from "./voice-recorder";
import { MentionAutocomplete } from "./mention-autocomplete";
import {
  Send,
  Paperclip,
  Smile,
  X,
  CornerUpLeft,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Loader2,
} from "lucide-react";

interface ChatInputProps {
  channelName: string;
  onSend: (content: string) => Promise<void>;
  onFileUpload: (file: File) => Promise<void>;
  onVoiceSend: (blob: Blob, duration: number) => Promise<void>;
  replyTo: { id: string; content: string; senderName: string } | null;
  onCancelReply: () => void;
  isSending: boolean;
  onTyping?: () => void;
  onStopTyping?: () => void;
  channelId: string;
}

export function ChatInput({
  channelName,
  onSend,
  onFileUpload,
  onVoiceSend,
  replyTo,
  onCancelReply,
  isSending,
  onTyping,
  onStopTyping,
  channelId,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: channelMembers } = useChannelMembers(channelId);
  const memberOptions = (channelMembers ?? [])
    .map((m) => {
      const p = m.profile as unknown as { id: string; full_name: string; avatar_url: string | null; role: string } | null;
      return p ? { id: p.id, full_name: p.full_name, avatar_url: p.avatar_url, role: p.role } : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;
    setMessage("");
    onStopTyping?.();
    await onSend(trimmed);
    textareaRef.current?.focus();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [message, onSend, isSending, onStopTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionQuery !== null) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = message.slice(start, end);
    const newText = message.slice(0, start) + prefix + selected + suffix + message.slice(end);
    setMessage(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessage(val);
    onTyping?.();

    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;

    // Detect @mention
    const cursorPos = ta.selectionStart;
    const textBefore = val.slice(0, cursorPos);
    const atMatch = textBefore.match(/@(\w*)$/);

    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionStartPos(cursorPos - atMatch[0].length);
    } else {
      setMentionQuery(null);
    }
  };

  const handleMentionSelect = (member: { id: string; full_name: string }) => {
    const before = message.slice(0, mentionStartPos);
    const after = message.slice(textareaRef.current?.selectionStart ?? message.length);
    const newText = `${before}@${member.full_name} ${after}`;
    setMessage(newText);
    setMentionQuery(null);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-border/40 bg-surface">
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-primary/15 animate-fade-in">
          <CornerUpLeft className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-primary">{replyTo.senderName}</span>
            <p className="text-xs text-muted-foreground truncate">{replyTo.content}</p>
          </div>
          <button onClick={onCancelReply} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-center gap-0.5 mb-1.5 px-1">
          <FormatBtn icon={Bold} title="Gras" onClick={() => wrapSelection("**", "**")} />
          <FormatBtn icon={Italic} title="Italique" onClick={() => wrapSelection("_", "_")} />
          <FormatBtn icon={Strikethrough} title="Barre" onClick={() => wrapSelection("~~", "~~")} />
          <div className="w-px h-4 bg-border/40 mx-1" />
          <FormatBtn icon={List} title="Liste" onClick={() => wrapSelection("\n- ", "")} />
          <FormatBtn icon={ListOrdered} title="Liste numerotee" onClick={() => wrapSelection("\n1. ", "")} />
          <div className="w-px h-4 bg-border/40 mx-1" />
          <FormatBtn icon={Code} title="Code" onClick={() => wrapSelection("`", "`")} />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1 bg-muted/40 rounded-xl px-3.5 py-2.5 flex items-end gap-2 border border-border/30 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-surface transition-all duration-200 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              placeholder={`Message ${channelName}`}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[20px] max-h-[160px] leading-5"
              rows={1}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center gap-0.5 shrink-0 relative">
              <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Joindre un fichier"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <VoiceRecorder onSend={onVoiceSend} />

              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                  showEmoji ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                )}
                title="Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
              {showEmoji && (
                <EmojiPicker
                  onSelect={(emoji) => {
                    setMessage((prev) => prev + emoji);
                    textareaRef.current?.focus();
                  }}
                  onClose={() => setShowEmoji(false)}
                />
              )}
            </div>

            {mentionQuery !== null && memberOptions.length > 0 && (
              <MentionAutocomplete
                query={mentionQuery}
                members={memberOptions}
                onSelect={handleMentionSelect}
                onClose={() => setMentionQuery(null)}
                position={{ top: 8, left: 0 }}
              />
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white hover:bg-primary/90 transition-all duration-150 active:scale-90 disabled:opacity-30 disabled:pointer-events-none disabled:scale-100 shrink-0 shadow-sm hover:shadow-md"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormatBtn({ icon: Icon, title, onClick }: { icon: React.ComponentType<{ className?: string }>; title: string; onClick: () => void }) {
  return (
    <button onClick={onClick} title={title} className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
