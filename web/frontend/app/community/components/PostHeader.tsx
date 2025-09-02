/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface PostHeaderProps {
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  createdAt: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  title: string;
  getInitials: (name: string) => string;
  formatDate: (dateString: string) => string;
  getRoleColor: (role: string) => string;
  getRoleLabel: (role: string) => string;
  currentUser?: {
    shopId: string;
  };
}

const PostHeader = ({
  author,
  createdAt,
  category,
  title,
  getInitials,
  formatDate,
  getRoleColor,
  getRoleLabel,
  currentUser,
}: PostHeaderProps) => {
  const [highestBadge, setHighestBadge] = useState<any>(null);
  const [isLoadingBadge, setIsLoadingBadge] = useState(true);

  // Charger le badge le plus élevé de l'auteur
  useEffect(() => {
    if (!author.id || !currentUser?.shopId) return;

    const loadHighestBadge = async () => {
      try {
        setIsLoadingBadge(true);

        // Charger les points et badges de l'utilisateur
        const [pointsResponse, badgesResponse] = await Promise.all([
          fetch(
            `/api/users/points?userId=${author.id}&shopId=${currentUser.shopId}`
          ),
          fetch(`/api/badges?userId=${author.id}&shopId=${currentUser.shopId}`),
        ]);

        let userPoints = 0;
        if (pointsResponse.ok) {
          const pointsData = await pointsResponse.json();
          userPoints = pointsData.points || 0;
        }

        if (badgesResponse.ok) {
          const allBadges = await badgesResponse.json();

          // Filtrer les badges débloqués et prendre le plus élevé
          const unlockedBadges = allBadges
            .filter((badge: any) => userPoints >= badge.requiredPoints)
            .sort((a: any, b: any) => b.requiredPoints - a.requiredPoints);

          if (unlockedBadges.length > 0) {
            setHighestBadge(unlockedBadges[0]);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du badge:", error);
      } finally {
        setIsLoadingBadge(false);
      }
    };

    loadHighestBadge();
  }, [author.id, currentUser?.shopId]);
  return (
    <>
      {/* Post Header */}
      <div className="flex items-start justify-between ">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatar} />
            <AvatarFallback className="bg-blue-500 text-white font-semibold text-sm">
              {getInitials(author.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            {/* Nom et date sur la même ligne */}
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900 text-sm">
                {author.name}
              </p>
              <span className="text-xs text-gray-500">
                · posté le {formatDate(createdAt)}
              </span>
            </div>

            {/* Badge le plus élevé en dessous */}
            <div className="flex items-center">
              {isLoadingBadge ? (
                <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
              ) : highestBadge ? (
                <Image
                  src={highestBadge.imageUrl}
                  alt={highestBadge.name}
                  width={15}
                  height={15}
                  className="rounded-full"
                  title={highestBadge.name}
                />
              ) : null}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Post Title */}
      <h1 className="text-[13px] font-semibold text-gray-900 mb-4">{title}</h1>

      {/* Categories badges - Style CategoriesSection */}
      <div className="flex gap-2">
        {category && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200">
            <span className={`w-2.5 h-2.5 rounded-full ${category.color}`} />
            <span className="text-[12px] font-medium text-gray-900">
              {category.name}
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default PostHeader;
