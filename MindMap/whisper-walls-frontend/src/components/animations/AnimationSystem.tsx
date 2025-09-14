import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Animation variants for different romantic effects
export const animationVariants = {
  // Butterfly-like page transitions
  butterflyEnter: {
    initial: { 
      opacity: 0, 
      scale: 0.8, 
      rotateY: -90,
      x: -100
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      rotateY: 0,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.175, 0.885, 0.32, 1.275], // Elastic easing
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      rotateY: 90,
      x: 100,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  },

  // Blooming match animations
  bloomingMatch: {
    initial: { 
      scale: 0, 
      opacity: 0,
      rotate: -180
    },
    animate: { 
      scale: [0, 1.2, 1], 
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        times: [0, 0.6, 1]
      }
    }
  },

  // Love note fade animations
  loveNoteFade: {
    initial: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)"
    },
    animate: { 
      opacity: [1, 0.8, 0.3, 0], 
      y: [-10, -20, -40, -80], 
      scale: [1, 1.05, 1.1, 0.9],
      filter: ["blur(0px)", "blur(1px)", "blur(3px)", "blur(5px)"],
      transition: {
        duration: 3,
        ease: "easeOut",
        times: [0, 0.3, 0.7, 1]
      }
    }
  },

  // Heart flutter animations
  heartFlutter: {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  },

  // Pulsing aura effects
  pulsingAura: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  },

  // Floating particles
  floatingParticle: {
    animate: {
      y: [0, -20, 0],
      x: [0, 10, -10, 0],
      rotate: [0, 360],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  },

  // Dreamy microinteractions
  dreamyHover: {
    whileHover: {
      scale: 1.05,
      y: -5,
      boxShadow: "0 10px 30px rgba(255, 105, 180, 0.3)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    whileTap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  },

  // Staggered children animation
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  // Fade in up animation
  fadeInUp: {
    initial: { 
      opacity: 0, 
      y: 30 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  },

  // Sparkle effect
  sparkle: {
    animate: {
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
      opacity: [0, 1, 0],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 2
      }
    }
  },

  // Enhanced butterfly flutter with realistic movement
  butterflyFlutter: {
    animate: {
      x: [0, 20, -15, 25, -10, 15, 0],
      y: [0, -15, -5, -25, -10, -20, 0],
      rotate: [0, 10, -5, 15, -8, 12, 0],
      scale: [1, 1.1, 0.95, 1.15, 0.9, 1.05, 1],
      transition: {
        duration: 6,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  },

  // Petal cascade animation
  petalCascade: {
    animate: {
      y: [0, 100],
      x: [0, 30, -20, 40],
      rotate: [0, 180, 360, 540],
      opacity: [1, 0.8, 0.6, 0],
      transition: {
        duration: 4,
        ease: "linear",
        repeat: Infinity,
        repeatDelay: 1
      }
    }
  },

  // Magical shimmer effect
  magicalShimmer: {
    animate: {
      background: [
        "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
        "linear-gradient(45deg, transparent 30%, rgba(255,105,180,0.3) 50%, transparent 70%)",
        "linear-gradient(45deg, transparent 30%, rgba(138,43,226,0.3) 50%, transparent 70%)",
        "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)"
      ],
      backgroundPosition: ["-100% 0", "100% 0", "200% 0", "300% 0"],
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity
      }
    }
  },

  // Gentle sway animation
  gentleSway: {
    animate: {
      rotate: [-2, 2, -2],
      x: [-5, 5, -5],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  }
};

// Enhanced particle system for romantic effects
interface ParticleSystemProps {
  type: 'hearts' | 'sparkles' | 'petals' | 'butterflies' | 'stardust' | 'bubbles';
  count?: number;
  intensity?: 'low' | 'medium' | 'high';
  direction?: 'up' | 'down' | 'left' | 'right' | 'random';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  type,
  count = 10,
  intensity = 'medium',
  direction = 'up',
  speed = 'normal',
  className = ''
}) => {
  const getParticleEmoji = (type: string) => {
    switch (type) {
      case 'hearts': return ['💕', '💖', '💗', '💝', '❤️', '💜'];
      case 'sparkles': return ['✨', '⭐', '🌟', '💫', '🔮', '💎'];
      case 'petals': return ['🌸', '🌺', '🌻', '🌹', '🌷', '🏵️'];
      case 'butterflies': return ['🦋', '🧚‍♀️', '🧚‍♂️', '🌈', '🦄', '🌙'];
      case 'stardust': return ['✨', '💫', '⭐', '🌟'];
      case 'bubbles': return ['🫧', '💭', '☁️', '🌫️'];
      default: return ['💕'];
    }
  };

  const particles = getParticleEmoji(type);
  
  const intensityMap = {
    low: { count: Math.max(count * 0.5, 3), opacity: 0.6 },
    medium: { count, opacity: 0.8 },
    high: { count: count * 1.5, opacity: 1 }
  };

  const speedMap = {
    slow: { duration: [6, 10], delay: [0, 8] },
    normal: { duration: [4, 7], delay: [0, 5] },
    fast: { duration: [2, 4], delay: [0, 2] }
  };

  const getDirectionalMovement = (dir: string, windowWidth: number, windowHeight: number) => {
    switch (dir) {
      case 'up':
        return {
          initial: { x: Math.random() * windowWidth, y: windowHeight + 50 },
          animate: { y: -100, x: Math.random() * windowWidth }
        };
      case 'down':
        return {
          initial: { x: Math.random() * windowWidth, y: -50 },
          animate: { y: windowHeight + 100, x: Math.random() * windowWidth }
        };
      case 'left':
        return {
          initial: { x: windowWidth + 50, y: Math.random() * windowHeight },
          animate: { x: -100, y: Math.random() * windowHeight }
        };
      case 'right':
        return {
          initial: { x: -50, y: Math.random() * windowHeight },
          animate: { x: windowWidth + 100, y: Math.random() * windowHeight }
        };
      case 'random':
      default:
        return {
          initial: { 
            x: Math.random() * windowWidth, 
            y: Math.random() * windowHeight 
          },
          animate: { 
            x: Math.random() * windowWidth, 
            y: Math.random() * windowHeight 
          }
        };
    }
  };

  const config = intensityMap[intensity];
  const speedConfig = speedMap[speed];

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: Math.floor(config.count) }).map((_, i) => {
        const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        const movement = getDirectionalMovement(direction, windowWidth, windowHeight);
        
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ 
              fontSize: `${16 + Math.random() * 16}px`,
              opacity: config.opacity
            }}
            initial={{
              ...movement.initial,
              opacity: 0,
              scale: 0
            }}
            animate={{
              ...movement.animate,
              opacity: [0, 1, 1, 0],
              rotate: type === 'butterflies' ? [0, 360] : Math.random() * 360,
              scale: [0, 1.2, 1, 0.8],
              ...(type === 'butterflies' && {
                x: [
                  movement.initial.x,
                  movement.initial.x + 30,
                  movement.initial.x - 20,
                  movement.animate.x
                ],
                y: [
                  movement.initial.y,
                  movement.initial.y - 20,
                  movement.initial.y - 10,
                  movement.animate.y
                ]
              })
            }}
            transition={{
              duration: speedConfig.duration[0] + Math.random() * (speedConfig.duration[1] - speedConfig.duration[0]),
              delay: Math.random() * speedConfig.delay[1],
              repeat: Infinity,
              ease: type === 'butterflies' ? "easeInOut" : "linear"
            }}
          >
            {particles[Math.floor(Math.random() * particles.length)]}
          </motion.div>
        );
      })}
    </div>
  );
};

