import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../styles/designSystem';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';
  component?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  color?: 'primary' | 'secondary' | 'text' | 'textSecondary' | 'accent' | 'inherit';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: keyof typeof typography.weights;
  font?: 'primary' | 'secondary' | 'mono';
  gradient?: boolean;
  glow?: boolean;
  truncate?: boolean;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  component,
  color = 'text',
  align = 'left',
  weight,
  font = 'primary',
  gradient = false,
  glow = false,
  truncate = false,
  className = '',
  style,
  ...props
}) => {
  const { currentTheme } = useTheme();

  // Determine the HTML element to render
  const getComponent = () => {
    if (component) return component;
    
    switch (variant) {
      case 'h1': return 'h1';
      case 'h2': return 'h2';
      case 'h3': return 'h3';
      case 'h4': return 'h4';
      case 'h5': return 'h5';
      case 'h6': return 'h6';
      case 'caption':
      case 'overline': return 'span';
      default: return 'p';
    }
  };

  // Get variant styles
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: typography.sizes['5xl'],
          fontWeight: typography.weights.bold,
          lineHeight: typography.lineHeights.tight,
          letterSpacing: typography.letterSpacing.tight
        };
      case 'h2':
        return {
          fontSize: typography.sizes['4xl'],
          fontWeight: typography.weights.bold,
          lineHeight: typography.lineHeights.tight,
          letterSpacing: typography.letterSpacing.tight
        };
      case 'h3':
        return {
          fontSize: typography.sizes['3xl'],
          fontWeight: typography.weights.semibold,
          lineHeight: typography.lineHeights.snug,
          letterSpacing: typography.letterSpacing.normal
        };
      case 'h4':
        return {
          fontSize: typography.sizes['2xl'],
          fontWeight: typography.weights.semibold,
          lineHeight: typography.lineHeights.snug,
          letterSpacing: typography.letterSpacing.normal
        };
      case 'h5':
        return {
          fontSize: typography.sizes.xl,
          fontWeight: typography.weights.medium,
          lineHeight: typography.lineHeights.normal,
          letterSpacing: typography.letterSpacing.normal
        };
      case 'h6':
        return {
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.medium,
          lineHeight: typography.lineHeights.normal,
          letterSpacing: typography.letterSpacing.normal
        };
      case 'body1':
        return {
          fontSize: typography.sizes.base,
          fontWeight: typography.weights.normal,
          lineHeight: typography.lineHeights.relaxed,
          letterSpacing: typography.letterSpacing.normal
        };
      case 'body2':
        return {
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.normal,
          lineHeight: typography.lineHeights.normal,
          letterSpacing: typography.letterSpacing.normal
        };
      case 'caption':
        return {
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.normal,
          lineHeight: typography.lineHeights.normal,
          letterSpacing: typography.letterSpacing.wide
        };
      case 'overline':
        return {
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.medium,
          lineHeight: typography.lineHeights.normal,
          letterSpacing: typography.letterSpacing.widest,
          textTransform: 'uppercase' as const
        };
      default:
        return {};
    }
  };

  // Get color styles
  const getColorStyles = (color: string) => {
    switch (color) {
      case 'primary':
        return { color: currentTheme.colors.primary };
      case 'secondary':
        return { color: currentTheme.colors.secondary };
      case 'accent':
        return { color: currentTheme.colors.accent };
      case 'textSecondary':
        return { color: currentTheme.colors.textSecondary };
      case 'inherit':
        return { color: 'inherit' };
      default:
        return { color: currentTheme.colors.text };
    }
  };

  // Get font family
  const getFontFamily = (font: string) => {
    switch (font) {
      case 'secondary':
        return typography.fonts.secondary;
      case 'mono':
        return typography.fonts.mono;
      default:
        return typography.fonts.primary;
    }
  };

  // Build classes
  const classes = [
    // Alignment
    align === 'center' ? 'text-center' : '',
    align === 'right' ? 'text-right' : '',
    align === 'justify' ? 'text-justify' : '',
    
    // Gradient text
    gradient ? 'bg-gradient-to-r bg-clip-text text-transparent' : '',
    
    // Glow effect
    glow ? 'drop-shadow-lg' : '',
    
    // Truncate
    truncate ? 'truncate' : '',
    
    className
  ].filter(Boolean).join(' ');

  // Build styles
  const variantStyles = getVariantStyles(variant);
  const colorStyles = gradient ? {} : getColorStyles(color);
  const fontFamily = getFontFamily(font);
  const fontWeight = weight ? typography.weights[weight] : variantStyles.fontWeight;

  const combinedStyles = {
    ...variantStyles,
    ...colorStyles,
    fontFamily,
    fontWeight,
    ...(gradient && {
      backgroundImage: currentTheme.gradients.primary,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    }),
    ...(glow && {
      textShadow: `0 0 20px ${currentTheme.colors.primary}40`
    }),
    ...style
  };

  const Component = getComponent();

  return (
    <Component
      className={classes}
      style={combinedStyles}
      {...props}
    >
      {children}
    </Component>
  );
};

// Convenience components for common typography patterns
export const Heading: React.FC<Omit<TypographyProps, 'variant'> & { level: 1 | 2 | 3 | 4 | 5 | 6 }> = ({
  level,
  ...props
}) => {
  const variant = `h${level}` as TypographyProps['variant'];
  return <Typography variant={variant} {...props} />;
};

export const Text: React.FC<Omit<TypographyProps, 'variant'> & { size?: 'sm' | 'base' | 'lg' }> = ({
  size = 'base',
  ...props
}) => {
  const variant = size === 'sm' ? 'body2' : 'body1';
  return <Typography variant={variant} {...props} />;
};

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => {
  return <Typography variant="caption" color="textSecondary" {...props} />;
};

export const Overline: React.FC<Omit<TypographyProps, 'variant'>> = (props) => {
  return <Typography variant="overline" color="textSecondary" {...props} />;
};