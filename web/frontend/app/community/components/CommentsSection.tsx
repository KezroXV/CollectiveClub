import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import CommentItem from "./CommentItem";

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
  postId: string;
  onNewCommentChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  onCommentAdded: () => void;
  getInitials: (name: string) => string;
  formatRelativeDate: (dateString: string) => string;
}

const CommentsSection = ({
  comments,
  commentsCount,
  currentUser,
  newComment,
  submittingComment,
  postId,
  onNewCommentChange,
  onSubmitComment,
  onCommentAdded,
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
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              postId={postId}
              getInitials={getInitials}
              formatRelativeDate={formatRelativeDate}
              onCommentAdded={onCommentAdded}
            />
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