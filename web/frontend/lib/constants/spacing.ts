/**
 * Scale d'espacement mathématique premium
 * Basé sur une progression géométrique pour un rythme visuel cohérent
 */

// Base scale suivant la suite géométrique (1.618 - golden ratio)
export const SPACING_SCALE = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
  36: '9rem',        // 144px
  40: '10rem',       // 160px
  44: '11rem',       // 176px
  48: '12rem',       // 192px
  52: '13rem',       // 208px
  56: '14rem',       // 224px
  60: '15rem',       // 240px
  64: '16rem',       // 256px
  72: '18rem',       // 288px
  80: '20rem',       // 320px
  96: '24rem',       // 384px
} as const;

// Espacements spécifiques aux composants
export const COMPONENT_SPACING = {
  // Boutons
  button: {
    paddingX: {
      sm: 'px-3',
      md: 'px-4',
      lg: 'px-6',
      xl: 'px-8',
    },
    paddingY: {
      sm: 'py-1.5',
      md: 'py-2',
      lg: 'py-2.5',
      xl: 'py-3',
    },
    gap: {
      sm: 'gap-1.5',
      md: 'gap-2',
      lg: 'gap-2.5',
    },
  },
  
  // Cards
  card: {
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    },
    gap: {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
  },
  
  // Input fields
  input: {
    padding: {
      sm: 'px-2.5 py-1.5',
      md: 'px-3 py-2',
      lg: 'px-4 py-3',
    },
  },
  
  // Dialogs/Modals
  dialog: {
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    gap: 'gap-4',
  },
  
  // Navigation
  nav: {
    itemGap: 'gap-1',
    sectionGap: 'gap-6',
    padding: 'px-4 py-2',
  },
  
  // Lists
  list: {
    itemGap: 'gap-2',
    sectionGap: 'gap-4',
  },
  
  // Grids
  grid: {
    gap: {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    },
  },
} as const;

// Marges et paddings sémantiques
export const SEMANTIC_SPACING = {
  // Layout sections
  section: {
    paddingY: 'py-16',
    paddingX: 'px-4',
    gap: 'gap-12',
  },
  
  // Content blocks
  content: {
    maxWidth: 'max-w-4xl',
    paddingY: 'py-8',
    gap: 'gap-6',
  },
  
  // Forms
  form: {
    fieldGap: 'gap-4',
    sectionGap: 'gap-8',
    submitGap: 'gap-6',
  },
  
  // Headers
  header: {
    paddingY: 'py-4',
    paddingX: 'px-4',
  },
  
  // Footers
  footer: {
    paddingY: 'py-8',
    paddingX: 'px-4',
  },
} as const;

// Responsive spacing utilities
export const RESPONSIVE_SPACING = {
  // Mobile first approach
  container: {
    padding: 'px-4 sm:px-6 lg:px-8',
    margin: 'mx-auto',
  },
  
  section: {
    paddingY: 'py-8 sm:py-12 lg:py-16',
    marginY: 'my-8 sm:my-12 lg:my-16',
  },
  
  gap: {
    sm: 'gap-2 sm:gap-3 lg:gap-4',
    md: 'gap-4 sm:gap-6 lg:gap-8',
    lg: 'gap-6 sm:gap-8 lg:gap-12',
  },
} as const;

// Fonctions helper pour spacing dynamique
export const getSpacing = (size: keyof typeof SPACING_SCALE) => {
  return SPACING_SCALE[size];
};

export const createResponsiveSpacing = (mobile: string, tablet: string, desktop: string) => {
  return `${mobile} sm:${tablet} lg:${desktop}`;
};