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
  ChevronDown,
  ChevronUp,
  Calendar,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PollDisplay from "@/components/PollDisplay";
import ReactionPicker from "@/components/ReactionPicker";
import ThemeWrapper from "@/components/ThemeWrapper";
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

interface AuthorBadge {
  id: string;
  name: string;
  imageUrl: string;
  requiredCount: number;
}

interface PostDetailData {
  post: Post;
  authorRecentPosts: AuthorPost[];
  authorRecentComments: AuthorComment[];
  authorBadges: AuthorBadge[];
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
        const response = await fetch(`/api/posts/${params.postId}`);
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
  }, [params.postId, router]);

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

  const { post, authorRecentPosts, authorRecentComments, authorBadges } = data;

  return (
    <ThemeWrapper applyBackgroundColor={true} className="min-h-screen">
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
            {/* Colonne principale (70%) */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm">
                <CardHeader>
                  {/* Post Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback className="bg-blue-500 text-white font-semibold">
                          {getInitials(post.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {post.author.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">
                            {formatDate(post.createdAt)}
                          </p>
                          <Badge
                            className={getRoleColor(post.author.role)}
                            variant="secondary"
                          >
                            {getRoleLabel(post.author.role)}
                          </Badge>
                        </div>
                      </div>
                      {post.category && (
                        <Badge
                          className={`${post.category.color} text-white ml-4`}
                        >
                          {post.category.name}
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Post Title */}
                  <CardTitle className="text-2xl font-bold text-gray-900 mt-4">
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

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="flex items-center gap-4">
                      <ReactionPicker
                        postId={post.id}
                        currentUserId={currentUser?.id || ""}
                        onReactionUpdate={() => window.location.reload()}
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setShowComments(!showComments)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        {post._count.comments} commentaires
                        {showComments ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                      Partager
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
                                <p className="text-sm text-gray-700">
                                  {comment.content}
                                </p>
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

            {/* Sidebar droite (30%) */}
            <div className="space-y-6">
              {/* Profil de l'auteur */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Profil de l&apos;auteur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback className="bg-blue-500 text-white text-lg font-semibold">
                        {getInitials(post.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{post.author.name}</h3>
                      <Badge
                        className={getRoleColor(post.author.role)}
                        variant="secondary"
                      >
                        {getRoleLabel(post.author.role)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="h-4 w-4" />
                    Membre depuis {formatDate(post.author.createdAt)}
                  </div>

                  {currentUser?.id !== post.author.id && (
                    <Button className="w-full gap-2" size="sm">
                      <UserPlus className="h-4 w-4" />
                      S&apos;abonner
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Badges de l'auteur */}
              {authorBadges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Badges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {authorBadges.map((badge) => (
                        <div
                          key={badge.id}
                          className="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-12 h-12 mb-2">
                            <Image
                              src={badge.imageUrl}
                              alt={badge.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-xs font-medium text-center">
                            {badge.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posts récents de l'auteur */}
              {authorRecentPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Posts récents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {authorRecentPosts.map((authorPost) => (
                      <Link
                        key={authorPost.id}
                        href={`/community/${authorPost.id}`}
                      >
                        <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <h4 className="font-medium text-sm mb-2 line-clamp-2">
                            {authorPost.title}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>
                              {formatRelativeDate(authorPost.createdAt)}
                            </span>
                            <span>
                              {authorPost._count.comments} commentaires
                            </span>
                            <span>{authorPost._count.reactions} réactions</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Commentaires récents de l'auteur */}
              {authorRecentComments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Commentaires récents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {authorRecentComments.map((comment) => (
                      <Link
                        key={comment.id}
                        href={`/community/${comment.post.id}`}
                      >
                        <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <p className="text-sm mb-2 line-clamp-2">
                            {comment.content}
                          </p>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">
                              Sur: {comment.post.title}
                            </span>
                            <br />
                            <span>{formatRelativeDate(comment.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
