/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { createDefaultBadgesForShop } from "../lib/defaultBadges";

const prisma = new PrismaClient();

async function main() {
  // Créer une boutique par défaut pour le développement
  const defaultShop = await prisma.shop.upsert({
    where: { shopDomain: "collective-club-dev.myshopify.com" },
    update: {},
    create: {
      shopDomain: "collective-club-dev.myshopify.com",
      shopName: "Collective Club - Développement",
      ownerId: "dev-owner-123",
      settings: {
        theme: "default",
        primaryColor: "#3B82F6",
        environment: "development",
      },
    },
  });

  console.log("✅ Default shop created successfully");

  // Créer les catégories par défaut pour cette boutique
  const categories = [
    {
      name: "Maison",
      color: "bg-orange-500",
      description: "Tout pour la maison et la décoration",
      order: 1,
      shopId: defaultShop.id,
    },
    {
      name: "Tech",
      color: "bg-green-500",
      description: "Technologie et gadgets",
      order: 2,
      shopId: defaultShop.id,
    },
    {
      name: "Artisanat",
      color: "bg-pink-500",
      description: "Créations artisanales et DIY",
      order: 3,
      shopId: defaultShop.id,
    },
    {
      name: "Voyage",
      color: "bg-primary",
      description: "Voyages et destinations",
      order: 4,
      shopId: defaultShop.id,
    },
    {
      name: "Cosmétique",
      color: "bg-purple-500",
      description: "Beauté et cosmétiques",
      order: 5,
      shopId: defaultShop.id,
    },
    {
      name: "Revente",
      color: "bg-yellow-500",
      description: "Vente et revente d'articles",
      order: 6,
      shopId: defaultShop.id,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        shopId_name: {
          shopId: defaultShop.id,
          name: category.name,
        },
      },
      update: {},
      create: category,
    });
  }

  console.log("✅ Categories created successfully");

  // Créer les utilisateurs de test pour cette boutique
  const testUsers = [
    {
      email: "owner@collective-club.com",
      name: "Shop Owner",
      role: "ADMIN",
      isOwner: true,
    },
    {
      email: "admin@collective-club.com",
      name: "Admin User",
      role: "ADMIN",
      isOwner: false,
    },
    {
      email: "moderator@collective-club.com",
      name: "Moderator User",
      role: "MODERATOR",
      isOwner: false,
    },
    {
      email: "member1@collective-club.com",
      name: "Marie Martin",
      role: "MEMBER",
      isOwner: false,
    },
    {
      email: "member2@collective-club.com",
      name: "Pierre Dupont",
      role: "MEMBER",
      isOwner: false,
    },
    {
      email: "member3@collective-club.com",
      name: "Sophie Bernard",
      role: "MEMBER",
      isOwner: false,
    },
  ];

  let ownerUser = null;
  let adminUser = null;

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: {
        shopId_email: {
          shopId: defaultShop.id,
          email: userData.email,
        },
      },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role as any,
        shopId: defaultShop.id,
        shopDomain: "collective-club-dev.myshopify.com",
      },
    });

    if (userData.isOwner) {
      ownerUser = user;
      // Mettre à jour le shop avec l'ownerId correct
      await prisma.shop.update({
        where: { id: defaultShop.id },
        data: { ownerId: user.id },
      });
    }

    if (userData.email === "admin@collective-club.com") {
      adminUser = user;
    }
  }

  console.log("✅ Test users created successfully");

  // Créer les badges par défaut pour cette boutique
  await createDefaultBadgesForShop(defaultShop.id);
  console.log("✅ Default badges created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
