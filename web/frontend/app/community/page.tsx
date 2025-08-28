/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Plus, Search, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import ReactionPicker from "@/components/ReactionPicker";
import PollDisplay from "@/components/PollDisplay";
import ThemeWrapper from "@/components/ThemeWrapper";
interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: {
    id: string;
    name: string;
    email: string;
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

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const searchParams = useSearchParams();

  // Remplacer l'useEffect currentUser par :
  useEffect(() => {
    // 1. Essayer depuis l'URL
    const shop = searchParams.get("shop");

    if (shop) {
      setCurrentUser({
        id: "current-user-id",
        email: `admin@${shop}`,
        name: `Admin de ${shop}`,
        shopDomain: shop,
      });
    } else {
      // 2. Essayer depuis localStorage
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          console.log("✅ User loaded from localStorage:", user);
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content || !currentUser) return;

    setLoading(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPost,
          authorId: currentUser.id,
        }),
      });

      if (response.ok) {
        setNewPost({ title: "", content: "" });
        setShowCreateForm(false);
        fetchPosts();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const createComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment || !selectedPost || !currentUser) return;

    try {
      const response = await fetch(`/api/posts/${selectedPost}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          authorId: currentUser.id,
        }),
      });

      if (response.ok) {
        setNewComment("");
        fetchComments(selectedPost);
        fetchPosts(); // Refresh pour mettre à jour le count
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
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

  return (
    <ThemeWrapper applyBackgroundColor={true} className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Forum Communautaire</h1>
              <p className="text-muted-foreground">
                Partagez vos idées et discutez • {posts.length} posts
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gap-2"
            disabled={!currentUser}
          >
            <Plus className="h-4 w-4" />
            Nouveau post
          </Button>
        </div>

        {/* User Info */}
        {currentUser && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-green-500 text-white">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-green-800">
                    Connecté en tant que {currentUser.name}
                  </p>
                  <p className="text-sm text-green-600">{currentUser.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Post Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Créer un nouveau post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createPost} className="space-y-4">
                <Input
                  placeholder="Titre de votre post..."
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Contenu de votre post..."
                  rows={4}
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Publication..." : "Publier"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Rechercher des posts..." className="pl-10" />
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Aucun post pour l&apos;instant
                </h3>
                <p className="text-muted-foreground mb-4">
                  Soyez le premier à partager quelque chose !
                </p>
                {currentUser && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    Créer le premier post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(post.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {post.title}
                        </CardTitle>
                        <CardDescription>
                          Par {post.author.name} • {formatDate(post.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Nouveau</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.content}</p>

                  {post.poll && (
                    <div className="mb-4">
                      <PollDisplay
                        poll={post.poll}
                        currentUser={currentUser ?? undefined}
                        onVote={() => fetchPosts()}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 p-0 h-auto"
                      onClick={() => {
                        setSelectedPost(
                          selectedPost === post.id ? null : post.id
                        );
                        if (selectedPost !== post.id) {
                          fetchComments(post.id);
                        }
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      {post._count.comments} commentaires
                    </Button>
                    <ReactionPicker
                      postId={post.id}
                      currentUserId={currentUser?.id || ""}
                      onReactionUpdate={fetchPosts}
                    />
                  </div>

                  {/* Comments Section */}
                  {selectedPost === post.id && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold mb-4">Commentaires</h4>

                      {/* Comment Form */}
                      {currentUser && (
                        <form onSubmit={createComment} className="mb-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Écrivez un commentaire..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="flex-1"
                            />
                            <Button type="submit" size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </form>
                      )}

                      {/* Comments List */}
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-muted/50 rounded-lg p-3"
                          >
                            <div className="flex items-start gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(comment.author.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {comment.author.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {comments.length === 0 && (
                          <p className="text-muted-foreground text-sm text-center py-4">
                            Aucun commentaire pour l&apos;instant.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ThemeWrapper>
  );
}
