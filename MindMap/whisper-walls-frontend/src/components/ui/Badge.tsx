import React from 'react';
import { emotionalThemes } from '../../styles/designSystem';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  theme?: keyof typeof emotionalThemes;
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  dot?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  theme = 'neutral',
  size = 'md',
  rounded = 'full',
  dot = false,
  pulse = false,
  className = '',
  ...props
}) => {
  const currentTheme = emotionalThemes[theme];

  const baseClasses = [
    'inline-flex items-center justify-center font-medium',
    'transition-all duration-300',
    pulse ? 'animate-pulse' : ''
  ];

  // Size classes
  const sizeClasses = {
    sm: dot ? 'w-2 h-2' : 'px-2 py-1 text-xs',
    md: dot ? 'w-3 h-3' : 'px-3 py-1 text-sm',
    lg: dot ? 'w-4 h-4' : 'px-4 py-2 text-base'
  };

  // Rounded classes
  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  // Variant classes
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return [
          'text-white',
          `bg-[${currentTheme.colors.primary}]`,
          `shadow-[${currentTheme.colors.primary}]/20 shadow-md`
        ];
      case 'secondary':
        return [
          'text-white',
          `bg-[${currentTheme.colors.secondary}]`,
          `shadow-[${currentTheme.colors.secondary}]/20 shadow-md`
        ];
      case 'accent':
        return [
          `text-[${currentTheme.colors.text}]`,
          `bg-[${currentTheme.colors.accent}]`,
          'shadow-sm'
        ];
      case 'success':
        return [
          'text-white bg-green-500',
          'shadow-green-500/20 shadow-md'
        ];
      case 'warning':
        return [
          'text-white bg-yellow-500',
          'shadow-yellow-500/20 shadow-md'
        ];
      case 'error':
        return [
          'text-white bg-red-500',
          'shadow-red-500/20 shadow-md'
        ];
      default:
        return [
          `text-[${currentTheme.colors.textSecondary}]`,
          `bg-[${currentTheme.colors.surface}]`,
          `border border-[${currentTheme.colors.border}]`
        ];
    }
  };

  const variantClasses = getVariantClasses(variant);

  const allClasses = [
    ...baseClasses,
    sizeClasses[size],
    roundedClasses[rounded],
    ...variantClasses,
    className
  ].filter(Boolean).join(' ');

  if (dot) {
    return (
      <span
        className={allClasses}
        {...props}
      />
    );
  }

  return (
    <span
      className={allClasses}
      {...props}
    >
      {children}
    </span>
  );
};