import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { getShopId, ensureShopIsolation } from "@/lib/shopIsolation";

const prisma = new PrismaClient();

// GET - Récupérer les paramètres de personnalisation (isolés par boutique)
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

    // Vérifier que l'utilisateur existe dans cette boutique
    const user = await prisma.user.findFirst({
      where: {
        id: userId, // userId est déjà l'ID de l'utilisateur
        shopId // Vérifier qu'il appartient à cette boutique
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in this shop" },
        { status: 404 }
      );
    }

    // Récupérer ou créer les paramètres par défaut
    let settings = await prisma.customizationSettings.findUnique({
      where: { userId }, // Utiliser directement userId
    });

    // Si pas de paramètres existants, créer avec les valeurs par défaut
    if (!settings) {
      settings = await prisma.customizationSettings.create({
        data: {
          userId,
          colorPosts: "#3B82F6",
          colorBorders: "#E5E7EB", 
          colorBg: "#F9FAFB",
          colorText: "#111827",
          selectedFont: "Helvetica",
          bannerImageUrl: "/Bannière.svg",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching customization settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch customization settings" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les paramètres de personnalisation (ADMIN ONLY, isolé par boutique)
export async function PUT(request: NextRequest) {
  try {
    // 🏪 ISOLATION MULTI-TENANT
    const shopId = await getShopId(request);
    ensureShopIsolation(shopId);

    const body = await request.json();
    
    // Vérifier les droits admin dans cette boutique
    await requireAdmin(body.userId, shopId);
    const {
      userId,
      colorPosts,
      colorBorders,
      colorBg,
      colorText,
      selectedFont,
      coverImageUrl,
      bannerImageUrl,
      customBadges,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Upsert (créer ou mettre à jour)
    const settings = await prisma.customizationSettings.upsert({
      where: { userId },
      update: {
        colorPosts: colorPosts || "#3B82F6",
        colorBorders: colorBorders || "#E5E7EB",
        colorBg: colorBg || "#F9FAFB", 
        colorText: colorText || "#111827",
        selectedFont: selectedFont || "Helvetica",
        coverImageUrl: coverImageUrl || null,
        bannerImageUrl: bannerImageUrl || "/Bannière.svg",
        customBadges: customBadges || null,
      },
      create: {
        userId,
        colorPosts: colorPosts || "#3B82F6",
        colorBorders: colorBorders || "#E5E7EB",
        colorBg: colorBg || "#F9FAFB",
        colorText: colorText || "#111827", 
        selectedFont: selectedFont || "Helvetica",
        coverImageUrl: coverImageUrl || null,
        bannerImageUrl: bannerImageUrl || "/Bannière.svg",
        customBadges: customBadges || null,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating customization settings:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent modifier les paramètres de personnalisation" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update customization settings" },
      { status: 500 }
    );
  }
}