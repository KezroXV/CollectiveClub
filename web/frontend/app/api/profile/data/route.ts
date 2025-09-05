import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getShopId, ensureShopIsolation } from "@/lib/shopIsolation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// GET /api/profile/data - Récupérer les données du profil (posts récents, commentaires, badges)
export async function GET(request: NextRequest) {
  try {
    console.log('PROFILE DATA API: Starting request');
    
    // 🏪 ISOLATION MULTI-TENANT
    const shopId = await getShopId(request);
    ensureShopIsolation(shopId);
    console.log('PROFILE DATA API: ShopId obtained', { shopId });

    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

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

    console.log('PROFILE DATA API: User found', { userId: currentUser.id });

    // Récupérer les posts récents de l'utilisateur
    const authorRecentPosts = await prisma.post.findMany({
      where: {
        authorId: currentUser.id,
        shopId,
        status: 'PUBLISHED'
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
            reactions: true
          }
        }
      }
    });

    // Récupérer les commentaires récents de l'utilisateur
    const authorRecentComments = await prisma.comment.findMany({
      where: {
        authorId: currentUser.id,
        post: {
          shopId
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        content: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        _count: {
          select: {
            reactions: true
          }
        }
      }
    });

    // Récupérer les points de l'utilisateur
    const userPoints = await prisma.userPoints.findUnique({
      where: {
        userId_shopId: {
          userId: currentUser.id,
          shopId
        }
      }
    });

    // Récupérer tous les badges disponibles pour cette boutique
    const allBadges = await prisma.badge.findMany({
      where: { shopId },
      orderBy: { requiredPoints: 'asc' }
    });

    // Créer la liste des badges avec leur statut et filtrer seulement les débloqués
    const badges = allBadges
      .map(badge => ({
        id: badge.id,
        name: badge.name,
        imageUrl: badge.imageUrl,
        requiredPoints: badge.requiredPoints,
        unlocked: (userPoints?.points || 0) >= badge.requiredPoints
      }))
      .filter(badge => badge.unlocked) // Ne garder que les badges débloqués
      .sort((a, b) => a.requiredPoints - b.requiredPoints); // Trier par points croissants

    console.log('PROFILE DATA API: Data retrieved successfully', {
      postsCount: authorRecentPosts.length,
      commentsCount: authorRecentComments.length,
      badgesCount: badges.length,
      points: userPoints?.points || 0,
      badges: badges.map(b => ({ name: b.name, requiredPoints: b.requiredPoints, unlocked: b.unlocked }))
    });

    return NextResponse.json({ 
      success: true,
      data: {
        authorRecentPosts,
        authorRecentComments,
        badges,
        points: userPoints?.points || 0
      }
    });

  } catch (error) {
    console.error("Error fetching profile data:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    );
  }
}