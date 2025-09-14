import React from 'react';
import { emotionalThemes } from '../../styles/designSystem';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
  theme?: keyof typeof emotionalThemes;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  hover?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  theme = 'neutral',
  padding = 'md',
  rounded = 'xl',
  hover = false,
  glow = false,
  className = '',
  ...props
}) => {
  const currentTheme = emotionalThemes[theme];

  const baseClasses = [
    'transition-all duration-300',
    hover ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer' : '',
    glow ? 'hover:shadow-2xl' : ''
  ];

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  // Rounded classes
  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl'
  };

  // Variant classes
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'elevated':
        return [
          `bg-[${currentTheme.colors.surface}]`,
          'shadow-lg border border-opacity-20',
          `border-[${currentTheme.colors.border}]`
        ];
      case 'outlined':
        return [
          `bg-[${currentTheme.colors.background}]`,
          `border-2 border-[${currentTheme.colors.border}]`
        ];
      case 'glass':
        return [
          'bg-white bg-opacity-20 backdrop-blur-md',
          `border border-[${currentTheme.colors.border}] border-opacity-30`,
          'shadow-xl'
        ];
      case 'gradient':
        return [
          'text-white shadow-xl',
          `border border-[${currentTheme.colors.border}] border-opacity-20`
        ];
      default:
        return [
          `bg-[${currentTheme.colors.surface}]`,
          'shadow-md',
          `border border-[${currentTheme.colors.border}] border-opacity-50`
        ];
    }
  };

  const variantClasses = getVariantClasses(variant);

  const allClasses = [
    ...baseClasses,
    paddingClasses[padding],
    roundedClasses[rounded],
    ...variantClasses,
    className
  ].filter(Boolean).join(' ');

  const cardStyle = variant === 'gradient' ? {
    background: currentTheme.gradients.primary,
    boxShadow: glow ? currentTheme.shadows.glow : currentTheme.shadows.medium
  } : {
    backgroundColor: variant === 'glass' ? 'rgba(255, 255, 255, 0.1)' : currentTheme.colors.surface,
    boxShadow: glow ? currentTheme.shadows.glow : currentTheme.shadows.soft
  };

  return (
    <div
      className={allClasses}
      style={cardStyle}
      {...props}
    >
      {children}
    </div>
  );
};