import { PrismaClient } from '@prisma/client';
import { PostStructuredData } from "@/components/seo/StructuredData";
import PostClient from './PostClient';

// Import des métadonnées SEO
export { generateMetadata } from './metadata';

const prisma = new PrismaClient();

interface PageProps {
  params: { slug: string };
}

/**
 * Page serveur pour les posts avec slug SEO
 * Récupère les données et génère les métadonnées côté serveur
 */
export default async function PostBySlugPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Récupération des données côté serveur pour le SEO
  let post = null;
  try {
    post = await prisma.post.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            role: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        shop: {
          select: {
            id: true,
            shopName: true,
            shopDomain: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching post for SSR:', error);
  }

  return (
    <>
      {/* Données structurées SEO - côté serveur */}
      {post && <PostStructuredData post={post} />}
      
      {/* Composant client pour l'interactivité */}
      <PostClient />
    </>
  );
}