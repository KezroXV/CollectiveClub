"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function CreatePostPage() {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    console.log("Creating post:", { title, content });
    // TODO: API call to create post
    setTimeout(() => {
      setLoading(false);
      // TODO: Redirect to community page
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/community">
            <Button variant="ghost" size="sm">
              Forum
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Nouveau post</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Créer un nouveau post
          </h1>
          <p className="text-muted-foreground text-lg">
            Partagez votre message avec la communauté
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Nouveau post</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-medium">
                      Titre du post *
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Quel est le sujet de votre post ?"
                      className="text-lg"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Choisissez un titre clair et descriptif
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-base font-medium">
                      Contenu *
                    </Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Écrivez votre message..."
                      rows={12}
                      className="resize-none"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      {content.length}/5000 caractères
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={loading || !title.trim() || !content.trim()}
                      className="flex-1 gap-2"
                    >
                      {loading ? (
                        "Publication..."
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Publier le post
                        </>
                      )}
                    </Button>
                    <Link href="/community">
                      <Button type="button" variant="outline">
                        Annuler
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conseils</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">✍️ Titre efficace</h4>
                  <p className="text-muted-foreground">
                    Soyez précis et engageant
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">📝 Contenu utile</h4>
                  <p className="text-muted-foreground">
                    Structurez votre message
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">🤝 Restez respectueux</h4>
                  <p className="text-muted-foreground">
                    Favorisez les échanges constructifs
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prévisualisation</CardTitle>
              </CardHeader>
              <CardContent>
                {title || content ? (
                  <div className="space-y-2">
                    {title && (
                      <h3 className="font-semibold text-sm">{title}</h3>
                    )}
                    {content && (
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {content}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Votre prévisualisation apparaîtra ici
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
