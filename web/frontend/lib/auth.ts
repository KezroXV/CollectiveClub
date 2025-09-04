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
    async signIn({ user, account, profile }) {
      console.log("🔐 SignIn callback:", { 
        userId: user.id, 
        email: user.email, 
        name: user.name,
        provider: account?.provider 
      });
      
      // Simplement autoriser la connexion Google
      if (!user.email || account?.provider !== 'google') return false;
      
      return true; // La logique d'admin sera dans jwt callback
    },

    async session({ session, token }) {
      console.log("📝 Session callback:", { 
        sessionUser: session.user?.email, 
        tokenSub: token?.sub,
        tokenRole: token?.role
      });
      
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
      console.log("🎫 JWT callback:", { 
        tokenSub: token.sub, 
        userId: user?.id,
        userName: user?.name,
        provider: account?.provider 
      });
      
      // Au premier sign-in, configurer l'utilisateur
      if (user && account?.provider === 'google') {
        try {
          // Récupérer le contexte boutique
          const shopId = await getCurrentShopId();
          console.log("🏪 Shop context in JWT:", shopId);
          
          if (shopId) {
            // Vérifier si un admin existe déjà pour cette boutique
            const existingAdmin = await prisma.user.findFirst({
              where: {
                shopId: shopId,
                role: 'ADMIN'
              }
            });
            
            console.log("👑 Existing admin for shop:", existingAdmin?.email || "None");
            
            // Déterminer le rôle
            const role = !existingAdmin ? 'ADMIN' : 'MEMBER';
            const isShopOwner = !existingAdmin;
            
            // Mettre à jour l'utilisateur avec shopId et rôle
            const updatedUser = await prisma.user.update({
              where: { id: user.id },
              data: { 
                shopId: shopId,
                role: role,
                isShopOwner: isShopOwner
              },
              select: { role: true, isShopOwner: true, name: true }
            });
            
            console.log("✅ User configured:", { 
              email: user.email, 
              name: updatedUser.name,
              role: updatedUser.role, 
              isShopOwner: updatedUser.isShopOwner,
              shopId 
            });
            
            token.role = updatedUser.role;
            token.isShopOwner = updatedUser.isShopOwner;
            token.shopId = shopId;
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
        console.log("🔄 Loading user from DB with ID:", token.sub);
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, isShopOwner: true, shopId: true, email: true }
        });
        
        console.log("📄 DB User found:", dbUser);
        
        if (dbUser) {
          token.role = dbUser.role;
          token.isShopOwner = dbUser.isShopOwner;
          token.shopId = dbUser.shopId;
          console.log("✅ Token updated:", { role: token.role, isShopOwner: token.isShopOwner, shopId: token.shopId });
        } else {
          // Utilisateur n'existe plus en DB
          console.log("❌ User not found in DB, setting defaults");
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