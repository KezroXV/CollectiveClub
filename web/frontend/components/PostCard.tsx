/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Share2, Heart, Pin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PollDisplay from "@/components/PollDisplay";
import { toast } from "sonner";

type ReactionType = "LIKE" | "LOVE" | "LAUGH" | "WOW" | "APPLAUSE";

interface ReactionData {
  type: ReactionType;
  count: number;
}

const REACTION_EMOJIS: Record<ReactionType, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  LAUGH: "😂",
  WOW: "😮",
  APPLAUSE: "👏",
};

interface Post {
  slug: string;
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  isPinned?: boolean;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  poll?: {
    id: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
      order: number;
      _count: { votes: number };
    }>;
    _count: { votes: number };
  } | null;
  _count: {
    comments: number;
    reactions: number;
  };
  reactions?: ReactionData[];
  userReaction?: ReactionType | null;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  currentUser?: any;
  onVote?: () => void;
  isLast?: boolean;
}

export default function PostCard({
  post,
  currentUser,
  onVote,
  isLast = false,
}: PostCardProps) {
  const [showReactionDropdown, setShowReactionDropdown] = useState(false);

  // Gérer le clic à l'extérieur pour fermer le dropdown
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    if (target?.closest(".reaction-dropdown")) {
      return;
    }
    setShowReactionDropdown(false);
  }, []);

  useEffect(() => {
    if (showReactionDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showReactionDropdown, handleClickOutside]);
  const handleShare = () => {
    const url = `${window.location.origin}/community/posts/${post.slug || post.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié dans le presse-papiers !");
  };

  const handleReaction = async (type: ReactionType) => {
    if (!currentUser) {
      toast.error("Vous devez être connecté pour réagir");
      return;
    }

    setShowReactionDropdown(false);

    try {
      const response = await fetch(`/api/posts/${post.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          userId: currentUser.id,
          shopId: currentUser.shopId,
        }),
      });

      if (response.ok) {
        toast.success("Réaction ajoutée !");
        if (onVote) {
          onVote(); // Rafraîchir la liste des posts
        }
      } else {
        toast.error("Erreur lors de l'ajout de la réaction");
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
      toast.error("Erreur lors de l'ajout de la réaction");
    }
  };

  return (
    <div className={`pb-8 ${!isLast ? "border-b border-gray-100" : ""}`}>
      {/* Post Title and Content */}
      <div className="mb-6 pt-7  relative">
        <Link href={`/community/posts/${post.slug || post.id}`}>
          <h2 className="text-[10px] md:text-[13px] font-semibold text-gray-900 mb-2 leading-tight line-clamp-1 cursor-pointer hover:text-primary transition-colors duration-200">
            {post.title}
          </h2>
        </Link>
        <p className="text-gray-700 text-[13px] leading-6 line-clamp-2">
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="mb-8 ">
          <div className="rounded-2xl overflow-hidden hover:shadow-sm border border-gray-100">
            <Image
              src={post.imageUrl}
              alt={post.title}
              width={702}
              height={285}
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        </div>
      )}

      {/* Poll */}
      {post.poll && (
        <div className="mb-8 ">
          <PollDisplay
            poll={post.poll}
            currentUser={currentUser}
            onVote={onVote}
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-4">
        {/* Reactions with dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            className={`flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-full border-2 border-gray-200 hover:bg-gray-100 transition-colors ${
              post.userReaction
                ? "text-red-600 border-red-300 bg-red-50"
                : "text-gray-700"
            }`}
            onClick={() => setShowReactionDropdown(!showReactionDropdown)}
            disabled={!currentUser}
          >
            <Heart className={`h-5 w-5 stroke-2 ${post.userReaction ? "fill-current" : ""}`} />
            <span className="text-base font-medium">
              {post._count.reactions}
            </span>
          </Button>

          {/* Dropdown des réactions */}
          {showReactionDropdown && currentUser && (
            <div className="reaction-dropdown absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
              <div className="flex gap-1 mb-2">
                {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => {
                  const isSelected = post.userReaction === type;
                  const reactionCount = post.reactions?.find((r) => r.type === type)?.count || 0;
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
                      <span className="text-xs text-gray-500 mt-1">{reactionCount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Link
          href={`/community/posts/${post.slug || post.id}`}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors group"
        >
          <Button
            variant="outline"
            className="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-full border-2 border-gray-200 group-hover:bg-gray-100 text-gray-700"
          >
            <MessageSquare className="h-5 w-5 stroke-2" />
            <span className="text-base font-medium">
              {post._count.comments}
            </span>
          </Button>
        </Link>

        <Button
          variant="outline"
          className="ml-auto flex items-center gap-2 bg-white px-4 py-2 rounded-full border-chart-4 hover:bg-gray-100 text-gray-600"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          Partager
        </Button>
      </div>
    </div>
  );
}
