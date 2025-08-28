import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Vérifier si on a un paramètre shop dans l'URL
  const shopParam = request.nextUrl.searchParams.get('shop');
  
  if (shopParam) {
    // Définir un cookie avec le shopDomain pour les futures requêtes
    response.cookies.set('shopDomain', shopParam, {
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      httpOnly: false, // Accessible côté client aussi
      sameSite: 'lax',
      path: '/'
    });
    
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};