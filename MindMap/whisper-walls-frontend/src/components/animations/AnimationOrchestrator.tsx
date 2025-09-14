import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ParticleSystem, 
  ButterflySwarm, 
  SparkleEffect, 
  MagicalShimmer,
  BloomingWrapper,
  HeartFlutter,
  PulsingAura
} from './AnimationSystem';
import { FloatingHearts, BloomingFlower } from './RomanticAnimations';

// Animation orchestrator for complex romantic sequences
interface AnimationOrchestratorProps {
  trigger: string | null;
  onComplete?: () => void;
  className?: string;
}

export const AnimationOrchestrator: React.FC<AnimationOrchestratorProps> = ({
  trigger,
  onComplete,
  className = ''
}) => {
  const [activeAnimations, setActiveAnimations] = useState<Set<string>>(new Set());
  const [sequenceStep, setSequenceStep] = useState(0);

  const startAnimation = useCallback((animationType: string) => {
    setActiveAnimations(prev => new Set(prev).add(animationType));
  }, []);

  const endAnimation = useCallback((animationType: string) => {
    setActiveAnimations(prev => {
      const newSet = new Set(prev);
      newSet.delete(animationType);
      return newSet;
    });
  }, []);

  // Define animation sequences
  const animationSequences = {
    'match-found': [
      { type: 'bloom', delay: 0, duration: 1500 },
      { type: 'hearts', delay: 500, duration: 2000 },
      { type: 'butterflies', delay: 1000, duration: 3000 },
      { type: 'sparkles', delay: 1500, duration: 2500 }
    ],
    'message-sent': [
      { type: 'shimmer', delay: 0, duration: 1000 },
      { type: 'petals', delay: 300, duration: 2000 },
      { type: 'gentle-fade', delay: 800, duration: 1500 }
    ],
    'mood-detected': [
      { type: 'pulse', delay: 0, duration: 1000 },
      { type: 'color-wave', delay: 200, duration: 1800 },
      { type: 'sparkles', delay: 500, duration: 1500 }
    ],
    'connection-made': [
      { type: 'double-bloom', delay: 0, duration: 2000 },
      { type: 'heart-bridge', delay: 800, duration: 2500 },
      { type: 'celebration', delay: 1500, duration: 3000 }
    ]
  };

  useEffect(() => {
    if (!trigger || !animationSequences[trigger as keyof typeof animationSequences]) return;

    const sequence = animationSequences[trigger as keyof typeof animationSequences];
    setSequenceStep(0);

    sequence.forEach((step, index) => {
      setTimeout(() => {
        startAnimation(step.type);
        setSequenceStep(index + 1);
        
        // End animation after its duration
        setTimeout(() => {
          endAnimation(step.type);
          
          // Check if this is the last animation
          if (index === sequence.length - 1) {
            setTimeout(() => {
              onComplete?.();
            }, 500);
          }
        }, step.duration);
      }, step.delay);
    });
  }, [trigger, startAnimation, endAnimation, onComplete]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      <AnimatePresence>
        {/* Blooming animations */}
        {activeAnimations.has('bloom') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BloomingFlower isVisible={true} size="lg" />
          </motion.div>
        )}

        {/* Double bloom for connections */}
        {activeAnimations.has('double-bloom') && (
          <motion.div className="absolute inset-0">
            <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2">
              <BloomingFlower isVisible={true} size="md" />
            </div>
            <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2">
              <BloomingFlower isVisible={true} size="md" />
            </div>
          </motion.div>
        )}

        {/* Floating hearts */}
        {activeAnimations.has('hearts') && (
          <FloatingHearts 
            trigger={true} 
            count={12}
            onComplete={() => endAnimation('hearts')}
          />
        )}

        {/* Heart bridge animation */}
        {activeAnimations.has('heart-bridge') && (
          <motion.div className="absolute inset-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-pink-500 text-2xl"
                style={{
                  left: `${20 + i * 10}%`,
                  top: '50%'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.2, 1, 0.8],
                  y: [0, -20, 0, 20]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              >
                💕
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Butterfly swarms */}
        {activeAnimations.has('butterflies') && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ButterflySwarm 
              count={6} 
              area="large" 
              behavior="playful"
              className="absolute top-1/4 left-1/4"
            />
          </motion.div>
        )}

        {/* Sparkle effects */}
        {activeAnimations.has('sparkles') && (
          <SparkleEffect 
            count={15}
            intensity="magical"
            color="rainbow"
            pattern="random"
          />
        )}

        {/* Petal cascade */}
        {activeAnimations.has('petals') && (
          <ParticleSystem 
            type="petals"
            count={20}
            intensity="high"
            direction="down"
            speed="slow"
          />
        )}

        {/* Magical shimmer wave */}
        {activeAnimations.has('shimmer') && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,105,180,0.3) 50%, transparent 70%)',
                backgroundSize: '200% 200%'
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%']
              }}
              transition={{
                duration: 1,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}

        {/* Pulsing aura */}
        {activeAnimations.has('pulse') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-32 h-32 rounded-full"
              style={{ backgroundColor: 'rgba(255, 105, 180, 0.2)' }}
              animate={{
                scale: [1, 2, 3],
                opacity: [0.6, 0.3, 0]
              }}
              transition={{
                duration: 1,
                ease: "easeOut"
              }}
            />
          </motion.div>
        )}

        {/* Color wave effect */}
        {activeAnimations.has('color-wave') && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at center, rgba(255,105,180,0.3) 0%, rgba(138,43,226,0.2) 50%, transparent 100%)'
              }}
              animate={{
                scale: [0, 2, 4],
                opacity: [0.8, 0.4, 0]
              }}
              transition={{
                duration: 1.8,
                ease: "easeOut"
              }}
            />
          </motion.div>
        )}

        {/* Celebration finale */}
        {activeAnimations.has('celebration') && (
          <motion.div className="absolute inset-0">
            <ParticleSystem 
              type="sparkles"
              count={30}
              intensity="high"
              direction="random"
              speed="fast"
            />
            <ParticleSystem 
              type="hearts"
              count={15}
              intensity="medium"
              direction="up"
              speed="normal"
            />
            <ButterflySwarm 
              count={10} 
              area="large" 
              behavior="energetic"
              className="absolute inset-0"
            />
          </motion.div>
        )}

        {/* Gentle fade effect */}
        {activeAnimations.has('gentle-fade') && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Sequence progress indicator (optional) */}
      {trigger && (
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex space-x-2">
            {animationSequences[trigger as keyof typeof animationSequences]?.map((_, index) => (
              <motion.div
                key={index}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: sequenceStep > index ? '#FF69B4' : 'rgba(255,255,255,0.3)'
                }}
                animate={{
                  scale: sequenceStep === index + 1 ? [1, 1.5, 1] : 1
                }}
                transition={{
                  duration: 0.5,
                  repeat: sequenceStep === index + 1 ? Infinity : 0
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Hook for using the animation orchestrator
export const useAnimationOrchestrator = () => {
  const [currentTrigger, setCurrentTrigger] = useState<string | null>(null);

  const triggerSequence = useCallback((sequenceName: string) => {
    setCurrentTrigger(sequenceName);
  }, []);

  const clearTrigger = useCallback(() => {
    setCurrentTrigger(null);
  }, []);

  return {
    currentTrigger,
    triggerSequence,
    clearTrigger
  };
};