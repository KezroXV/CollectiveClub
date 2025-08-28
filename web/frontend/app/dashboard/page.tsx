/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RolesSection from "@/components/RolesSection";
import CategoriesSection from "@/components/CategoriesSection";
import Link from "next/link";
import { FileText, TrendingUp, Users, Home, HelpCircle } from "lucide-react";
import CustomizationModal from "./components/CustomizationModal";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeWrapper from "@/components/ThemeWrapper";

export default function DashboardPage() {
  const [showCustomization, setShowCustomization] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { loadUserTheme } = useTheme();

  const [stats, setStats] = useState({
    posts: 37,
    postsChange: -28,
    engagement: 130,
    engagementChange: 8,
    subscribers: 130,
    subscribersChange: 12,
  });

  // Charger l'utilisateur depuis localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        // Charger le thème de l'utilisateur
        if (user.id) {
          loadUserTheme(user.id);
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }
  }, [loadUserTheme]);

  return (
    <ThemeWrapper applyBackgroundColor={true} className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header avec métriques - LAYOUT EXACT MAQUETTE */}
        <div className="grid grid-cols-4 gap-6">
          {/* Posts - Grande carte à gauche */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-1">
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold text-blue-600">
                  {stats.posts}
                </span>
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                  ↓ {Math.abs(stats.postsChange)}%
                </span>
              </div>
              <p className="text-sm text-gray-500">Posts</p>
            </CardContent>
          </Card>

          {/* Engagement */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500">Engagement</p>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {stats.engagement}
                </span>
                <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">
                  ↑ {stats.engagementChange}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Abonnés */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500">Abonnés</p>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {stats.subscribers}
                </span>
                <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">
                  ↑ {stats.subscribersChange}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Espace vide pour équilibrer */}
          <div></div>
        </div>

        {/* Contenu principal - 3 colonnes EXACT */}
        <div className="grid grid-cols-12 gap-6">
          {/* Colonne gauche - Gestion (3 colonnes) */}
          <div className="col-span-3 space-y-6">
            {/* Section Gérer */}
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Gérer
                </h3>
                <nav className="space-y-1">
                  <Link
                    href="/dashboard/clients"
                    className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Clients
                  </Link>
                  <Link
                    href="/dashboard/posts"
                    className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    Posts
                  </Link>
                  <Link
                    href="/dashboard/customization"
                    className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    🎨 Thème
                  </Link>
                </nav>
              </CardContent>
            </Card>

            {/* Communautés phares */}
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Communautés phares
                </h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <p>Un espace pour les ecommerçants dans la cosmétique</p>
                  <p>
                    Débutants : Envoyez tous vos conseils ici sur comment gérer
                    sa boutique
                  </p>
                  <p>Quels sont vos objectifs ?</p>
                </div>
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

          {/* Colonne centrale - Vue d'ensemble (6 colonnes) */}
          <div className="col-span-6">
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Vue d&apos;ensemble
                </h2>
                <p className="text-gray-600 mb-8">
                  Tableau de bord principal pour gérer votre communauté.
                </p>

                {/* Statistiques détaillées */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Posts cette semaine
                    </h4>
                    <p className="text-4xl font-bold text-blue-600">12</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Commentaires
                    </h4>
                    <p className="text-4xl font-bold text-green-600">245</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - Rôles et Catégories (3 colonnes) */}
          <div className="col-span-3 space-y-6">
            {/* Section Rôles */}
            <RolesSection />

            {/* Section Catégories */}
            <CategoriesSection />

            {/* Section Personnalisation */}
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personnalisation du forum
                </h3>
                <Link href="/dashboard">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setShowCustomization(true)}
                  >
                    ✏️ Personnaliser
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <CustomizationModal
              isOpen={showCustomization}
              onClose={() => setShowCustomization(false)}
              userId={currentUser?.id}
            />
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
