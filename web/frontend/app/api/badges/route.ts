import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { getShopId, ensureShopIsolation } from "@/lib/shopIsolation";

const prisma = new PrismaClient();

// GET - Récupérer tous les badges d'un utilisateur (isolés par boutique)
export async function GET(request: NextRequest) {
  try {
    // 🏪 ISOLATION MULTI-TENANT
    const shopId = await getShopId(request);
    ensureShopIsolation(shopId);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const badges = await prisma.badge.findMany({
      where: { 
        userId,
        shopId // ✅ FILTRER PAR BOUTIQUE
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(badges);
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
    
    // Vérifier les droits admin dans cette boutique
    await requireAdmin(body.userId, shopId);
    
    const { userId, name, imageUrl, requiredCount, order } = body;

    if (!userId || !name || !imageUrl || requiredCount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const badge = await prisma.badge.create({
      data: {
        userId,
        name,
        imageUrl,
        requiredCount,
        order: order || 0,
        isDefault: false,
        shopId, // ✅ ASSOCIER À LA BOUTIQUE
      },
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