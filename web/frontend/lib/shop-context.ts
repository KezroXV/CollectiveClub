import { headers, cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getCurrentShopId(): Promise<string | null> {
  try {
    // Option 1: Depuis le cookie shopDomain (défini par middleware)
    const cookieStore = await cookies();
    const shopDomain = cookieStore.get('shopDomain')?.value;
    
    console.log('🔍 getCurrentShopId - shopDomain from cookie:', shopDomain);
    
    if (shopDomain) {
      let shop = await prisma.shop.findUnique({
        where: { shopDomain },
        select: { id: true }
      });
      
      console.log('🔍 Shop found in DB:', shop);
      
      // Si le shop n'existe pas, le créer automatiquement
      if (!shop) {
        console.log('🔍 Creating new shop:', shopDomain);
        shop = await prisma.shop.create({
          data: {
            shopDomain: shopDomain,
            shopName: shopDomain.replace('.myshopify.com', ''),
            ownerId: 'pending', // À mettre à jour lors du premier admin
          },
          select: { id: true }
        });
        console.log('🔍 Created shop:', shop);
      }
      
      console.log('🔍 Returning shopId:', shop?.id);
      return shop?.id || null;
    } else {
      console.log('🔍 No shopDomain cookie found');
    }
    
    // Option 2: Depuis les headers de la requête (fallback)
    const headersList = await headers();
    const referer = headersList.get('referer') || '';
    const host = headersList.get('host') || '';
    
    console.log('🔍 Fallback - referer:', referer);
    
    // Extraire shopId depuis l'URL ou query params
    // Exemple: ?shop=boutique-cosmetic.myshopify.com
    const shopMatch = referer.match(/[?&]shop=([^&]+)/);
    if (shopMatch) {
      const shopDomainFromUrl = shopMatch[1];
      
      let shop = await prisma.shop.findUnique({
        where: { shopDomain: shopDomainFromUrl },
        select: { id: true }
      });
      
      // Si le shop n'existe pas, le créer automatiquement
      if (!shop) {
        shop = await prisma.shop.create({
          data: {
            shopDomain: shopDomainFromUrl,
            shopName: shopDomainFromUrl.replace('.myshopify.com', ''),
            ownerId: 'pending', // À mettre à jour lors du premier admin
          },
          select: { id: true }
        });
      }
      
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