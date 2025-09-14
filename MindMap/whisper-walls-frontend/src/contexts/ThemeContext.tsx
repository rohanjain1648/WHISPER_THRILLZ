import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { emotionalThemes, EmotionalTheme, getThemeForMood, generateThemeCSS } from '../styles/designSystem';

interface ThemeContextType {
  currentTheme: EmotionalTheme;
  themeName: string;
  setTheme: (themeName: keyof typeof emotionalThemes) => void;
  setThemeFromMood: (dominantEmotion: string, sentiment: number) => void;
  availableThemes: typeof emotionalThemes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: keyof typeof emotionalThemes;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'neutral'
}) => {
  const [themeName, setThemeName] = useState<keyof typeof emotionalThemes>(defaultTheme);
  const [currentTheme, setCurrentTheme] = useState<EmotionalTheme>(emotionalThemes[defaultTheme]);

  // Update theme when themeName changes
  useEffect(() => {
    const theme = emotionalThemes[themeName];
    setCurrentTheme(theme);
    
    // Apply theme CSS custom properties to document root
    const root = document.documentElement;
    const themeCSS = generateThemeCSS(theme);
    
    // Parse CSS and apply as custom properties
    const cssLines = themeCSS.split('\n').filter(line => line.trim());
    cssLines.forEach(line => {
      const match = line.match(/--([^:]+):\s*([^;]+);?/);
      if (match) {
        const [, property, value] = match;
        root.style.setProperty(`--${property.trim()}`, value.trim());
      }
    });

    // Also apply theme class to body for global styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeName}`);
  }, [themeName]);

  const setTheme = (newThemeName: keyof typeof emotionalThemes) => {
    setThemeName(newThemeName);
  };

  const setThemeFromMood = (dominantEmotion: string, sentiment: number) => {
    const moodTheme = getThemeForMood(dominantEmotion, sentiment);
    
    // Find the theme name that matches this theme
    const matchingThemeName = Object.entries(emotionalThemes).find(
      ([_, theme]) => theme.name === moodTheme.name
    )?.[0] as keyof typeof emotionalThemes;

    if (matchingThemeName) {
      setTheme(matchingThemeName);
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    themeName,
    setTheme,
    setThemeFromMood,
    availableThemes: emotionalThemes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for getting theme-aware styles
export const useThemeStyles = () => {
  const { currentTheme } = useTheme();

  return {
    // Common style generators
    primaryButton: {
      background: currentTheme.gradients.primary,
      boxShadow: currentTheme.shadows.medium,
      color: 'white'
    },
    
    secondaryButton: {
      background: currentTheme.gradients.secondary,
      boxShadow: currentTheme.shadows.soft,
      color: 'white'
    },
    
    card: {
      backgroundColor: currentTheme.colors.surface,
      boxShadow: currentTheme.shadows.soft,
      borderColor: currentTheme.colors.border
    },
    
    cardElevated: {
      backgroundColor: currentTheme.colors.surface,
      boxShadow: currentTheme.shadows.medium,
      borderColor: currentTheme.colors.border
    },
    
    input: {
      backgroundColor: currentTheme.colors.background,
      borderColor: currentTheme.colors.border,
      color: currentTheme.colors.text
    },
    
    text: {
      color: currentTheme.colors.text
    },
    
    textSecondary: {
      color: currentTheme.colors.textSecondary
    },
    
    surface: {
      backgroundColor: currentTheme.colors.surface
    },
    
    background: {
      backgroundColor: currentTheme.colors.background
    }
  };
};