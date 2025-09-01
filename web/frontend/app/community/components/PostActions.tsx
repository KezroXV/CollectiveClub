import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, ChevronDown } from "lucide-react";

type ReactionType = "LIKE" | "LOVE" | "LAUGH" | "WOW" | "APPLAUSE";

interface PostActionsProps {
  totalReactions: number;
  commentsCount: number;
  showReactionDropdown: boolean;
  currentUser: {
    id: string;
    name: string;
    shopId: string;
  } | null;
  onReactionClick: () => void;
  onReaction: (type: ReactionType) => void;
  onCommentsClick: () => void;
  onShare: () => void;
}

const REACTION_EMOJIS: Record<ReactionType, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  LAUGH: "😂",
  WOW: "😮",
  APPLAUSE: "👏",
};

const PostActions = ({
  totalReactions,
  commentsCount,
  showReactionDropdown,
  currentUser,
  onReactionClick,
  onReaction,
  onCommentsClick,
  onShare,
}: PostActionsProps) => {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      <div className="flex items-center gap-6">
        {/* Reactions with dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={onReactionClick}
          >
            <Heart className="h-5 w-5" />
            <span className="text-sm font-medium">
              {totalReactions}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Dropdown des réactions */}
          {showReactionDropdown && currentUser && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-10">
              {Object.entries(REACTION_EMOJIS).map(
                ([type, emoji]) => (
                  <button
                    key={type}
                    onClick={() => onReaction(type as ReactionType)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors text-lg"
                    title={type}
                  >
                    {emoji}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <button
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          onClick={onCommentsClick}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm font-medium">
            {commentsCount}
          </span>
        </button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-gray-600 hover:text-gray-900"
        onClick={onShare}
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PostActions;