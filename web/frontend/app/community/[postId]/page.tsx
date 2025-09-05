/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ThemeWrapper from "@/components/ThemeWrapper";
import Header from "@/components/Header";
import { toast } from "sonner";
import PostHeader from "../components/PostHeader";
import PostContent from "../components/PostContent";
import PostActions from "../components/PostActions";
import CommentsSection from "../components/CommentsSection";
import AuthorSidebar from "../components/AuthorSidebar";

type ReactionType = "LIKE" | "LOVE" | "LAUGH" | "WOW" | "APPLAUSE";

interface ReactionData {
  type: ReactionType;
  count: number;
}

interface Post {
  shop: any;
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
    createdAt: string;
    role: string;
  };
  poll?: any;
  comments: Comment[];
  reactions?: ReactionData[];
  userReaction?: ReactionType | null;
  _count: {
    comments: number;
    reactions: number;
  };
  createdAt: string;
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

interface AuthorPost {
  id: string;
  title: string;
  createdAt: string;
  _count: {
    comments: number;
    reactions: number;
  };
}

interface AuthorComment {
  id: string;
  content: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
  };
  _count: {
    reactions: number;
  };
}

interface BadgeInfo {
  id: string;
  name: string;
  imageUrl: string;
  requiredPoints: number;
  unlocked: boolean;
}

interface UserPointsInfo {
  points: number;
  badges: BadgeInfo[];
}

interface PostDetailData {
  post: Post;
  authorRecentPosts: AuthorPost[];
  authorRecentComments: AuthorComment[];
  authorPoints?: UserPointsInfo;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-800";
    case "MODERATOR":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "MODERATOR":
      return "Modérateur";
    default:
      return "Membre";
  }
};

const PostDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    shopId: string;
    role?: string;
  } | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showReactionDropdown, setShowReactionDropdown] = useState(false);

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

  const fetchPostData = useCallback(async () => {
    if (!params.postId) return;

    try {
      const url = currentUser
        ? `/api/posts/${params.postId}?userId=${currentUser.id}`
        : `/api/posts/${params.postId}`;
      const response = await fetch(url);

      if (response.ok) {
        const postData = await response.json();

        setData(postData);
      } else {
        router.push("/community");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      router.push("/community");
    } finally {
      setLoading(false);
    }
  }, [params.postId, currentUser, router]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

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

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const formatRelativeDate = useCallback(
    (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) return "Aujourd'hui";
      if (diffInDays === 1) return "Hier";
      if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
      if (diffInDays < 30)
        return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
      return formatDate(dateString);
    },
    [formatDate]
  );

  const getInitials = useCallback((name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "?"
    );
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papiers !");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Erreur lors de la copie du lien");
    }
  }, []);

  const handleReaction = useCallback(
    async (type: ReactionType) => {
      if (!currentUser || !data) return;

      setShowReactionDropdown(false);

      try {
        const response = await fetch(`/api/posts/${data.post.id}/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            userId: currentUser.id,
            shopId: currentUser.shopId,
          }),
        });

        if (response.ok) {
          await fetchPostData();
          toast.success("Réaction ajoutée !");
        } else {
          toast.error("Erreur lors de l'ajout de la réaction");
        }
      } catch (error) {
        console.error("Error adding reaction:", error);
        toast.error("Erreur lors de l'ajout de la réaction");
      }
    },
    [currentUser, data, fetchPostData]
  );

  const totalReactions = useMemo(() => {
    return data?.post.reactions?.reduce((sum, r) => sum + r.count, 0) || 0;
  }, [data?.post.reactions]);

  const handleSubmitComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || !currentUser || !data) return;

      setSubmittingComment(true);
      try {
        const response = await fetch(`/api/posts/${data.post.id}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newComment.trim(),
            authorId: currentUser.id,
          }),
        });

        if (response.ok) {
          const comment = await response.json();
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  post: {
                    ...prev.post,
                    comments: [comment, ...prev.post.comments],
                    _count: {
                      ...prev.post._count,
                      comments: prev.post._count.comments + 1,
                    },
                  },
                }
              : null
          );
          setNewComment("");
          toast.success("Commentaire ajouté !");
        } else {
          toast.error("Erreur lors de l'ajout du commentaire");
        }
      } catch (error) {
        console.error("Error submitting comment:", error);
        toast.error("Erreur lors de l'ajout du commentaire");
      } finally {
        setSubmittingComment(false);
      }
    },
    [newComment, currentUser, data]
  );

  if (loading) {
    return (
      <ThemeWrapper applyBackgroundColor={true} className="min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeWrapper>
    );
  }

  if (!data) {
    return (
      <ThemeWrapper applyBackgroundColor={true} className="min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Post introuvable
            </h1>
            <Link href="/community">
              <Button>Retour au forum</Button>
            </Link>
          </div>
        </div>
      </ThemeWrapper>
    );
  }

  const { post, authorRecentPosts, authorRecentComments } = data;

  return (
    <ThemeWrapper applyBackgroundColor={true} className="min-h-screen">
      <Header currentUser={currentUser} />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-gray-900">
              Accueil
            </Link>
            <span>&gt;</span>
            <Link href="/community" className="hover:text-gray-900">
              Community
            </Link>
            <span>&gt;</span>
            <span className="text-gray-900 truncate max-w-xs">
              {post.title}
            </span>
          </nav>

          {/* Layout 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale (66%) */}
            <div className="lg:col-span-2">
              <Card className="hover:shadow-sm">
                <CardHeader className="">
                  <PostHeader
                    author={post.author}
                    createdAt={post.createdAt}
                    category={post.category}
                    title={post.title}
                    post={{
                      id: post.id,
                      isPinned: post.isPinned,
                      authorId: post.author.id,
                    }}
                    getInitials={getInitials}
                    formatDate={formatDate}
                    getRoleColor={getRoleColor}
                    getRoleLabel={getRoleLabel}
                    currentUser={currentUser}
                    onPin={fetchPostData}
                    onDelete={() => router.push("/community")}
                  />
                </CardHeader>

                <CardContent>
                  <PostContent
                    content={post.content}
                    imageUrl={post.imageUrl}
                    title={post.title}
                    poll={post.poll}
                    currentUser={currentUser}
                  />

                  <PostActions
                    totalReactions={totalReactions}
                    commentsCount={post._count.comments || 0}
                    showReactionDropdown={showReactionDropdown}
                    reactions={post.reactions}
                    userReaction={post.userReaction}
                    currentUser={currentUser}
                    onReactionClick={() =>
                      setShowReactionDropdown(!showReactionDropdown)
                    }
                    onReaction={handleReaction}
                    onCommentsClick={() => setShowComments(!showComments)}
                    onShare={handleShare}
                  />

                  {/* Comments Section */}
                  {showComments && (
                    <CommentsSection
                      comments={post.comments}
                      commentsCount={post._count.comments}
                      currentUser={currentUser}
                      newComment={newComment}
                      submittingComment={submittingComment}
                      postId={post.id}
                      onNewCommentChange={setNewComment}
                      onSubmitComment={handleSubmitComment}
                      onCommentAdded={fetchPostData}
                      getInitials={getInitials}
                      formatRelativeDate={formatRelativeDate}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar droite (33%) */}
            <div>
              <AuthorSidebar
                author={post.author}
                authorRecentPosts={authorRecentPosts}
                authorRecentComments={authorRecentComments}
                currentUser={currentUser}
                getInitials={getInitials}
                formatDate={formatDate}
              />
            </div>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
};

export default PostDetailPage;
