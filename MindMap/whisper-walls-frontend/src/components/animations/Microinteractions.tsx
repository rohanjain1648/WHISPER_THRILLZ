import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// Dreamy hover effect that follows cursor
interface DreamyHoverProps {
  children: React.ReactNode;
  intensity?: number;
  className?: string;
}

export const DreamyHover: React.FC<DreamyHoverProps> = ({
  children,
  intensity = 0.5,
  className = ''
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [30 * intensity, -30 * intensity]);
  const rotateY = useTransform(x, [-100, 100], [-30 * intensity, 30 * intensity]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`transform-gpu ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
};

// Magnetic attraction effect
interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.3,
  className = ''
}) => {
  const x = useSpring(0, { stiffness: 300, damping: 30 });
  const y = useSpring(0, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

// Ripple effect for clicks
interface RippleEffectProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  color = 'rgba(255, 105, 180, 0.3)',
  className = ''
}) => {
  const [ripples, setRipples] = useState<Array<{
    id: number;
    x: number;
    y: number;
  }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {children}
      
      {/* Ripple animations */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x - 25,
            top: ripple.y - 25,
            width: 50,
            height: 50,
            backgroundColor: color
          }}
          initial={{
            scale: 0,
            opacity: 1
          }}
          animate={{
            scale: 4,
            opacity: 0
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Breathing animation for calm, meditative effects
interface BreathingProps {
  children: React.ReactNode;
  rate?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export const Breathing: React.FC<BreathingProps> = ({
  children,
  rate = 'normal',
  className = ''
}) => {
  const rateMap = {
    slow: 4,
    normal: 3,
    fast: 2
  };

  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: rateMap[rate],
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Typewriter effect for romantic text reveals
interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay + currentIndex * speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-0.5 h-5 bg-current ml-1"
      />
    </span>
  );
};

// Morphing shape animation
interface MorphingShapeProps {
  shapes: string[];
  interval?: number;
  className?: string;
}

export const MorphingShape: React.FC<MorphingShapeProps> = ({
  shapes,
  interval = 2000,
  className = ''
}) => {
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentShapeIndex(prev => (prev + 1) % shapes.length);
    }, interval);

    return () => clearInterval(timer);
  }, [shapes.length, interval]);

  return (
    <motion.div
      className={`text-4xl ${className}`}
      key={currentShapeIndex}
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.175, 0.885, 0.32, 1.275]
      }}
    >
      {shapes[currentShapeIndex]}
    </motion.div>
  );
};

// Parallax scrolling effect
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  className = ''
}) => {
  const [scrollY, setScrollY] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className={className}
      style={{
        y: scrollY * speed
      }}
    >
      {children}
    </motion.div>
  );
};

// Enhanced reveal animation on scroll with particle effects
interface RevealOnScrollProps {
  children: React.ReactNode;
  threshold?: number;
  animation?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'bloom' | 'butterfly' | 'sparkle' | 'heart';
  delay?: number;
  withParticles?: boolean;
  particleType?: 'sparkles' | 'hearts' | 'petals';
  className?: string;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  threshold = 0.1,
  animation = 'fadeUp',
  delay = 0,
  withParticles = false,
  particleType = 'sparkles',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const getAnimationVariants = () => {
    const variants = {
      fadeUp: {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 }
      },
      fadeLeft: {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0 }
      },
      fadeRight: {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 }
      },
      bloom: {
        initial: { opacity: 0, scale: 0, rotate: -180 },
        animate: { opacity: 1, scale: 1, rotate: 0 }
      },
      butterfly: {
        initial: { opacity: 0, scale: 0.8, rotateY: -90 },
        animate: { opacity: 1, scale: 1, rotateY: 0 }
      },
      sparkle: {
        initial: { opacity: 0, scale: 0, rotate: -360 },
        animate: { 
          opacity: 1, 
          scale: [0, 1.2, 1], 
          rotate: 0,
          filter: ["brightness(0.5)", "brightness(1.5)", "brightness(1)"]
        }
      },
      heart: {
        initial: { opacity: 0, scale: 0 },
        animate: { 
          opacity: 1, 
          scale: [0, 1.3, 1],
          rotate: [0, 10, 0]
        }
      }
    };
    return variants[animation];
  };

  const getParticleEmoji = (type: string) => {
    const particles = {
      sparkles: ['✨', '⭐', '🌟'],
      hearts: ['💕', '💖', '💗'],
      petals: ['🌸', '🌺', '🌻']
    };
    return particles[type as keyof typeof particles] || particles.sparkles;
  };

  const variants = getAnimationVariants();
  const particles = getParticleEmoji(particleType);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div
        variants={variants}
        initial="initial"
        animate={isVisible ? "animate" : "initial"}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.175, 0.885, 0.32, 1.275]
        }}
      >
        {children}
      </motion.div>
      
      {/* Particle effects on reveal */}
      {withParticles && isVisible && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-lg"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -30, -60],
                x: [(Math.random() - 0.5) * 40]
              }}
              transition={{
                duration: 2,
                delay: delay + 0.5 + i * 0.1,
                ease: "easeOut"
              }}
            >
              {particles[Math.floor(Math.random() * particles.length)]}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced cursor attraction effect
interface CursorAttractorProps {
  children: React.ReactNode;
  strength?: number;
  range?: number;
  showTrail?: boolean;
  trailColor?: string;
  className?: string;
}

export const CursorAttractor: React.FC<CursorAttractorProps> = ({
  children,
  strength = 0.1,
  range = 100,
  showTrail = false,
  trailColor = '#FF69B4',
  className = ''
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isNear, setIsNear] = useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 300, damping: 30 });
  const y = useSpring(0, { stiffness: 300, damping: 30 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      if (distance < range) {
        setIsNear(true);
        const force = Math.max(0, 1 - distance / range);
        x.set(deltaX * strength * force);
        y.set(deltaY * strength * force);
      } else {
        setIsNear(false);
        x.set(0);
        y.set(0);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [x, y, strength, range]);

  return (
    <motion.div
      ref={elementRef}
      className={className}
      style={{ x, y }}
      animate={{
        scale: isNear ? 1.05 : 1,
        filter: isNear ? 'brightness(1.1)' : 'brightness(1)'
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
      
      {/* Cursor trail effect */}
      {showTrail && isNear && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{
            left: mousePosition.x - 10,
            top: mousePosition.y - 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: trailColor,
            opacity: 0.6
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 0.3, 0.6]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};

// Emotional pulse effect based on interaction intensity
interface EmotionalPulseProps {
  children: React.ReactNode;
  emotion?: 'joy' | 'love' | 'excitement' | 'calm' | 'surprise';
  intensity?: number;
  className?: string;
}

export const EmotionalPulse: React.FC<EmotionalPulseProps> = ({
  children,
  emotion = 'joy',
  intensity = 1,
  className = ''
}) => {
  const emotionConfig = {
    joy: { 
      color: '#FFD700', 
      scale: [1, 1.1, 1], 
      duration: 1.2,
      filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
    },
    love: { 
      color: '#FF69B4', 
      scale: [1, 1.15, 1], 
      duration: 1.5,
      filter: ['hue-rotate(0deg)', 'hue-rotate(10deg)', 'hue-rotate(0deg)']
    },
    excitement: { 
      color: '#FF4500', 
      scale: [1, 1.2, 1], 
      duration: 0.8,
      filter: ['saturate(1)', 'saturate(1.3)', 'saturate(1)']
    },
    calm: { 
      color: '#87CEEB', 
      scale: [1, 1.05, 1], 
      duration: 2.5,
      filter: ['blur(0px)', 'blur(0.5px)', 'blur(0px)']
    },
    surprise: { 
      color: '#9370DB', 
      scale: [1, 1.25, 1], 
      duration: 0.6,
      filter: ['contrast(1)', 'contrast(1.2)', 'contrast(1)']
    }
  };

  const config = emotionConfig[emotion];

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        scale: config.scale.map(s => 1 + (s - 1) * intensity),
        filter: config.filter
      }}
      transition={{
        duration: config.duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
      
      {/* Emotional aura */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          backgroundColor: config.color,
          opacity: 0.1 * intensity
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1 * intensity, 0.3 * intensity, 0.1 * intensity]
        }}
        transition={{
          duration: config.duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};