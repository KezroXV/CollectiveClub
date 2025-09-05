"use client";

import { useState, useEffect } from "react";
import ThemeWrapper from "@/components/ThemeWrapper";
import { useRouter } from "next/navigation";
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
  const { loadUserTheme } = useTheme();
  const router = useRouter();
  
  // Vérifier si l'utilisateur a accès au dashboard
  const hasAccess = isAdmin || isModerator;
  const shopId = currentUser?.shopId || '';

  const handleClientsClick = () => setShowClientsModal(true);
  const handlePostsClick = () => setShowPostsModal(true);
  const handleThemeClick = () => setShowThemeModal(true);
  const handleCloseCustomizationModal = () => {
    setShowCustomization(false);
    setShowThemeModal(false);
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
        <DashboardHeader shopId={shopId} />

        <div className="grid grid-cols-12 gap-6">
          <ManagementSection
            onClientsClick={handleClientsClick}
            onPostsClick={handlePostsClick}
            onThemeClick={handleThemeClick}
            shopId={shopId}
          />

          <ShopManagementSection
            userId={currentUser?.id}
            shopId={shopId}
            onThemeClick={handleThemeClick}
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
        />
      </div>
    </ThemeWrapper>
  );
}
