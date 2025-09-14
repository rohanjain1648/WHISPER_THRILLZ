import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Floating hearts that appear on interactions
interface FloatingHeartsProps {
  trigger: boolean;
  onComplete?: () => void;
  count?: number;
  className?: string;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({
  trigger,
  onComplete,
  count = 5,
  className = ''
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-pink-500"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${30 + Math.random() * 40}%`,
                fontSize: `${16 + Math.random() * 16}px`
              }}
              initial={{
                opacity: 0,
                scale: 0,
                y: 0
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1.2, 1, 0.8],
                y: -100,
                x: (Math.random() - 0.5) * 100,
                rotate: Math.random() * 360
              }}
              exit={{
                opacity: 0,
                scale: 0
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            >
              💕
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

// Blooming flower animation for matches/connections
interface BloomingFlowerProps {
  isVisible: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BloomingFlower: React.FC<BloomingFlowerProps> = ({
  isVisible,
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`${sizeMap[size]} ${className}`}
          initial={{
            scale: 0,
            rotate: -90,
            opacity: 0
          }}
          animate={{
            scale: [0, 1.3, 1],
            rotate: [0, 10, 0],
            opacity: 1
          }}
          exit={{
            scale: 0,
            opacity: 0,
            rotate: 90
          }}
          transition={{
            duration: 1.5,
            ease: [0.175, 0.885, 0.32, 1.275],
            times: [0, 0.6, 1]
          }}
        >
          🌸
          {/* Petal particles */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-pink-300 text-sm"
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
                scale: 0
              }}
              animate={{
                x: Math.cos((i * 60) * Math.PI / 180) * 40,
                y: Math.sin((i * 60) * Math.PI / 180) * 40,
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 1.2,
                delay: 0.5,
                ease: "easeOut"
              }}
            >
              🌸
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Whisper fade animation for disappearing messages
interface WhisperFadeProps {
  children: React.ReactNode;
  isVisible: boolean;
  onComplete?: () => void;
  className?: string;
}

export const WhisperFade: React.FC<WhisperFadeProps> = ({
  children,
  isVisible,
  onComplete,
  className = ''
}) => {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className={className}
          initial={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            y: -20,
            filter: "blur(2px)"
          }}
          transition={{
            duration: 2,
            ease: "easeOut"
          }}
        >
          {children}
          {/* Whisper particles */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-gray-300 text-xs"
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${20 + i * 10}%`
                }}
                animate={{
                  y: [-5, -15, -25],
                  opacity: [0, 0.6, 0],
                  scale: [0.8, 1, 0.6]
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Butterfly page transition
interface ButterflyPageTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

export const ButterflyPageTransition: React.FC<ButterflyPageTransitionProps> = ({
  children,
  isVisible,
  direction = 'right',
  className = ''
}) => {
  const getDirectionVariants = (dir: string) => {
    const variants = {
      left: { x: [-100, 0], rotateY: [-30, 0] },
      right: { x: [100, 0], rotateY: [30, 0] },
      up: { y: [-100, 0], rotateX: [-30, 0] },
      down: { y: [100, 0], rotateX: [30, 0] }
    };
    return variants[dir as keyof typeof variants];
  };

  const directionVariants = getDirectionVariants(direction);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          initial={{
            opacity: 0,
            scale: 0.8,
            ...Object.fromEntries(
              Object.entries(directionVariants).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
            )
          }}
          animate={{
            opacity: 1,
            scale: 1,
            ...Object.fromEntries(
              Object.entries(directionVariants).map(([key, value]) => [key, Array.isArray(value) ? value[1] : value])
            )
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            ...Object.fromEntries(
              Object.entries(directionVariants).map(([key, value]) => [key, Array.isArray(value) ? -value[0] : -value])
            )
          }}
          transition={{
            duration: 0.8,
            ease: [0.175, 0.885, 0.32, 1.275]
          }}
        >
          {children}
          {/* Butterfly particles */}
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-purple-400"
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${10 + i * 20}%`
                }}
                animate={{
                  x: [0, 20, -10, 15, 0],
                  y: [0, -15, -5, -20, 0],
                  rotate: [0, 10, -5, 15, 0]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🦋
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Heartbeat animation for emotional emphasis
interface HeartbeatProps {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const Heartbeat: React.FC<HeartbeatProps> = ({
  children,
  intensity = 'medium',
  className = ''
}) => {
  const intensityMap = {
    low: { scale: [1, 1.05, 1], duration: 1.5 },
    medium: { scale: [1, 1.1, 1], duration: 1.2 },
    high: { scale: [1, 1.15, 1], duration: 0.8 }
  };

  const config = intensityMap[intensity];

  return (
    <motion.div
      className={className}
      animate={{
        scale: config.scale
      }}
      transition={{
        duration: config.duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Magical sparkle trail for cursor/touch interactions
interface SparkleTrailProps {
  isActive: boolean;
  position: { x: number; y: number };
  className?: string;
}

export const SparkleTrail: React.FC<SparkleTrailProps> = ({
  isActive,
  position,
  className = ''
}) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (isActive) {
      const newSparkle = {
        id: Date.now(),
        x: position.x,
        y: position.y
      };
      setSparkles(prev => [...prev.slice(-10), newSparkle]);

      const timer = setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isActive, position]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute text-yellow-300"
            style={{
              left: sparkle.x - 8,
              top: sparkle.y - 8
            }}
            initial={{
              opacity: 1,
              scale: 0
            }}
            animate={{
              opacity: 0,
              scale: [0, 1, 0],
              rotate: 360
            }}
            exit={{
              opacity: 0
            }}
            transition={{
              duration: 1,
              ease: "easeOut"
            }}
          >
            ✨
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Romantic glow effect
interface RomanticGlowProps {
  children: React.ReactNode;
  color?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

export const RomanticGlow: React.FC<RomanticGlowProps> = ({
  children,
  color = '#FF69B4',
  intensity = 'medium',
  className = ''
}) => {
  const intensityMap = {
    subtle: '0 0 10px',
    medium: '0 0 20px',
    strong: '0 0 30px'
  };

  return (
    <motion.div
      className={className}
      style={{
        filter: `drop-shadow(${intensityMap[intensity]} ${color}40)`
      }}
      animate={{
        filter: [
          `drop-shadow(${intensityMap[intensity]} ${color}40)`,
          `drop-shadow(${intensityMap[intensity]} ${color}80)`,
          `drop-shadow(${intensityMap[intensity]} ${color}40)`
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};