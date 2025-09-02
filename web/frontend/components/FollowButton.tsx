"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string;
  shopId: string;
  isFollowing: boolean;
  followersCount: number;
  onToggle?: (isFollowing: boolean, newFollowersCount: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export default function FollowButton({
  targetUserId,
  currentUserId,
  shopId,
  isFollowing: initialIsFollowing,
  followersCount: initialFollowersCount,
  onToggle,
  disabled = false,
  size = "sm",
  variant = "default",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isLoading, setIsLoading] = useState(false);

  // Ne pas afficher le bouton si c'est le même utilisateur
  if (currentUserId === targetUserId) {
    return null;
  }

  const handleToggleFollow = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const response = await fetch(
          `/api/users/${targetUserId}/follow?followerId=${currentUserId}&shopId=${shopId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erreur lors du désabonnement");
        }

        const data = await response.json();
        setIsFollowing(false);
        setFollowersCount(data.followersCount);
        onToggle?.(false, data.followersCount);
        toast.success("Vous ne suivez plus cet utilisateur");
      } else {
        // Follow
        const response = await fetch(`/api/users/${targetUserId}/follow`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            followerId: currentUserId,
            shopId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erreur lors de l'abonnement");
        }

        const data = await response.json();
        setIsFollowing(true);
        setFollowersCount(data.followersCount);
        onToggle?.(true, data.followersCount);
        toast.success("Vous suivez maintenant cet utilisateur");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      return isFollowing ? "Ne plus suivre..." : "Suivre...";
    }
    return isFollowing ? "Suivi" : "S'abonner";
  };

  const getButtonVariant = () => {
    if (isFollowing) {
      return variant === "default" ? "outline" : variant;
    }
    return variant;
  };

  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    return isFollowing ? (
      <UserMinus className="h-4 w-4" />
    ) : (
      <UserPlus className="h-4 w-4" />
    );
  };

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isLoading || disabled}
      size={"lg"}
      variant={getButtonVariant()}
      className={`gap-2 px-3 py-1 font-semibold cursor-pointer text-[12px] ${
        isFollowing
          ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          : ""
      }`}
    >
      {getButtonText()}
    </Button>
  );
}
