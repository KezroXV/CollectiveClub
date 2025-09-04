import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getCurrentShopId } from "@/lib/shop-context"

// Contexte d'auth pour server-side
export async function getAuthContext() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Not authenticated');
  }

  const shopId = await getCurrentShopId();
  
  return {
    user: session.user as AuthUser,
    shopId: shopId || "default"
  };
}

// Helper pour vérifier admin avec contexte
export async function requireAuthAdmin() {
  const { user, shopId } = await getAuthContext();
  
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
  
  return { user, shopId };
}

// Types pour TypeScript
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

export interface AuthContext {
  user: AuthUser;
  shopId: string;
}