/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Share2, Heart, Pin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PollDisplay from "@/components/PollDisplay";
import { toast } from "sonner";

interface Post {
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
  const handleShare = () => {
    const url = `${window.location.origin}/community/${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié dans le presse-papiers !");
  };

  return (
    <div className={`pb-8 ${!isLast ? "border-b border-gray-100" : ""}`}>
      {/* Post Title and Content */}
      <div className="mb-6 pt-7 pl-16 relative">
        <h2 className="text-[10px] md:text-[13px] font-semibold text-gray-900 mb-2 leading-tight line-clamp-1">
          {post.title}
        </h2>
        <p className="text-gray-700 text-[13px] leading-6 line-clamp-2">
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="mb-8 pl-16">
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
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
        <div className="mb-8 pl-16">
          <PollDisplay
            poll={post.poll}
            currentUser={currentUser}
            onVote={onVote}
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-6 pl-16">
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-gray-200 hover:bg-gray-100 text-gray-600"
        >
          <Heart className="h-4 w-4" />
          <Badge className="rounded-full bg-white text-gray-600  px-2 py-0 text-xs font-medium">
            {post._count.reactions}
          </Badge>
        </Button>

        <Link
          href={`/community?postId=${post.id}`}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors group"
        >
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-gray-200 group-hover:bg-primary/10 group-hover:border-primary/30 text-gray-600"
          >
            <MessageSquare className="h-4 w-4" />
            <Badge className="rounded-full bg-white text-gray-600 border border-gray-200 px-2 py-0 text-xs font-medium">
              {post._count.comments}
            </Badge>
          </Button>
        </Link>

        <Button
          variant="outline"
          className="ml-auto flex items-center gap-2 bg-white px-4 py-2 rounded-full border-gray-200 hover:bg-gray-100 text-gray-600"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          Partager
        </Button>
      </div>
    </div>
  );
}
