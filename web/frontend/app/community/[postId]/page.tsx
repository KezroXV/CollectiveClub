/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import PollDisplay from "@/components/PollDisplay";
import Header from "@/components/Header";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
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
  poll?: any;
  _count: {
    comments: number;
    reactions: number;
  };
  createdAt: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }
  }, []);

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.postId}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data);
        } else {
          router.push("/community");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        router.push("/community");
      } finally {
        setLoading(false);
      }
    };

    if (params.postId) {
      fetchPost();
    }
  }, [params.postId, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "?"
    );
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié dans le presse-papiers !");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentUser={currentUser} />
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentUser={currentUser} />
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Post introuvable
            </h1>
            <Link href="/community">
              <Button>Retour au forum</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Bouton retour */}
          <div className="mb-6">
            <Link href="/community">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour au forum
              </Button>
            </Link>
          </div>

          {/* Post complet */}
          <div className="bg-white rounded-[22px] border border-primary/20 shadow-sm overflow-hidden">
            <div className="p-8">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                      {getInitials(post.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900 text-base">
                      {post.author.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                  {post.category && (
                    <Badge className={`${post.category.color} text-white ml-4`}>
                      {post.category.name}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              {/* Post Title and Content */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>
                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* Poll Display */}
              {post.poll && (
                <div className="mb-6">
                  <PollDisplay
                    poll={post.poll}
                    currentUser={currentUser}
                    onVote={() => {
                      // Optionnel: recharger le post pour avoir les stats à jour
                      window.location.reload();
                    }}
                  />
                </div>
              )}

              {/* Post Image */}
              {post.imageUrl && (
                <div className="mb-8">
                  <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      width={1600}
                      height={900}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
                <Button variant="outline" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <Badge variant="secondary">{post._count.reactions}</Badge>
                </Button>

                <Button variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <Badge variant="secondary">{post._count.comments}</Badge>
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2 ml-auto"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Partager
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
