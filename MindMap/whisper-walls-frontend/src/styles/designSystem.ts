// Whisper Walls Design System
// Emotional color palettes and design tokens for romantic, heart-touching experiences

export interface EmotionalColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

export interface EmotionalTheme {
  name: string;
  colors: EmotionalColorPalette;
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  shadows: {
    soft: string;
    medium: string;
    strong: string;
    glow: string;
  };
}

// Emotional Color Palettes mapped to different moods
export const emotionalThemes: Record<string, EmotionalTheme> = {
  // Joy - Warm, bright, uplifting colors
  joy: {
    name: 'Joyful Radiance',
    colors: {
      primary: '#FFD700', // Golden yellow
      secondary: '#FF6B6B', // Coral pink
      accent: '#4ECDC4', // Turquoise
      background: '#FFFEF7', // Warm white
      surface: '#FFF9E6', // Light cream
      text: '#2D3748', // Warm dark gray
      textSecondary: '#718096', // Medium gray
      border: '#E2E8F0', // Light gray
      shadow: 'rgba(255, 215, 0, 0.15)' // Golden shadow
    },
    gradients: {
      primary: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      secondary: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
      accent: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'
    },
    shadows: {
      soft: '0 2px 8px rgba(255, 215, 0, 0.1)',
      medium: '0 4px 16px rgba(255, 215, 0, 0.15)',
      strong: '0 8px 32px rgba(255, 215, 0, 0.2)',
      glow: '0 0 20px rgba(255, 215, 0, 0.3)'
    }
  },

  // Sadness - Cool, muted, comforting colors
  sadness: {
    name: 'Gentle Melancholy',
    colors: {
      primary: '#6B73FF', // Soft blue
      secondary: '#9F7AEA', // Lavender
      accent: '#68D391', // Soft green
      background: '#F7FAFC', // Cool white
      surface: '#EDF2F7', // Light blue-gray
      text: '#2D3748', // Dark gray
      textSecondary: '#718096', // Medium gray
      border: '#CBD5E0', // Cool gray
      shadow: 'rgba(107, 115, 255, 0.15)' // Blue shadow
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6B73FF 0%, #667EEA 100%)',
      secondary: 'linear-gradient(135deg, #9F7AEA 0%, #764BA2 100%)',
      accent: 'linear-gradient(135deg, #68D391 0%, #4FD1C7 100%)'
    },
    shadows: {
      soft: '0 2px 8px rgba(107, 115, 255, 0.1)',
      medium: '0 4px 16px rgba(107, 115, 255, 0.15)',
      strong: '0 8px 32px rgba(107, 115, 255, 0.2)',
      glow: '0 0 20px rgba(107, 115, 255, 0.3)'
    }
  },

  // Love/Romance - Warm pinks, roses, and purples
  love: {
    name: 'Romantic Blush',
    colors: {
      primary: '#FF69B4', // Hot pink
      secondary: '#DA70D6', // Orchid
      accent: '#FFB6C1', // Light pink
      background: '#FFF5F8', // Soft pink white
      surface: '#FFEEF2', // Light rose
      text: '#2D3748', // Dark gray
      textSecondary: '#718096', // Medium gray
      border: '#F7FAFC', // Very light gray
      shadow: 'rgba(255, 105, 180, 0.15)' // Pink shadow
    },
    gradients: {
      primary: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)',
      secondary: 'linear-gradient(135deg, #DA70D6 0%, #BA55D3 100%)',
      accent: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)'
    },
    shadows: {
      soft: '0 2px 8px rgba(255, 105, 180, 0.1)',
      medium: '0 4px 16px rgba(255, 105, 180, 0.15)',
      strong: '0 8px 32px rgba(255, 105, 180, 0.2)',
      glow: '0 0 20px rgba(255, 105, 180, 0.3)'
    }
  },

  // Hope/Anticipation - Fresh greens and blues
  hope: {
    name: 'Hopeful Dawn',
    colors: {
      primary: '#48BB78', // Green
      secondary: '#4299E1', // Blue
      accent: '#ED8936', // Orange
      background: '#F7FAFC', // Clean white
      surface: '#EDF2F7', // Light gray
      text: '#2D3748', // Dark gray
      textSecondary: '#718096', // Medium gray
      border: '#E2E8F0', // Light gray
      shadow: 'rgba(72, 187, 120, 0.15)' // Green shadow
    },
    gradients: {
      primary: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)',
      secondary: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)',
      accent: 'linear-gradient(135deg, #ED8936 0%, #DD6B20 100%)'
    },
    shadows: {
      soft: '0 2px 8px rgba(72, 187, 120, 0.1)',
      medium: '0 4px 16px rgba(72, 187, 120, 0.15)',
      strong: '0 8px 32px rgba(72, 187, 120, 0.2)',
      glow: '0 0 20px rgba(72, 187, 120, 0.3)'
    }
  },

  // Stress/Anxiety - Calming purples and teals
  stress: {
    name: 'Calming Serenity',
    colors: {
      primary: '#805AD5', // Purple
      secondary: '#38B2AC', // Teal
      accent: '#9F7AEA', // Light purple
      background: '#FAFAFA', // Neutral white
      surface: '#F7FAFC', // Cool white
      text: '#2D3748', // Dark gray
      textSecondary: '#718096', // Medium gray
      border: '#E2E8F0', // Light gray
      shadow: 'rgba(128, 90, 213, 0.15)' // Purple shadow
    },
    gradients: {
      primary: 'linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)',
      secondary: 'linear-gradient(135deg, #38B2AC 0%, #319795 100%)',
      accent: 'linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)'
    },
    shadows: {
      soft: '0 2px 8px rgba(128, 90, 213, 0.1)',
      medium: '0 4px 16px rgba(128, 90, 213, 0.15)',
      strong: '0 8px 32px rgba(128, 90, 213, 0.2)',
      glow: '0 0 20px rgba(128, 90, 213, 0.3)'
    }
  },

  // Default/Neutral - Balanced, warm grays and soft colors
  neutral: {
    name: 'Gentle Warmth',
    colors: {
      primary: '#667EEA', // Soft blue-purple
      secondary: '#764BA2', // Muted purple
      accent: '#F093FB', // Light pink
      background: '#FFFFFF', // Pure white
      surface: '#F7FAFC', // Light gray
      text: '#2D3748', // Dark gray
      textSecondary: '#718096', // Medium gray
      border: '#E2E8F0', // Light gray
      shadow: 'rgba(102, 126, 234, 0.15)' // Soft blue shadow
    },
    gradients: {
      primary: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      secondary: 'linear-gradient(135deg, #764BA2 0%, #667EEA 100%)',
      accent: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)'
    },
    shadows: {
      soft: '0 2px 8px rgba(102, 126, 234, 0.1)',
      medium: '0 4px 16px rgba(102, 126, 234, 0.15)',
      strong: '0 8px 32px rgba(102, 126, 234, 0.2)',
      glow: '0 0 20px rgba(102, 126, 234, 0.3)'
    }
  }
};

