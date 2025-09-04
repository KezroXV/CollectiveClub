"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  isShopOwner?: boolean;
  shopId?: string;
}

/**
 * Hook personnalisé pour récupérer l'utilisateur connecté via NextAuth
 * Remplace les anciennes implémentations localStorage ou fetch manuel
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const user: CurrentUser = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || '',
        image: session.user.image || undefined,
        role: (session.user as any).role || 'MEMBER',
        isShopOwner: (session.user as any).isShopOwner || false,
        shopId: (session.user as any).shopId || undefined
      };
      
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }

    setLoading(false);
  }, [session, status]);

  return {
    currentUser,
    loading,
    isAuthenticated: status === 'authenticated',
    isAdmin: currentUser?.role === 'ADMIN',
    isModerator: currentUser?.role === 'MODERATOR' || currentUser?.role === 'ADMIN'
  };
}