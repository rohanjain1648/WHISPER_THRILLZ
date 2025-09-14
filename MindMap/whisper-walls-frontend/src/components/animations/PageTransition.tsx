import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTransitions } from '../../hooks/useAnimations';
import { ParticleSystem } from './AnimationSystem';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey: string;
  type?: 'fade' | 'slide' | 'butterfly' | 'bloom' | 'whisper';
  duration?: number;
  particles?: boolean;
  particleType?: 'hearts' | 'sparkles' | 'petals' | 'butterflies';
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionKey,
  type = 'butterfly',
  duration = 0.8,
  particles = false,
  particleType = 'butterflies',
  className = ''
}) => {
  const getTransitionVariants = () => {
    const variants = {
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      slide: {
        initial: { x: 100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -100, opacity: 0 }
      },
      butterfly: {
        initial: { 
          opacity: 0, 
          scale: 0.8, 
          rotateY: -90,
          x: -50
        },
        animate: { 
          opacity: 1, 
          scale: 1, 
          rotateY: 0,
          x: 0
        },
        exit: { 
          opacity: 0, 
          scale: 0.8, 
          rotateY: 90,
          x: 50
        }
      },
      bloom: {
        initial: { 
          opacity: 0, 
          scale: 0, 
          rotate: -180 
        },
        animate: { 
          opacity: 1, 
          scale: 1, 
          rotate: 0 
        },
        exit: { 
          opacity: 0, 
          scale: 0, 
          rotate: 180 
        }
      },
      whisper: {
        initial: { 
          opacity: 0, 
          y: 20, 
          filter: "blur(5px)" 
        },
        animate: { 
          opacity: 1, 
          y: 0, 
          filter: "blur(0px)" 
        },
        exit: { 
          opacity: 0, 
          y: -20, 
          filter: "blur(5px)" 
        }
      }
    };
    return variants[type];
  };

  const variants = getTransitionVariants();

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={transitionKey}
          className={className}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration,
            ease: [0.175, 0.885, 0.32, 1.275]
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      
      {/* Particle effects during transitions */}
      {particles && (
        <ParticleSystem 
          type={particleType} 
          count={8}
          className="z-0"
        />
      )}
    </div>
  );
};

// Specialized page transition components
export const ButterflyPageTransition: React.FC<Omit<PageTransitionProps, 'type'>> = (props) => (
  <PageTransition {...props} type="butterfly" particles particleType="butterflies" />
);

export const BloomPageTransition: React.FC<Omit<PageTransitionProps, 'type'>> = (props) => (
  <PageTransition {...props} type="bloom" particles particleType="petals" />
);

export const WhisperPageTransition: React.FC<Omit<PageTransitionProps, 'type'>> = (props) => (
  <PageTransition {...props} type="whisper" particles particleType="sparkles" />
);

// Route transition wrapper
interface RouteTransitionProps {
  children: React.ReactNode;
  location: string;
  className?: string;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  location,
  className = ''
}) => {
  return (
    <ButterflyPageTransition
      transitionKey={location}
      className={`min-h-screen ${className}`}
    >
      {children}
    </ButterflyPageTransition>
  );
};