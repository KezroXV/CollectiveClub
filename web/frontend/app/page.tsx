/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, Share2, Heart } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryFilter from "@/components/CategoryFilter";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import CreatePostModal from "@/components/CreatePostModal";
import { toast } from "sonner";
import PollDisplay from "@/components/PollDisplay";
import ThemeWrapper from "@/components/ThemeWrapper";
import { useShopPersistence } from "@/lib/useShopPersistence";
// ReactionPicker retiré pour n'afficher que coeur + commentaires

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState("newest");
  
  // 🏪 Initialiser la persistance du shop
  const { currentShop } = useShopPersistence();
  // Auth user detection
  useEffect(() => {
    const shop = searchParams.get("shop");
    const hmac = searchParams.get("hmac");

    if (shop && hmac) {
      console.log("🔥 Shopify auth detected for shop:", shop);
      createOrUpdateUser(shop);
    } else {
      // Load from localStorage
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }
    }
  }, [searchParams]);

  // Create/update user
  const createOrUpdateUser = async (shop: string) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `admin@${shop}`,
          name: `Admin de ${shop}`,
          shopDomain: shop,
        }),
      });

      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));
        console.log("✅ User created/updated:", user.id);
      }
    } catch (error) {
      console.error("❌ Error creating user:", error);
    }
  };

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      const data = await response.json();
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
      <Header currentUser={currentUser ?? undefined} />

      {/* Hero Banner */}
      <HeroBanner />
      {/* Section unifiée: Filtres + Posts */}
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto rounded-[22px] border border-primary/20 bg-white shadow-sm overflow-hidden">
            <div className="p-6">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onSearch={setSearchQuery}
                onCreatePost={() => setShowCreateModal(true)}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
              {/* Séparateur entre filtres et posts */}
              <div className="w-full h-px bg-gray-200 "></div>

              {/* Posts Content */}
              <div className="space-y-0">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-24">
                    <div className="text-gray-400 mb-8">
                      <MessageSquare className="h-24 w-24 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {searchQuery || selectedCategory !== "all"
                        ? "Aucun post trouvé"
                        : "Aucun post pour l'instant"}
                    </h3>
                    <p className="text-gray-600 mb-10 text-lg leading-relaxed max-w-md mx-auto">
                      {searchQuery || selectedCategory !== "all"
                        ? "Essayez de modifier vos filtres de recherche"
                        : "Soyez le premier à partager quelque chose !"}
                    </p>
                    {currentUser && (
                      <Link href="/community">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg rounded-lg shadow-sm">
                          Créer le premier post
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  filteredPosts.map((post, index) => (
                    <div
                      key={post.id}
                      className={`pb-8 ${
                        index !== filteredPosts.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      {/* Post Title and Content */}
                      <div className="mb-6 pt-7 pl-16">
                        <h2 className="text-[17px] md:text-[18px] font-semibold text-gray-900 mb-2 leading-tight line-clamp-1">
                          {post.title}
                        </h2>
                        <p className="text-gray-700 text-[14px] leading-6 line-clamp-2">
                          {post.content}
                        </p>
                      </div>

                      {/* Post Image */}
                      {post.imageUrl && (
                        <div className="mb-8 pl-16">
                          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            <Image
                              src={post.imageUrl}
                              alt={post.title}
                              width={1600}
                              height={900}
                              className="w-full h-auto max-h-96 object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Poll */}
                      {post.poll && (
                        <div className="mb-8 pl-16">
                          <PollDisplay
                            poll={post.poll}
                            currentUser={currentUser ?? undefined}
                            onVote={() => fetchPosts()}
                          />
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center gap-6 pl-16">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-gray-200 hover:bg-gray-100 text-gray-600"
                        >
                          <Heart className="h-4 w-4" />
                          <Badge className="rounded-full bg-white text-gray-600 border border-gray-200 px-2 py-0 text-xs font-medium">
                            {post._count.reactions}
                          </Badge>
                        </Button>

                        <Link
                          href={`/community?postId=${post.id}`}
                          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors group"
                        >
                          <Button
                            variant="outline"
                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-gray-200 group-hover:bg-primary/10 group-hover:border-primary/30 text-gray-600"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <Badge className="rounded-full bg-white text-gray-600 border border-gray-200 px-2 py-0 text-xs font-medium">
                              {post._count.comments}
                            </Badge>
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          className="ml-auto flex items-center gap-2 bg-white px-4 py-2 rounded-full border-gray-200 hover:bg-gray-100 text-gray-600"
                          onClick={() => {
                            const url = `${window.location.origin}/community/${post.id}`;
                            navigator.clipboard.writeText(url);
                            toast.success(
                              "Lien copié dans le presse-papiers !"
                            );
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                          Partager
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentUser={currentUser}
        onPostCreated={fetchPosts}
      />
    </ThemeWrapper>
  );
}
