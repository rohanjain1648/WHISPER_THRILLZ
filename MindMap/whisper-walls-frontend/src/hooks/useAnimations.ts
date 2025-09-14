import { useState, useCallback, useRef, useEffect } from 'react';
import { useAnimation, AnimationControls } from 'framer-motion';

// Hook for managing romantic animations
export const useRomanticAnimations = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationQueue, setAnimationQueue] = useState<string[]>([]);
  const controls = useAnimation();

  const triggerAnimation = useCallback(async (animationType: string) => {
    setIsAnimating(true);
    setAnimationQueue(prev => [...prev, animationType]);

    try {
      switch (animationType) {
        case 'heartFlutter':
          await controls.start({
            scale: [1, 1.2, 1],
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.6, ease: "easeInOut" }
          });
          break;
        
        case 'bloom':
          await controls.start({
            scale: [0, 1.3, 1],
            rotate: [0, 360],
            opacity: [0, 1],
            transition: { duration: 1.2, ease: "easeOut" }
          });
          break;
        
        case 'whisperFade':
          await controls.start({
            opacity: [1, 0.5, 0],
            y: [0, -20, -40],
            scale: [1, 1.1, 0.9],
            filter: ["blur(0px)", "blur(2px)", "blur(5px)"],
            transition: { duration: 2, ease: "easeOut" }
          });
          break;
        
        case 'sparkle':
          await controls.start({
            scale: [0, 1.5, 0],
            rotate: [0, 180, 360],
            opacity: [0, 1, 0],
            transition: { duration: 1, ease: "easeInOut" }
          });
          break;
        
        default:
          console.warn(`Unknown animation type: ${animationType}`);
      }
    } finally {
      setIsAnimating(false);
      setAnimationQueue(prev => prev.filter(item => item !== animationType));
    }
  }, [controls]);

  const resetAnimation = useCallback(() => {
    controls.stop();
    controls.set({ scale: 1, rotate: 0, opacity: 1, y: 0, filter: "blur(0px)" });
    setIsAnimating(false);
    setAnimationQueue([]);
  }, [controls]);

  return {
    controls,
    isAnimating,
    animationQueue,
    triggerAnimation,
    resetAnimation
  };
};

// Hook for particle effects
export const useParticleEffects = () => {
  const [particles, setParticles] = useState<Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    timestamp: number;
  }>>([]);

  const addParticle = useCallback((type: string, x: number, y: number) => {
    const particle = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      x,
      y,
      timestamp: Date.now()
    };
    
    setParticles(prev => [...prev, particle]);

    // Auto-remove particle after animation duration
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particle.id));
    }, 2000);
  }, []);

  const clearParticles = useCallback(() => {
    setParticles([]);
  }, []);

  return {
    particles,
    addParticle,
    clearParticles
  };
};

// Hook for managing interaction animations
export const useInteractionAnimations = () => {
  const [hoveredElements, setHoveredElements] = useState<Set<string>>(new Set());
  const [clickedElements, setClickedElements] = useState<Set<string>>(new Set());

  const handleHover = useCallback((elementId: string, isHovering: boolean) => {
    setHoveredElements(prev => {
      const newSet = new Set(prev);
      if (isHovering) {
        newSet.add(elementId);
      } else {
        newSet.delete(elementId);
      }
      return newSet;
    });
  }, []);

  const handleClick = useCallback((elementId: string) => {
    setClickedElements(prev => new Set(prev).add(elementId));
    
    // Remove from clicked set after animation
    setTimeout(() => {
      setClickedElements(prev => {
        const newSet = new Set(prev);
        newSet.delete(elementId);
        return newSet;
      });
    }, 300);
  }, []);

  const isHovered = useCallback((elementId: string) => {
    return hoveredElements.has(elementId);
  }, [hoveredElements]);

  const isClicked = useCallback((elementId: string) => {
    return clickedElements.has(elementId);
  }, [clickedElements]);

  return {
    handleHover,
    handleClick,
    isHovered,
    isClicked
  };
};

