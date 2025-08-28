import { NextRequest, NextResponse } from "next/server";
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/node";

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: [
    "read_customers",
    "write_customers",
    "read_content",
    "write_content",
  ],
  hostName: process.env.HOST!.replace(/https?:\/\//, ""),
  apiVersion: ApiVersion.October24, // ✅ Correction ici
  isEmbeddedApp: true,
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");

  if (!shop) {
    return NextResponse.json(
      { error: "Shop parameter required" },
      { status: 400 }
    );
  }

  try {
    // ✅ Correction de la syntaxe
    const authRoute = await shopify.auth.begin({
      shop: shop,
      callbackPath: "/api/auth/callback",
      isOnline: false,
      rawRequest: request,
    });

    return NextResponse.redirect(authRoute);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
