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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Pour récupérer la réaction utilisateur

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
            reactions: {
              select: {
                type: true,
                userId: true
              }
            }
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



    // Calculer les réactions groupées par type
    const reactionsGrouped = post.reactions.reduce((acc: any, reaction: any) => {
      const existingType = acc.find((r: any) => r.type === reaction.type);
      if (existingType) {
        existingType.count += 1;
      } else {
        acc.push({ type: reaction.type, count: 1 });
      }
      return acc;
    }, []);

    // Trouver la réaction de l'utilisateur actuel
    const userReaction = userId 
      ? post.reactions.find((r: any) => r.userId === userId)?.type 
      : null;

    // Traiter les réactions des commentaires
    const commentsWithReactions = post.comments.map((comment: any) => {
      const commentReactionsGrouped = comment.reactions.reduce((acc: any, reaction: any) => {
        const existingType = acc.find((r: any) => r.type === reaction.type);
        if (existingType) {
          existingType.count += 1;
        } else {
          acc.push({ type: reaction.type, count: 1 });
        }
        return acc;
      }, []);

      const commentUserReaction = userId 
        ? comment.reactions.find((r: any) => r.userId === userId)?.type 
        : null;

      return {
        ...comment,
        reactions: commentReactionsGrouped,
        userReaction: commentUserReaction
      };
    });

    const response = {
      post: {
        ...post,
        reactions: reactionsGrouped,
        userReaction,
        comments: commentsWithReactions
      },
      authorRecentPosts,
      authorRecentComments
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
