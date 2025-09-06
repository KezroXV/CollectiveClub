/* eslint-disable @next/next/no-img-element */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  BarChart3,
} from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const { currentUser } = useCurrentUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [showPoll, setShowPoll] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; color: string }>
  >([]);
  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedCategory("");
    setImageUrl("");
    setShowPoll(false); // ✅ AJOUTER
    setPollQuestion(""); // ✅ AJOUTER
    setPollOptions(["", "", "", ""]); // ✅ AJOUTER
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !currentUser) return;

    // ✅ VALIDATION SONDAGE
    if (
      showPoll &&
      (!pollQuestion.trim() ||
        pollOptions.filter((opt) => opt.trim()).length < 2)
    ) {
      alert("Un sondage doit avoir une question et au moins 2 options");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ PRÉPARER LES DONNÉES DU SONDAGE
      let pollData = null;
      if (showPoll && pollQuestion.trim()) {
        const validOptions = pollOptions
          .filter((opt) => opt.trim())
          .map((text, index) => ({
            text: text.trim(),
            order: index,
          }));

        if (validOptions.length >= 2) {
          pollData = {
            question: pollQuestion.trim(),
            options: validOptions,
          };
        }
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: selectedCategory || undefined,
          imageUrl: imageUrl || undefined,
          poll: pollData, // ✅ ENVOYER LES DONNÉES DU SONDAGE
        }),
      });

      if (response.ok) {
        handleClose();
        onPostCreated();
      } else {
        console.error("Error creating post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

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

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Créer un post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Titre
            </Label>
            <Input
              id="title"
              placeholder="J'ai une idée de boutique mais je ne sais pas comment choisir, comment vous avez eu votre idée vous ?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="content"
              placeholder="Salut, je ne sais pas comment choisir entre quelques idées de..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] text-base resize-none"
            />
          </div>

          {/* Upload d'image */}
          <div className="space-y-3 mb-0">
            <Label className="text-sm font-medium">Ajouter une image</Label>

            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-full max-w-[230px] h-auto rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={`w-[230px] h-[60px] border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center ${
                  isDragOver
                    ? "border-primary bg-primary/10"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex items-center gap-2 text-gray-500">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-sm">
                    {isDragOver
                      ? "Déposez votre image ici"
                      : "Cliquez pour ajouter"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Catégories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Ajouter une catégorie</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.name ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.name ? "" : category.name
                  )
                }
                className="gap-2 rounded-full transition-all"
              >
                <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Ajouter un sondage</Label>
            <Button
              type="button"
              variant={showPoll ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPoll(!showPoll)}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {showPoll ? "Retirer" : "Sondage"}
            </Button>
          </div>

          {showPoll && (
            <Card className="p-4 space-y-4">
              {/* Question du sondage */}
              <div className="space-y-2">
                <Label htmlFor="poll-question" className="text-sm font-medium">
                  Question du sondage
                </Label>
                <Input
                  id="poll-question"
                  placeholder="Quelle est votre couleur préférée ?"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="h-10"
                />
              </div>

              {/* Options du sondage */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Options (4 maximum)
                </Label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-6">
                      {index + 1}.
                    </span>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...pollOptions];
                        newOptions[index] = e.target.value;
                        setPollOptions(newOptions);
                      }}
                      className="h-9"
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publication...
              </>
            ) : (
              "Publier"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
