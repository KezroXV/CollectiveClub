"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Search, Plus } from "lucide-react";

interface CommunityEmptyStateProps {
  type: "no-posts" | "no-results";
  searchQuery?: string;
  onCreatePost?: () => void;
  onClearSearch?: () => void;
  showCreateButton?: boolean;
}

export default function CommunityEmptyState({
  type,
  searchQuery,
  onCreatePost,
  onClearSearch,
  showCreateButton = false,
}: CommunityEmptyStateProps) {
  if (type === "no-results") {
    return (
      <Card className="hover:shadow-sm border-0">
        <CardContent className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted/50">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Aucun résultat trouvé</h3>
              <p className="text-muted-foreground max-w-md">
                Aucun post ne correspond à votre recherche &quot;{searchQuery}&quot;. Essayez avec
                d&apos;autres mots-clés.
              </p>
            </div>
            {onClearSearch && (
              <Button variant="outline" onClick={onClearSearch} className="mt-4">
                Afficher tous les posts
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-sm border-0">
      <CardContent className="text-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted/50">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Aucun post pour l&apos;instant</h3>
            <p className="text-muted-foreground max-w-md">
              Lancez la conversation ! Soyez le premier à partager quelque chose avec la
              communauté.
            </p>
          </div>
          {showCreateButton && onCreatePost && (
            <Button onClick={onCreatePost} className="mt-4 px-6">
              <Plus className="h-4 w-4 mr-2" />
              Créer le premier post
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
