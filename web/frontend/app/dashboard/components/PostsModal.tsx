"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Heart,
  MessageSquare,
  Eye,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface PostData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
  _count: {
    reactions: number;
    comments: number;
    views?: number;
  };
  category?: {
    name: string;
    color: string;
  };
}

interface PostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  shopId?: string;
}

export default function PostsModal({
  isOpen,
  onClose,
  userId,
}: PostsModalProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = async () => {
    if (!isOpen) return;

    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      params.append("admin", "true");
      params.append("include", "stats");

      const response = await fetch(`/api/posts?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.content.toLowerCase().includes(query.toLowerCase()) ||
          post.author.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Retirer le post de la liste locale
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setFilteredPosts((prev) => prev.filter((p) => p.id !== postId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  useEffect(() => {
    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen, userId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        size="full"
        className="sm:max-w-6xl w-[95vw] max-h-[80vh] overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Gestion des Posts
          </DialogTitle>
          <DialogDescription>
            Gérez tous les posts de votre communauté
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher par titre, contenu ou auteur..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats rapides */}
          {!isLoading && (
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Total: {posts.length} posts</span>
              <span>Affichés: {filteredPosts.length} posts</span>
            </div>
          )}

          {/* Liste des posts */}
          <div className="overflow-y-auto max-h-96 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">
                  Chargement des posts...
                </span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery
                  ? "Aucun post trouvé pour cette recherche"
                  : "Aucun post dans votre communauté"}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {post.title}
                          </h4>
                          {post.category && (
                            <Badge
                              variant="secondary"
                              className="ml-2 shrink-0"
                              style={{
                                backgroundColor: `${post.category.color}20`,
                                color: post.category.color,
                              }}
                            >
                              {post.category.name}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {truncateContent(post.content)}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Par {post.author.name}</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Heart className="h-4 w-4" />
                            {post._count.reactions}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MessageSquare className="h-4 w-4" />
                            {post._count.comments}
                          </div>
                          {post._count.views !== undefined && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Eye className="h-4 w-4" />
                              {post._count.views}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteConfirm({ id: post.id, title: post.title })
                        }
                        className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        {deleteConfirm && (
          <Dialog open={true} onOpenChange={() => setDeleteConfirm(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Confirmer la suppression
                </DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir supprimer le post &quot;
                  {deleteConfirm.title}&quot; ?<br />
                  Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeletePost(deleteConfirm.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Suppression...
                    </>
                  ) : (
                    "Supprimer"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
