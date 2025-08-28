/**
 * Hiérarchie typographique premium
 * Scale harmonieuse basée sur le ratio typographique
 */

// Type scale basé sur le ratio majeur tiers (1.25)
export const FONT_SIZES = {
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px
  base: '1rem',       // 16px
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem',      // 48px
  '6xl': '3.75rem',   // 60px
  '7xl': '4.5rem',    // 72px
  '8xl': '6rem',      // 96px
  '9xl': '8rem',      // 128px
} as const;

// Line heights correspondants pour chaque taille
export const LINE_HEIGHTS = {
  xs: '1rem',         // 16px
  sm: '1.25rem',      // 20px
  base: '1.5rem',     // 24px
  lg: '1.75rem',      // 28px
  xl: '1.75rem',      // 28px
  '2xl': '2rem',      // 32px
  '3xl': '2.25rem',   // 36px
  '4xl': '2.5rem',    // 40px
  '5xl': '1',         // 1
  '6xl': '1',         // 1
  '7xl': '1',         // 1
  '8xl': '1',         // 1
  '9xl': '1',         // 1
} as const;

// Poids de police sémantiques
export const FONT_WEIGHTS = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// Classes typographiques préconçues
export const TYPOGRAPHY_CLASSES = {
  // Headings
  h1: 'text-4xl font-bold leading-tight tracking-tight sm:text-5xl',
  h2: 'text-3xl font-bold leading-tight tracking-tight sm:text-4xl',
  h3: 'text-2xl font-semibold leading-tight tracking-tight sm:text-3xl',
  h4: 'text-xl font-semibold leading-snug tracking-tight sm:text-2xl',
  h5: 'text-lg font-semibold leading-snug tracking-tight sm:text-xl',
  h6: 'text-base font-semibold leading-snug tracking-tight sm:text-lg',
  
  // Body text
  'body-lg': 'text-lg leading-relaxed',
  'body-base': 'text-base leading-relaxed',
  'body-sm': 'text-sm leading-relaxed',
  
  // UI text
  'ui-lg': 'text-lg leading-normal',
  'ui-base': 'text-base leading-normal',
  'ui-sm': 'text-sm leading-normal',
  'ui-xs': 'text-xs leading-normal',
  
  // Special text
  caption: 'text-xs leading-normal text-muted-foreground',
  overline: 'text-xs leading-normal font-medium uppercase tracking-widest',
  label: 'text-sm leading-none font-medium',
  
  // Interactive elements
  button: 'text-sm font-medium leading-none',
  'button-sm': 'text-xs font-medium leading-none',
  'button-lg': 'text-base font-medium leading-none',
  
  link: 'text-sm font-medium underline-offset-4 hover:underline',
  
  // Display text
  display: 'text-6xl font-black leading-none tracking-tight sm:text-7xl lg:text-8xl',
  'display-sm': 'text-4xl font-black leading-none tracking-tight sm:text-5xl lg:text-6xl',
  
  // Code text
  code: 'font-mono text-sm',
  'code-sm': 'font-mono text-xs',
} as const;

// Responsive typography utilities
export const RESPONSIVE_TYPOGRAPHY = {
  // Responsive headings
  hero: 'text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl',
  title: 'text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl',
  subtitle: 'text-lg font-semibold leading-normal sm:text-xl md:text-2xl',
  
  // Responsive body
  lead: 'text-lg leading-relaxed sm:text-xl',
  body: 'text-base leading-relaxed sm:text-lg',
  small: 'text-sm leading-relaxed sm:text-base',
} as const;

// Letter spacing (tracking) values
export const LETTER_SPACING = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// Typography tokens pour design system
export const TYPOGRAPHY_TOKENS = {
  // Font families (à adapter selon les fonts utilisées)
  fontFamily: {
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },
  
  // Semantic sizing
  sizes: {
    xs: { fontSize: FONT_SIZES.xs, lineHeight: LINE_HEIGHTS.xs },
    sm: { fontSize: FONT_SIZES.sm, lineHeight: LINE_HEIGHTS.sm },
    base: { fontSize: FONT_SIZES.base, lineHeight: LINE_HEIGHTS.base },
    lg: { fontSize: FONT_SIZES.lg, lineHeight: LINE_HEIGHTS.lg },
    xl: { fontSize: FONT_SIZES.xl, lineHeight: LINE_HEIGHTS.xl },
    '2xl': { fontSize: FONT_SIZES['2xl'], lineHeight: LINE_HEIGHTS['2xl'] },
    '3xl': { fontSize: FONT_SIZES['3xl'], lineHeight: LINE_HEIGHTS['3xl'] },
    '4xl': { fontSize: FONT_SIZES['4xl'], lineHeight: LINE_HEIGHTS['4xl'] },
  },
  
  // Weights avec sémantique
  weights: {
    body: FONT_WEIGHTS.normal,
    heading: FONT_WEIGHTS.semibold,
    strong: FONT_WEIGHTS.bold,
    ui: FONT_WEIGHTS.medium,
  },
} as const;

// Fonctions helper
export const createTypographyClass = (
  size: keyof typeof FONT_SIZES,
  weight: keyof typeof FONT_WEIGHTS,
  lineHeight?: keyof typeof LINE_HEIGHTS
) => {
  const sizeClass = `text-${size}`;
  const weightClass = `font-${weight}`;
  const leadingClass = lineHeight ? `leading-${lineHeight}` : '';
  
  return [sizeClass, weightClass, leadingClass].filter(Boolean).join(' ');
};