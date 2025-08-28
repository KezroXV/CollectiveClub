import { PrismaClient } from "@prisma/client";

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
        environment: "development"
      }
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
        }
      },
      update: {},
      create: category,
    });
  }

  console.log("✅ Categories created successfully");

  // Créer un utilisateur admin par défaut pour cette boutique
  const adminUser = await prisma.user.upsert({
    where: { 
      shopId_email: {
        shopId: defaultShop.id,
        email: "admin@collective-club.com",
      }
    },
    update: {},
    create: {
      email: "admin@collective-club.com",
      name: "Admin",
      role: "ADMIN",
      shopId: defaultShop.id,
      shopDomain: "collective-club-dev.myshopify.com",
    },
  });

  console.log("✅ Admin user created successfully");

  // Créer les badges par défaut pour cette boutique
  const defaultBadges = [
    {
      name: "Nouveau",
      imageUrl: "/Badge-nouveau.svg",
      requiredCount: 5,
      isDefault: true,
      order: 1,
      shopId: defaultShop.id,
    },
    {
      name: "Bronze",
      imageUrl: "/Badge-bronze.svg",
      requiredCount: 50,
      isDefault: true,
      order: 2,
      shopId: defaultShop.id,
    },
    {
      name: "Argent",
      imageUrl: "/Badge-argent.svg",
      requiredCount: 100,
      isDefault: true,
      order: 3,
      shopId: defaultShop.id,
    },
    {
      name: "Or",
      imageUrl: "/Badge-or.svg",
      requiredCount: 500,
      isDefault: true,
      order: 4,
      shopId: defaultShop.id,
    },
  ];

  for (const badge of defaultBadges) {
    await prisma.badge.upsert({
      where: {
        shopId_userId_name: {
          shopId: defaultShop.id,
          userId: adminUser.id,
          name: badge.name,
        },
      },
      update: {},
      create: {
        ...badge,
        userId: adminUser.id,
      },
    });
  }

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