// Blooming animation wrapper
interface BloomingWrapperProps {
  children: React.ReactNode;
  trigger?: boolean;
  delay?: number;
  className?: string;
}

export const BloomingWrapper: React.FC<BloomingWrapperProps> = ({
  children,
  trigger = true,
  delay = 0,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      variants={animationVariants.bloomingMatch}
      initial="initial"
      animate={trigger ? "animate" : "initial"}
      transition={{ delay }}
    >
      {children}
      {/* Particle burst effect */}
      <AnimatePresence>
        {trigger && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 text-pink-400"
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 1
                }}
                animate={{
                  x: Math.cos((i * 45) * Math.PI / 180) * 50,
                  y: Math.sin((i * 45) * Math.PI / 180) * 50,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: 1,
                  delay: delay + 0.5,
                  ease: "easeOut"
                }}
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Love note fade component
interface LoveNoteFadeProps {
  children: React.ReactNode;
  trigger?: boolean;
  onComplete?: () => void;
  className?: string;
}

export const LoveNoteFade: React.FC<LoveNoteFadeProps> = ({
  children,
  trigger = false,
  onComplete,
  className = ''
}) => {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!trigger && (
        <motion.div
          className={className}
          variants={animationVariants.loveNoteFade}
          initial="initial"
          animate={trigger ? "animate" : "initial"}
          exit="animate"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Heart flutter component
interface HeartFlutterProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export const HeartFlutter: React.FC<HeartFlutterProps> = ({
  children,
  active = true,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      variants={animationVariants.heartFlutter}
      animate={active ? "animate" : ""}
    >
      {children}
    </motion.div>
  );
};

// Pulsing aura wrapper
interface PulsingAuraProps {
  children: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PulsingAura: React.FC<PulsingAuraProps> = ({
  children,
  color = 'rgba(255, 105, 180, 0.3)',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={`relative ${className}`}>
      {/* Aura effect */}
      <motion.div
        className={`absolute inset-0 rounded-full ${sizeClasses[size]}`}
        style={{ backgroundColor: color }}
        variants={animationVariants.pulsingAura}
        animate="animate"
      />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Enhanced Butterfly page transition with particle trails
interface ButterflyTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  withParticles?: boolean;
  particleCount?: number;
  className?: string;
}

export const ButterflyTransition: React.FC<ButterflyTransitionProps> = ({
  children,
  isVisible,
  direction = 'right',
  withParticles = true,
  particleCount = 6,
  className = ''
}) => {
  const getDirectionalVariants = (dir: string) => {
    const baseVariants = animationVariants.butterflyEnter;
    const directionalOffsets = {
      left: { x: -100, rotateY: -90 },
      right: { x: 100, rotateY: 90 },
      up: { y: -100, rotateX: -90 },
      down: { y: 100, rotateX: 90 }
    };
    
    const offset = directionalOffsets[dir as keyof typeof directionalOffsets] || directionalOffsets.right;
    
    return {
      ...baseVariants,
      initial: { ...baseVariants.initial, ...offset },
      exit: { ...baseVariants.exit, ...offset }
    };
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          variants={getDirectionalVariants(direction)}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
          
          {/* Butterfly particle trail */}
          {withParticles && (
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: particleCount }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-purple-400 text-lg"
                  style={{
                    left: `${10 + (i * 15)}%`,
                    top: `${20 + (i * 10)}%`
                  }}
                  animate={{
                    x: [0, 30, -15, 25, 0],
                    y: [0, -20, -10, -30, 0],
                    rotate: [0, 15, -10, 20, 0],
                    scale: [0.8, 1.2, 1, 1.1, 0.9]
                  }}
                  transition={{
                    duration: 4,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🦋
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Dreamy microinteraction wrapper
interface DreamyInteractionProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const DreamyInteraction: React.FC<DreamyInteractionProps> = ({
  children,
  className = '',
  disabled = false
}) => {
  return (
    <motion.div
      className={className}
      variants={animationVariants.dreamyHover}
      whileHover={disabled ? {} : "whileHover"}
      whileTap={disabled ? {} : "whileTap"}
    >
      {children}
    </motion.div>
  );
};

// Staggered animation container
interface StaggeredContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({
  children,
  className = '',
  delay = 0
}) => {
  return (
    <motion.div
      className={className}
      variants={animationVariants.staggerContainer}
      initial="initial"
      animate="animate"
      transition={{ delay }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={animationVariants.fadeInUp}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Enhanced sparkle effect component
interface SparkleEffectProps {
  count?: number;
  intensity?: 'subtle' | 'medium' | 'magical';
  color?: 'gold' | 'pink' | 'purple' | 'rainbow';
  pattern?: 'random' | 'circle' | 'heart' | 'butterfly';
  className?: string;
}

export const SparkleEffect: React.FC<SparkleEffectProps> = ({
  count = 5,
  intensity = 'medium',
  color = 'gold',
  pattern = 'random',
  className = ''
}) => {
  const getColorClass = (colorType: string) => {
    const colors = {
      gold: 'text-yellow-300',
      pink: 'text-pink-400',
      purple: 'text-purple-400',
      rainbow: 'text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text'
    };
    return colors[colorType as keyof typeof colors] || colors.gold;
  };

  const getPatternPosition = (index: number, total: number, patternType: string) => {
    switch (patternType) {
      case 'circle':
        const angle = (index / total) * 2 * Math.PI;
        return {
          left: `${50 + 30 * Math.cos(angle)}%`,
          top: `${50 + 30 * Math.sin(angle)}%`
        };
      case 'heart':
        const t = (index / total) * 2 * Math.PI;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        return {
          left: `${50 + x * 2}%`,
          top: `${50 - y * 2}%`
        };
      case 'butterfly':
        const wing = index < total / 2 ? -1 : 1;
        const wingIndex = index % (total / 2);
        return {
          left: `${50 + wing * (20 + wingIndex * 10)}%`,
          top: `${30 + wingIndex * 15}%`
        };
      default:
        return {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`
        };
    }
  };

  const intensityConfig = {
    subtle: { scale: [0, 0.8, 0], duration: 2 },
    medium: { scale: [0, 1, 0], duration: 1.5 },
    magical: { scale: [0, 1.5, 0], duration: 1 }
  };

  const config = intensityConfig[intensity];

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute ${getColorClass(color)}`}
          style={getPatternPosition(i, count, pattern)}
          animate={{
            scale: config.scale,
            rotate: [0, 180, 360],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: config.duration,
            delay: Math.random() * 2,
            repeat: Infinity,
            repeatDelay: 1 + Math.random() * 2,
            ease: "easeInOut"
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

// Butterfly swarm animation
interface ButterflySwarmProps {
  count?: number;
  area?: 'small' | 'medium' | 'large';
  behavior?: 'gentle' | 'playful' | 'energetic';
  className?: string;
}

export const ButterflySwarm: React.FC<ButterflySwarmProps> = ({
  count = 8,
  area = 'medium',
  behavior = 'gentle',
  className = ''
}) => {
  const areaConfig = {
    small: { width: 200, height: 200 },
    medium: { width: 400, height: 300 },
    large: { width: 600, height: 400 }
  };

  const behaviorConfig = {
    gentle: { 
      speed: 8, 
      amplitude: 20, 
      rotationRange: 10,
      butterflies: ['🦋', '🧚‍♀️', '🧚‍♂️']
    },
    playful: { 
      speed: 5, 
      amplitude: 40, 
      rotationRange: 20,
      butterflies: ['🦋', '🌈', '💫']
    },
    energetic: { 
      speed: 3, 
      amplitude: 60, 
      rotationRange: 30,
      butterflies: ['🦋', '⚡', '🌟']
    }
  };

  const { width, height } = areaConfig[area];
  const { speed, amplitude, rotationRange, butterflies } = behaviorConfig[behavior];

  return (
    <div 
      className={`relative pointer-events-none ${className}`}
      style={{ width, height }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{
            x: Math.random() * width,
            y: Math.random() * height
          }}
          animate={{
            x: [
              Math.random() * width,
              Math.random() * width,
              Math.random() * width,
              Math.random() * width
            ],
            y: [
              Math.random() * height,
              Math.random() * height,
              Math.random() * height,
              Math.random() * height
            ],
            rotate: [
              -rotationRange + Math.random() * rotationRange * 2,
              -rotationRange + Math.random() * rotationRange * 2,
              -rotationRange + Math.random() * rotationRange * 2
            ],
            scale: [0.8, 1.2, 1, 1.1, 0.9]
          }}
          transition={{
            duration: speed + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        >
          {butterflies[Math.floor(Math.random() * butterflies.length)]}
        </motion.div>
      ))}
    </div>
  );
};

// Magical shimmer overlay
interface MagicalShimmerProps {
  children: React.ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  color?: 'pink' | 'purple' | 'gold' | 'rainbow';
  trigger?: boolean;
  className?: string;
}

export const MagicalShimmer: React.FC<MagicalShimmerProps> = ({
  children,
  intensity = 'medium',
  color = 'pink',
  trigger = true,
  className = ''
}) => {
  const getShimmerGradient = (colorType: string) => {
    const gradients = {
      pink: 'linear-gradient(45deg, transparent 30%, rgba(255,105,180,0.4) 50%, transparent 70%)',
      purple: 'linear-gradient(45deg, transparent 30%, rgba(138,43,226,0.4) 50%, transparent 70%)',
      gold: 'linear-gradient(45deg, transparent 30%, rgba(255,215,0,0.4) 50%, transparent 70%)',
      rainbow: 'linear-gradient(45deg, transparent 20%, rgba(255,105,180,0.3) 35%, rgba(138,43,226,0.3) 50%, rgba(0,191,255,0.3) 65%, transparent 80%)'
    };
    return gradients[colorType as keyof typeof gradients] || gradients.pink;
  };

  const intensityConfig = {
    subtle: { duration: 3, size: '200%' },
    medium: { duration: 2, size: '300%' },
    strong: { duration: 1.5, size: '400%' }
  };

  const config = intensityConfig[intensity];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      {trigger && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: getShimmerGradient(color),
            backgroundSize: config.size
          }}
          animate={{
            backgroundPosition: ['-100% 0', '200% 0']
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </div>
  );
};