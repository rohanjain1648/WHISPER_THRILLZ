import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import animation components for performance testing
import { 
  ParticleSystem, 
  BloomingWrapper, 
  HeartFlutter, 
  PulsingAura,
  ButterflySwarm,
  SparkleEffect,
  MagicalShimmer
} from '../../components/animations/AnimationSystem';
import { FloatingHearts, BloomingFlower, SparkleTrail } from '../../components/animations/RomanticAnimations';
import { 
  DreamyHover, 
  Magnetic, 
  RippleEffect, 
  CursorAttractor,
  EmotionalPulse 
} from '../../components/animations/Microinteractions';
import { AnimationOrchestrator } from '../../components/animations/AnimationOrchestrator';

// Mock performance APIs
const mockPerformanceNow = jest.fn();
const mockPerformanceMark = jest.fn();
const mockPerformanceMeasure = jest.fn();

Object.defineProperty(window, 'performance', {
  value: {
    now: mockPerformanceNow,
    mark: mockPerformanceMark,
    measure: mockPerformanceMeasure,
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => [])
  },
  writable: true
});

// Mock requestAnimationFrame
let rafCallbacks: (() => void)[] = [];
const mockRaf = jest.fn((callback: () => void) => {
  rafCallbacks.push(callback);
  return rafCallbacks.length;
});

const mockCancelRaf = jest.fn((id: number) => {
  rafCallbacks = rafCallbacks.filter((_, index) => index + 1 !== id);
});

Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRaf,
  writable: true
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: mockCancelRaf,
  writable: true
});

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  value: 1200,
  writable: true
});

Object.defineProperty(window, 'innerHeight', {
  value: 800,
  writable: true
});

// Performance monitoring utilities
class AnimationPerformanceMonitor {
  private frameCount = 0;
  private startTime = 0;
  private frameTimestamps: number[] = [];

  start() {
    this.frameCount = 0;
    this.startTime = performance.now();
    this.frameTimestamps = [];
  }

  recordFrame() {
    this.frameCount++;
    this.frameTimestamps.push(performance.now());
  }

  getFPS(): number {
    if (this.frameTimestamps.length < 2) return 0;
    
    const duration = this.frameTimestamps[this.frameTimestamps.length - 1] - this.frameTimestamps[0];
    return (this.frameTimestamps.length - 1) / (duration / 1000);
  }

  getAverageFrameTime(): number {
    if (this.frameTimestamps.length < 2) return 0;
    
    const frameTimes = [];
    for (let i = 1; i < this.frameTimestamps.length; i++) {
      frameTimes.push(this.frameTimestamps[i] - this.frameTimestamps[i - 1]);
    }
    
    return frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
  }

  getDroppedFrames(): number {
    const targetFrameTime = 1000 / 60; // 60 FPS
    let droppedFrames = 0;
    
    for (let i = 1; i < this.frameTimestamps.length; i++) {
      const frameTime = this.frameTimestamps[i] - this.frameTimestamps[i - 1];
      if (frameTime > targetFrameTime * 1.5) {
        droppedFrames++;
      }
    }
    
    return droppedFrames;
  }
}

