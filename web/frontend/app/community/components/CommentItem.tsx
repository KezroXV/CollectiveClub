import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, MessageCircle, Send, Trash2 } from "lucide-react";
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
    role?: string;
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
  const [showReplies, setShowReplies] = useState(false);
  const [showReactionDropdown, setShowReactionDropdown] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const totalReactions =
    comment.reactions?.reduce((sum, r) => sum + r.count, 0) || 0;

  const repliesCount = comment.replies?.length || 0;

  // Vérifier si l'utilisateur peut supprimer ce commentaire
  const canDelete =
    currentUser &&
    (comment.author.id === currentUser.id || // L'auteur peut supprimer son commentaire
      currentUser.role === "ADMIN" || // Les admins peuvent tout supprimer
      currentUser.role === "MODERATOR"); // Les modérateurs peuvent tout supprimer

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    // Ne pas fermer si on clique à l'intérieur du dropdown de réactions
    if (target?.closest(".reaction-dropdown")) {
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

  const handleDeleteComment = async () => {
    if (!currentUser || !canDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userRole: currentUser.role,
        }),
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        onCommentAdded(); // Actualiser la liste des commentaires
        toast.success("Commentaire supprimé !");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erreur lors de la suppression du commentaire");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`${isReply ? "ml-8 border-l-2 border-gray-100 pl-4" : ""}`}>
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback className="text-sm">
            {getInitials(comment.author.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-base text-gray-900">
                {comment.author.name}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                • {formatRelativeDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Membre</p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-800 leading-relaxed">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            {/* Reactions */}
            <div className="relative">
              <button
                className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-full transition-all duration-200 ${
                  comment.userReaction
                    ? "text-red-600 bg-red-50 hover:bg-red-100"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setShowReactionDropdown(!showReactionDropdown)}
              >
                <Heart
                  className={`h-4 w-4 ${
                    comment.userReaction ? "fill-current" : ""
                  }`}
                />
                <span>{totalReactions > 0 ? totalReactions : "J'aime"}</span>
              </button>

              {/* Dropdown des réactions */}
              {showReactionDropdown && currentUser && (
                <div className="reaction-dropdown absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                  <div className="flex gap-1">
                    {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => {
                      const isSelected = comment.userReaction === type;
                      const reactionCount =
                        comment.reactions?.find((r) => r.type === type)
                          ?.count || 0;
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

            {/* Voir les réponses / Commenter (seulement pour les commentaires principaux) */}
            {!isReply && (
              <button
                className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-full transition-all duration-200"
                onClick={() => {
                  if (repliesCount > 0) {
                    setShowReplies(!showReplies);
                  } else if (currentUser) {
                    setShowReplyForm(!showReplyForm);
                  }
                }}
              >
                <MessageCircle className="h-4 w-4" />
                <span>{repliesCount > 0 ? repliesCount : "Commenter"}</span>
              </button>
            )}

            {/* Bouton répondre séparé quand les réponses sont visibles */}
            {!isReply && currentUser && showReplies && repliesCount > 0 && (
              <button
                className="flex items-center gap-2 text-xs font-medium text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-full transition-all duration-200"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <MessageCircle className="h-4 w-4" />
                Répondre
              </button>
            )}

            {/* Bouton de suppression */}
            {canDelete && (
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <button
                    className="flex items-center gap-2 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-full transition-all duration-200"
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </DialogTrigger>
                <DialogContent size="sm">
                  <DialogHeader>
                    <DialogTitle>Supprimer le commentaire</DialogTitle>
                    <DialogDescription>
                      Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette
                      action est irréversible et le commentaire sera
                      définitivement supprimé.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                      disabled={deleting}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteComment}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting ? "Suppression..." : "Supprimer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && currentUser && (
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <form onSubmit={handleSubmitReply}>
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-900">
                        {currentUser.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Écrivez une réponse..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        disabled={submittingReply}
                        className="text-sm border-gray-200 rounded-xl bg-white"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!replyContent.trim() || submittingReply}
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && showReplies && (
            <div className="mt-6 space-y-4">
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
