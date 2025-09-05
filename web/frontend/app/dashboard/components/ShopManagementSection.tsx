import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Plus, MoreHorizontal, Edit } from "lucide-react";
import { useState, useEffect } from "react";

interface ShopManagementSectionProps {
  userId?: string;
  shopId: string;
  onThemeClick: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isOwner?: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
  _count: {
    posts: number;
  };
}

export default function ShopManagementSection({
  userId,
  shopId,
  onThemeClick,
}: ShopManagementSectionProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fonction pour récupérer les utilisateurs (admins et modérateurs)
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch(`/api/members?userId=${userId}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      // Filtrer pour ne garder que les admins et modérateurs
      const filteredUsers = data.members.filter((user: any) => 
        user.role === 'ADMIN' || user.role === 'MODERATOR'
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fonction pour récupérer les catégories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch("/api/categories", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (shopId && userId) {
      fetchUsers();
      fetchCategories();
    }
  }, [shopId, userId]);

  // Fonctions helper
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplay = (role: string, isOwner?: boolean) => {
    if (isOwner) return "Proprio.";
    return role === 'ADMIN' ? 'admin' : 'Modérateur';
  };

  const getRoleColor = (role: string, isOwner?: boolean) => {
    if (isOwner) return "bg-red-100 text-red-800";
    return role === 'ADMIN' ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800";
  };

  return (
    <div className="col-span-4">
      <Card className="hover:shadow-sm border-chart-4">
        <CardContent className="p-6">
          {/* Section Rôles */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Rôles</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Rechercher..." 
                  className="pl-10 w-48 h-8 text-sm"
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {loadingUsers ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <div>
                        <div className="h-3 w-24 bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 w-32 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun administrateur ou modérateur trouvé</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-medium">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role, user.isOwner)}`}>
                      {getRoleDisplay(user.role, user.isOwner)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 mb-6">
            <Plus className="h-4 w-4" />
          </Button>

          <hr className="border-chart-4 border-[1px] mb-6" />

          {/* Section Catégories */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Mes Catégories</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Rechercher..." 
                  className="pl-10 w-48 h-8 text-sm"
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {loadingCategories ? (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-3 w-3 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </>
            ) : categories.length === 0 ? (
              <p className="text-sm text-gray-500 col-span-2">Aucune catégorie trouvée</p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 mb-6">
            <Plus className="h-4 w-4" />
          </Button>

          <hr className="border-chart-4 border-[1px] mb-6" />

          {/* Section Personnalisation */}
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Personnalisation du forum
          </h3>
          
          <Button
            variant="ghost"
            onClick={onThemeClick}
            className="w-full justify-start h-16 border border-dashed border-chart-4 text-gray-600 hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Personnaliser
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}