import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { getShopId, ensureShopIsolation } from "@/lib/shopIsolation";

const prisma = new PrismaClient();

// PUT - Modifier un badge (ADMIN ONLY, isolé par boutique)
export async function PUT(
  request: NextRequest,
  { params }: { params: { badgeId: string } }
) {
  try {
    // 🏪 ISOLATION MULTI-TENANT
    const shopId = await getShopId(request);
    ensureShopIsolation(shopId);

    const body = await request.json();
    const { badgeId } = params;
    
    // Vérifier les droits admin dans cette boutique
    await requireAdmin(body.userId, shopId);
    
    const { name, imageUrl, requiredCount, order } = body;

    if (!name || !imageUrl || requiredCount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Vérifier que le badge appartient à cette boutique
    const existingBadge = await prisma.badge.findFirst({
      where: { 
        id: badgeId,
        shopId // ✅ VÉRIFIER L'ISOLATION
      }
    });

    if (!existingBadge) {
      return NextResponse.json(
        { error: "Badge not found in this shop" },
        { status: 404 }
      );
    }

    const badge = await prisma.badge.update({
      where: { id: badgeId },
      data: {
        name,
        imageUrl,
        requiredCount,
        order: order || 0,
      },
    });

    return NextResponse.json(badge);
  } catch (error) {
    console.error("Error updating badge:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent modifier des badges" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update badge" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un badge (ADMIN ONLY, isolé par boutique)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { badgeId: string } }
) {
  try {
    // 🏪 ISOLATION MULTI-TENANT
    const shopId = await getShopId(request);
    ensureShopIsolation(shopId);

    const { badgeId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }
    
    // Vérifier les droits admin dans cette boutique
    await requireAdmin(userId, shopId);
    
    // Vérifier que le badge appartient à cette boutique et n'est pas par défaut
    const badge = await prisma.badge.findFirst({
      where: { 
        id: badgeId,
        shopId // ✅ VÉRIFIER L'ISOLATION
      }
    });

    if (!badge) {
      return NextResponse.json(
        { error: "Badge not found in this shop" },
        { status: 404 }
      );
    }

    if (badge.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default badges" },
        { status: 400 }
      );
    }

    await prisma.badge.delete({
      where: { id: badgeId },
    });

    return NextResponse.json({ message: "Badge deleted successfully" });
  } catch (error) {
    console.error("Error deleting badge:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent supprimer des badges" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete badge" },
      { status: 500 }
    );
  }
}