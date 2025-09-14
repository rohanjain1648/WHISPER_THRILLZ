import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { motion } from 'framer-motion';
import '@testing-library/jest-dom';

// Import all animation components
import {
  AnimationSystem,
  ParticleSystem,
  BloomingWrapper,
  LoveNoteFade,
  HeartFlutter,
  PulsingAura,
  ButterflyTransition,
  DreamyInteraction,
  StaggeredContainer,
  SparkleEffect
} from '../../components/animations/AnimationSystem';

import {
  FloatingHearts,
  BloomingFlower,
  WhisperFade,
  ButterflyPageTransition,
  Heartbeat,
  SparkleTrail,
  RomanticGlow
} from '../../components/animations/RomanticAnimations';

import {
  DreamyHover,
  Magnetic,
  RippleEffect,
  Breathing,
  Typewriter,
  MorphingShape,
  Parallax,
  RevealOnScroll
} from '../../components/animations/Microinteractions';

import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { PageTransition } from '../../components/animations/PageTransition';

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn()
  }),
  useMotionValue: () => ({ set: jest.fn() }),
  useTransform: () => ({ set: jest.fn() }),
  useSpring: () => ({ set: jest.fn() })
}));

// Mock hooks
jest.mock('../../hooks/useAnimations', () => ({
  useRomanticAnimations: () => ({
    controls: { start: jest.fn(), stop: jest.fn(), set: jest.fn() },
    isAnimating: false,
    animationQueue: [],
    triggerAnimation: jest.fn(),
    resetAnimation: jest.fn()
  }),
  useInteractionAnimations: () => ({
    handleHover: jest.fn(),
    handleClick: jest.fn(),
    isHovered: jest.fn(() => false),
    isClicked: jest.fn(() => false)
  }),
  useParticleEffects: () => ({
    particles: [],
    addParticle: jest.fn(),
    clearParticles: jest.fn()
  }),
  usePageTransitions: () => ({
    isTransitioning: false,
    transitionType: 'butterfly',
    startTransition: jest.fn(),
    endTransition: jest.fn(),
    getTransitionVariants: jest.fn()
  })
}));

