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
    image?: string;
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
    role?: string;
  } | null;
  newComment: string;
  submittingComment: boolean;
  postId: string;
  onNewCommentChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  onCommentAdded: () => void;
  onCommentDeleted: (commentId: string) => void;
  onReactionUpdated: (commentId: string, reactions: ReactionData[], userReaction: ReactionType | null) => void;
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
  onCommentDeleted,
  onReactionUpdated,
  getInitials,
  formatRelativeDate,
}: CommentsSectionProps) => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h3 className="text-xl font-bold mb-6 text-gray-900">
        Commentaires ({commentsCount})
      </h3>

      {/* Comment Form */}
      {currentUser && (
        <div className="mb-8">
          <form
            onSubmit={onSubmitComment}
            className="bg-white rounded-2xl border border-gray-100 hover:shadow-sm p-4"
          >
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-sm">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500">Membre</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Écrivez un commentaire..."
                    value={newComment}
                    onChange={(e) => onNewCommentChange(e.target.value)}
                    disabled={submittingComment}
                    className="border-chart-4 rounded-xl bg-gray-50 focus:bg-white transition-colors"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || submittingComment}
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-2xl border border-gray-100 hover:shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
            >
              <CommentItem
                comment={comment}
                currentUser={currentUser}
                postId={postId}
                getInitials={getInitials}
                formatRelativeDate={formatRelativeDate}
                onCommentAdded={onCommentAdded}
                onCommentDeleted={onCommentDeleted}
                onReactionUpdated={onReactionUpdated}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-sm p-8">
              <p className="text-gray-500 text-sm">
                Aucun commentaire pour l&apos;instant. Soyez le premier à
                commenter !
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
