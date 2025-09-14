import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardProps } from './Card';
import { useInteractionAnimations } from '../../hooks/useAnimations';
import { RomanticGlow, SparkleEffect } from '../animations/RomanticAnimations';

interface AnimatedCardProps extends CardProps {
  animationType?: 'float' | 'tilt' | 'glow' | 'pulse' | 'none';
  hoverEffect?: boolean;
  glowColor?: string;
  sparkleOnHover?: boolean;
  entranceAnimation?: 'fadeIn' | 'slideUp' | 'bloom' | 'butterfly';
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  animationType = 'float',
  hoverEffect = true,
  glowColor = '#FF69B4',
  sparkleOnHover = false,
  entranceAnimation = 'fadeIn',
  delay = 0,
  className = '',
  ...props
}) => {
  const { handleHover, isHovered } = useInteractionAnimations();
  const cardId = React.useId();

  const getEntranceVariants = () => {
    const variants = {
      fadeIn: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      },
      slideUp: {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 }
      },
      bloom: {
        initial: { opacity: 0, scale: 0, rotate: -180 },
        animate: { opacity: 1, scale: 1, rotate: 0 }
      },
      butterfly: {
        initial: { opacity: 0, scale: 0.8, rotateY: -90 },
        animate: { opacity: 1, scale: 1, rotateY: 0 }
      }
    };
    return variants[entranceAnimation];
  };

  const getAnimationVariants = () => {
    const variants = {
      float: {
        animate: {
          y: [0, -5, 0],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      },
      tilt: {
        animate: {
          rotate: [0, 1, -1, 0],
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      },
      glow: {
        animate: {
          boxShadow: [
            `0 0 20px ${glowColor}40`,
            `0 0 30px ${glowColor}60`,
            `0 0 20px ${glowColor}40`
          ],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      },
      pulse: {
        animate: {
          scale: [1, 1.02, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      },
      none: {}
    };
    return variants[animationType];
  };

  const hoverVariants = {
    whileHover: hoverEffect ? {
      scale: 1.03,
      y: -8,
      boxShadow: `0 15px 35px ${glowColor}30`,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    } : {},
    whileTap: hoverEffect ? {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    } : {}
  };

  const entranceVariants = getEntranceVariants();
  const animationVariants = getAnimationVariants();

  return (
    <motion.div
      className="relative"
      initial={entranceVariants.initial}
      animate={entranceVariants.animate}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.175, 0.885, 0.32, 1.275]
      }}
      onMouseEnter={() => handleHover(cardId, true)}
      onMouseLeave={() => handleHover(cardId, false)}
    >
      <motion.div
        variants={animationVariants}
        animate="animate"
        {...hoverVariants}
      >
        <Card
          {...props}
          className={`relative overflow-hidden ${className}`}
        >
          {children}
          
          {/* Sparkle effect on hover */}
          {sparkleOnHover && isHovered(cardId) && (
            <SparkleEffect count={5} className="absolute inset-0" />
          )}
          
          {/* Subtle shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 pointer-events-none"
            animate={{
              x: isHovered(cardId) ? ['-100%', '100%'] : '-100%',
              opacity: isHovered(cardId) ? [0, 0.1, 0] : 0
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut"
            }}
          />
        </Card>
      </motion.div>
      
      {/* Romantic glow wrapper */}
      {animationType === 'glow' && (
        <RomanticGlow color={glowColor} intensity="medium">
          <div className="absolute inset-0 pointer-events-none" />
        </RomanticGlow>
      )}
    </motion.div>
  );
};