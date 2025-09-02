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
        reactions: true,
        _count: {
          select: { comments: true, reactions: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found in this shop" }, { status: 404 });
    }

    // 🔧 FIX: Récupérer les commentaires avec structure hiérarchique (commentaires + réponses imbriquées)
    // Récupérer tous les commentaires principaux (sans parentId)
    const topLevelComments = await prisma.comment.findMany({
      where: { 
        postId,
        shopId,
        OR: [
          { parentId: null },
          { parentId: { equals: null } }
        ]
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        reactions: {
          select: {
            type: true,
            userId: true
          }
        },
        _count: {
          select: { reactions: true }
        }
      },
      orderBy: { createdAt: "asc" },
    });

    // Récupérer toutes les réponses et les organiser par parentId
    const replies = await prisma.comment.findMany({
      where: { 
        postId,
        shopId,
        parentId: { not: null }
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        reactions: {
          select: {
            type: true,
            userId: true
          }
        },
        _count: {
          select: { reactions: true }
        }
      },
      orderBy: { createdAt: "asc" },
    });

    // Organiser les réponses par parentId
    const repliesByParent = new Map();
    for (const reply of replies) {
      const parentId = (reply as any).parentId;
      if (!repliesByParent.has(parentId)) {
        repliesByParent.set(parentId, []);
      }
      repliesByParent.get(parentId).push(reply);
    }

    // Ajouter les réponses aux commentaires principaux
    const comments = topLevelComments.map(comment => ({
      ...comment,
      replies: repliesByParent.get(comment.id) || [],
      _count: {
        ...comment._count,
        replies: (repliesByParent.get(comment.id) || []).length
      }
    }));

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
        },
        _count: {
          select: { reactions: true }
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

    // Traiter les réactions pour chaque commentaire et ses réponses
    const commentsWithReactions = comments.map((comment: any) => {
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

      // Traiter les réactions pour chaque réponse
      const repliesWithReactions = comment.replies.map((reply: any) => {
        const replyReactionsGrouped = reply.reactions.reduce((acc: any, reaction: any) => {
          const existingType = acc.find((r: any) => r.type === reaction.type);
          if (existingType) {
            existingType.count += 1;
          } else {
            acc.push({ type: reaction.type, count: 1 });
          }
          return acc;
        }, []);

        const replyUserReaction = userId 
          ? reply.reactions.find((r: any) => r.userId === userId)?.type 
          : null;

        return {
          ...reply,
          reactions: replyReactionsGrouped,
          userReaction: replyUserReaction
        };
      });

      return {
        ...comment,
        reactions: commentReactionsGrouped,
        userReaction: commentUserReaction,
        replies: repliesWithReactions
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