// Typography System
export const typography = {
  fonts: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary: '"Playfair Display", Georgia, serif',
    mono: '"JetBrains Mono", "Fira Code", monospace'
  },
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },
  lineHeights: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};

// Spacing System
export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem'     // 256px
};

// Border Radius System
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

// Animation Durations
export const animations = {
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms',
    slowest: '1000ms'
  },
  easings: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Helper function to get theme based on mood
export function getThemeForMood(dominantEmotion: string, sentiment: number): EmotionalTheme {
  // Map emotions to themes
  const emotionThemeMap: Record<string, string> = {
    joy: 'joy',
    happiness: 'joy',
    excitement: 'joy',
    sadness: 'sadness',
    melancholy: 'sadness',
    grief: 'sadness',
    love: 'love',
    romance: 'love',
    affection: 'love',
    hope: 'hope',
    optimism: 'hope',
    anticipation: 'hope',
    stress: 'stress',
    anxiety: 'stress',
    worry: 'stress',
    anger: 'stress',
    fear: 'stress'
  };

  // Get theme based on emotion
  let themeName = emotionThemeMap[dominantEmotion.toLowerCase()] || 'neutral';

  // Adjust based on sentiment if needed
  if (sentiment > 0.5) {
    if (themeName === 'sadness') themeName = 'hope';
    if (themeName === 'stress') themeName = 'neutral';
  } else if (sentiment < -0.5) {
    if (themeName === 'joy') themeName = 'neutral';
    if (themeName === 'hope') themeName = 'sadness';
  }

  return emotionalThemes[themeName] || emotionalThemes.neutral;
}

// Helper function to generate CSS custom properties for a theme
export function generateThemeCSS(theme: EmotionalTheme): string {
  return `
    --color-primary: ${theme.colors.primary};
    --color-secondary: ${theme.colors.secondary};
    --color-accent: ${theme.colors.accent};
    --color-background: ${theme.colors.background};
    --color-surface: ${theme.colors.surface};
    --color-text: ${theme.colors.text};
    --color-text-secondary: ${theme.colors.textSecondary};
    --color-border: ${theme.colors.border};
    --color-shadow: ${theme.colors.shadow};
    
    --gradient-primary: ${theme.gradients.primary};
    --gradient-secondary: ${theme.gradients.secondary};
    --gradient-accent: ${theme.gradients.accent};
    
    --shadow-soft: ${theme.shadows.soft};
    --shadow-medium: ${theme.shadows.medium};
    --shadow-strong: ${theme.shadows.strong};
    --shadow-glow: ${theme.shadows.glow};
  `;
}