"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, TrendingUp } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "recent" | "popular";
  onSortChange: (sort: "recent" | "popular") => void;
  resultsCount: number;
  totalCount: number;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultsCount,
  totalCount,
}: SearchBarProps) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher des posts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-muted-foreground/20 focus:border-primary hover:shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => onSortChange("recent")}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            Récents
          </Button>
          <Button
            variant={sortBy === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => onSortChange("popular")}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Populaires
          </Button>
        </div>
      </div>
      {(searchQuery || totalCount > 0) && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {searchQuery
              ? `${resultsCount} résultat${resultsCount > 1 ? "s" : ""} pour "${searchQuery}"`
              : `${totalCount} post${totalCount > 1 ? "s" : ""} • Triés par ${
                  sortBy === "recent" ? "date" : "popularité"
                }`}
          </span>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="text-xs px-2 py-1 h-auto"
            >
              Effacer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
