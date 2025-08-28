"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  color: string;
  _count: {
    posts: number;
  };
}

const COLOR_OPTIONS = [
  { name: "Orange", value: "bg-orange-500" },
  { name: "Vert", value: "bg-green-500" },
  { name: "Rose", value: "bg-pink-500" },
  { name: "Bleu", value: "bg-blue-500" },
  { name: "Violet", value: "bg-purple-500" },
  { name: "Jaune", value: "bg-yellow-500" },
  { name: "Rouge", value: "bg-red-500" },
  { name: "Cyan", value: "bg-cyan-500" },
];

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoriesSectionProps {
  variant?: "card" | "inline";
}

export default function CategoriesSection({
  variant = "card",
}: CategoriesSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-blue-500");
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          color: selectedColor,
          order: categories.length,
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories((prev) => [
          ...prev,
          { ...newCategory, _count: { posts: 0 } },
        ]);
        setNewCategoryName("");
        setSelectedColor("bg-blue-500");
        setShowAddModal(false);
        toast.success("Catégorie créée avec succès");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const Header = (
    <div className="flex items-center justify-between gap-3">
      <h4 className="text-[18px] font-medium text-gray-800">Mes Catégories</h4>
      <div className="relative w-64 max-w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-9 text-[12px]"
        />
      </div>
    </div>
  );

  const Chips = (
    <div className="flex flex-wrap gap-2">
      {filteredCategories.map((category) => (
        <div
          key={category.id}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${category.color}`} />
          <span className="text-[12px] font-medium text-gray-900">
            {category.name}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-60 hover:opacity-100 transition-opacity">
                <span className="sr-only">Actions</span>⋯
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  /* future: edit */
                }}
              >
                Renommer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  /* future: color */
                }}
              >
                Changer la couleur
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  /* future: delete */
                }}
              >
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );

  const AddFloating = (
    <div className="flex justify-end">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => setShowAddModal(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );

  const InlineContent = (
    <div className="space-y-4">
      {Header}
      {Chips}
      {AddFloating}
    </div>
  );

  return (
    <>
      {variant === "inline" ? (
        InlineContent
      ) : (
        <Card className="border-gray-200">
          <CardHeader>{Header}</CardHeader>
          <CardContent className="space-y-4">
            {Chips}
            {AddFloating}
          </CardContent>
        </Card>
      )}

      {/* Modal d'ajout */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une catégorie</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Nom de la catégorie
              </label>
              <Input
                placeholder="Ex: Mode, Tech, Lifestyle..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Couleur
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-12 h-8 rounded-md ${color.value} relative ${
                      selectedColor === color.value
                        ? "ring-2 ring-gray-900 ring-offset-2"
                        : ""
                    }`}
                  >
                    {selectedColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || loading}
              >
                {loading ? "Création..." : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
