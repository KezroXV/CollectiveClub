import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getShopId, ensureShopIsolation } from "@/lib/shopIsolation";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    // 🏪 ISOLATION MULTI-TENANT
    const shopId = await getShopId(request);
    ensureShopIsolation(shopId);

    const { postId } = await params;

    const post = await prisma.post.findFirst({
      where: { 
        id: postId,
        shopId // ✅ VÉRIFIER L'ISOLATION
      },
      include: {
        author: {
          select: { 
            id: true, 
            name: true, 
            email: true, 
            avatar: true,
            createdAt: true,
            role: true
          },
        },
        category: {
          select: { id: true, name: true, color: true },
        },
        poll: {
          include: {
            options: {
              include: {
                _count: {
                  select: { votes: true },
                },
              },
              orderBy: { order: "asc" },
            },
            _count: {
              select: { votes: true },
            },
          },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        reactions: true,
        _count: {
          select: { comments: true, reactions: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found in this shop" }, { status: 404 });
    }

    // Récupérer les posts récents de l'auteur (excluant le post actuel)
    const authorRecentPosts = await prisma.post.findMany({
      where: {
        authorId: post.author.id,
        shopId,
        id: { not: postId }
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: {
          select: { comments: true, reactions: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 4
    });

    // Récupérer les commentaires récents de l'auteur sur d'autres posts
    const authorRecentComments = await prisma.comment.findMany({
      where: {
        authorId: post.author.id,
        shopId,
        postId: { not: postId }
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    // Récupérer les badges de l'auteur via UserBadge
    const authorUserBadges = await prisma.userBadge.findMany({
      where: {
        userId: post.author.id,
        shopId
      },
      include: {
        badge: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            requiredPoints: true
          }
        }
      },
      orderBy: { 
        badge: { order: 'asc' } 
      }
    });

    // Transformer pour compatibilité avec l'interface existante
    const authorBadges = authorUserBadges.map(ub => ({
      ...ub.badge,
      requiredCount: ub.badge.requiredPoints // Pour compatibilité
    }));

    const response = {
      post,
      authorRecentPosts,
      authorRecentComments,
      authorBadges
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
