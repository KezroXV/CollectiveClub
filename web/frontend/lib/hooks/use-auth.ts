"use client"

import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === 'ADMIN',
    isModerator: session?.user?.role === 'MODERATOR' || session?.user?.role === 'ADMIN',
    isShopOwner: session?.user?.isShopOwner || false,
  };
}