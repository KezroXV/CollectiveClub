import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import CommentReactions from "@/components/CommentReactions";

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
}

interface CommentsSectionProps {
  comments: Comment[];
  commentsCount: number;
  currentUser: {
    id: string;
    name: string;
    shopId: string;
  } | null;
  newComment: string;
  submittingComment: boolean;
  onNewCommentChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  getInitials: (name: string) => string;
  formatRelativeDate: (dateString: string) => string;
}

const CommentsSection = ({
  comments,
  commentsCount,
  currentUser,
  newComment,
  submittingComment,
  onNewCommentChange,
  onSubmitComment,
  getInitials,
  formatRelativeDate,
}: CommentsSectionProps) => {
  return (
    <div className="mt-8 pt-6 border-t">
      <h3 className="text-lg font-semibold mb-4">
        Commentaires ({commentsCount})
      </h3>

      {/* Comment Form */}
      {currentUser && (
        <form onSubmit={onSubmitComment} className="mb-6">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Écrivez un commentaire..."
                value={newComment}
                onChange={(e) => onNewCommentChange(e.target.value)}
                disabled={submittingComment}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || submittingComment}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.avatar} />
                <AvatarFallback className="text-xs">
                  {getInitials(comment.author.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatRelativeDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {comment.content}
                </p>
                {/* Réactions du commentaire */}
                <CommentReactions
                  commentId={comment.id}
                  shopId={currentUser?.shopId || ""}
                  userId={currentUser?.id}
                  reactions={comment.reactions || []}
                  userReaction={comment.userReaction}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            Aucun commentaire pour l&apos;instant. Soyez le
            premier à commenter !
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;