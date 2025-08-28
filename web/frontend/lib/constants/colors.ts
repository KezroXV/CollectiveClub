/**
 * Palette de couleurs premium basée sur les CSS variables shadcn
 * Extends les couleurs existantes avec variants premium
 */

export const PREMIUM_COLORS = {
  // Extensions des couleurs shadcn primary
  primary: {
    50: 'hsl(var(--primary) / 0.05)',
    100: 'hsl(var(--primary) / 0.1)',
    200: 'hsl(var(--primary) / 0.2)',
    300: 'hsl(var(--primary) / 0.3)',
    400: 'hsl(var(--primary) / 0.4)',
    500: 'hsl(var(--primary))',
    600: 'hsl(var(--primary) / 0.9)',
    700: 'hsl(var(--primary) / 0.8)',
    800: 'hsl(var(--primary) / 0.7)',
    900: 'hsl(var(--primary) / 0.6)',
  },
  
  // States colors basés sur shadcn
  success: {
    light: 'hsl(120, 100%, 97%)',
    base: 'hsl(120, 84%, 45%)',
    dark: 'hsl(120, 84%, 35%)',
  },
  
  warning: {
    light: 'hsl(45, 100%, 97%)',
    base: 'hsl(45, 84%, 55%)',
    dark: 'hsl(45, 84%, 45%)',
  },
  
  info: {
    light: 'hsl(210, 100%, 97%)',
    base: 'hsl(210, 84%, 55%)',
    dark: 'hsl(210, 84%, 45%)',
  },
  
  // Gradients premium
  gradients: {
    primary: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
    secondary: 'linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--secondary) / 0.8) 100%)',
    accent: 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--accent) / 0.8) 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },
  
  // Shadows premium
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    premium: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    glow: '0 0 20px rgba(var(--primary), 0.3)',
  },
  
  // Ring colors pour focus states
  rings: {
    primary: 'ring-primary/20',
    secondary: 'ring-secondary/20',
    destructive: 'ring-destructive/20',
    success: 'ring-green-500/20',
    warning: 'ring-yellow-500/20',
    info: 'ring-blue-500/20',
  },
} as const;

// Classes Tailwind personnalisées pour couleurs
export const COLOR_CLASSES = {
  // Backgrounds avec opacité
  bg: {
    'primary-subtle': 'bg-primary/5',
    'primary-muted': 'bg-primary/10',
    'secondary-subtle': 'bg-secondary/5',
    'secondary-muted': 'bg-secondary/10',
    'accent-subtle': 'bg-accent/5',
    'accent-muted': 'bg-accent/10',
    'glass': 'bg-white/10 backdrop-blur-sm',
  },
  
  // Borders avec variants
  border: {
    'primary-subtle': 'border-primary/20',
    'primary-muted': 'border-primary/30',
    'secondary-subtle': 'border-secondary/20',
    'accent-subtle': 'border-accent/20',
  },
  
  // Text colors avec états
  text: {
    'primary-subtle': 'text-primary/80',
    'secondary-subtle': 'text-secondary/80',
    'muted-subtle': 'text-muted-foreground/60',
  },
} as const;

// Fonction helper pour créer des variants de couleur
export const createColorVariant = (color: string, opacity: number) => {
  return `hsl(var(--${color}) / ${opacity})`;
};

// Fonction pour obtenir une couleur avec opacité
export const getColorWithOpacity = (colorVar: string, opacity: number) => {
  return `hsl(var(--${colorVar}) / ${opacity})`;
};