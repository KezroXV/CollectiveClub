"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Filter,
  Search,
  Plus,
  ChevronDown,
  Share2,
  Wrench,
  Clock,
  Calendar,
  Heart,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Nouveau",
    icon: Clock,
  },
  {
    value: "oldest",
    label: "Plus ancien",
    icon: Calendar,
  },
  {
    value: "popular",
    label: "Plus likés",
    icon: Heart,
  },
];

interface Category {
  id: string;
  name: string;
  color: string;
  _count: {
    posts: number;
  };
}

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearch: (query: string) => void;
  onCreatePost: () => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  onSearch,
  onCreatePost,
  sortBy = "newest",
  onSortChange,
}: CategoryFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const MAX_VISIBLE = 6; // Réduire pour laisser place à "Tout"

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Ajouter "Tout" en premier
  const allCategories = [
    {
      id: "all",
      name: "Tout",
      color: "bg-gray-400",
      _count: { posts: 0 },
    },
    ...categories,
  ];

  const visibleCategories = allCategories.slice(0, MAX_VISIBLE + 1);
  const overflowCategories = allCategories.slice(MAX_VISIBLE + 1);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortBy)?.label || "Nouveau";

  if (loading) {
    return (
      <div className="bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-6 py-6">
            <div className="h-12 w-32 bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="h-14 flex-1 max-w-2xl bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="h-12 w-40 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-6">
        {/* Top Row: Filter + Search + Create Button */}
        <div className="flex items-center gap-6 py-6">
          {/* Bouton Filtrer avec dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-3 text-base px-6 py-3 h-auto rounded-2xl border-gray-300 bg-white hover:bg-gray-50 transition-all font-medium"
              >
                <Filter className="h-4 w-4" />
                Filtrer
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Trier par
              </DropdownMenuLabel>
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() =>
                    option.value !== undefined && onSortChange?.(option.value)
                  }
                  className="flex items-center gap-3 py-2"
                >
                  {option.icon && (
                    <option.icon className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="flex-1">{option.label}</span>
                  {sortBy === option.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}

              {overflowCategories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Plus de catégories
                  </DropdownMenuLabel>
                  {overflowCategories.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => onCategoryChange(category.id)}
                      className="flex items-center gap-3 py-2"
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${category.color}`}
                      ></span>
                      <span className="flex-1">{category.name}</span>
                      <span className="text-xs text-gray-400">
                        {category._count.posts}
                      </span>
                      {selectedCategory === category.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Rechercher par nom ou par post..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-14 h-14 border border-gray-300 focus:border-primary focus:ring-primary rounded-2xl text-base bg-white"
            />
          </div>

          <Button
            onClick={onCreatePost}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-3 px-8 py-4 h-auto rounded-2xl shadow-sm font-medium text-base"
          >
            Créer un post
            <div className="bg-white rounded-full p-1">
              <Plus className="h-4 w-4 text-black" />
            </div>
          </Button>
        </div>

        {/* Categories Row */}
        <div className="flex items-center gap-3 pb-4 flex-nowrap">
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl whitespace-nowrap transition-all text-sm font-medium border ${
                selectedCategory === category.id
                  ? "bg-white text-gray-900 border-gray-300 ring-2 ring-blue-300"
                  : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
              <span>{category.name}</span>
              {category._count.posts > 0 && category.id !== "all" && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {category._count.posts}
                </span>
              )}
            </button>
          ))}

          {/* Status indicator pour le tri actuel */}
          <div className="flex items-center gap-2 ml-auto text-sm text-gray-500">
            <span>Trié par:</span>
            <span className="font-medium text-gray-700">
              {currentSortLabel}
            </span>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 rounded-full bg-white border border-gray-300 hover:bg-gray-50"
            >
              <Wrench className="h-4 w-4 text-gray-500" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 rounded-full bg-white border border-gray-300 hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
