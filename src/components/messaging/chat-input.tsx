"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useChannelMembers } from "@/hooks/use-channels";
import { EmojiPicker } from "./emoji-picker";
import { VoiceRecorder } from "./voice-recorder";
import { MentionAutocomplete } from "./mention-autocomplete";
import { TemplatePicker } from "./template-picker";
import { TemplateManagerModal } from "./template-manager-modal";
import { AiSlashCommands, isAiSlashCommand } from "./ai-slash-commands";
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
  Loader2,
  Clock,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface ChatInputProps {
  channelName: string;
  onSend: (content: string, scheduledAt?: string, isUrgent?: boolean) => Promise<void>;
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
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [templateShortcutQuery, setTemplateShortcutQuery] = useState<
    string | null
  >(null);
  const [templateSlashStartPos, setTemplateSlashStartPos] = useState(0);
  const [showAiCommands, setShowAiCommands] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: channelMembers } = useChannelMembers(channelId);
  const memberOptions = (channelMembers ?? [])
    .map((m) => {
      const p = m.profile as unknown as {
        id: string;
        full_name: string;
        avatar_url: string | null;
        role: string;
      } | null;
      return p
        ? {
            id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            role: p.role,
          }
        : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;
    const schedule = scheduledAt
      ? new Date(scheduledAt).toISOString()
      : undefined;
    const urgent = isUrgent;
    setMessage("");
    setScheduledAt("");
    setShowSchedule(false);
    setIsUrgent(false);
    onStopTyping?.();
    await onSend(trimmed, schedule, urgent);
    textareaRef.current?.focus();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [message, onSend, isSending, onStopTyping, scheduledAt, isUrgent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionQuery !== null) return;
    if (showTemplatePicker) return;
    if (showAiCommands) return;
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
    const newText =
      message.slice(0, start) + prefix + selected + suffix + message.slice(end);
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

    // Detect AI slash commands (priority check before template shortcuts)
    if (isAiSlashCommand(val)) {
      setShowAiCommands(true);
      setShowTemplatePicker(false);
      setTemplateShortcutQuery(null);
    } else {
      setShowAiCommands(false);

      // Detect /template shortcut (only at start of input or after whitespace)
      const slashMatch = textBefore.match(/(^|\s)(\/\w*)$/);
      if (slashMatch) {
        const fullMatch = slashMatch[2]; // the /word part
        // Check if the partial command matches an AI command prefix — if so, show AI panel instead
        const partialCmd = fullMatch.replace(/^\//, "").toLowerCase();
        const aiCommandNames = ["help", "resume", "translate", "suggest"];
        const matchesAiPrefix = aiCommandNames.some((c) =>
          c.startsWith(partialCmd),
        );
        if (matchesAiPrefix && textBefore.trim() === fullMatch) {
          setShowAiCommands(true);
          setShowTemplatePicker(false);
          setTemplateShortcutQuery(null);
        } else {
          setTemplateShortcutQuery(fullMatch);
          setTemplateSlashStartPos(cursorPos - fullMatch.length);
          setShowTemplatePicker(true);
        }
      } else if (templateShortcutQuery !== null) {
        setTemplateShortcutQuery(null);
        // Only close if it was opened via shortcut, not via button
        if (showTemplatePicker && templateShortcutQuery) {
          setShowTemplatePicker(false);
        }
      }
    }
  };

  const handleMentionSelect = (member: { id: string; full_name: string }) => {
    const before = message.slice(0, mentionStartPos);
    const after = message.slice(
      textareaRef.current?.selectionStart ?? message.length,
    );
    const newText = `${before}@${member.full_name} ${after}`;
    setMessage(newText);
    setMentionQuery(null);
    textareaRef.current?.focus();
  };

  const handleTemplateSelect = useCallback(
    (content: string) => {
      if (templateShortcutQuery !== null) {
        // Replace the /shortcut text with template content
        const before = message.slice(0, templateSlashStartPos);
        const cursorPos = textareaRef.current?.selectionStart ?? message.length;
        const after = message.slice(cursorPos);
        setMessage(before + content + after);
      } else {
        // Insert at cursor or append
        const cursorPos =
          textareaRef.current?.selectionStart ?? message.length;
        const before = message.slice(0, cursorPos);
        const after = message.slice(cursorPos);
        setMessage(before + content + after);
      }
      setTemplateShortcutQuery(null);
      setShowTemplatePicker(false);
      textareaRef.current?.focus();
    },
    [message, templateShortcutQuery, templateSlashStartPos],
  );

  return (
    <div className="border-t border-border/40 bg-surface">
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-primary/15 animate-fade-in">
          <CornerUpLeft className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-primary">
              {replyTo.senderName}
            </span>
            <p className="text-xs text-muted-foreground truncate">
              {replyTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="p-3">
        <div
          className={cn(
            "rounded-xl transition-all duration-200 relative cursor-text",
            isUrgent
              ? "bg-red-50 dark:bg-red-950/20 ring-1 ring-red-300 dark:ring-red-800"
              : "bg-muted/40",
          )}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.closest(
                "button, input, [role='dialog'], [data-emoji-picker]",
              )
            )
              return;
            textareaRef.current?.focus();
          }}
        >
          {/* Urgent indicator */}
          {isUrgent && (
            <div className="flex items-center gap-1.5 px-3 pt-2 pb-0">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-[11px] font-semibold text-red-500 uppercase tracking-wide">
                Message urgent
              </span>
            </div>
          )}

          {/* Formatting toolbar */}
          <div className="flex items-center gap-0.5 px-3 pt-2 pb-0.5">
            <FormatBtn
              icon={Bold}
              title="Gras"
              onClick={() => wrapSelection("**", "**")}
            />
            <FormatBtn
              icon={Italic}
              title="Italique"
              onClick={() => wrapSelection("_", "_")}
            />
            <FormatBtn
              icon={Strikethrough}
              title="Barre"
              onClick={() => wrapSelection("~~", "~~")}
            />
            <div className="w-px h-4 bg-border/40 mx-1" />
            <FormatBtn
              icon={List}
              title="Liste"
              onClick={() => wrapSelection("\n- ", "")}
            />
            <FormatBtn
              icon={ListOrdered}
              title="Liste numerotee"
              onClick={() => wrapSelection("\n1. ", "")}
            />
          </div>

          {/* Textarea + action buttons */}
          <div className="flex items-end gap-2 px-3.5 pb-2.5">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              placeholder={`Message ${channelName}`}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-0 resize-none min-h-[20px] max-h-[160px] leading-5 py-1"
              rows={1}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center gap-0.5 shrink-0 relative">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Joindre un fichier"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <VoiceRecorder onSend={onVoiceSend} />

              <button
                onClick={() => {
                  setTemplateShortcutQuery(null);
                  setShowTemplatePicker(!showTemplatePicker);
                }}
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                  showTemplatePicker
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Templates / Reponses rapides"
              >
                <Zap className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                  showEmoji
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground",
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

              <button
                onClick={() => setIsUrgent(!isUrgent)}
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                  isUrgent
                    ? "text-red-500 bg-red-500/10"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title={isUrgent ? "Retirer l'urgence" : "Marquer comme urgent"}
              >
                <AlertTriangle className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSchedule(!showSchedule)}
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                    scheduledAt
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  title="Programmer"
                >
                  <Clock className="w-4 h-4" />
                </button>
                {showSchedule && (
                  <div className="absolute bottom-9 right-0 bg-surface border border-border rounded-xl shadow-lg p-3 z-20 w-56">
                    <p className="text-xs font-medium text-foreground mb-2">
                      Programmer l&apos;envoi
                    </p>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full h-8 px-2 bg-muted border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {scheduledAt && (
                      <button
                        onClick={() => {
                          setScheduledAt("");
                          setShowSchedule(false);
                        }}
                        className="mt-2 text-xs text-red-500 hover:underline"
                      >
                        Annuler la programmation
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleSend}
                disabled={!message.trim() || isSending}
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all duration-150 active:scale-90 disabled:opacity-30 disabled:pointer-events-none disabled:scale-100 shrink-0",
                  isUrgent
                    ? "bg-red-500 hover:bg-red-600"
                    : scheduledAt
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-primary hover:bg-primary/90",
                )}
                title={isUrgent ? "Envoyer (urgent)" : scheduledAt ? "Programmer" : "Envoyer"}
              >
                {isSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : scheduledAt ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
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

          {showAiCommands && (
            <AiSlashCommands
              query={message.trim()}
              channelId={channelId}
              onInsertResult={(text) => {
                setMessage(text);
                setShowAiCommands(false);
                textareaRef.current?.focus();
              }}
              onClose={() => setShowAiCommands(false)}
              onClearInput={() => setMessage("")}
            />
          )}

          <TemplatePicker
            open={showTemplatePicker && !showAiCommands}
            onSelect={handleTemplateSelect}
            onManage={() => setShowTemplateManager(true)}
            shortcutQuery={templateShortcutQuery}
            onClose={() => {
              setShowTemplatePicker(false);
              setTemplateShortcutQuery(null);
            }}
          />
        </div>
      </div>

      <TemplateManagerModal
        open={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
      />
    </div>
  );
}

function FormatBtn({
  icon: Icon,
  title,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
