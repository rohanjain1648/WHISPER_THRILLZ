import React from 'react';
import { emotionalThemes, EmotionalTheme } from '../../styles/designSystem';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: keyof typeof emotionalThemes;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  theme = 'neutral',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = 'lg',
  className = '',
  disabled,
  ...props
}) => {
  const currentTheme = emotionalThemes[theme];

  const baseClasses = [
    'inline-flex items-center justify-center font-medium transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'transform hover:scale-105 active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
  ];

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
    xl: 'px-8 py-4 text-xl gap-3'
  };

  // Rounded classes
  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  // Variant classes based on theme
  const getVariantClasses = (variant: string, theme: EmotionalTheme) => {
    switch (variant) {
      case 'primary':
        return [
          'text-white shadow-lg',
          `bg-gradient-to-r from-[${theme.colors.primary}] to-[${theme.colors.secondary}]`,
          `hover:shadow-xl focus:ring-[${theme.colors.primary}]`,
          `hover:from-[${theme.colors.secondary}] hover:to-[${theme.colors.primary}]`
        ];
      case 'secondary':
        return [
          'text-white shadow-md',
          `bg-gradient-to-r from-[${theme.colors.secondary}] to-[${theme.colors.accent}]`,
          `hover:shadow-lg focus:ring-[${theme.colors.secondary}]`
        ];
      case 'accent':
        return [
          `text-[${theme.colors.text}] shadow-sm`,
          `bg-[${theme.colors.accent}] hover:bg-[${theme.colors.secondary}]`,
          `focus:ring-[${theme.colors.accent}]`
        ];
      case 'ghost':
        return [
          `text-[${theme.colors.primary}] hover:text-[${theme.colors.secondary}]`,
          `hover:bg-[${theme.colors.surface}] focus:ring-[${theme.colors.primary}]`
        ];
      case 'outline':
        return [
          `text-[${theme.colors.primary}] border-2 border-[${theme.colors.primary}]`,
          `hover:bg-[${theme.colors.primary}] hover:text-white`,
          `focus:ring-[${theme.colors.primary}]`
        ];
      default:
        return [];
    }
  };

  const variantClasses = getVariantClasses(variant, currentTheme);

  const allClasses = [
    ...baseClasses,
    sizeClasses[size],
    roundedClasses[rounded],
    ...variantClasses,
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={allClasses}
      disabled={disabled || isLoading}
      style={{
        background: variant === 'primary' ? currentTheme.gradients.primary : 
                   variant === 'secondary' ? currentTheme.gradients.secondary : undefined,
        boxShadow: variant === 'primary' ? currentTheme.shadows.medium : 
                  variant === 'secondary' ? currentTheme.shadows.soft : undefined
      }}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};