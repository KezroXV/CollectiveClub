"use client"

import { useCurrentUser } from "@/lib/hooks/useCurrentUser"
import { signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthDebugPage() {
  const { currentUser, loading, isAuthenticated, isAdmin, isModerator } = useCurrentUser()

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>🔍 Debug d'authentification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Status:</strong> {isAuthenticated ? "✅ Connecté" : "❌ Non connecté"}
          </div>
          
          {currentUser ? (
            <div className="space-y-2">
              <div><strong>ID:</strong> {currentUser.id}</div>
              <div><strong>Email:</strong> {currentUser.email}</div>
              <div><strong>Name:</strong> {currentUser.name}</div>
              <div><strong>Role:</strong> {currentUser.role}</div>
              <div><strong>isShopOwner:</strong> {currentUser.isShopOwner ? "✅ Oui" : "❌ Non"}</div>
              <div><strong>shopId:</strong> {currentUser.shopId || "❌ Manquant"}</div>
              <div><strong>isAdmin:</strong> {isAdmin ? "✅ Oui" : "❌ Non"}</div>
              <div><strong>isModerator:</strong> {isModerator ? "✅ Oui" : "❌ Non"}</div>
            </div>
          ) : (
            <div>Aucune donnée utilisateur</div>
          )}

          <div className="flex gap-4 pt-4">
            {isAuthenticated ? (
              <Button onClick={() => signOut()}>Se déconnecter</Button>
            ) : (
              <Button onClick={() => signIn("google")}>Se connecter avec Google</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}