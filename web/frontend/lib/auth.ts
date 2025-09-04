import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { getCurrentShopId } from "@/lib/shop-context"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Simplement autoriser la connexion Google
      if (!user.email || account?.provider !== 'google') return false;
      
      return true; // La logique d'admin sera dans jwt callback
    },

    async session({ session, token }) {
      // Récupérer les infos depuis le token JWT
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.name = token.name || session.user.name;
        session.user.image = token.picture || session.user.image;
        session.user.role = (token.role as any) || "MEMBER";
        session.user.isShopOwner = (token.isShopOwner as boolean) || false;
        session.user.shopId = (token.shopId as string) || undefined;
      }
      return session;
    },

    async jwt({ token, user, account }) {
      // Au premier sign-in, configurer l'utilisateur
      if (user && account?.provider === 'google') {
        try {
          // Récupérer le contexte boutique
          const shopId = await getCurrentShopId();
          
          if (shopId) {
            // Vérifier si cet utilisateur existe déjà pour cette boutique spécifique
            let shopUser = await prisma.user.findFirst({
              where: {
                email: user.email,
                shopId: shopId
              }
            });
            
            if (!shopUser) {
              // Vérifier si un admin existe déjà pour cette boutique
              const existingAdmin = await prisma.user.findFirst({
                where: {
                  shopId: shopId,
                  role: 'ADMIN'
                }
              });
              
              // Déterminer le rôle pour ce nouvel utilisateur dans cette boutique
              const role = !existingAdmin ? 'ADMIN' : 'MEMBER';
              const isShopOwner = !existingAdmin;
              
              // Créer un nouvel utilisateur pour cette boutique
              shopUser = await prisma.user.create({
                data: {
                  email: user.email!,
                  name: user.name!,
                  image: user.image,
                  shopId: shopId,
                  role: role,
                  isShopOwner: isShopOwner
                }
              });
              
              // Mettre à jour l'ID du token avec le nouvel utilisateur de cette boutique
              token.sub = shopUser.id;
            }
            
            token.role = shopUser.role;
            token.isShopOwner = shopUser.isShopOwner;
            token.shopId = shopUser.shopId;
          } else {
            // Pas de shopId, utilisateur normal
            token.role = "MEMBER";
            token.isShopOwner = false;
            token.shopId = undefined;
          }
        } catch (error) {
          console.error("❌ JWT callback error:", error);
          token.role = "MEMBER";
          token.isShopOwner = false;
          token.shopId = undefined;
        }
      } else if (token.sub) {
        // Connexions suivantes, récupérer depuis DB avec token.sub
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, isShopOwner: true, shopId: true, email: true }
        });
        
        
        if (dbUser) {
          token.role = dbUser.role;
          token.isShopOwner = dbUser.isShopOwner;
          token.shopId = dbUser.shopId;
        } else {
          // Utilisateur n'existe plus en DB
          token.role = "MEMBER";
          token.isShopOwner = false;
          token.shopId = undefined;
        }
      }
      
      return token;
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: "jwt", // Changer pour JWT temporairement
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  
  debug: process.env.NODE_ENV === "development"
}

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