import React, { forwardRef } from 'react';
import { emotionalThemes } from '../../styles/designSystem';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  theme?: keyof typeof emotionalThemes;
  variant?: 'default' | 'filled' | 'outlined' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  theme = 'neutral',
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  error = false,
  helperText,
  label,
  className = '',
  ...props
}, ref) => {
  const currentTheme = emotionalThemes[theme];

  const baseClasses = [
    'transition-all duration-300 focus:outline-none',
    'placeholder-gray-400'
  ];

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  // Variant classes
  const getVariantClasses = (variant: string, hasError: boolean) => {
    const errorClasses = hasError ? [
      'border-red-500 focus:border-red-500 focus:ring-red-500'
    ] : [
      `border-[${currentTheme.colors.border}]`,
      `focus:border-[${currentTheme.colors.primary}]`,
      `focus:ring-[${currentTheme.colors.primary}]`
    ];

    switch (variant) {
      case 'filled':
        return [
          `bg-[${currentTheme.colors.surface}]`,
          'border-2 border-transparent rounded-lg',
          'focus:ring-2 focus:ring-opacity-50',
          ...errorClasses
        ];
      case 'outlined':
        return [
          `bg-[${currentTheme.colors.background}]`,
          'border-2 rounded-lg',
          'focus:ring-2 focus:ring-opacity-50',
          ...errorClasses
        ];
      case 'underlined':
        return [
          `bg-transparent border-b-2 border-t-0 border-l-0 border-r-0`,
          'rounded-none focus:ring-0',
          ...errorClasses
        ];
      default:
        return [
          `bg-[${currentTheme.colors.background}]`,
          'border rounded-lg',
          'focus:ring-2 focus:ring-opacity-50',
          ...errorClasses
        ];
    }
  };

  const variantClasses = getVariantClasses(variant, error);

  const inputClasses = [
    ...baseClasses,
    sizeClasses[size],
    ...variantClasses,
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    className
  ].filter(Boolean).join(' ');

  const inputStyle = {
    backgroundColor: variant === 'filled' ? currentTheme.colors.surface : 
                    variant === 'underlined' ? 'transparent' : currentTheme.colors.background,
    borderColor: error ? '#EF4444' : currentTheme.colors.border,
    color: currentTheme.colors.text
  };

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium mb-2 text-[${currentTheme.colors.text}]`}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`text-[${currentTheme.colors.textSecondary}]`}>
              {leftIcon}
            </span>
          </div>
        )}
        <input
          ref={ref}
          className={inputClasses}
          style={inputStyle}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={`text-[${currentTheme.colors.textSecondary}]`}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      {helperText && (
        <p className={`mt-1 text-sm ${error ? 'text-red-500' : `text-[${currentTheme.colors.textSecondary}]`}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});