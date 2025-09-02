import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

type ReactionType = "LIKE" | "LOVE" | "LAUGH" | "WOW" | "APPLAUSE";

interface ReactionData {
  type: ReactionType;
  count: number;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  reactions?: ReactionData[];
  userReaction?: ReactionType | null;
  replies?: Comment[];
  _count?: {
    reactions: number;
    replies?: number;
  };
}

interface CommentItemProps {
  comment: Comment;
  currentUser: {
    id: string;
    name: string;
    shopId: string;
  } | null;
  postId: string;
  getInitials: (name: string) => string;
  formatRelativeDate: (dateString: string) => string;
  onCommentAdded: () => void;
  isReply?: boolean;
}

const REACTION_EMOJIS: Record<ReactionType, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  LAUGH: "😂",
  WOW: "😮",
  APPLAUSE: "👏",
};

const CommentItem = ({
  comment,
  currentUser,
  postId,
  getInitials,
  formatRelativeDate,
  onCommentAdded,
  isReply = false,
}: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReactionDropdown, setShowReactionDropdown] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const totalReactions = comment.reactions?.reduce((sum, r) => sum + r.count, 0) || 0;

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    // Ne pas fermer si on clique à l'intérieur du dropdown de réactions
    if (target?.closest('.reaction-dropdown')) {
      return;
    }
    setShowReactionDropdown(false);
  }, []);

  useEffect(() => {
    if (showReactionDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showReactionDropdown, handleClickOutside]);

  const handleReaction = async (type: ReactionType) => {
    if (!currentUser) return;

    setShowReactionDropdown(false);

    try {
      const response = await fetch(`/api/comments/${comment.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          userId: currentUser.id,
          shopId: currentUser.shopId,
        }),
      });

      if (response.ok) {
        onCommentAdded();
        toast.success("Réaction ajoutée !");
      } else {
        toast.error("Erreur lors de l'ajout de la réaction");
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
      toast.error("Erreur lors de l'ajout de la réaction");
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentUser) return;

    setSubmittingReply(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent.trim(),
          authorId: currentUser.id,
          parentId: comment.id,
        }),
      });

      if (response.ok) {
        setReplyContent("");
        setShowReplyForm(false);
        onCommentAdded();
        toast.success("Réponse ajoutée !");
      } else {
        toast.error("Erreur lors de l'ajout de la réponse");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("Erreur lors de l'ajout de la réponse");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className={`${isReply ? "ml-12" : ""}`}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback className="text-sm">
            {getInitials(comment.author.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {comment.author.name}
              </span>
              <span className="text-xs text-gray-500">
                {formatRelativeDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 ml-2">
            {/* Reactions */}
            <div className="relative">
              <button
                className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                  comment.userReaction
                    ? "text-red-600 hover:text-red-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setShowReactionDropdown(!showReactionDropdown)}
              >
                <Heart
                  className={`h-4 w-4 ${
                    comment.userReaction ? "fill-current" : ""
                  }`}
                />
                {totalReactions > 0 && <span>{totalReactions}</span>}
              </button>

              {/* Dropdown des réactions */}
              {showReactionDropdown && currentUser && (
                <div className="reaction-dropdown absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                  <div className="flex gap-1">
                    {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => {
                      const isSelected = comment.userReaction === type;
                      const reactionCount = comment.reactions?.find(r => r.type === type)?.count || 0;
                      return (
                        <div key={type} className="flex flex-col items-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleReaction(type as ReactionType);
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                            className={`p-2 rounded transition-colors text-lg relative ${
                              isSelected
                                ? "bg-blue-100 border-2 border-blue-300"
                                : "hover:bg-gray-100"
                            }`}
                            title={type}
                          >
                            {emoji}
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white" />
                            )}
                          </button>
                          {reactionCount > 0 && (
                            <span className="text-xs text-gray-500 mt-1">
                              {reactionCount}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Répondre (seulement pour les commentaires principaux) */}
            {!isReply && currentUser && (
              <button
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <MessageCircle className="h-4 w-4" />
                Répondre
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && currentUser && (
            <form onSubmit={handleSubmitReply} className="mt-3 ml-2">
              <div className="flex gap-2 items-end">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Écrivez une réponse..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    disabled={submittingReply}
                    className="text-sm"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyContent.trim() || submittingReply}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  postId={postId}
                  getInitials={getInitials}
                  formatRelativeDate={formatRelativeDate}
                  onCommentAdded={onCommentAdded}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;