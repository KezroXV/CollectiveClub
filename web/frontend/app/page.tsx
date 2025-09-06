/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import HeroBanner from "@/components/HeroBanner";
import CategoryFilter from "@/components/CategoryFilter";
import CreatePostModal from "@/components/CreatePostModal";
import PostsList from "@/components/PostsList";
import ThemeWrapper from "@/components/ThemeWrapper";
import { useShopPersistence } from "@/lib/useShopPersistence";
// ReactionPicker retiré pour n'afficher que coeur + commentaires

interface Post {
  id: string;
  slug?: string;
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

export default function HomePage() {
  const { currentUser } = useCurrentUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [pinnedCount, setPinnedCount] = useState(0);

  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState("newest");
  
  // 🏪 Initialiser la persistance du shop
  const { currentShop } = useShopPersistence();

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (showPinnedOnly) {
        params.append('pinnedOnly', 'true');
      }
      if (currentUser?.id) {
        params.append('userId', currentUser.id);
      }
      
      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();
      const postsArray = data.posts || data; // Support nouvelle et ancienne structure
      const pinnedPostsCount = data.pinnedCount || 0;
      setPosts(postsArray);
      setFilteredPosts(postsArray);
      setPinnedCount(pinnedPostsCount);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [showPinnedOnly, currentUser?.id]);


  // Filter posts
  // Modifier le filtering par catégorie :
  useEffect(() => {
    // Toujours cloner pour éviter les mutations in-place qui bloquent le re-render
    let filtered = [...posts];

    // Filter by category - CORRIGÉ
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (post) => post.category?.id === selectedCategory
      );
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort posts (sur une copie)
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "popular":
          const aReactions = a._count?.reactions || 0;
          const bReactions = b._count?.reactions || 0;
          return bReactions - aReactions;
        default:
          return 0;
      }
    });

    // Toujours setter une nouvelle référence
    setFilteredPosts(sorted);
  }, [posts, selectedCategory, searchQuery, sortBy]);

  return (
    <ThemeWrapper applyBackgroundColor={true} className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Banner */}
      <HeroBanner />
      {/* Section unifiée: Filtres + Posts */}
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto rounded-[16px] sm:rounded-[22px] border border-primary/20 bg-white hover:shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onSearch={setSearchQuery}
                onCreatePost={() => setShowCreateModal(true)}
                sortBy={sortBy}
                onSortChange={setSortBy}
                showPinnedOnly={showPinnedOnly}
                onPinnedFilterChange={setShowPinnedOnly}
                pinnedCount={pinnedCount}
              />
              {/* Séparateur entre filtres et posts */}
              <div className="w-full h-px bg-gray-200 "></div>

              {/* Posts Content */}
              <PostsList
                posts={filteredPosts}
                currentUser={currentUser ?? undefined}
                onVote={fetchPosts}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        </div>
      </div>
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={fetchPosts}
      />
    </ThemeWrapper>
  );
}
