// Core Animation System
export {
  animationVariants,
  ParticleSystem,
  BloomingWrapper,
  LoveNoteFade,
  HeartFlutter,
  PulsingAura,
  ButterflyTransition,
  DreamyInteraction,
  StaggeredContainer,
  SparkleEffect,
  ButterflySwarm,
  MagicalShimmer
} from './AnimationSystem';

// Romantic Animations
export {
  FloatingHearts,
  BloomingFlower,
  WhisperFade,
  ButterflyPageTransition,
  Heartbeat,
  SparkleTrail,
  RomanticGlow
} from './RomanticAnimations';

// Microinteractions
export {
  DreamyHover,
  Magnetic,
  RippleEffect,
  Breathing,
  Typewriter,
  MorphingShape,
  Parallax,
  RevealOnScroll,
  CursorAttractor,
  EmotionalPulse
} from './Microinteractions';

// Page Transitions
export {
  PageTransition,
  ButterflyPageTransition as ButterflyPageTransitionComponent,
  BloomPageTransition,
  WhisperPageTransition,
  RouteTransition
} from './PageTransition';

// Animation Orchestrator
export {
  AnimationOrchestrator,
  useAnimationOrchestrator
} from './AnimationOrchestrator';

// Animation Types
export interface AnimationConfig {
  type: 'fade' | 'slide' | 'butterfly' | 'bloom' | 'whisper';
  duration?: number;
  delay?: number;
  easing?: string;
}

export interface ParticleConfig {
  type: 'hearts' | 'sparkles' | 'petals' | 'butterflies' | 'stardust' | 'bubbles';
  count?: number;
  intensity?: 'low' | 'medium' | 'high';
  direction?: 'up' | 'down' | 'left' | 'right' | 'random';
  speed?: 'slow' | 'normal' | 'fast';
}

export interface MicrointeractionConfig {
  hover?: boolean;
  click?: boolean;
  focus?: boolean;
  scroll?: boolean;
  cursor?: boolean;
}

export interface EmotionalAnimationConfig {
  emotion: 'joy' | 'love' | 'excitement' | 'calm' | 'surprise' | 'nostalgia' | 'hope';
  intensity: number; // 0-1
  duration?: number;
  particles?: boolean;
}

// Animation Presets
export const ANIMATION_PRESETS = {
  // Romantic presets
  LOVE_CONFESSION: {
    sequence: 'match-found',
    particles: { type: 'hearts', count: 15, intensity: 'high' },
    emotion: 'love',
    intensity: 1
  },
  
  GENTLE_WHISPER: {
    sequence: 'message-sent',
    particles: { type: 'petals', count: 8, intensity: 'medium' },
    emotion: 'calm',
    intensity: 0.7
  },
  
  JOYFUL_DISCOVERY: {
    sequence: 'mood-detected',
    particles: { type: 'sparkles', count: 12, intensity: 'high' },
    emotion: 'joy',
    intensity: 0.9
  },
  
  MAGICAL_CONNECTION: {
    sequence: 'connection-made',
    particles: { type: 'butterflies', count: 10, intensity: 'medium' },
    emotion: 'surprise',
    intensity: 0.8
  },
  
  // Mood-based presets
  NOSTALGIC_MOMENT: {
    particles: { type: 'petals', count: 6, intensity: 'low', speed: 'slow' },
    emotion: 'nostalgia',
    intensity: 0.6
  },
  
  HOPEFUL_FUTURE: {
    particles: { type: 'stardust', count: 10, intensity: 'medium' },
    emotion: 'hope',
    intensity: 0.8
  },
  
  EXCITED_ENERGY: {
    particles: { type: 'sparkles', count: 20, intensity: 'high', speed: 'fast' },
    emotion: 'excitement',
    intensity: 1
  }
} as const;

// Utility functions
export const createAnimationSequence = (
  animations: Array<{
    type: string;
    delay: number;
    duration: number;
    config?: any;
  }>
) => {
  return animations;
};

export const getEmotionalColor = (emotion: string): string => {
  const emotionColors = {
    joy: '#FFD700',
    love: '#FF69B4',
    excitement: '#FF4500',
    calm: '#87CEEB',
    surprise: '#9370DB',
    nostalgia: '#DDA0DD',
    hope: '#98FB98'
  };
  
  return emotionColors[emotion as keyof typeof emotionColors] || '#FF69B4';
};

export const calculateAnimationIntensity = (
  baseIntensity: number,
  userMood: number,
  contextFactor: number = 1
): number => {
  return Math.min(1, Math.max(0, baseIntensity * userMood * contextFactor));
};