import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getShopId, ensureShopIsolation } from "@/lib/shopIsolation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// PUT /api/profile/update - Mettre à jour le profil utilisateur
export async function PUT(request: NextRequest) {
  try {
    console.log('UPDATE PROFILE API: Starting request');
    
    // 🏪 ISOLATION MULTI-TENANT
    const shopId = await getShopId(request);
    ensureShopIsolation(shopId);
    console.log('UPDATE PROFILE API: ShopId obtained', { shopId });

    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, image, password } = body;
    
    console.log('UPDATE PROFILE API: Request data', { name, email, hasImage: !!image, hasPassword: !!password });

    // Trouver l'utilisateur actuel
    const currentUser = await prisma.user.findFirst({
      where: { 
        email: session.user.email,
        shopId 
      }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Mise à jour du nom
    if (name && name !== currentUser.name) {
      updateData.name = name;
    }

    // Mise à jour de l'image
    if (image && image !== currentUser.image) {
      updateData.image = image;
    }

    // Mise à jour du mot de passe (pour les utilisateurs non-OAuth uniquement)
    if (password) {
      // Vérifier que ce n'est pas un utilisateur OAuth
      const accounts = await prisma.account.findMany({
        where: { userId: currentUser.id }
      });
      
      if (accounts.length > 0) {
        return NextResponse.json(
          { error: "Cannot change password for OAuth users" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    console.log('UPDATE PROFILE API: Update data prepared', { updateData: Object.keys(updateData) });

    // Effectuer la mise à jour
    if (Object.keys(updateData).length > 0) {
      const updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true
        }
      });

      console.log('UPDATE PROFILE API: User updated successfully');

      return NextResponse.json({ 
        success: true, 
        message: "Profil mis à jour avec succès",
        user: updatedUser
      });
    } else {
      console.log('UPDATE PROFILE API: No changes detected');
      return NextResponse.json({ 
        success: true, 
        message: "Aucune modification détectée"
      });
    }

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}