describe('Animation Performance Tests', () => {
  let performanceMonitor: AnimationPerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new AnimationPerformanceMonitor();
    mockPerformanceNow.mockImplementation(() => Date.now());
    rafCallbacks = [];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const simulateAnimationFrames = (count: number, duration: number = 1000) => {
    const frameInterval = duration / count;
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        performanceMonitor.recordFrame();
        rafCallbacks.forEach(callback => callback());
      }, i * frameInterval);
    }
  };

  describe('Particle System Performance', () => {
    it('should maintain 60fps with low particle count', async () => {
      render(<ParticleSystem type="hearts" count={5} intensity="low" />);
      
      performanceMonitor.start();
      simulateAnimationFrames(60, 1000);
      
      await waitFor(() => {
        expect(performanceMonitor.getFPS()).toBeGreaterThan(55);
        expect(performanceMonitor.getDroppedFrames()).toBeLessThan(3);
      });
    });

    it('should handle high particle count efficiently', async () => {
      render(<ParticleSystem type="butterflies" count={20} intensity="high" />);
      
      performanceMonitor.start();
      simulateAnimationFrames(60, 1000);
      
      await waitFor(() => {
        expect(performanceMonitor.getFPS()).toBeGreaterThan(45);
        expect(performanceMonitor.getAverageFrameTime()).toBeLessThan(20);
      });
    });

    it('should optimize performance with different particle types', async () => {
      const { rerender } = render(<ParticleSystem type="sparkles" count={10} />);
      
      performanceMonitor.start();
      simulateAnimationFrames(30, 500);
      
      const sparklesFPS = performanceMonitor.getFPS();
      
      // Test different particle type
      rerender(<ParticleSystem type="petals" count={10} />);
      
      performanceMonitor.start();
      simulateAnimationFrames(30, 500);
      
      const petalsFPS = performanceMonitor.getFPS();
      
      // Both should maintain good performance
      expect(sparklesFPS).toBeGreaterThan(50);
      expect(petalsFPS).toBeGreaterThan(50);
    });
  });

  describe('Butterfly Swarm Performance', () => {
    it('should animate butterfly swarm smoothly', async () => {
      render(<ButterflySwarm count={8} area="medium" behavior="gentle" />);
      
      performanceMonitor.start();
      simulateAnimationFrames(60, 1000);
      
      await waitFor(() => {
        expect(performanceMonitor.getFPS()).toBeGreaterThan(55);
        expect(performanceMonitor.getDroppedFrames()).toBeLessThan(2);
      });
    });

    it('should handle energetic behavior efficiently', async () => {
      render(<ButterflySwarm count={10} area="large" behavior="energetic" />);
      
      performanceMonitor.start();
      simulateAnimationFrames(60, 1000);
      
      await waitFor(() => {
        expect(performanceMonitor.getFPS()).toBeGreaterThan(50);
        expect(performanceMonitor.getAverageFrameTime()).toBeLessThan(18);
      });
    });
  });

  describe('Microinteraction Performance', () => {
    it('should handle cursor attraction smoothly', async () => {
      const TestComponent = () => (
        <CursorAttractor strength={0.3} range={100}>
          <div>Test Content</div>
        </CursorAttractor>
      );
      
      render(<TestComponent />);
      
      performanceMonitor.start();
      
      // Simulate mouse movements
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseMove(document, {
          clientX: 100 + i * 10,
          clientY: 100 + i * 10
        });
      }
      
      simulateAnimationFrames(60, 1000);
      
      await waitFor(() => {
        expect(performanceMonitor.getFPS()).toBeGreaterThan(55);
      });
    });

    it('should handle emotional pulse animations efficiently', async () => {
      render(
        <EmotionalPulse emotion="love" intensity={1}>
          <div>Emotional Content</div>
        </EmotionalPulse>
      );
      
      performanceMonitor.start();
      simulateAnimationFrames(60, 1000);
      
      await waitFor(() => {
        expect(performanceMonitor.getFPS()).toBeGreaterThan(55);
        expect(performanceMonitor.getDroppedFrames()).toBeLessThan(3);
      });
    });
  });

  describe('Complex Animation Sequences', () => {
    it('should handle animation orchestrator sequences efficiently', async () => {
      const TestOrchestrator = () => {
        const [trigger, setTrigger] = React.useState<string | null>(null);
        
        React.useEffect(() => {
          setTrigger('match-found');
        }, []);
        
        return (
          <AnimationOrchestrator 
            trigger={trigger}
            onComplete={() => setTrigger(null)}
          />
        );
      };
      
      render(<TestOrchestrator />);
      
      performanceMonitor.start();
      simulateAnimationFrames(120, 2000); // Longer sequence
      
      await waitFor(() => {
        expect(performanceMonitor.getFPS()).toBeGreaterThan(45);
        expect(performanceMonitor.getAverageFrameTime()).toBeLessThan(25);
      });
    });

    it('should maintain performance with multiple simultaneous animations', async () => {
      render(
        <div>
          <ParticleSystem type="hearts" count={10} />
          <ButterflySwarm count={6} behavior="playful" />
          <SparkleEffect count={8} intensity="medium" />
          <MagicalShimmer intensity="medium">
            <div>Shimmer Content</div>
          </MagicalShimmer>
        </div>
      );
      
      performanceMonitor.start();
      simulateAnimationFrames(60, 1000);
      
      await waitFor(() => {
        expect(performanceMonitor.getFPS()).toBeGreaterThan(40);
        expect(performanceMonitor.getDroppedFrames()).toBeLessThan(5);
      });
    });
  });

  describe('Memory and Resource Management', () => {
    it('should clean up animation resources properly', async () => {
      const { unmount } = render(
        <ParticleSystem type="butterflies" count={15} />
      );
      
      // Simulate some animation frames
      simulateAnimationFrames(30, 500);
      
      const initialCallbackCount = rafCallbacks.length;
      
      // Unmount component
      unmount();
      
      // Verify cleanup
      expect(rafCallbacks.length).toBeLessThanOrEqual(initialCallbackCount);
    });

    it('should handle rapid component mounting/unmounting', async () => {
      const TestComponent = ({ show }: { show: boolean }) => (
        show ? <FloatingHearts trigger={true} count={8} /> : null
      );
      
      const { rerender } = render(<TestComponent show={true} />);
      
      // Rapidly toggle component
      for (let i = 0; i < 5; i++) {
        rerender(<TestComponent show={false} />);
        rerender(<TestComponent show={true} />);
      }
      
      performanceMonitor.start();
      simulateAnimationFrames(60, 1000);
      
      await waitFor(() => {
        expect(performanceMonitor.getFPS()).toBeGreaterThan(50);
      });
    });
  });

  describe('Animation Quality Metrics', () => {
    it('should maintain smooth transitions during state changes', async () => {
      const TestComponent = () => {
        const [isActive, setIsActive] = React.useState(false);
        
        return (
          <div>
            <button onClick={() => setIsActive(!isActive)}>
              Toggle Animation
            </button>
            <BloomingWrapper trigger={isActive}>
              <div>Blooming Content</div>
            </BloomingWrapper>
          </div>
        );
      };
      
      const { getByText } = render(<TestComponent />);
      
      performanceMonitor.start();
      
      // Trigger animation
      fireEvent.click(getByText('Toggle Animation'));
      
      simulateAnimationFrames(60, 1000);
      
      await waitFor(() => {
        expect(performanceMonitor.getFPS()).toBeGreaterThan(55);
        expect(performanceMonitor.getAverageFrameTime()).toBeLessThan(17); // ~60fps
      });
    });

    it('should handle responsive design changes smoothly', async () => {
      render(<ParticleSystem type="sparkles" count={12} />);
      
      performanceMonitor.start();
      
      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', { value: 800 });
      Object.defineProperty(window, 'innerHeight', { value: 600 });
      fireEvent.resize(window);
      
      simulateAnimationFrames(60, 1000);
      
      await waitFor(() => {
        expect(performanceMonitor.getFPS()).toBeGreaterThan(50);
      });
    });
  });
});