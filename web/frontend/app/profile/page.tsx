"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import ThemeWrapper from "@/components/ThemeWrapper";
import AuthorSidebar from "@/app/community/components/AuthorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save } from "lucide-react";

interface AuthorPost {
  id: string;
  title: string;
  slug?: string;
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
    slug?: string;
  };
  _count: {
    reactions: number;
  };
}

interface BadgeInfo {
  id: string;
  name: string;
  imageUrl: string;
  requiredPoints: number;
  unlocked: boolean;
}

export default function ProfilePage() {
  const { currentUser, loading } = useCurrentUser();
  const { update: updateSession } = useSession();
  const [authorRecentPosts, setAuthorRecentPosts] = useState<AuthorPost[]>([]);
  const [authorRecentComments, setAuthorRecentComments] = useState<
    AuthorComment[]
  >([]);
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [loadingProfileData, setLoadingProfileData] = useState(false);

  // États pour l'édition du profil
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fonctions utilitaires
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Charger les données du profil
  useEffect(() => {
    const loadProfileData = async () => {
      if (!currentUser) return;
      
      setLoadingProfileData(true);
      try {
        const response = await fetch('/api/profile/data');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('Profile data received:', result.data);
            setAuthorRecentPosts(result.data.authorRecentPosts || []);
            setAuthorRecentComments(result.data.authorRecentComments || []);
            setBadges(result.data.badges || []);
            setPoints(result.data.points || 0);
            console.log('Badges set:', result.data.badges);
            console.log('Points set:', result.data.points);
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoadingProfileData(false);
      }
    };

    loadProfileData();
  }, [currentUser]);

  // Initialiser le formulaire quand l'utilisateur est chargé
  if (currentUser && !editForm.name && !editForm.email) {
    setEditForm((prev) => ({
      ...prev,
      name: currentUser.name || "",
      email: currentUser.email || "",
    }));
  }

  // Gérer la sélection d'image
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sauvegarder les modifications du profil
  const handleSaveProfile = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      const updateData: any = {};

      if (editForm.name !== currentUser.name) {
        updateData.name = editForm.name;
      }

      if (editForm.email !== currentUser.email) {
        updateData.email = editForm.email;
      }

      // Gestion de l'upload d'image
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        // Upload image vers Cloudinary ou votre service
        const imageResponse = await fetch('/api/upload/profile-image', {
          method: 'POST',
          body: formData,
        });
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          updateData.image = imageData.url;
        }
      }

      // Gestion du mot de passe seulement pour les non-OAuth
      if (editForm.newPassword && !isOAuthUser()) {
        if (editForm.newPassword !== editForm.confirmPassword) {
          alert("Les mots de passe ne correspondent pas");
          return;
        }
        updateData.password = editForm.newPassword;
      }

      if (Object.keys(updateData).length > 0) {
        console.log('Profile update data:', updateData);
        
        const response = await fetch(`/api/profile/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Profile updated successfully:', result);
          
          // Mettre à jour la session NextAuth avec les nouvelles données
          if (result.user) {
            // Forcer NextAuth à recharger la session depuis la DB (maintenant avec name et image)
            await updateSession();
            
            // Mettre à jour le formulaire d'édition avec les nouvelles données
            setEditForm(prev => ({
              ...prev,
              name: result.user.name || "",
              email: result.user.email || ""
            }));
            
            // Réinitialiser les états d'upload d'image
            setSelectedImage(null);
            setImagePreview(null);
          }
        } else {
          const error = await response.json();
          console.error('Profile update error:', error);
          alert(`Erreur lors de la sauvegarde: ${error.error || 'Erreur inconnue'}`);
        }
      }

      setIsEditing(false);
      setEditForm((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // Vérifier si l'utilisateur utilise OAuth (pas de mot de passe)
  const isOAuthUser = () => {
    // Avec NextAuth Google, pas de mot de passe
    return true; // Pour l'instant tous les utilisateurs sont OAuth
  };

  if (loading) {
    return (
      <ThemeWrapper applyBackgroundColor={true} className="min-h-screen">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement du profil...</p>
            </div>
          </div>
        </div>
      </ThemeWrapper>
    );
  }

  if (!currentUser) {
    return (
      <ThemeWrapper applyBackgroundColor={true} className="min-h-screen">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Profil non trouvé
            </h1>
            <p className="text-gray-600">
              Vous devez être connecté pour voir votre profil.
            </p>
          </div>
        </div>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper applyBackgroundColor={true} className="min-h-screen">
      <Header />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne gauche - Formulaire d'édition */}
            <div className="lg:col-span-2 space-y-6">
              {/* En-tête */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
                  <p className="text-gray-600">
                    Vous pouvez gérer votre profil ici
                  </p>
                </div>
                <Button
                  onClick={() =>
                    isEditing ? handleSaveProfile() : setIsEditing(true)
                  }
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : isEditing ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  {isSaving
                    ? "Sauvegarde..."
                    : isEditing
                    ? "Enregistrer"
                    : "Modifier"}
                </Button>
              </div>

              {/* Formulaire d'édition du profil */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations du profil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Photo de profil */}
                  <div className="space-y-2">
                    <Label>Photo de profil</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => document.getElementById('profile-image-input')?.click()}>
                          <AvatarImage src={imagePreview || currentUser.image || undefined} />
                          <AvatarFallback className="bg-blue-500 text-white font-semibold text-xl">
                            {getInitials(currentUser.name || "")}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1.5 shadow-md">
                            <Camera className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {isEditing ? (
                          <>
                            <p>Cliquez sur l'image pour la modifier</p>
                            <p className="text-xs">Formats: JPG, PNG (max 5MB)</p>
                            {selectedImage && (
                              <p className="text-green-600 text-xs mt-1">
                                ✓ Nouvelle image sélectionnée
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p>Photo de profil actuelle</p>
                            <p className="text-xs">Modifiable en mode édition</p>
                          </>
                        )}
                      </div>
                    </div>
                    <input
                      id="profile-image-input"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Nom */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Votre nom complet"
                      />
                    ) : (
                      <div className="p-2 border rounded-md bg-gray-50">
                        {currentUser.name || "Non renseigné"}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <div>
                        <Input
                          id="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          type="email"
                          disabled // Email OAuth non modifiable
                          className="bg-gray-50"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Email géré par Google (non modifiable)
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 border rounded-md bg-gray-50">
                        {currentUser.email}
                      </div>
                    )}
                  </div>

                  {/* Section mot de passe - masquée pour OAuth */}
                  {!isOAuthUser() && (
                    <>
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Modification du mot de passe
                        </h3>

                        {isEditing && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">
                                Nouveau mot de passe
                              </Label>
                              <Input
                                id="newPassword"
                                type="password"
                                value={editForm.newPassword}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    newPassword: e.target.value,
                                  }))
                                }
                                placeholder="Laissez vide pour ne pas modifier"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">
                                Confirmez le nouveau mot de passe
                              </Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={editForm.confirmPassword}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    confirmPassword: e.target.value,
                                  }))
                                }
                                placeholder="Confirmez votre nouveau mot de passe"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Boutons d'action */}
                  {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        {isSaving && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        {isSaving ? "Sauvegarde..." : "Enregistrer"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            name: currentUser.name || "",
                            email: currentUser.email || "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        disabled={isSaving}
                      >
                        Annuler
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Colonne droite - Sidebar avec infos utilisateur */}
            <div className="lg:col-span-1">
              <AuthorSidebar
                author={{
                  id: currentUser.id,
                  name: currentUser.name || "",
                  email: currentUser.email || "",
                  image: currentUser.image || undefined,
                  createdAt: currentUser.createdAt || new Date().toISOString(),
                }}
                authorRecentPosts={authorRecentPosts}
                authorRecentComments={authorRecentComments}
                currentUser={null} // Pas de bouton follow sur son propre profil
                getInitials={getInitials}
                formatDate={formatDate}
                badges={badges}
                points={points}
              />
            </div>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
