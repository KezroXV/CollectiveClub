import Link from "next/link";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import FollowButton from "@/components/FollowButton";
import { Coins, Heart, MessageSquare, Star } from "lucide-react";
import Image from "next/image";

interface BadgeInfo {
  id: string;
  name: string;
  imageUrl: string;
  requiredPoints: number;
  unlocked: boolean;
  unlockedAt?: string;
}

interface UserPointsInfo {
  points: number;
  badges: BadgeInfo[];
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

interface AuthorSidebarProps {
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
  };
  authorRecentPosts: AuthorPost[];
  authorRecentComments: AuthorComment[];
  currentUser: {
    id: string;
    name: string;
    shopId: string;
  } | null;
  getInitials: (name: string) => string;
  formatDate: (dateString: string) => string;
}

const AuthorSidebar = ({
  author,
  authorRecentPosts,
  authorRecentComments,
  currentUser,
  getInitials,
  formatDate,
}: AuthorSidebarProps) => {
  const [authorPoints, setAuthorPoints] = useState<UserPointsInfo | null>(null);
  const [authorBadges, setAuthorBadges] = useState<BadgeInfo[]>([]);
  const [isLoadingBadges, setIsLoadingBadges] = useState(true);
  const [followersCount] = useState(0);

  // Charger les données de l'auteur
  useEffect(() => {
    if (!author.id || !currentUser?.shopId) return;

    const loadAuthorData = async () => {
      try {
        setIsLoadingBadges(true);
        
        // Charger les points et badges en parallèle
        const [pointsResponse, badgesResponse] = await Promise.all([
          fetch(`/api/users/points?userId=${author.id}&shopId=${currentUser.shopId}`),
          fetch(`/api/badges/points?userId=${author.id}&shopId=${currentUser.shopId}`)
        ]);

        if (pointsResponse.ok) {
          const pointsData = await pointsResponse.json();
          setAuthorPoints({
            points: pointsData.points || 0,
            badges: []
          });
        }

        if (badgesResponse.ok) {
          const badgesData = await badgesResponse.json();
          const unlockedBadges = badgesData.badges?.filter((badge: BadgeInfo) => badge.unlocked) || [];
          setAuthorBadges(unlockedBadges);
          
          // Mettre à jour authorPoints avec les badges
          setAuthorPoints(prev => prev ? {
            ...prev,
            badges: unlockedBadges
          } : {
            points: 0,
            badges: unlockedBadges
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données auteur:', error);
      } finally {
        setIsLoadingBadges(false);
      }
    };

    loadAuthorData();
  }, [author.id, currentUser?.shopId]);
  return (
    <Card className="overflow-hidden bg-white max-w-[400px]">
      <CardContent className="p-0">
        {/* Profil de l'auteur */}
        <div className="p-6 flex   gap-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={author.avatar} />
              <AvatarFallback className="bg-blue-500 text-white font-semibold text-lg">
                {getInitials(author.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{author.name}</h3>
              <p className="text-[10px] text-gray-500">
                Membre depuis le {formatDate(author.createdAt)}
              </p>
              <p className="text-[10px] text-gray-500">{followersCount} abonnés</p>
            </div>
          </div>

          {currentUser && currentUser.id !== author.id && (
            <div className="w-fit flex justify-end">
              <FollowButton
                targetUserId={author.id}
                currentUserId={currentUser.id}
                shopId={currentUser.shopId}
                isFollowing={false}
                followersCount={0}
                size="default"
              />
            </div>
          )}
        </div>

        {/* Badges de l'auteur */}
        <div className="px-6 pb-6">
          <h4 className="font-bold text-[18px] text-gray-900 mb-4">Badges</h4>

          {/* Points de l'utilisateur */}
          {authorPoints && (
            <div className="flex items-center gap-2 mb-4">
              <Coins className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">
                {authorPoints.points} points
              </span>
            </div>
          )}

          {isLoadingBadges && (
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
              ))}
            </div>
          )}

          {!isLoadingBadges && (
            <div className="flex gap-2 flex-wrap mb-2">
              {authorBadges.length > 0 ? (
                authorBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="relative group cursor-help"
                    title={`${badge.name} - Débloqué le ${badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString('fr-FR') : 'N/A'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 flex items-center justify-center overflow-hidden">
                      {badge.imageUrl ? (
                        <Image
                          src={badge.imageUrl}
                          alt={badge.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      ) : (
                        <Star className="h-6 w-6 text-yellow-600" />
                      )}
                    </div>
                    
                    {/* Tooltip au hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      {badge.name}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 w-full">
                  <p className="text-xs text-gray-500">Aucun badge débloqué</p>
                </div>
              )}
            </div>
          )}

          {!isLoadingBadges && (
            <div className="flex gap-2 text-xs text-gray-600 flex-wrap">
              {authorBadges.length > 0 ? (
                authorBadges.map((badge) => (
                  <span key={badge.id} className="bg-gray-100 px-2 py-1 rounded-full">
                    {badge.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 italic">Aucun badge à afficher</span>
              )}
            </div>
          )}
        </div>

        {/* Posts récents */}
        <div className="px-6 pb-6">
          <h4 className="font-bold text-[18px] text-gray-900 mb-4">
            Posts récents
          </h4>
          <div className="space-y-4">
            {authorRecentPosts.length > 0 ? (
              authorRecentPosts.slice(0, 2).map((authorPost) => (
                <Link key={authorPost.id} href={`/community/${authorPost.id}`}>
                  <div className="hover:bg-gray-50 -mx-2 px-2 py-3 rounded transition-colors">
                    <h5 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                      {authorPost.title}
                    </h5>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {authorPost._count.reactions}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {authorPost._count.comments}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Aucun post récent</p>
              </div>
            )}
          </div>
        </div>

        {/* Commentaires récents */}
        <div className="px-6 pb-6">
          <h4 className="font-bold text-[18px] text-gray-900 mb-4">
            Commentaires récents
          </h4>
          <div className="space-y-4">
            {authorRecentComments.length > 0 ? (
              authorRecentComments.slice(0, 2).map((comment) => (
                <Link key={comment.id} href={`/community/${comment.post.id}`}>
                  <div className="hover:bg-gray-50 -mx-2 px-2 py-3 rounded transition-colors">
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        24
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        10
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  Aucun commentaire récent
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorSidebar;
