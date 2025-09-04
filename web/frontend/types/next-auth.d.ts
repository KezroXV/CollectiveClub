import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "MODERATOR" | "MEMBER"
      isShopOwner: boolean
    } & DefaultSession["user"]
  }

  interface User {
    role: "ADMIN" | "MODERATOR" | "MEMBER"
    isShopOwner: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "MODERATOR" | "MEMBER"
    isShopOwner: boolean
  }
}