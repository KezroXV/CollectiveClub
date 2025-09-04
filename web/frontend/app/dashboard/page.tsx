"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CategoriesSection from "@/components/CategoriesSection";
import RolesMembersModal from "./components/RolesMembersModal";
import StatsCards from "./components/StatsCards";
import PostsModal from "./components/PostsModal";
import ClientsModal from "./components/ClientsModal";
import Link from "next/link";
import { FileText, Users, Home } from "lucide-react";
import CustomizationModal from "./components/CustomizationModal";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeWrapper from "@/components/ThemeWrapper";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

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

  // Handlers pour les modals
  const handleClientsClick = () => setShowClientsModal(true);
  const handlePostsClick = () => setShowPostsModal(true);
  const handleThemeClick = () => setShowThemeModal(true);
  // Roles rendered inline; no modal trigger needed

  // Rediriger si pas d'accès
  if (!loading && !hasAccess) {
    router.push("/");
    return null;
  }

  // Charger le thème utilisateur
  if (currentUser?.id && hasAccess) {
    loadUserTheme(currentUser.id);
  }

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
        {/* Header avec métriques dynamiques */}
        <div className="mb-8">
          <StatsCards shopId={shopId} />
        </div>

        {/* Contenu principal - 3 colonnes EXACT */}
        <div className="grid grid-cols-12 gap-6">
          {/* Colonne gauche - Gestion (3 colonnes) */}
          <div className="col-span-8 space-y-6">
            {/* Section Gérer */}
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Gérer
                </h3>
                <nav className="space-y-1">
                  <button
                    onClick={handleClientsClick}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left"
                  >
                    <Users className="h-4 w-4 mr-3 transition-colors duration-200" />
                    Clients
                  </button>
                  <button
                    onClick={handlePostsClick}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left"
                  >
                    <FileText className="h-4 w-4 mr-3 transition-colors duration-200" />
                    Posts
                  </button>
                  <button
                    onClick={handleThemeClick}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left"
                  >
                    🎨 Thème
                  </button>
                </nav>
              </CardContent>
            </Card>

            {/* Retour au forum */}
            <Link
              href="/community"
              className="flex items-center px-4 py-3 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Home className="h-4 w-4 mr-3" />
              Retour au forum
            </Link>
          </div>

          {/* Colonne droite - Bloc Gestion unifié (3 colonnes) */}
          <div className="col-span-4">
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-[18px] font-semibold text-gray-900 mb-6">
                  Gestion de la boutique
                </h3>

                <div className="space-y-6">
                  {/* Section Rôles inline */}
                  <div className="space-y-3">
                    <RolesMembersModal
                      variant="inline"
                      isOpen={true}
                      onClose={() => {}}
                      userId={currentUser?.id}
                      shopId={shopId}
                    />
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Section Catégories inline */}
                  <div className="space-y-3">
                    <CategoriesSection variant="inline" />
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Section Personnalisation */}
                  <div className="space-y-3">
                    <h4 className="text-[18px] font-medium text-gray-800">
                      Personnalisation
                    </h4>
                    <p className="text-[12px] text-gray-600">
                      Personnalisez l&apos;apparence et le thème de votre forum
                    </p>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:shadow-md"
                      onClick={handleThemeClick}
                    >
                      🎨 Personnaliser le thème
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modals de gestion */}
            <PostsModal
              isOpen={showPostsModal}
              onClose={() => setShowPostsModal(false)}
              userId={currentUser?.id}
              shopId={shopId}
              userRole={currentUser?.role}
            />

            <ClientsModal
              isOpen={showClientsModal}
              onClose={() => setShowClientsModal(false)}
              userId={currentUser?.id}
              shopId={shopId}
              userRole={currentUser?.role}
            />

            {/* Roles modal removed; rendered inline above */}

            <CustomizationModal
              isOpen={showCustomization || showThemeModal}
              onClose={() => {
                setShowCustomization(false);
                setShowThemeModal(false);
              }}
              userId={currentUser?.id}
            />
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
