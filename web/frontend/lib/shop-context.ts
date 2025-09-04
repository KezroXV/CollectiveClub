import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getCurrentShopId(): Promise<string | null> {
  try {
    // Option 1: Depuis les headers de la requête
    const headersList = await headers();
    const referer = headersList.get('referer') || '';
    const host = headersList.get('host') || '';
    
    // Extraire shopId depuis l'URL ou query params
    // Exemple: ?shop=boutique-cosmetic.myshopify.com
    const shopMatch = referer.match(/[?&]shop=([^&]+)/);
    if (shopMatch) {
      const shopDomain = shopMatch[1];
      
      const shop = await prisma.shop.findUnique({
        where: { shopDomain },
        select: { id: true }
      });
      
      return shop?.id || null;
    }
    
    // Option 2: Fallback sur host pour développement
    // TODO: Adapter selon votre logique de boutique
    if (host.includes('localhost')) {
      // En développement, utiliser une boutique par défaut
      const defaultShop = await prisma.shop.findFirst({
        select: { id: true }
      });
      return defaultShop?.id || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting shopId:', error);
    return null;
  }
}

export async function getShopContext(shopId: string) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      id: true,
      shopDomain: true,
      shopName: true,
      settings: true
    }
  });
  
  return shop;
}