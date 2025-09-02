/* eslint-disable @typescript-eslint/no-explicit-any */
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
  _count: {
    reactions: number;
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
  const [followersCount, setFollowersCount] = useState(0);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Charger les données de l'auteur
  useEffect(() => {
    if (!author.id || !currentUser?.shopId) return;

    const loadAuthorData = async () => {
      try {
        setIsLoadingBadges(true);
        setIsLoadingFollowers(true);

        // Charger les points, badges, followers et statut de suivi en parallèle
        const [
          pointsResponse,
          badgesResponse,
          followersResponse,
          followStatusResponse,
        ] = await Promise.all([
          fetch(
            `/api/users/points?userId=${author.id}&shopId=${currentUser.shopId}`
          ),
          fetch(`/api/badges?userId=${author.id}&shopId=${currentUser.shopId}`),
          fetch(
            `/api/users/${author.id}/followers/count?shopId=${currentUser.shopId}`
          ),
          fetch(
            `/api/users/${author.id}/followers/status?currentUserId=${currentUser.id}&shopId=${currentUser.shopId}`
          ),
        ]);

        let userPoints = 0;
        if (pointsResponse.ok) {
          const pointsData = await pointsResponse.json();
          userPoints = pointsData.points || 0;
          setAuthorPoints({
            points: userPoints,
            badges: [],
          });
        }

        if (badgesResponse.ok) {
          const allBadges = await badgesResponse.json();

          // Calculer quels badges sont débloqués en fonction des points
          const badgesWithStatus = allBadges.map((badge: any) => ({
            ...badge,
            unlocked: userPoints >= badge.requiredPoints,
          }));

          // Filtrer pour garder seulement les badges débloqués et trier par ordre croissant de points
          const unlockedBadges = badgesWithStatus
            .filter((badge: BadgeInfo) => badge.unlocked)
            .sort(
              (a: { requiredPoints: number }, b: { requiredPoints: number }) =>
                a.requiredPoints - b.requiredPoints
            );
          setAuthorBadges(unlockedBadges);

          // Mettre à jour authorPoints avec les badges
          setAuthorPoints((prev) =>
            prev
              ? {
                  ...prev,
                  badges: unlockedBadges,
                }
              : {
                  points: userPoints,
                  badges: unlockedBadges,
                }
          );
        }

        // Charger le nombre de followers
        if (followersResponse.ok) {
          const followersData = await followersResponse.json();
          setFollowersCount(followersData.followersCount || 0);
        }

        // Charger le statut de suivi
        if (followStatusResponse.ok) {
          const followStatusData = await followStatusResponse.json();
          setIsFollowing(followStatusData.isFollowing || false);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données auteur:", error);
      } finally {
        setIsLoadingBadges(false);
        setIsLoadingFollowers(false);
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
              <p className="text-[10px] text-gray-500">
                {isLoadingFollowers ? (
                  <span className="inline-block w-8 h-2 bg-gray-200 animate-pulse rounded"></span>
                ) : (
                  `${followersCount} abonnés`
                )}
              </p>
            </div>
          </div>

          {currentUser && currentUser.id !== author.id && (
            <div className="w-fit flex justify-end">
              <FollowButton
                targetUserId={author.id}
                currentUserId={currentUser.id}
                shopId={currentUser.shopId}
                isFollowing={isFollowing}
                followersCount={followersCount}
                size="default"
                onToggle={(newIsFollowing, newFollowersCount) => {
                  setIsFollowing(newIsFollowing);
                  setFollowersCount(newFollowersCount);
                }}
              />
            </div>
          )}
        </div>

        {/* Badges de l'auteur */}
        <div className="px-6 pb-6">
          <h4 className="font-bold text-[18px] text-gray-900 mb-4">Badges</h4>

          {isLoadingBadges && (
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"
                ></div>
              ))}
            </div>
          )}

          {!isLoadingBadges && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {authorBadges.length > 0 ? (
                authorBadges.map((badge) => (
                  <div key={badge.id} className="text-center">
                    <div
                      className="relative mx-auto mb-1.5 drop-shadow-sm"
                      style={{ width: 48, height: 48 }}
                    >
                      <Image
                        src={badge.imageUrl}
                        alt={badge.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <span className="absolute -top-1.5 -right-1.5 text-[8px] px-1 py-0.5 rounded bg-white shadow border border-gray-200">
                        {badge.requiredPoints}
                      </span>
                    </div>
                    <p className="font-medium text-[10px] text-gray-900">
                      {badge.name}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-4">
                  <p className="text-xs text-gray-500">Aucun badge débloqué</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Posts récents */}
        <div className="px-6 pb-6">
          <h4 className="font-bold text-[18px] text-gray-900 mb-4">
            Posts récents
          </h4>
          <div className="space-y-3">
            {authorRecentPosts.length > 0 ? (
              authorRecentPosts.slice(0, 2).map((authorPost) => (
                <Link key={authorPost.id} href={`/community/${authorPost.id}`}>
                  <Card className="p-0 my-2.5 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <h5 className="text-[13px] font-medium text-gray-900 mb-2 line-clamp-2">
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
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-500">Aucun post récent</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Commentaires récents */}
        <div className="px-6 pb-6">
          <h4 className="font-bold text-[18px] text-gray-900 mb-4">
            Commentaires récents
          </h4>
          <div className="space-y-3">
            {authorRecentComments.length > 0 ? (
              authorRecentComments.slice(0, 2).map((comment) => (
                <Link key={comment.id} href={`/community/${comment.post.id}`}>
                  <Card className="p-0 my-2.5 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {comment.content}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {comment._count.reactions}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {comment._count.reactions}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-500">
                    Aucun commentaire récent
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorSidebar;
