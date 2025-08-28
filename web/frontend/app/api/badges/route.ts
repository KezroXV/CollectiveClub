/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin, resolveActingAdmin } from "@/lib/auth";
import { getShopId, ensureShopIsolation } from "@/lib/shopIsolation";

const prisma = new PrismaClient();

// GET - Récupérer les badges d'une boutique, avec fallback utilisateur
export async function GET(request: NextRequest) {
  try {
    // 🏪 ISOLATION MULTI-TENANT
    const shopId = await getShopId(request);
    ensureShopIsolation(shopId);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const forumId = searchParams.get("forumId"); // Support futur pour l'isolation par forum

    // 1) Si userId fourni, valider qu'il appartient à cette boutique et récupérer ses badges
    if (userId) {
      // Vérifier que l'utilisateur existe dans cette boutique
      const user = await prisma.user.findFirst({
        where: { id: userId, shopId },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found in this shop" },
          { status: 404 }
        );
      }

      // Récupérer les badges spécifiques à cet utilisateur
      const userBadgeWhere: any = {
        userId,
        shopId, // ✅ double isolation: utilisateur + boutique
      };

      // TODO: Ajouter l'isolation par forum une fois le modèle Forum créé
      // if (forumId) {
      //   userBadgeWhere.forumId = forumId;
      // }

      const userBadges = await prisma.badge.findMany({
        where: userBadgeWhere,
        orderBy: { order: "asc" },
      });

      if (userBadges.length > 0) {
        return NextResponse.json(userBadges);
      }
    }

    // 2) Fallback: retourner tous les badges de la boutique (paliers globaux)
    const shopBadgeWhere: any = { shopId };

    // TODO: Ajouter l'isolation par forum une fois le modèle Forum créé
    // if (forumId) {
    //   shopBadgeWhere.forumId = forumId;
    // }

    const shopBadges = await prisma.badge.findMany({
      where: shopBadgeWhere,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(shopBadges);
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau badge (ADMIN ONLY, isolé par boutique)
export async function POST(request: NextRequest) {
  try {
    // 🏪 ISOLATION MULTI-TENANT
    const shopId = await getShopId(request);
    ensureShopIsolation(shopId);

    const body = await request.json();
    const { userId: providedUserId, forumId } = body; // Support futur pour l'isolation par forum

    // Résoudre l'utilisateur admin agissant
    const userId = await resolveActingAdmin(providedUserId, shopId);

    // Vérifier les droits admin
    await requireAdmin(userId, shopId);

    const { name, imageUrl, requiredCount, order } = body;

    if (!name || !imageUrl || requiredCount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const badgeData: any = {
      userId,
      name,
      imageUrl,
      requiredCount,
      order: order || 0,
      isDefault: false,
      shopId, // ✅ ASSOCIER À LA BOUTIQUE
    };

    // TODO: Ajouter l'association au forum une fois le modèle Forum créé
    // if (forumId) {
    //   badgeData.forumId = forumId;
    // }

    const badge = await prisma.badge.create({
      data: badgeData,
    });

    return NextResponse.json(badge);
  } catch (error) {
    console.error("Error creating badge:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent créer des badges" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create badge" },
      { status: 500 }
    );
  }
}