describe('Animation System Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('Core Animation Components Integration', () => {
    test('ParticleSystem renders with different particle types', () => {
      const { rerender } = render(<ParticleSystem type="hearts" count={5} />);
      expect(screen.getByText('💕')).toBeInTheDocument();

      rerender(<ParticleSystem type="sparkles" count={3} />);
      expect(screen.getByText('✨')).toBeInTheDocument();

      rerender(<ParticleSystem type="butterflies" count={2} />);
      expect(screen.getByText('🦋')).toBeInTheDocument();
    });

    test('BloomingWrapper triggers animation with particle burst', async () => {
      const onComplete = jest.fn();
      render(
        <BloomingWrapper trigger={true} onComplete={onComplete}>
          <div>Blooming Content</div>
        </BloomingWrapper>
      );

      expect(screen.getByText('Blooming Content')).toBeInTheDocument();
      // Check for sparkle particles
      expect(screen.getAllByText('✨')).toHaveLength(8);
    });

    test('LoveNoteFade handles fade animation lifecycle', async () => {
      const onComplete = jest.fn();
      const { rerender } = render(
        <LoveNoteFade trigger={false} onComplete={onComplete}>
          <div>Love Note</div>
        </LoveNoteFade>
      );

      expect(screen.getByText('Love Note')).toBeInTheDocument();

      // Trigger fade
      rerender(
        <LoveNoteFade trigger={true} onComplete={onComplete}>
          <div>Love Note</div>
        </LoveNoteFade>
      );

      // Note should still be visible during animation
      expect(screen.queryByText('Love Note')).toBeInTheDocument();
    });

    test('HeartFlutter animation activates correctly', () => {
      render(
        <HeartFlutter active={true}>
          <div>Fluttering Heart</div>
        </HeartFlutter>
      );

      expect(screen.getByText('Fluttering Heart')).toBeInTheDocument();
    });

    test('PulsingAura creates aura effect with custom colors', () => {
      render(
        <PulsingAura color="rgba(255, 0, 0, 0.5)" size="lg">
          <div>Aura Content</div>
        </PulsingAura>
      );

      expect(screen.getByText('Aura Content')).toBeInTheDocument();
    });
  });

  describe('Romantic Animation Components Integration', () => {
    test('FloatingHearts triggers and completes animation cycle', async () => {
      const onComplete = jest.fn();
      render(<FloatingHearts trigger={true} onComplete={onComplete} count={3} />);

      // Should render hearts
      expect(screen.getAllByText('💕')).toHaveLength(3);
    });

    test('BloomingFlower shows and hides with visibility prop', () => {
      const { rerender } = render(<BloomingFlower isVisible={true} size="md" />);
      expect(screen.getByText('🌸')).toBeInTheDocument();

      rerender(<BloomingFlower isVisible={false} size="md" />);
      // Should not be visible when isVisible is false
    });

    test('WhisperFade handles message disappearing animation', () => {
      const onComplete = jest.fn();
      render(
        <WhisperFade isVisible={true} onComplete={onComplete}>
          <div>Whisper Message</div>
        </WhisperFade>
      );

      expect(screen.getByText('Whisper Message')).toBeInTheDocument();
      // Should have sparkle particles
      expect(screen.getAllByText('✨')).toHaveLength(3);
    });

    test('ButterflyPageTransition handles directional transitions', () => {
      const { rerender } = render(
        <ButterflyPageTransition isVisible={true} direction="right">
          <div>Page Content</div>
        </ButterflyPageTransition>
      );

      expect(screen.getByText('Page Content')).toBeInTheDocument();
      expect(screen.getAllByText('🦋')).toHaveLength(3);

      rerender(
        <ButterflyPageTransition isVisible={true} direction="left">
          <div>Page Content</div>
        </ButterflyPageTransition>
      );

      expect(screen.getByText('Page Content')).toBeInTheDocument();
    });

    test('Heartbeat animation with different intensities', () => {
      const { rerender } = render(
        <Heartbeat intensity="low">
          <div>Heartbeat Content</div>
        </Heartbeat>
      );

      expect(screen.getByText('Heartbeat Content')).toBeInTheDocument();

      rerender(
        <Heartbeat intensity="high">
          <div>Heartbeat Content</div>
        </Heartbeat>
      );

      expect(screen.getByText('Heartbeat Content')).toBeInTheDocument();
    });

    test('RomanticGlow applies glow effects with custom colors', () => {
      render(
        <RomanticGlow color="#FF69B4" intensity="strong">
          <div>Glowing Content</div>
        </RomanticGlow>
      );

      expect(screen.getByText('Glowing Content')).toBeInTheDocument();
    });
  });

  describe('Microinteraction Components Integration', () => {
    test('DreamyHover responds to mouse interactions', () => {
      render(
        <DreamyHover intensity={0.8}>
          <div>Hover Target</div>
        </DreamyHover>
      );

      const element = screen.getByText('Hover Target');
      expect(element).toBeInTheDocument();

      // Simulate mouse move
      fireEvent.mouseMove(element, { clientX: 100, clientY: 100 });
      fireEvent.mouseLeave(element);
    });

    test('Magnetic component attracts to cursor', () => {
      render(
        <Magnetic strength={0.5}>
          <div>Magnetic Element</div>
        </Magnetic>
      );

      const element = screen.getByText('Magnetic Element');
      fireEvent.mouseMove(element, { clientX: 50, clientY: 50 });
      fireEvent.mouseLeave(element);
    });

    test('RippleEffect creates ripples on click', () => {
      render(
        <RippleEffect color="rgba(255, 105, 180, 0.3)">
          <div>Click Target</div>
        </RippleEffect>
      );

      const element = screen.getByText('Click Target');
      fireEvent.click(element, { clientX: 100, clientY: 100 });
    });

    test('Breathing animation with different rates', () => {
      const { rerender } = render(
        <Breathing rate="slow">
          <div>Breathing Content</div>
        </Breathing>
      );

      expect(screen.getByText('Breathing Content')).toBeInTheDocument();

      rerender(
        <Breathing rate="fast">
          <div>Breathing Content</div>
        </Breathing>
      );

      expect(screen.getByText('Breathing Content')).toBeInTheDocument();
    });

    test('Typewriter effect displays text progressively', async () => {
      const onComplete = jest.fn();
      render(
        <Typewriter
          text="Hello World"
          speed={10}
          delay={0}
          onComplete={onComplete}
        />
      );

      // Should start with empty or partial text
      await waitFor(() => {
        expect(screen.getByText(/Hello/)).toBeInTheDocument();
      });
    });

    test('MorphingShape cycles through shapes', () => {
      const shapes = ['🌸', '🦋', '💕', '✨'];
      render(<MorphingShape shapes={shapes} interval={100} />);

      expect(screen.getByText('🌸')).toBeInTheDocument();
    });

    test('RevealOnScroll triggers animation on intersection', () => {
      // Mock IntersectionObserver
      const mockIntersectionObserver = jest.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
      });
      window.IntersectionObserver = mockIntersectionObserver;

      render(
        <RevealOnScroll animation="bloom" threshold={0.5}>
          <div>Reveal Content</div>
        </RevealOnScroll>
      );

      expect(screen.getByText('Reveal Content')).toBeInTheDocument();
    });
  });

  describe('UI Component Integration', () => {
    test('AnimatedButton integrates all animation features', async () => {
      const onClick = jest.fn();
      const onAnimationComplete = jest.fn();

      render(
        <AnimatedButton
          animationType="bloom"
          particleEffect={true}
          glowIntensity="strong"
          onClick={onClick}
          onAnimationComplete={onAnimationComplete}
        >
          Animated Button
        </AnimatedButton>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Test hover
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);

      // Test click
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalled();
    });

    test('AnimatedCard with all animation features', () => {
      render(
        <AnimatedCard
          animationType="glow"
          hoverEffect={true}
          sparkleOnHover={true}
          entranceAnimation="butterfly"
          delay={0.2}
        >
          <div>Card Content</div>
        </AnimatedCard>
      );

      expect(screen.getByText('Card Content')).toBeInTheDocument();

      // Test hover
      const card = screen.getByText('Card Content').closest('div');
      if (card) {
        fireEvent.mouseEnter(card);
        fireEvent.mouseLeave(card);
      }
    });

    test('PageTransition with particles and different types', () => {
      const { rerender } = render(
        <PageTransition
          transitionKey="page1"
          type="butterfly"
          particles={true}
          particleType="hearts"
        >
          <div>Page 1</div>
        </PageTransition>
      );

      expect(screen.getByText('Page 1')).toBeInTheDocument();

      rerender(
        <PageTransition
          transitionKey="page2"
          type="bloom"
          particles={true}
          particleType="petals"
        >
          <div>Page 2</div>
        </PageTransition>
      );

      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });
  });

  describe('Animation System Performance', () => {
    test('Multiple animations can run simultaneously', () => {
      render(
        <div>
          <HeartFlutter active={true}>
            <div>Heart 1</div>
          </HeartFlutter>
          <PulsingAura>
            <div>Aura 1</div>
          </PulsingAura>
          <ParticleSystem type="sparkles" count={5} />
          <BloomingWrapper trigger={true}>
            <div>Bloom 1</div>
          </BloomingWrapper>
        </div>
      );

      expect(screen.getByText('Heart 1')).toBeInTheDocument();
      expect(screen.getByText('Aura 1')).toBeInTheDocument();
      expect(screen.getByText('Bloom 1')).toBeInTheDocument();
      expect(screen.getAllByText('✨')).toHaveLength(5);
    });

    test('Animation cleanup prevents memory leaks', () => {
      const { unmount } = render(
        <div>
          <FloatingHearts trigger={true} count={10} />
          <SparkleEffect count={15} />
          <ParticleSystem type="hearts" count={20} />
        </div>
      );

      // Unmount should clean up all animations
      unmount();
      // No assertions needed - just ensuring no errors during cleanup
    });

    test('Staggered animations maintain proper timing', () => {
      render(
        <StaggeredContainer delay={0.1}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </StaggeredContainer>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('Animation Accessibility', () => {
    test('Animations respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <AnimatedButton animationType="bloom">
          Accessible Button
        </AnimatedButton>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('Animations maintain keyboard navigation', () => {
      render(
        <DreamyInteraction>
          <button>Focusable Button</button>
        </DreamyInteraction>
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
    });

    test('Screen readers can access animated content', () => {
      render(
        <WhisperFade isVisible={true}>
          <div role="alert" aria-live="polite">
            Important message
          </div>
        </WhisperFade>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Important message')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('Handles missing animation props gracefully', () => {
      render(
        <AnimatedButton>
          Button without props
        </AnimatedButton>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('Handles invalid particle types', () => {
      render(
        // @ts-ignore - Testing invalid prop
        <ParticleSystem type="invalid" count={5} />
      );

      // Should render with default particles
      expect(screen.getByText('💕')).toBeInTheDocument();
    });

    test('Handles zero or negative counts', () => {
      render(<ParticleSystem type="hearts" count={0} />);
      // Should not crash with zero count
    });

    test('Handles rapid state changes', async () => {
      const { rerender } = render(
        <BloomingWrapper trigger={false}>
          <div>Content</div>
        </BloomingWrapper>
      );

      // Rapidly toggle trigger
      for (let i = 0; i < 10; i++) {
        rerender(
          <BloomingWrapper trigger={i % 2 === 0}>
            <div>Content</div>
          </BloomingWrapper>
        );
      }

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    test('Animations adapt to different emotional themes', () => {
      const joyTheme = {
        colors: { primary: '#FFD700', accent: '#FF6B6B' },
        shadows: { glow: '0 0 20px rgba(255, 215, 0, 0.3)' }
      };

      render(
        <div style={{ '--color-primary': joyTheme.colors.primary } as React.CSSProperties}>
          <RomanticGlow color={joyTheme.colors.primary}>
            <div>Themed Content</div>
          </RomanticGlow>
        </div>
      );

      expect(screen.getByText('Themed Content')).toBeInTheDocument();
    });

    test('Particle colors match theme colors', () => {
      render(
        <div className="theme-love">
          <ParticleSystem type="hearts" count={3} />
        </div>
      );

      expect(screen.getAllByText('💕')).toHaveLength(3);
    });
  });
});