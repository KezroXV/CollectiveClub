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
      <div className="mb-6 pt-7  relative">
        <Link href={`/community/${post.id}`}>
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
        <Button
          variant="outline"
          className="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-full border-2 border-gray-200 hover:bg-gray-100 text-gray-700"
        >
          <Heart className="h-5 w-5 stroke-2" />
          <span className="text-base font-medium">
            {post._count.reactions}
          </span>
        </Button>

        <Link
          href={`/community/${post.id}`}
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
