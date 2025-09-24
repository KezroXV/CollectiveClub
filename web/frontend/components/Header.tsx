"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { signOut } from "next-auth/react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Header() {
  const { currentUser, isAdmin, isModerator } = useCurrentUser();
  const { colors } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const pathname = usePathname();

  // Vérifier si l'utilisateur est admin ou modérateur
  const isAdminOrMod = isAdmin || isModerator;

  const navigation = [
    { name: "Accueil", href: "/", current: pathname === "/" },
    { name: "Post", href: "/community", current: pathname === "/community" },
    // Dashboard visible uniquement pour les admins et modérateurs
    ...(isAdminOrMod
      ? [
          {
            name: "Dashboard",
            href: "/dashboard",
            current: pathname === "/dashboard",
          },
        ]
      : []),
    { name: "Profil", href: "/profile", current: pathname === "/profile" },
  ];

  return (
    <header
      className="hover:shadow-sm border-b"
      style={{
        backgroundColor: colors.Fond,
      }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 sm:w-8 h-7 sm:h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">C</span>
            </div>
            <span
              className="font-semibold text-base sm:text-lg"
              style={{ color: colors.Police }}
            >
              Collective Club
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={item.current ? "default" : "ghost"}
                  className="px-3 sm:px-4 py-2 rounded-full text-sm"
                  style={{
                    backgroundColor: item.current
                      ? `${colors.Posts}20`
                      : "transparent",
                    color: item.current ? colors.Posts : colors.Police,
                  }}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* Menu Mobile */}
            <button
              className="md:hidden p-2"
              onClick={() => setShowMenu(!showMenu)}
            >
              {showMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Avatar */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100"
                >
                  <Avatar className="h-7 sm:h-8 w-7 sm:w-8">
                    {currentUser.image && (
                      <AvatarImage
                        src={currentUser.image}
                        alt={currentUser.name || "Photo de profil"}
                      />
                    )}
                    <AvatarFallback
                      className="text-white text-sm"
                      style={{ backgroundColor: colors.Posts }}
                    >
                      {currentUser.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                    style={{ border: `1px solid ${colors.Bordures}` }}
                  >
                    <div
                      className="px-4 py-2 text-sm text-gray-500 border-b"
                      style={{ borderBottomColor: colors.Bordures }}
                    >
                      {currentUser.name}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      🔧 Paramètres
                    </Link>
                    <Link
                      href="/help"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ❓ Aide
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🚪 Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Mobile */}
        {showMenu && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={item.current ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      item.current ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
