import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function verifyAdminRole(userId: string, shopId?: string): Promise<{ isAdmin: boolean; error?: string }> {
  try {
    if (!userId) {
      return { isAdmin: false, error: "userId is required" };
    }

    let user;
    
    // Si shopId fourni, chercher dans la boutique spécifique
    if (shopId) {
      user = await prisma.user.findFirst({
        where: { 
          id: userId,
          shopId: shopId 
        },
        select: { id: true, role: true, email: true, shopId: true }
      });
    } else {
      // Fallback: chercher par ID uniquement
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, email: true, shopId: true }
      });
    }

    if (!user) {
      return { isAdmin: false, error: "User not found" };
    }

    if (user.role !== 'ADMIN') {
      return { isAdmin: false, error: "Admin privileges required" };
    }

    return { isAdmin: true };
  } catch (error) {
    console.error("Error verifying admin role:", error);
    return { isAdmin: false, error: "Authorization check failed" };
  }
}

export async function getShopAdmin(shopId: string) {
  let adminUser = await prisma.user.findFirst({
    where: { 
      shopId: shopId,
      role: 'ADMIN' 
    },
    select: { id: true, role: true, email: true, shopId: true, name: true }
  });

  // Si aucun admin n'existe, créer un admin automatiquement
  if (!adminUser) {
    try {
      const shop = await prisma.shop.findUnique({
        where: { id: shopId },
        select: { shopDomain: true, shopName: true }
      });

      if (!shop) {
        throw new Error("Shop not found");
      }

      adminUser = await prisma.user.create({
        data: {
          email: `admin@${shop.shopDomain}`,
          name: `Admin ${shop.shopName}`,
          role: 'ADMIN',
          shopId: shopId,
          shopDomain: shop.shopDomain,
        },
        select: { id: true, role: true, email: true, shopId: true, name: true }
      });

      console.log(`✅ Auto-created admin for shop ${shopId}:`, adminUser.email);
    } catch (error) {
      console.error("Error creating admin user:", error);
      throw new Error("No admin user found and failed to create one");
    }
  }

  return adminUser;
}

export async function resolveActingAdmin(providedUserId: string | null | undefined, shopId: string): Promise<string> {
  let actingUserId: string | null = providedUserId || null;
  
  if (actingUserId) {
    // Vérifier si l'utilisateur fourni existe et est admin dans cette boutique
    const user = await prisma.user.findFirst({
      where: { id: actingUserId, shopId },
      select: { id: true, role: true },
    });
    
    // Si l'utilisateur n'existe pas ou n'est pas admin, fallback sur l'admin de la boutique
    if (!user || user.role !== "ADMIN") {
      const adminUser = await getShopAdmin(shopId);
      actingUserId = adminUser.id;
    }
  } else {
    // Si aucun userId fourni, récupérer l'admin de la boutique
    const adminUser = await getShopAdmin(shopId);
    actingUserId = adminUser.id;
  }

  if (!actingUserId) {
    throw new Error("No admin user found in this shop");
  }

  return actingUserId;
}

export async function requireAdmin(userId: string, shopId?: string) {
  // 🔒 SÉCURITÉ: Validation stricte - ne pas auto-créer d'admin
  // Si l'userId est invalide, rejeter immédiatement
  if (!userId || typeof userId !== 'string' || userId.length < 10) {
    throw new Error("Valid userId is required");
  }

  // Si l'userId est en fait l'ID de la boutique, utiliser l'admin existant UNIQUEMENT
  if (shopId && userId === shopId) {
    const adminUser = await prisma.user.findFirst({
      where: { 
        shopId: shopId,
        role: 'ADMIN' 
      },
      select: { id: true, role: true, email: true, shopId: true }
    });

    if (!adminUser) {
      throw new Error("No admin user found for this shop");
    }

    userId = adminUser.id;
  }

  const auth = await verifyAdminRole(userId, shopId);
  
  if (!auth.isAdmin) {
    throw new Error(auth.error || "Unauthorized");
  }
  
  return true;
}