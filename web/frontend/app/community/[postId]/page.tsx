/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Send,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PollDisplay from "@/components/PollDisplay";
import ThemeWrapper from "@/components/ThemeWrapper";
import FollowButton from "@/components/FollowButton";
import PointsDisplay from "@/components/PointsDisplay";
import BadgeGrid from "@/components/BadgeGrid";
import Header from "@/components/Header";
import PostReactions from "@/components/PostReactions";
import CommentReactions from "@/components/CommentReactions";
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
    createdAt: string;
    role: string;
  };
  poll?: any;
  comments: Comment[];
  reactions?: Array<{
    type: string;
    count: number;
  }>;
  userReaction?: string | null;
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
  reactions?: Array<{
    type: string;
    count: number;
  }>;
  userReaction?: string | null;
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
}


interface PostDetailData {
  post: Post;
  authorRecentPosts: AuthorPost[];
  authorRecentComments: AuthorComment[];
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

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
    const fetchPostData = async () => {
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
    };

    if (params.postId) {
      fetchPostData();
    }
  }, [params.postId, router, currentUser]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
    return formatDate(dateString);
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

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié dans le presse-papiers !");
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
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
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Erreur lors de l'ajout du commentaire");
    } finally {
      setSubmittingComment(false);
    }
  };

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

          {/* Bouton retour */}
          <div className="mb-6">
            <Link href="/community">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour au forum
              </Button>
            </Link>
          </div>

          {/* Layout 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale (66%) */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback className="bg-blue-500 text-white font-semibold text-sm">
                          {getInitials(post.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {post.author.name}
                          </p>
                          <Badge
                            className={`${getRoleColor(post.author.role)} text-xs px-2 py-1`}
                            variant="secondary"
                          >
                            {getRoleLabel(post.author.role)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          posté le {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Categories badges */}
                  <div className="flex gap-2 mb-4">
                    {post.category && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-3 py-1"
                        style={{ backgroundColor: post.category.color, color: 'white' }}
                      >
                        {post.category.name}
                      </Badge>
                    )}
                  </div>

                  {/* Post Title */}
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {post.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {/* Post Content */}
                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <div className="mb-6">
                      <div className="rounded-xl overflow-hidden">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          width={800}
                          height={400}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Poll Display */}
                  {post.poll && (
                    <div className="mb-6">
                      <PollDisplay
                        poll={post.poll}
                        currentUser={currentUser}
                        onVote={() => window.location.reload()}
                      />
                    </div>
                  )}

                  {/* Post Reactions */}
                  {currentUser && (
                    <PostReactions
                      postId={post.id}
                      shopId={currentUser.shopId}
                      userId={currentUser.id}
                      reactions={post.reactions || []}
                      userReaction={post.userReaction}
                    />
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <button 
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        onClick={() => setShowComments(!showComments)}
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span className="text-sm font-medium">{post._count.comments || 10}</span>
                      </button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-gray-600 hover:text-gray-900"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Comments Section */}
                  {showComments && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-lg font-semibold mb-4">
                        Commentaires ({post._count.comments})
                      </h3>

                      {/* Comment Form */}
                      {currentUser && (
                        <form onSubmit={handleSubmitComment} className="mb-6">
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
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={submittingComment}
                              />
                              <Button
                                type="submit"
                                size="sm"
                                disabled={
                                  !newComment.trim() || submittingComment
                                }
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Comments List */}
                      <div className="space-y-4">
                        {post.comments.length > 0 ? (
                          post.comments.map((comment) => (
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
                                  shopId={currentUser?.shopId || ''}
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
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar droite (33%) */}
            <div>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Profil de l'auteur */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback className="bg-blue-500 text-white font-semibold">
                          {getInitials(post.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{post.author.name}</h3>
                        <p className="text-xs text-gray-500">tomp</p>
                        <p className="text-xs text-gray-500 mb-1">
                          Membre depuis le {formatDate(post.author.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">7k abonnés</p>
                      </div>
                    </div>

                    {currentUser && currentUser.id !== post.author.id && (
                      <FollowButton
                        targetUserId={post.author.id}
                        currentUserId={currentUser.id}
                        shopId={currentUser.shopId}
                        isFollowing={false}
                        followersCount={0}
                        size="sm"
                      />
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-200"></div>

                  {/* Points de l'auteur */}
                  <div className="p-6">
                    <PointsDisplay 
                      userId={post.author.id}
                      shopId={currentUser?.shopId || data?.post?.shop?.id}
                      compact={true}
                    />
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-200"></div>

                  {/* Badges de l'auteur */}
                  <div className="p-6">
                    <BadgeGrid
                      userId={post.author.id}
                      shopId={currentUser?.shopId || data?.post?.shop?.id}
                      userPoints={0}
                      compact={true}
                    />
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-200"></div>

                  {/* Posts récents */}
                  <div className="p-6">
                    <h4 className="font-semibold text-lg mb-4">Posts récents</h4>
                    <div className="space-y-4">
                      {authorRecentPosts.length > 0 ? (
                        authorRecentPosts.slice(0, 2).map((authorPost) => (
                          <Link key={authorPost.id} href={`/community/${authorPost.id}`}>
                            <div className="hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors">
                              <h5 className="text-sm font-medium mb-2 line-clamp-2">
                                {authorPost.title}
                              </h5>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  {authorPost._count.reactions}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {authorPost._count.comments}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <>
                          <div className="hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors">
                            <h5 className="text-sm font-medium mb-2 line-clamp-2">
                              Vous connaissez un bon site qui vends des marques vintage ?
                            </h5>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                24
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                10
                              </span>
                            </div>
                          </div>
                          <div className="hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors">
                            <h5 className="text-sm font-medium mb-2 line-clamp-2">
                              Je lance ma nouvelle boutique Shopify, des bêta testeurs pour tester un peu les fonctionnalités du site svp ?
                            </h5>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                17
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                1
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-200"></div>

                  {/* Commentaires récents */}
                  <div className="p-6">
                    <h4 className="font-semibold text-lg mb-4">Commentaires récents</h4>
                    <div className="space-y-4">
                      {authorRecentComments.length > 0 ? (
                        authorRecentComments.slice(0, 2).map((comment) => (
                          <Link key={comment.id} href={`/community/${comment.post.id}`}>
                            <div className="hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors">
                              <p className="text-sm mb-2 line-clamp-2">
                                {comment.content}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  24
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  10
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <>
                          <div className="hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors">
                            <p className="text-sm mb-2 line-clamp-2">
                              Trop cool ton idée, comment t&apos;es arrivé là ? Tu as combien de marques au total ?
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                24
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                10
                              </span>
                            </div>
                          </div>
                          <div className="hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors">
                            <p className="text-sm mb-2 line-clamp-2">
                              Honnêtement je suis pas d&apos;accord, je trouve que certaines boutiques pouvait être plus simple mais...
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                17
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                1
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
