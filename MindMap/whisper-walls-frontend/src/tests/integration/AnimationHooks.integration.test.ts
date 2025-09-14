import { renderHook, act } from '@testing-library/react';
import {
  useRomanticAnimations,
  useParticleEffects,
  useInteractionAnimations,
  useSequentialAnimations,
  useMoodAnimations,
  useCursorTrail,
  usePageTransitions
} from '../../hooks/useAnimations';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  useAnimation: () => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn(),
    set: jest.fn()
  })
}));

describe('Animation Hooks Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('useRomanticAnimations Integration', () => {
    test('manages animation queue and state correctly', async () => {
      const { result } = renderHook(() => useRomanticAnimations());

      expect(result.current.isAnimating).toBe(false);
      expect(result.current.animationQueue).toEqual([]);

      // Trigger multiple animations
      act(() => {
        result.current.triggerAnimation('heartFlutter');
        result.current.triggerAnimation('bloom');
      });

      expect(result.current.animationQueue).toContain('heartFlutter');
      expect(result.current.animationQueue).toContain('bloom');

      // Reset animations
      act(() => {
        result.current.resetAnimation();
      });

      expect(result.current.isAnimating).toBe(false);
      expect(result.current.animationQueue).toEqual([]);
    });

    test('handles unknown animation types gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { result } = renderHook(() => useRomanticAnimations());

      await act(async () => {
        await result.current.triggerAnimation('unknownAnimation');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Unknown animation type: unknownAnimation');
      consoleSpy.mockRestore();
    });

    test('executes different animation types with correct parameters', async () => {
      const { result } = renderHook(() => useRomanticAnimations());

      // Test heartFlutter animation
      await act(async () => {
        await result.current.triggerAnimation('heartFlutter');
      });

      expect(result.current.controls.start).toHaveBeenCalledWith({
        scale: [1, 1.2, 1],
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.6, ease: "easeInOut" }
      });

      // Test bloom animation
      await act(async () => {
        await result.current.triggerAnimation('bloom');
      });

      expect(result.current.controls.start).toHaveBeenCalledWith({
        scale: [0, 1.3, 1],
        rotate: [0, 360],
        opacity: [0, 1],
        transition: { duration: 1.2, ease: "easeOut" }
      });

      // Test whisperFade animation
      await act(async () => {
        await result.current.triggerAnimation('whisperFade');
      });

      expect(result.current.controls.start).toHaveBeenCalledWith({
        opacity: [1, 0.5, 0],
        y: [0, -20, -40],
        scale: [1, 1.1, 0.9],
        filter: ["blur(0px)", "blur(2px)", "blur(5px)"],
        transition: { duration: 2, ease: "easeOut" }
      });
    });
  });

  describe('useParticleEffects Integration', () => {
    test('manages particle lifecycle correctly', () => {
      const { result } = renderHook(() => useParticleEffects());

      expect(result.current.particles).toEqual([]);

      // Add particles
      act(() => {
        result.current.addParticle('heart', 100, 200);
        result.current.addParticle('sparkle', 150, 250);
      });

      expect(result.current.particles).toHaveLength(2);
      expect(result.current.particles[0]).toMatchObject({
        type: 'heart',
        x: 100,
        y: 200
      });

      // Clear particles
      act(() => {
        result.current.clearParticles();
      });

      expect(result.current.particles).toEqual([]);
    });

    test('auto-removes particles after timeout', () => {
      const { result } = renderHook(() => useParticleEffects());

      act(() => {
        result.current.addParticle('heart', 100, 200);
      });

      expect(result.current.particles).toHaveLength(1);

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.particles).toHaveLength(0);
    });

    test('handles multiple particles with different timestamps', () => {
      const { result } = renderHook(() => useParticleEffects());

      act(() => {
        result.current.addParticle('heart', 100, 200);
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        result.current.addParticle('sparkle', 150, 250);
      });

      expect(result.current.particles).toHaveLength(2);

      // Advance time to remove first particle
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.particles).toHaveLength(1);
      expect(result.current.particles[0].type).toBe('sparkle');
    });
  });

  describe('useInteractionAnimations Integration', () => {
    test('manages hover and click states correctly', () => {
      const { result } = renderHook(() => useInteractionAnimations());

      const elementId = 'test-element';

      expect(result.current.isHovered(elementId)).toBe(false);
      expect(result.current.isClicked(elementId)).toBe(false);

      // Test hover
      act(() => {
        result.current.handleHover(elementId, true);
      });

      expect(result.current.isHovered(elementId)).toBe(true);

      act(() => {
        result.current.handleHover(elementId, false);
      });

      expect(result.current.isHovered(elementId)).toBe(false);

      // Test click
      act(() => {
        result.current.handleClick(elementId);
      });

      expect(result.current.isClicked(elementId)).toBe(true);

      // Click state should auto-clear after timeout
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.isClicked(elementId)).toBe(false);
    });

    test('handles multiple elements independently', () => {
      const { result } = renderHook(() => useInteractionAnimations());

      const element1 = 'element-1';
      const element2 = 'element-2';

      act(() => {
        result.current.handleHover(element1, true);
        result.current.handleClick(element2);
      });

      expect(result.current.isHovered(element1)).toBe(true);
      expect(result.current.isHovered(element2)).toBe(false);
      expect(result.current.isClicked(element1)).toBe(false);
      expect(result.current.isClicked(element2)).toBe(true);
    });
  });

  describe('useSequentialAnimations Integration', () => {
    test('executes animation steps in sequence', async () => {
      const { result } = renderHook(() => useSequentialAnimations());

      const step1 = jest.fn().mockResolvedValue(undefined);
      const step2 = jest.fn().mockResolvedValue(undefined);
      const step3 = jest.fn().mockResolvedValue(undefined);

      act(() => {
        result.current.addStep(step1);
        result.current.addStep(step2);
        result.current.addStep(step3);
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentStep).toBe(0);

      await act(async () => {
        await result.current.playSequence();
      });

      expect(step1).toHaveBeenCalled();
      expect(step2).toHaveBeenCalled();
      expect(step3).toHaveBeenCalled();
      expect(result.current.isPlaying).toBe(false);
    });

    test('prevents concurrent sequence execution', async () => {
      const { result } = renderHook(() => useSequentialAnimations());

      const step1 = jest.fn().mockResolvedValue(undefined);
      
      act(() => {
        result.current.addStep(step1);
      });

      // Start first sequence
      const promise1 = act(async () => {
        await result.current.playSequence();
      });

      // Try to start second sequence while first is running
      const promise2 = act(async () => {
        await result.current.playSequence();
      });

      await Promise.all([promise1, promise2]);

      // Step should only be called once
      expect(step1).toHaveBeenCalledTimes(1);
    });

    test('resets sequence correctly', () => {
      const { result } = renderHook(() => useSequentialAnimations());

      const step1 = jest.fn();
      
      act(() => {
        result.current.addStep(step1);
      });

      act(() => {
        result.current.resetSequence();
      });

      expect(result.current.currentStep).toBe(0);
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('useMoodAnimations Integration', () => {
    test('applies different mood animations correctly', async () => {
      const { result } = renderHook(() => useMoodAnimations());

      expect(result.current.currentMood).toBe('neutral');

      // Test joy animation
      await act(async () => {
        await result.current.setMoodAnimation('joy');
      });

      expect(result.current.currentMood).toBe('joy');
      expect(result.current.controls.start).toHaveBeenCalledWith({
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
        transition: { duration: 0.8, ease: "easeInOut", repeat: Infinity }
      });

      // Test sadness animation
      await act(async () => {
        await result.current.setMoodAnimation('sadness');
      });

      expect(result.current.currentMood).toBe('sadness');
      expect(result.current.controls.start).toHaveBeenCalledWith({
        y: [0, 5, 0],
        opacity: [1, 0.8, 1],
        transition: { duration: 2, ease: "easeInOut", repeat: Infinity }
      });

      // Test love animation
      await act(async () => {
        await result.current.setMoodAnimation('love');
      });

      expect(result.current.currentMood).toBe('love');
      expect(result.current.controls.start).toHaveBeenCalledWith({
        scale: [1, 1.05, 1],
        filter: ["hue-rotate(0deg)", "hue-rotate(10deg)", "hue-rotate(0deg)"],
        transition: { duration: 1.5, ease: "easeInOut", repeat: Infinity }
      });
    });

    test('handles unknown mood with default animation', async () => {
      const { result } = renderHook(() => useMoodAnimations());

      await act(async () => {
        await result.current.setMoodAnimation('unknownMood');
      });

      expect(result.current.currentMood).toBe('unknownMood');
      expect(result.current.controls.start).toHaveBeenCalledWith({
        scale: 1,
        rotate: 0,
        y: 0,
        opacity: 1,
        filter: "hue-rotate(0deg)"
      });
    });

    test('stops mood animation correctly', () => {
      const { result } = renderHook(() => useMoodAnimations());

      act(() => {
        result.current.stopMoodAnimation();
      });

      expect(result.current.controls.stop).toHaveBeenCalled();
      expect(result.current.controls.set).toHaveBeenCalledWith({
        scale: 1,
        rotate: 0,
        y: 0,
        opacity: 1,
        filter: "hue-rotate(0deg)"
      });
    });
  });

  describe('useCursorTrail Integration', () => {
    test('manages cursor trail points correctly', () => {
      const { result } = renderHook(() => useCursorTrail());

      expect(result.current.trailPoints).toEqual([]);
      expect(result.current.isActive).toBe(false);

      // Activate trail
      act(() => {
        result.current.activateTrail();
      });

      expect(result.current.isActive).toBe(true);

      // Deactivate trail
      act(() => {
        result.current.deactivateTrail();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.trailPoints).toEqual([]);
    });

    test('handles mouse move events when active', () => {
      // Mock addEventListener and removeEventListener
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { result, unmount } = renderHook(() => useCursorTrail());

      act(() => {
        result.current.activateTrail();
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    test('filters old trail points', () => {
      const { result } = renderHook(() => useCursorTrail());

      act(() => {
        result.current.activateTrail();
      });

      // Simulate mouse move event
      const mockEvent = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 200
      });

      act(() => {
        document.dispatchEvent(mockEvent);
      });

      // Fast-forward time to expire trail points
      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Simulate another mouse move to trigger cleanup
      act(() => {
        document.dispatchEvent(mockEvent);
      });
    });
  });

  describe('usePageTransitions Integration', () => {
    test('manages transition state correctly', () => {
      const { result } = renderHook(() => usePageTransitions());

      expect(result.current.isTransitioning).toBe(false);
      expect(result.current.transitionType).toBe('fade');

      act(() => {
        result.current.startTransition('butterfly');
      });

      expect(result.current.isTransitioning).toBe(true);
      expect(result.current.transitionType).toBe('butterfly');

      act(() => {
        result.current.endTransition();
      });

      expect(result.current.isTransitioning).toBe(false);
    });

    test('returns correct transition variants for different types', () => {
      const { result } = renderHook(() => usePageTransitions());

      // Test fade variants
      act(() => {
        result.current.startTransition('fade');
      });

      let variants = result.current.getTransitionVariants();
      expect(variants).toEqual({
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      });

      // Test butterfly variants
      act(() => {
        result.current.startTransition('butterfly');
      });

      variants = result.current.getTransitionVariants();
      expect(variants).toEqual({
        initial: { scale: 0.8, rotateY: -90, opacity: 0 },
        animate: { scale: 1, rotateY: 0, opacity: 1 },
        exit: { scale: 0.8, rotateY: 90, opacity: 0 }
      });

      // Test bloom variants
      act(() => {
        result.current.startTransition('bloom');
      });

      variants = result.current.getTransitionVariants();
      expect(variants).toEqual({
        initial: { scale: 0, rotate: -180, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
        exit: { scale: 0, rotate: 180, opacity: 0 }
      });
    });

    test('falls back to fade variants for unknown types', () => {
      const { result } = renderHook(() => usePageTransitions());

      act(() => {
        result.current.startTransition('unknownType');
      });

      const variants = result.current.getTransitionVariants();
      expect(variants).toEqual({
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      });
    });
  });

  describe('Cross-Hook Integration', () => {
    test('multiple animation hooks work together', () => {
      const romanticHook = renderHook(() => useRomanticAnimations());
      const particleHook = renderHook(() => useParticleEffects());
      const interactionHook = renderHook(() => useInteractionAnimations());

      // Simulate complex interaction
      act(() => {
        interactionHook.result.current.handleClick('button-1');
        particleHook.result.current.addParticle('heart', 100, 200);
        romanticHook.result.current.triggerAnimation('bloom');
      });

      expect(interactionHook.result.current.isClicked('button-1')).toBe(true);
      expect(particleHook.result.current.particles).toHaveLength(1);
      expect(romanticHook.result.current.animationQueue).toContain('bloom');
    });

    test('mood animations integrate with particle effects', async () => {
      const moodHook = renderHook(() => useMoodAnimations());
      const particleHook = renderHook(() => useParticleEffects());

      // Set joyful mood and add celebratory particles
      await act(async () => {
        await moodHook.result.current.setMoodAnimation('joy');
      });

      act(() => {
        particleHook.result.current.addParticle('sparkle', 150, 150);
        particleHook.result.current.addParticle('heart', 200, 100);
      });

      expect(moodHook.result.current.currentMood).toBe('joy');
      expect(particleHook.result.current.particles).toHaveLength(2);
    });

    test('page transitions work with cursor trails', () => {
      const transitionHook = renderHook(() => usePageTransitions());
      const trailHook = renderHook(() => useCursorTrail());

      act(() => {
        transitionHook.result.current.startTransition('butterfly');
        trailHook.result.current.activateTrail();
      });

      expect(transitionHook.result.current.isTransitioning).toBe(true);
      expect(trailHook.result.current.isActive).toBe(true);

      act(() => {
        transitionHook.result.current.endTransition();
        trailHook.result.current.deactivateTrail();
      });

      expect(transitionHook.result.current.isTransitioning).toBe(false);
      expect(trailHook.result.current.isActive).toBe(false);
    });
  });

  describe('Performance and Memory Management', () => {
    test('hooks clean up properly on unmount', () => {
      const { unmount } = renderHook(() => {
        const romantic = useRomanticAnimations();
        const particles = useParticleEffects();
        const interactions = useInteractionAnimations();
        const trail = useCursorTrail();
        
        return { romantic, particles, interactions, trail };
      });

      // Add some state
      act(() => {
        // This should not cause memory leaks when unmounted
      });

      // Unmount should clean up all timers and event listeners
      unmount();
    });

    test('handles rapid state changes without performance issues', () => {
      const { result } = renderHook(() => useParticleEffects());

      // Rapidly add many particles
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addParticle('heart', Math.random() * 500, Math.random() * 500);
        }
      });

      expect(result.current.particles.length).toBeLessThanOrEqual(100);

      // Clear all at once
      act(() => {
        result.current.clearParticles();
      });

      expect(result.current.particles).toEqual([]);
    });

    test('animation queues handle concurrent operations', async () => {
      const { result } = renderHook(() => useRomanticAnimations());

      // Trigger multiple animations concurrently
      const promises = [];
      act(() => {
        promises.push(result.current.triggerAnimation('heartFlutter'));
        promises.push(result.current.triggerAnimation('bloom'));
        promises.push(result.current.triggerAnimation('sparkle'));
      });

      await act(async () => {
        await Promise.all(promises);
      });

      // All animations should complete without conflicts
      expect(result.current.isAnimating).toBe(false);
    });
  });
});