// Hook for sequential animations
export const useSequentialAnimations = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationSteps = useRef<Array<() => Promise<void>>>([]);

  const addStep = useCallback((animationFn: () => Promise<void>) => {
    animationSteps.current.push(animationFn);
  }, []);

  const playSequence = useCallback(async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setCurrentStep(0);

    for (let i = 0; i < animationSteps.current.length; i++) {
      setCurrentStep(i);
      await animationSteps.current[i]();
    }

    setIsPlaying(false);
    setCurrentStep(0);
  }, [isPlaying]);

  const resetSequence = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    animationSteps.current = [];
  }, []);

  return {
    currentStep,
    isPlaying,
    addStep,
    playSequence,
    resetSequence
  };
};

// Hook for mood-based animations
export const useMoodAnimations = () => {
  const [currentMood, setCurrentMood] = useState<string>('neutral');
  const controls = useAnimation();

  const moodAnimations = {
    joy: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.8, ease: "easeInOut", repeat: Infinity }
    },
    sadness: {
      y: [0, 5, 0],
      opacity: [1, 0.8, 1],
      transition: { duration: 2, ease: "easeInOut", repeat: Infinity }
    },
    love: {
      scale: [1, 1.05, 1],
      filter: ["hue-rotate(0deg)", "hue-rotate(10deg)", "hue-rotate(0deg)"],
      transition: { duration: 1.5, ease: "easeInOut", repeat: Infinity }
    },
    excitement: {
      scale: [1, 1.15, 1],
      rotate: [0, 2, -2, 0],
      transition: { duration: 0.5, ease: "easeInOut", repeat: Infinity }
    },
    calm: {
      scale: [1, 1.02, 1],
      transition: { duration: 3, ease: "easeInOut", repeat: Infinity }
    }
  };

  const setMoodAnimation = useCallback(async (mood: string) => {
    setCurrentMood(mood);
    const animation = moodAnimations[mood as keyof typeof moodAnimations];
    
    if (animation) {
      await controls.start(animation);
    } else {
      // Default neutral animation
      await controls.start({
        scale: 1,
        rotate: 0,
        y: 0,
        opacity: 1,
        filter: "hue-rotate(0deg)"
      });
    }
  }, [controls]);

  const stopMoodAnimation = useCallback(() => {
    controls.stop();
    controls.set({
      scale: 1,
      rotate: 0,
      y: 0,
      opacity: 1,
      filter: "hue-rotate(0deg)"
    });
  }, [controls]);

  return {
    currentMood,
    controls,
    setMoodAnimation,
    stopMoodAnimation
  };
};

// Hook for cursor trail effects
export const useCursorTrail = () => {
  const [trailPoints, setTrailPoints] = useState<Array<{
    x: number;
    y: number;
    timestamp: number;
  }>>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const point = {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      };

      setTrailPoints(prev => {
        const newPoints = [...prev, point];
        // Keep only recent points (last 500ms)
        return newPoints.filter(p => Date.now() - p.timestamp < 500);
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  const activateTrail = useCallback(() => setIsActive(true), []);
  const deactivateTrail = useCallback(() => {
    setIsActive(false);
    setTrailPoints([]);
  }, []);

  return {
    trailPoints,
    isActive,
    activateTrail,
    deactivateTrail
  };
};

// Hook for page transition animations
export const usePageTransitions = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<string>('fade');

  const startTransition = useCallback((type: string = 'fade') => {
    setTransitionType(type);
    setIsTransitioning(true);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const getTransitionVariants = useCallback(() => {
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
        initial: { scale: 0.8, rotateY: -90, opacity: 0 },
        animate: { scale: 1, rotateY: 0, opacity: 1 },
        exit: { scale: 0.8, rotateY: 90, opacity: 0 }
      },
      bloom: {
        initial: { scale: 0, rotate: -180, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
        exit: { scale: 0, rotate: 180, opacity: 0 }
      }
    };

    return variants[transitionType as keyof typeof variants] || variants.fade;
  }, [transitionType]);

  return {
    isTransitioning,
    transitionType,
    startTransition,
    endTransition,
    getTransitionVariants
  };
};