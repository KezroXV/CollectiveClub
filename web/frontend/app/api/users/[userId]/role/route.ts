import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { getShopId, ensureShopIsolation } from "@/lib/shopIsolation";

const prisma = new PrismaClient();

// PUT /api/users/[userId]/role - Changer le rôle d'un utilisateur (ADMIN ONLY, isolé par boutique)
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // 🏪 ISOLATION MULTI-TENANT
    const shopId = await getShopId(request);
    ensureShopIsolation(shopId);

    const { userId: targetUserId } = await params;
    const body = await request.json();
    const { adminUserId, role } = body;

    // Vérifier que l'utilisateur qui fait la demande est admin dans cette boutique
    await requireAdmin(adminUserId, shopId);

    // Vérifier que le rôle est valide
    if (!['ADMIN', 'MODERATOR', 'MEMBER'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be ADMIN, MODERATOR, or MEMBER" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur cible appartient à cette boutique
    const targetUser = await prisma.user.findFirst({
      where: {
        id: targetUserId,
        shopId // ✅ VÉRIFIER L'ISOLATION
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found in this shop" },
        { status: 404 }
      );
    }

    // Mettre à jour le rôle
    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        shopDomain: true,
        shopId: true,
      }
    });

    return NextResponse.json({
      message: `User role updated to ${role}`,
      user
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent modifier les rôles" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}