"use client";

import { useState, useRef, useEffect } from "react";
import { useComments } from "@/hooks/use-feed";
import { useAuth } from "@/hooks/use-auth";
import { ReportButton } from "@/components/feed/report-modal";
import type { FeedComment } from "@/types/feed";
import {
  Send,
  X,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_DEPTH = 3;

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
    <div className="mt-2 pl-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        <CornerDownRight className="w-3 h-3" />
        Repondre a {authorName}
        <button
          onClick={onCancel}
          className="text-red-500 hover:text-red-400 ml-1"
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
          className="h-8 w-8 flex items-center justify-center bg-[#DC2626] text-white rounded-xl hover:bg-[#B91C1C] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Threaded Comment (recursive) ────
function ThreadedComment({
  comment,
  depth,
  currentUserId,
  replyToId,
  onSetReplyTo,
  onSubmitReply,
  onDelete,
  isReplyPending,
}: {
  comment: FeedComment;
  depth: number;
  currentUserId?: string;
  replyToId: string | null;
  onSetReplyTo: (id: string | null, authorName?: string) => void;
  onSubmitReply: (parentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  isReplyPending: boolean;
}) {
  const [repliesExpanded, setRepliesExpanded] = useState(depth < 1);
  const isAuthor = currentUserId === comment.author_id;
  const hasReplies =
    (comment.replies && comment.replies.length > 0) || comment.reply_count > 0;
  const replyCount = comment.replies?.length || comment.reply_count || 0;
  const canReply = depth < MAX_VISIBLE_DEPTH - 1;

  return (
    <div
      className={cn(
        "group",
        depth > 0 && "ml-8 border-l-2 border-border/30 pl-3",
      )}
    >
      {/* Comment bubble */}
      <div className="flex items-start gap-2">
        {comment.author?.avatar_url ? (
          <img
            src={comment.author.avatar_url}
            alt=""
            className={cn(
              "rounded-full object-cover mt-0.5 flex-shrink-0",
              depth === 0 ? "w-7 h-7" : "w-6 h-6",
            )}
          />
        ) : (
          <div
            className={cn(
              "rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-semibold mt-0.5 flex-shrink-0",
              depth === 0 ? "w-7 h-7 text-[10px]" : "w-6 h-6 text-[9px]",
            )}
          >
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
            <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-3 mt-1 ml-1">
            {canReply && (
              <button
                onClick={() =>
                  onSetReplyTo(
                    comment.id,
                    comment.author?.full_name ?? "Utilisateur",
                  )
                }
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Repondre
              </button>
            )}
            {isAuthor && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-[11px] text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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

      {/* Inline reply input */}
      {replyToId === comment.id && (
        <div className="ml-9">
          <ReplyInput
            authorName={comment.author?.full_name ?? "Utilisateur"}
            onSubmit={(content) => onSubmitReply(comment.id, content)}
            onCancel={() => onSetReplyTo(null)}
            isPending={isReplyPending}
          />
        </div>
      )}

      {/* Nested replies */}
      {hasReplies && (
        <div className="mt-1">
          {/* Collapse/Expand toggle */}
          {replyCount > 0 && (
            <button
              onClick={() => setRepliesExpanded(!repliesExpanded)}
              className="flex items-center gap-1 ml-9 mb-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {repliesExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              {repliesExpanded
                ? "Masquer les reponses"
                : `Voir ${replyCount} reponse${replyCount > 1 ? "s" : ""}`}
            </button>
          )}

          {/* Render child comments recursively */}
          {repliesExpanded && comment.replies && comment.replies.length > 0 && (
            <div className="space-y-2 mt-1">
              {comment.replies.map((reply) => (
                <ThreadedComment
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  currentUserId={currentUserId}
                  replyToId={replyToId}
                  onSetReplyTo={onSetReplyTo}
                  onSubmitReply={onSubmitReply}
                  onDelete={onDelete}
                  isReplyPending={isReplyPending}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Comment Thread (root) ───────────
export function CommentThread({ postId }: { postId: string }) {
  const { comments, isLoading, addComment, deleteComment } =
    useComments(postId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const handleSubmitTopLevel = () => {
    if (!newComment.trim()) return;
    addComment.mutate(
      { content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment("");
        },
      },
    );
  };

  const handleSubmitReply = (parentId: string, content: string) => {
    addComment.mutate(
      { content, parentId },
      {
        onSuccess: () => {
          setReplyToId(null);
        },
      },
    );
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
          <ThreadedComment
            key={comment.id}
            comment={comment}
            depth={0}
            currentUserId={user?.id}
            replyToId={replyToId}
            onSetReplyTo={(id) => setReplyToId(id)}
            onSubmitReply={handleSubmitReply}
            onDelete={(id) => deleteComment.mutate(id)}
            isReplyPending={addComment.isPending}
          />
        ))
      )}

      {/* Main comment input (top-level) */}
      <div className="flex items-start gap-2 pt-2">
        <div className="flex-1">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSubmitTopLevel()
              }
              placeholder="Ecrire un commentaire..."
              className="flex-1 h-9 px-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
            <button
              onClick={handleSubmitTopLevel}
              disabled={!newComment.trim() || addComment.isPending}
              className="h-9 w-9 flex items-center justify-center bg-[#DC2626] text-white rounded-xl hover:bg-[#B91C1C] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
