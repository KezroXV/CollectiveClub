"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface ThemeColors {
  Posts: string;
  Bordures: string;
  Fond: string;
  Police: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  selectedFont: string;
  coverImageUrl: string | null;
  bannerImageUrl: string;
  updateTheme: (colors: ThemeColors, font: string, coverImage?: string | null, bannerImage?: string) => void;
  loadUserTheme: (userId: string) => Promise<void>;
}

const defaultTheme: ThemeColors = {
  Posts: "#3B82F6",
  Bordures: "#E5E7EB",
  Fond: "#F9FAFB",
  Police: "#111827",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(defaultTheme);
  const [selectedFont, setSelectedFont] = useState("Helvetica");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string>("/Bannière.svg");

  const updateTheme = (newColors: ThemeColors, font: string, coverImage?: string | null, bannerImage?: string) => {
    setColors(newColors);
    setSelectedFont(font);
    if (coverImage !== undefined) {
      setCoverImageUrl(coverImage);
    }
    if (bannerImage !== undefined) {
      setBannerImageUrl(bannerImage);
    }
  };

  const loadUserTheme = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/customization?userId=${userId}`);
      if (response.ok) {
        const settings = await response.json();
        setColors({
          Posts: settings.colorPosts,
          Bordures: settings.colorBorders,
          Fond: settings.colorBg,
          Police: settings.colorText,
        });
        setSelectedFont(settings.selectedFont);
        setCoverImageUrl(settings.coverImageUrl);
        setBannerImageUrl(settings.bannerImageUrl || "/Bannière.svg");
      }
    } catch (error) {
      console.error("Erreur lors du chargement du thème:", error);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        colors,
        selectedFont,
        coverImageUrl,
        bannerImageUrl,
        updateTheme,
        loadUserTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}