"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useChannelMembers } from "@/hooks/use-channels";
import { EmojiPicker } from "./emoji-picker";
import { GifPicker } from "./gif-picker";
import { VoiceRecorder } from "./voice-recorder";
import { MentionAutocomplete } from "./mention-autocomplete";
import { TemplatePicker } from "./template-picker";
import { TemplateManagerModal } from "./template-manager-modal";
import { AiSlashCommands, isAiSlashCommand } from "./ai-slash-commands";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Extension } from "@tiptap/core";
import {
  Send,
  Paperclip,
  Smile,
  X,
  CornerUpLeft,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Loader2,
  Clock,
  AlertTriangle,
  Zap,
  Image as ImageIcon,
} from "lucide-react";

interface ChatInputProps {
  channelName: string;
  onSend: (
    content: string,
    scheduledAt?: string,
    isUrgent?: boolean,
  ) => Promise<void>;
  onFileUpload: (file: File) => Promise<void>;
  onVoiceSend: (blob: Blob, duration: number) => Promise<void>;
  onGifSend?: (gifUrl: string) => Promise<void>;
  replyTo: { id: string; content: string; senderName: string } | null;
  onCancelReply: () => void;
  isSending: boolean;
  onTyping?: () => void;
  onStopTyping?: () => void;
  channelId: string;
}

/**
 * Convertit le HTML TipTap en markdown simplifie compatible avec renderRichText
 */
function htmlToMarkdown(html: string): string {
  // Remplacer les balises de formatage inline
  let md = html;

  // <strong> / <b> → **...**
  md = md.replace(/<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>/gi, "**$1**");
  // <em> / <i> → _..._
  md = md.replace(/<(?:em|i)>([\s\S]*?)<\/(?:em|i)>/gi, "_$1_");
  // <s> / <del> / <strike> → ~~...~~
  md = md.replace(
    /<(?:s|del|strike)>([\s\S]*?)<\/(?:s|del|strike)>/gi,
    "~~$1~~",
  );
  // <u> → __...__
  md = md.replace(/<u>([\s\S]*?)<\/u>/gi, "__$1__");

  // Listes non ordonnees : <ul><li>...</li></ul>
  md = md.replace(/<ul>([\s\S]*?)<\/ul>/gi, (_match, inner: string) => {
    const items = inner.match(/<li>([\s\S]*?)<\/li>/gi) || [];
    return (
      items
        .map(
          (item) =>
            "- " +
            item
              .replace(/<\/?li>/gi, "")
              .replace(/<\/?p>/gi, "")
              .trim(),
        )
        .join("\n") + "\n"
    );
  });

  // Listes ordonnees : <ol><li>...</li></ol>
  md = md.replace(/<ol>([\s\S]*?)<\/ol>/gi, (_match, inner: string) => {
    const items = inner.match(/<li>([\s\S]*?)<\/li>/gi) || [];
    return (
      items
        .map(
          (item, i) =>
            `${i + 1}. ` +
            item
              .replace(/<\/?li>/gi, "")
              .replace(/<\/?p>/gi, "")
              .trim(),
        )
        .join("\n") + "\n"
    );
  });

  // <br> → \n
  md = md.replace(/<br\s*\/?>/gi, "\n");
  // <p>...</p> → contenu + \n
  md = md.replace(/<p>([\s\S]*?)<\/p>/gi, "$1\n");

  // Nettoyer les balises HTML restantes
  md = md.replace(/<[^>]+>/g, "");

  // Decoder les entites HTML courantes
  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, " ");

  // Supprimer les \n en trop a la fin
  md = md.replace(/\n+$/, "");

  return md;
}

