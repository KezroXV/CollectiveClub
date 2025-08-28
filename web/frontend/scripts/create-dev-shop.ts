import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createDevShop() {
  const shopId = "cmeqzo59z0017u3pgqc4ej9q0";
  
  try {
    // Créer la boutique avec l'ID spécifique
    const shop = await prisma.shop.upsert({
      where: { id: shopId },
      update: {},
      create: {
        id: shopId,
        shopDomain: "dev-test.myshopify.com",
        shopName: "Boutique de Test Dev",
        ownerId: "dev-owner-test",
        settings: {
          theme: "default",
          primaryColor: "#3B82F6",
          environment: "development"
        }
      }
    });

    console.log("✅ Boutique créée:", shop.shopName);

    // Créer un utilisateur admin pour cette boutique
    const adminUser = await prisma.user.upsert({
      where: {
        shopId_email: {
          shopId: shopId,
          email: "admin@dev-test.com"
        }
      },
      update: {},
      create: {
        email: "admin@dev-test.com",
        name: "Admin Dev",
        role: "ADMIN",
        shopId: shopId,
        shopDomain: "dev-test.myshopify.com"
      }
    });

    console.log("✅ Utilisateur admin créé:", adminUser.email, "ID:", adminUser.id);

    // Créer des catégories par défaut
    const categories = [
      { name: "Tech", color: "bg-blue-500", description: "Technologie", order: 1 },
      { name: "General", color: "bg-gray-500", description: "Discussion générale", order: 2 }
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: {
          shopId_name: {
            shopId: shopId,
            name: category.name
          }
        },
        update: {},
        create: {
          ...category,
          shopId: shopId
        }
      });
    }

    console.log("✅ Catégories créées");

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createDevShop();