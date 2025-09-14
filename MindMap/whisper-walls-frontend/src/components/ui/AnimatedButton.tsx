import React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from './Button';
import { useRomanticAnimations, useInteractionAnimations } from '../../hooks/useAnimations';
import { FloatingHearts, SparkleEffect } from '../animations/RomanticAnimations';

interface AnimatedButtonProps extends ButtonProps {
  animationType?: 'heartFlutter' | 'bloom' | 'sparkle' | 'glow' | 'none';
  particleEffect?: boolean;
  glowIntensity?: 'subtle' | 'medium' | 'strong';
  onAnimationComplete?: () => void;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  animationType = 'heartFlutter',
  particleEffect = false,
  glowIntensity = 'medium',
  onAnimationComplete,
  onClick,
  className = '',
  ...props
}) => {
  const { controls, triggerAnimation } = useRomanticAnimations();
  const { handleHover, handleClick, isHovered, isClicked } = useInteractionAnimations();
  const [showHearts, setShowHearts] = React.useState(false);
  const [showSparkles, setShowSparkles] = React.useState(false);
  const buttonId = React.useId();

  const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    handleClick(buttonId);
    
    if (animationType !== 'none') {
      await triggerAnimation(animationType);
    }
    
    if (particleEffect) {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 100);
    }
    
    onAnimationComplete?.();
    onClick?.(e);
  };

  const handleMouseEnter = () => {
    handleHover(buttonId, true);
    if (animationType === 'sparkle') {
      setShowSparkles(true);
    }
  };

  const handleMouseLeave = () => {
    handleHover(buttonId, false);
    setShowSparkles(false);
  };

  const getGlowStyles = () => {
    const intensityMap = {
      subtle: '0 0 10px',
      medium: '0 0 20px', 
      strong: '0 0 30px'
    };
    
    return {
      filter: isHovered(buttonId) 
        ? `drop-shadow(${intensityMap[glowIntensity]} currentColor)`
        : 'none'
    };
  };

  return (
    <div className="relative">
      <motion.div
        animate={controls}
        style={getGlowStyles()}
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        whileTap={{
          scale: 0.95,
          transition: { duration: 0.1 }
        }}
      >
        <Button
          {...props}
          className={`relative overflow-hidden ${className}`}
          onClick={handleButtonClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
          
          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
            animate={{
              x: isHovered(buttonId) ? ['-100%', '100%'] : '-100%',
              opacity: isHovered(buttonId) ? [0, 0.3, 0] : 0
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut"
            }}
          />
          
          {/* Sparkle effect */}
          {showSparkles && (
            <SparkleEffect count={3} className="absolute inset-0" />
          )}
        </Button>
      </motion.div>
      
      {/* Floating hearts effect */}
      <FloatingHearts
        trigger={showHearts}
        onComplete={() => setShowHearts(false)}
        count={3}
      />
    </div>
  );
};