export function ChatInput({
  channelName,
  onSend,
  onFileUpload,
  onVoiceSend,
  onGifSend,
  replyTo,
  onCancelReply,
  isSending,
  onTyping,
  onStopTyping,
  channelId,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
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

  // Ref stable pour les callbacks utilises dans l'extension TipTap
  const handleSendRef = useRef<() => void>(() => {});
  const mentionQueryRef = useRef<string | null>(null);
  const showTemplatePickerRef = useRef(false);
  const showAiCommandsRef = useRef(false);

  mentionQueryRef.current = mentionQuery;
  showTemplatePickerRef.current = showTemplatePicker;
  showAiCommandsRef.current = showAiCommands;

  // Extension custom pour Enter = envoyer, Shift+Enter = nouvelle ligne
  const EnterToSend = Extension.create({
    name: "enterToSend",
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          // Ne pas intercepter si un autocomplete est ouvert
          if (mentionQueryRef.current !== null) return false;
          if (showTemplatePickerRef.current) return false;
          if (showAiCommandsRef.current) return false;
          handleSendRef.current();
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: `Message ${channelName}...`,
      }),
      Underline,
      EnterToSend,
    ],
    editorProps: {
      attributes: {
        class: "tiptap-chat",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const plainText = ed.getText();
      setMessage(plainText);
      onTyping?.();

      // Detect @mention
      // On utilise la position du curseur via l'API de l'editeur
      const text = plainText;
      const cursorOffset = ed.state.selection.from;
      // Approximation : on prend le texte brut jusqu'au curseur
      // TipTap getText() donne tout le texte sans balises
      const textNodes: string[] = [];
      let charCount = 0;
      let cursorTextPos = text.length;
      ed.state.doc.descendants((node, pos) => {
        if (node.isText && node.text) {
          const start = charCount;
          charCount += node.text.length;
          if (cursorOffset >= pos && cursorOffset <= pos + node.nodeSize) {
            cursorTextPos = start + (cursorOffset - pos);
          }
          textNodes.push(node.text);
        } else if (node.isBlock && charCount > 0) {
          charCount += 1; // pour le \n entre les blocs
        }
        return true;
      });

      const textBefore = text.slice(0, cursorTextPos);
      const atMatch = textBefore.match(/@(\w*)$/);

      if (atMatch) {
        setMentionQuery(atMatch[1]);
        setMentionStartPos(cursorTextPos - atMatch[0].length);
      } else {
        setMentionQuery(null);
      }

      // Detect AI slash commands
      if (isAiSlashCommand(text)) {
        setShowAiCommands(true);
        setShowTemplatePicker(false);
        setTemplateShortcutQuery(null);
      } else {
        setShowAiCommands(false);

        // Detect /template shortcut
        const slashMatch = textBefore.match(/(^|\s)(\/\w*)$/);
        if (slashMatch) {
          const fullMatch = slashMatch[2];
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
            setTemplateSlashStartPos(cursorTextPos - fullMatch.length);
            setShowTemplatePicker(true);
          }
        } else if (templateShortcutQuery !== null) {
          setTemplateShortcutQuery(null);
          if (showTemplatePicker && templateShortcutQuery) {
            setShowTemplatePicker(false);
          }
        }
      }
    },
  });

  const handleSend = useCallback(async () => {
    if (!editor) return;
    const html = editor.getHTML();
    const markdown = htmlToMarkdown(html);
    const trimmed = markdown.trim();
    if (!trimmed || isSending) return;
    const schedule = scheduledAt
      ? new Date(scheduledAt).toISOString()
      : undefined;
    const urgent = isUrgent;
    editor.commands.clearContent();
    setMessage("");
    setScheduledAt("");
    setShowSchedule(false);
    setIsUrgent(false);
    onStopTyping?.();
    await onSend(trimmed, schedule, urgent);
    editor.commands.focus();
  }, [editor, onSend, isSending, onStopTyping, scheduledAt, isUrgent]);

  // Mettre a jour la ref stable
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMentionSelect = (member: { id: string; full_name: string }) => {
    if (!editor) return;
    const text = editor.getText();
    const before = text.slice(0, mentionStartPos);
    // On reconstruit le texte avec la mention inseree
    // Il faut remplacer dans l'editeur TipTap
    const cursorTextPos = message.length; // approximation
    const after = text.slice(cursorTextPos);
    const newText = `${before}@${member.full_name} ${after}`;
    editor.commands.setContent(`<p>${newText}</p>`);
    setMentionQuery(null);
    editor.commands.focus("end");
  };

  const handleTemplateSelect = useCallback(
    (content: string) => {
      if (!editor) return;
      if (templateShortcutQuery !== null) {
        // Remplacer le /shortcut avec le contenu du template
        const text = editor.getText();
        const before = text.slice(0, templateSlashStartPos);
        const cursorTextPos = text.length;
        const after = text.slice(cursorTextPos);
        editor.commands.setContent(`<p>${before}${content}${after}</p>`);
      } else {
        // Inserer a la position du curseur
        editor.chain().focus().insertContent(content).run();
      }
      setTemplateShortcutQuery(null);
      setShowTemplatePicker(false);
      editor.commands.focus();
    },
    [editor, templateShortcutQuery, templateSlashStartPos],
  );

  return (
    <div className="border-t border-border/20 bg-surface">
      {replyTo && (
        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-[#AF0000]/[0.04] border-b border-[#AF0000]/10 animate-fade-in">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#AF0000] to-[#DC2626]" />
          <CornerUpLeft className="w-3.5 h-3.5 text-[#AF0000] shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-[#AF0000]">
              {replyTo.senderName}
            </span>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {replyTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="p-3.5">
        <div
          className={cn(
            "rounded-2xl transition-all duration-200 relative cursor-text shadow-sm",
            isUrgent
              ? "bg-red-50 dark:bg-red-950/20 ring-1 ring-red-300 dark:ring-red-800 shadow-red-500/10"
              : "bg-surface ring-1 ring-border/40 shadow-black/[0.03] hover:ring-border/60 focus-within:ring-[#AF0000]/20 focus-within:shadow-[#AF0000]/5",
          )}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.closest(
                "button, input, [role='dialog'], [data-emoji-picker]",
              )
            )
              return;
            editor?.commands.focus();
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
          <div className="flex items-center gap-0.5 px-3.5 pt-2.5 pb-0.5">
            <FormatBtn
              icon={Bold}
              title="Gras"
              active={editor?.isActive("bold") ?? false}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            />
            <FormatBtn
              icon={Italic}
              title="Italique"
              active={editor?.isActive("italic") ?? false}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            />
            <FormatBtn
              icon={UnderlineIcon}
              title="Souligne"
              active={editor?.isActive("underline") ?? false}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            />
            <FormatBtn
              icon={Strikethrough}
              title="Barre"
              active={editor?.isActive("strike") ?? false}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
            />
            <div className="w-px h-4 bg-border/40 mx-1" />
            <FormatBtn
              icon={List}
              title="Liste"
              active={editor?.isActive("bulletList") ?? false}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            />
            <FormatBtn
              icon={ListOrdered}
              title="Liste numerotee"
              active={editor?.isActive("orderedList") ?? false}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            />
          </div>

          {/* TipTap editor + action buttons */}
          <div className="flex items-end gap-2 px-4 pb-3">
            <div className="flex-1 py-1">
              <EditorContent editor={editor} />
            </div>
            <div className="flex items-center gap-0.5 shrink-0 relative">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-all duration-200"
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
                    editor?.chain().focus().insertContent(emoji).run();
                  }}
                  onClose={() => setShowEmoji(false)}
                />
              )}

              <button
                onClick={() => {
                  setShowGif(!showGif);
                  setShowEmoji(false);
                }}
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                  showGif
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="GIF"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              {showGif && (
                <GifPicker
                  onSelect={(gifUrl) => {
                    if (onGifSend) {
                      onGifSend(gifUrl);
                    } else {
                      editor?.chain().focus().insertContent(gifUrl).run();
                    }
                    setShowGif(false);
                  }}
                  onClose={() => setShowGif(false)}
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
                  "w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all duration-200 active:scale-90 disabled:opacity-25 disabled:pointer-events-none disabled:scale-100 shrink-0 shadow-sm",
                  isUrgent
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/25"
                    : scheduledAt
                      ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25"
                      : "bg-gradient-to-br from-[#AF0000] to-[#DC2626] hover:from-[#9A0000] hover:to-[#C62222] shadow-[#AF0000]/25",
                )}
                title={
                  isUrgent
                    ? "Envoyer (urgent)"
                    : scheduledAt
                      ? "Programmer"
                      : "Envoyer"
                }
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
                editor?.commands.setContent(`<p>${text}</p>`);
                setMessage(text);
                setShowAiCommands(false);
                editor?.commands.focus();
              }}
              onClose={() => setShowAiCommands(false)}
              onClearInput={() => {
                editor?.commands.clearContent();
                setMessage("");
              }}
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
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
        active
          ? "text-[#AF0000] bg-[#AF0000]/10"
          : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/60",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
