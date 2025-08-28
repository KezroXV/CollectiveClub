"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Users,
  MessageSquare,
  Heart,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
  postsCount: number;
  commentsCount: number;
  reactionsCount: number;
}

interface PaginatedResponse {
  members: MemberData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  shopId?: string;
}

export default function ClientsModal({
  isOpen,
  onClose,
  userId,
}: ClientsModalProps) {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const ITEMS_PER_PAGE = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchMembers = async (page: number = 1, search: string = "") => {
    if (!isOpen) return;

    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      params.append("page", page.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());
      if (search.trim()) params.append("search", search.trim());

      const response = await fetch(`/api/members?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaginatedResponse = await response.json();
      setMembers(data.members);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalMembers(data.total);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderator":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "member":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "Administrateur";
      case "moderator":
        return "Modérateur";
      case "member":
        return "Membre";
      default:
        return role;
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchMembers(newPage, debouncedSearch);
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers(currentPage, debouncedSearch);
    }
  }, [isOpen, userId, debouncedSearch, currentPage]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        size="full"
        className="sm:max-w-6xl w-[95vw] max-h-[80vh] overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des Membres
          </DialogTitle>
          <DialogDescription>
            Consultez et gérez les membres de votre communauté
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats rapides */}
          {!isLoading && (
            <div className="flex gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Total: {totalMembers} membres</span>
              </div>
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>
                  Page {currentPage} / {totalPages}
                </span>
              </div>
            </div>
          )}

          {/* Liste des membres */}
          <div className="overflow-y-auto max-h-96 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">
                  Chargement des membres...
                </span>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {debouncedSearch
                  ? "Aucun membre trouvé pour cette recherche"
                  : "Aucun membre dans votre communauté"}
              </div>
            ) : (
              members.map((member) => (
                <Card
                  key={member.id}
                  className="hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {member.name}
                            </h4>
                            <p className="text-sm text-gray-600 truncate">
                              {member.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              className={`text-xs ${getRoleBadgeColor(
                                member.role
                              )}`}
                            >
                              {getRoleLabel(member.role)}
                            </Badge>
                            {member.isActive && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-green-100 text-green-800"
                              >
                                Actif
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs text-gray-500 mb-2">
                          <span>Inscrit le {formatDate(member.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">
                              {member.postsCount}
                            </span>
                            <span className="text-gray-500">posts</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                            <span className="font-medium">
                              {member.commentsCount}
                            </span>
                            <span className="text-gray-500">commentaires</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Heart className="h-4 w-4 text-red-600" />
                            <span className="font-medium">
                              {member.reactionsCount}
                            </span>
                            <span className="text-gray-500">réactions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
