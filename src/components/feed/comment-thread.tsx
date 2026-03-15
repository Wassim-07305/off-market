"use client";

import { useState, useRef, useEffect } from "react";
import { useComments } from "@/hooks/use-feed";
import { useAuth } from "@/hooks/use-auth";
import { ReportButton } from "@/components/feed/report-modal";
import type { FeedComment } from "@/types/feed";
import { Send, X } from "lucide-react";

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "a l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

// ─── Reply Input ─────────────────────
function ReplyInput({
  authorName,
  onSubmit,
  onCancel,
  isPending,
}: {
  authorName: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <div className="ml-8 mt-2 pl-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        Repondre a {authorName}
        <button
          onClick={onCancel}
          className="text-error hover:text-error/80 ml-1"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
          placeholder="Ecrire une reponse..."
          className="flex-1 h-8 px-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isPending}
          className="h-8 w-8 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Comment Item ─────────────────────
function CommentItem({
  comment,
  depth,
  currentUserId,
  onReply,
  onDelete,
}: {
  comment: FeedComment;
  depth: number;
  currentUserId?: string;
  onReply?: (commentId: string, authorName: string) => void;
  onDelete: (commentId: string) => void;
}) {
  const isAuthor = currentUserId === comment.author_id;

  return (
    <div className="flex items-start gap-2 group">
      {comment.author?.avatar_url ? (
        <img
          src={comment.author.avatar_url}
          alt=""
          className="w-7 h-7 rounded-full object-cover mt-0.5"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-[10px] text-primary font-semibold mt-0.5">
          {comment.author?.full_name?.charAt(0) ?? "?"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="bg-muted/40 rounded-xl px-3 py-2">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-foreground">
              {comment.author?.full_name ?? "Utilisateur"}
            </p>
            <span className="text-[10px] text-muted-foreground font-mono">
              {timeAgo(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-foreground mt-0.5">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-1">
          {depth === 0 && onReply && (
            <button
              onClick={() =>
                onReply(comment.id, comment.author?.full_name ?? "Utilisateur")
              }
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Repondre
            </button>
          )}
          {isAuthor && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-[11px] text-muted-foreground hover:text-error transition-colors opacity-0 group-hover:opacity-100"
            >
              Supprimer
            </button>
          )}
          {!isAuthor && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ReportButton commentId={comment.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Comment Thread ───────────────────
export function CommentThread({ postId }: { postId: string }) {
  const { comments, isLoading, addComment, deleteComment } =
    useComments(postId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{
    commentId: string;
    authorName: string;
  } | null>(null);

  const handleSubmit = (parentId?: string, content?: string) => {
    const text = content ?? newComment;
    if (!text.trim()) return;
    addComment.mutate(
      { content: text.trim(), parentId },
      {
        onSuccess: () => {
          if (!parentId) setNewComment("");
          setReplyTo(null);
        },
      },
    );
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyTo({ commentId, authorName });
  };

  return (
    <div className="p-4 space-y-3">
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-shimmer rounded-lg" />
          ))}
        </div>
      ) : (
        comments.map((comment) => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              depth={0}
              currentUserId={user?.id}
              onReply={handleReply}
              onDelete={(id) => deleteComment.mutate(id)}
            />

            {/* Inline reply input below the target comment */}
            {replyTo?.commentId === comment.id && (
              <ReplyInput
                authorName={replyTo.authorName}
                onSubmit={(content) => handleSubmit(comment.id, content)}
                onCancel={() => setReplyTo(null)}
                isPending={addComment.isPending}
              />
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 mt-2 space-y-2 border-l-2 border-border/30 pl-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={1}
                    currentUserId={user?.id}
                    onDelete={(id) => deleteComment.mutate(id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Main comment input (parentId = null) */}
      <div className="flex items-start gap-2 pt-2">
        <div className="flex-1">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSubmit()
              }
              placeholder="Ecrire un commentaire..."
              className="flex-1 h-9 px-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
            <button
              onClick={() => handleSubmit()}
              disabled={!newComment.trim() || addComment.isPending}
              className="h-9 w-9 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
