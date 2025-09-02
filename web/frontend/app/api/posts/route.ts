/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getShopId, ensureShopIsolation } from "@/lib/shopIsolation";
import { awardPoints } from "@/lib/points";
import { PointAction } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/posts - Récupérer tous les posts avec sondages (isolés par boutique)
export async function GET(request: NextRequest) {
  try {
    // 🏪 ISOLATION MULTI-TENANT
    const shopId = await getShopId(request);
    ensureShopIsolation(shopId);

    const { searchParams } = new URL(request.url);
    const pinnedOnly = searchParams.get('pinnedOnly'); // Pour filtre "pinned"
    const sortBy = searchParams.get('sortBy') || 'newest';
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    // Construction de la clause where
    const whereClause: any = { shopId };

    if (pinnedOnly === 'true') {
      whereClause.isPinned = true;
    }

    if (categoryId && categoryId !== 'all') {
      whereClause.categoryId = categoryId;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Construction de la clause orderBy
    const orderBy: any[] = [];
    
    // Toujours mettre les épinglés en premier (sauf si on filtre uniquement les épinglés)
    if (pinnedOnly !== 'true') {
      orderBy.push({ isPinned: 'desc' });
    }
    
    // Ajouter le tri secondaire
    switch (sortBy) {
      case 'oldest':
        orderBy.push({ createdAt: 'asc' });
        break;
      case 'popular':
        orderBy.push({ reactions: { _count: 'desc' } });
        break;
      case 'newest':
      default:
        orderBy.push({ createdAt: 'desc' });
        break;
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, color: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        reactions: true,
        // ✅ INCLURE LE SONDAGE AVEC TOUTES SES DONNÉES
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
        _count: {
          select: { comments: true, reactions: true },
        },
      },
      orderBy,
    });

    // Compter les posts épinglés pour le badge
    const pinnedCount = await prisma.post.count({
      where: { shopId, isPinned: true }
    });

    return NextResponse.json({
      posts,
      pinnedCount
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Créer un nouveau post avec sondage (isolé par boutique)
export async function POST(request: NextRequest) {
  try {
    // 🏪 ISOLATION MULTI-TENANT
    const shopId = await getShopId(request);
    ensureShopIsolation(shopId);

    const body = await request.json();
    const { title, content, imageUrl, category, authorId, poll } = body; // ✅ AJOUTER poll

    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: "Title, content, and authorId are required" },
        { status: 400 }
      );
    }

    // 🔒 SÉCURITÉ: Vérifier que l'auteur existe et appartient à cette boutique
    const author = await prisma.user.findFirst({
      where: {
        id: authorId,
        shopId: shopId
      },
      select: { id: true, role: true }
    });

    if (!author) {
      return NextResponse.json(
        { error: "Author not found or doesn't belong to this shop" },
        { status: 403 }
      );
    }

    // Convertir category (nom) en categoryId avec isolation par boutique
    let categoryId = null;
    if (category) {
      const foundCategory = await prisma.category.findUnique({
        where: { 
          shopId_name: {
            shopId,
            name: category,
          }
        },
      });
      if (foundCategory) {
        categoryId = foundCategory.id;
      }
    }

    // ✅ CRÉER LE POST AVEC SONDAGE
    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        categoryId,
        authorId,
        shopId, // ✅ ASSOCIER À LA BOUTIQUE
        // ✅ CRÉER LE SONDAGE SI FOURNI
        ...(poll && {
          poll: {
            create: {
              question: poll.question,
              shopId, // ✅ ASSOCIER LE SONDAGE À LA BOUTIQUE
              options: {
                create: poll.options.map((option: any, index: number) => ({
                  text: option.text,
                  order: index,
                  shopId, // ✅ ASSOCIER CHAQUE OPTION À LA BOUTIQUE
                })),
              },
            },
          },
        }),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, color: true },
        },
        // ✅ INCLURE LE SONDAGE CRÉÉ
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
        _count: {
          select: { comments: true, reactions: true },
        },
      },
    });

    // 🏆 ATTRIBUER DES POINTS AUTOMATIQUEMENT POUR LA CRÉATION D'UN POST
    try {
      await awardPoints(authorId, shopId, PointAction.POST_CREATED);
    } catch (pointsError) {
      console.error("Error awarding points for post creation:", pointsError);
      // Ne pas faire échouer la création du post si l'attribution des points échoue
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
