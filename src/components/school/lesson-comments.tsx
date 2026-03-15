"use client";

import { useState } from "react";
import { MessageCircle, Reply, Trash2, Send } from "lucide-react";
import {
  useLessonComments,
  useCreateComment,
  useDeleteComment,
} from "@/hooks/use-lesson-comments";
import type { LessonComment } from "@/hooks/use-lesson-comments";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

// ─── Comment input ─────────────────────────────────────────────

function CommentInput({
  lessonId,
  parentId,
  placeholder,
  onCancel,
  autoFocus,
}: {
  lessonId: string;
  parentId?: string | null;
  placeholder?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [content, setContent] = useState("");
  const createComment = useCreateComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createComment.mutate(
      { lessonId, content: content.trim(), parentId },
      {
        onSuccess: () => {
          setContent("");
          onCancel?.();
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Ajouter un commentaire..."}
        autoFocus={autoFocus}
        className="min-h-[60px] text-sm"
        autoGrow
      />
      <div className="flex flex-col gap-1">
        <Button
          type="submit"
          size="sm"
          loading={createComment.isPending}
          disabled={!content.trim()}
          icon={<Send className="h-3.5 w-3.5" />}
        >
          Envoyer
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}

// ─── Single comment ────────────────────────────────────────────

function CommentItem({
  comment,
  lessonId,
  isReply,
}: {
  comment: LessonComment;
  lessonId: string;
  isReply?: boolean;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const { user } = useAuth();
  const deleteComment = useDeleteComment();

  const isOwn = user?.id === comment.profile_id;
  const profileName = comment.profile?.full_name ?? "Utilisateur";
  const profileAvatar = comment.profile?.avatar_url ?? null;
  const profileRole = comment.profile?.role;

  return (
    <div className={cn("flex gap-3", isReply && "ml-10")}>
      <Avatar src={profileAvatar} name={profileName} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{profileName}</span>
          {(profileRole === "admin" || profileRole === "coach") && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              {profileRole === "admin" ? "Admin" : "Coach"}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.created_at, "relative")}
          </span>
        </div>

        <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
          {comment.content}
        </p>

        <div className="mt-1.5 flex items-center gap-3">
          {!isReply && (
            <button
              type="button"
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Reply className="h-3 w-3" />
              Repondre
            </button>
          )}
          {isOwn && (
            <button
              type="button"
              onClick={() =>
                deleteComment.mutate({ commentId: comment.id, lessonId })
              }
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              Supprimer
            </button>
          )}
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <div className="mt-3">
            <CommentInput
              lessonId={lessonId}
              parentId={comment.id}
              placeholder={`Repondre a ${profileName}...`}
              onCancel={() => setShowReplyInput(false)}
              autoFocus
            />
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                lessonId={lessonId}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────

interface LessonCommentsProps {
  lessonId: string;
}

export function LessonComments({ lessonId }: LessonCommentsProps) {
  const { data: comments, isLoading } = useLessonComments(lessonId);

  const totalCount =
    (comments?.length ?? 0) +
    (comments?.reduce((acc, c) => acc + (c.replies?.length ?? 0), 0) ?? 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-base font-semibold">
          Commentaires
          {totalCount > 0 && (
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              ({totalCount})
            </span>
          )}
        </h3>
      </div>

      {/* Comment input */}
      <CommentInput lessonId={lessonId} />

      {/* Comment list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted/50" />
                <div className="h-10 w-full animate-pulse rounded bg-muted/50" />
              </div>
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              lessonId={lessonId}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">
            Soyez le premier a commenter
          </p>
        </div>
      )}
    </div>
  );
}
