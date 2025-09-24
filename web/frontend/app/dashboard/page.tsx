"use client";

import { useState, useEffect } from "react";
import ThemeWrapper from "@/components/ThemeWrapper";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DashboardHeader from "./components/DashboardHeader";
import ManagementSection from "./components/ManagementSection";
import ShopManagementSection from "./components/ShopManagementSection";
import ModalsManager from "./components/ModalsManager";

export default function DashboardPage() {
  const { currentUser, loading, isAdmin, isModerator } = useCurrentUser();
  const [showCustomization, setShowCustomization] = useState(false);
  const [showPostsModal, setShowPostsModal] = useState(false);
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [actualShopId, setActualShopId] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { loadUserTheme, colors } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Vérifier si l'utilisateur a accès au dashboard
  const hasAccess = isAdmin || isModerator;

  // Récupérer le shopId depuis URL ou cookies
  useEffect(() => {
    const shopFromUrl = searchParams.get("shop");
    if (shopFromUrl === "collective-club.myshopify.com") {
      // Utiliser le shopId connu pour collective-club
      setActualShopId("cmf57twjy0000u34sla2lhgl9");
    } else if (shopFromUrl) {
      // Pour d'autres shops, récupérer dynamiquement
      const fetchShopId = async () => {
        try {
          const response = await fetch(`/api/categories?shop=${shopFromUrl}`);
          if (response.ok) {
            const categories = await response.json();
            if (categories && categories.length > 0) {
              // Extraire le shopId depuis la première catégorie
              setActualShopId(categories[0].shopId);
            }
          }
        } catch (error) {
          console.error("Error fetching shop:", error);
        }
      };
      fetchShopId();
    } else {
      // Fallback vers currentUser.shopId
      if (currentUser?.shopId) {
        setActualShopId(currentUser.shopId);
      }
    }
  }, [searchParams, currentUser?.shopId]);

  const shopId = actualShopId || currentUser?.shopId || "";

  // DEBUG: Vérifier le currentUser et shopId
  console.log("🏪 DashboardPage DEBUG:", {
    currentUser,
    shopId,
    hasCurrentUser: !!currentUser,
    hasShopId: !!currentUser?.shopId,
  });

  const handleClientsClick = () => setShowClientsModal(true);
  const handlePostsClick = () => setShowPostsModal(true);
  const handleThemeClick = () => setShowThemeModal(true);
  const handleCloseCustomizationModal = () => {
    setShowCustomization(false);
    setShowThemeModal(false);
  };

  const handlePostDeleted = () => {
    // Incrémenter le trigger pour forcer le refresh de PopularPosts
    setRefreshTrigger((prev) => prev + 1);
  };

  // Rediriger si pas d'accès
  if (!loading && !hasAccess) {
    router.push("/");
    return null;
  }

  // Charger le thème utilisateur
  useEffect(() => {
    if (currentUser?.id && hasAccess) {
      loadUserTheme(currentUser.id);
    }
  }, [currentUser?.id, hasAccess, loadUserTheme]);

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <ThemeWrapper
        applyBackgroundColor={true}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </ThemeWrapper>
    );
  }

  // Afficher un message d'erreur si pas autorisé (ne devrait pas arriver à cause de la redirection)
  if (!hasAccess) {
    return (
      <ThemeWrapper
        applyBackgroundColor={true}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="text-gray-600 mb-4">
            Vous devez être administrateur ou modérateur pour accéder au
            dashboard.
          </p>
          <Link href="/community">
            <Button>Retour à la communauté</Button>
          </Link>
        </div>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper applyBackgroundColor={true} className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader shopId={shopId} borderColor={colors.Bordures} />

        <div className="grid grid-cols-12 gap-6">
          <ManagementSection
            onClientsClick={handleClientsClick}
            onPostsClick={handlePostsClick}
            onThemeClick={handleThemeClick}
            shopId={shopId}
            refreshTrigger={refreshTrigger}
            borderColor={colors.Bordures}
          />

          <ShopManagementSection
            userId={currentUser?.id}
            shopId={shopId}
            onThemeClick={handleThemeClick}
            borderColor={colors.Bordures}
          />
        </div>

        <ModalsManager
          showPostsModal={showPostsModal}
          showClientsModal={showClientsModal}
          showCustomization={showCustomization}
          showThemeModal={showThemeModal}
          userId={currentUser?.id}
          shopId={shopId}
          userRole={currentUser?.role}
          onClosePostsModal={() => setShowPostsModal(false)}
          onCloseClientsModal={() => setShowClientsModal(false)}
          onCloseCustomizationModal={handleCloseCustomizationModal}
          onPostDeleted={handlePostDeleted}
        />
      </div>
    </ThemeWrapper>
  );
}
