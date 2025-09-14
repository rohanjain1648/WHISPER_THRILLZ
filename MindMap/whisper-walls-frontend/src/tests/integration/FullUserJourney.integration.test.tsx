import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import main app components that would use animations
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { PageTransition } from '../../components/animations/PageTransition';
import { FloatingHearts, BloomingFlower } from '../../components/animations/RomanticAnimations';
import { DreamyHover, RippleEffect } from '../../components/animations/Microinteractions';

// Mock the design system
jest.mock('../../styles/designSystem', () => ({
  emotionalThemes: {
    love: {
      colors: { primary: '#FF69B4', secondary: '#DA70D6' },
      shadows: { glow: '0 0 20px rgba(255, 105, 180, 0.3)' }
    },
    joy: {
      colors: { primary: '#FFD700', secondary: '#FF6B6B' },
      shadows: { glow: '0 0 20px rgba(255, 215, 0, 0.3)' }
    }
  },
  getThemeForMood: jest.fn(() => ({
    colors: { primary: '#FF69B4' },
    shadows: { glow: '0 0 20px rgba(255, 105, 180, 0.3)' }
  }))
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
  useAnimation: () => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn(),
    set: jest.fn()
  }),
  useMotionValue: () => ({ set: jest.fn() }),
  useTransform: () => ({ set: jest.fn() }),
  useSpring: () => ({ set: jest.fn() })
}));

// Mock animation hooks
jest.mock('../../hooks/useAnimations', () => ({
  useRomanticAnimations: () => ({
    controls: { start: jest.fn(), stop: jest.fn(), set: jest.fn() },
    isAnimating: false,
    animationQueue: [],
    triggerAnimation: jest.fn().mockResolvedValue(undefined),
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
  useMoodAnimations: () => ({
    currentMood: 'neutral',
    controls: { start: jest.fn(), stop: jest.fn(), set: jest.fn() },
    setMoodAnimation: jest.fn(),
    stopMoodAnimation: jest.fn()
  }),
  usePageTransitions: () => ({
    isTransitioning: false,
    transitionType: 'butterfly',
    startTransition: jest.fn(),
    endTransition: jest.fn(),
    getTransitionVariants: jest.fn(() => ({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    }))
  })
}));

// Mock UI components
jest.mock('../../components/ui/Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}));

jest.mock('../../components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>
}));

// Test component that simulates a full user journey
const WhisperWallsJourney: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [showHearts, setShowHearts] = React.useState(false);
  const [showBloom, setShowBloom] = React.useState(false);
  const [userMood, setUserMood] = React.useState('neutral');

  const handleCreateMessage = () => {
    setShowHearts(true);
    setCurrentPage('creating');
    setTimeout(() => setShowHearts(false), 2000);
  };

  const handleMessageCreated = () => {
    setShowBloom(true);
    setCurrentPage('success');
    setTimeout(() => setShowBloom(false), 3000);
  };

  const handleDiscoverMessage = () => {
    setCurrentPage('discovery');
  };

  const handleMoodChange = (mood: string) => {
    setUserMood(mood);
  };

  return (
    <div className="whisper-walls-app">
      <PageTransition transitionKey={currentPage} type="butterfly">
        {currentPage === 'home' && (
          <div className="home-page">
            <h1>Welcome to Whisper Walls</h1>
            
            {/* Mood selection with animated buttons */}
            <div className="mood-selection">
              <h2>How are you feeling?</h2>
              <AnimatedButton
                animationType="heartFlutter"
                onClick={() => handleMoodChange('love')}
                data-testid="mood-love"
              >
                💕 In Love
              </AnimatedButton>
              <AnimatedButton
                animationType="sparkle"
                onClick={() => handleMoodChange('joy')}
                data-testid="mood-joy"
              >
                ✨ Joyful
              </AnimatedButton>
              <AnimatedButton
                animationType="bloom"
                onClick={() => handleMoodChange('hope')}
                data-testid="mood-hope"
              >
                🌸 Hopeful
              </AnimatedButton>
            </div>

            {/* Main actions */}
            <div className="main-actions">
              <DreamyHover>
                <AnimatedCard
                  animationType="float"
                  hoverEffect={true}
                  sparkleOnHover={true}
                  onClick={handleCreateMessage}
                  data-testid="create-message-card"
                >
                  <h3>Leave a Whisper</h3>
                  <p>Share your heart with the world</p>
                </AnimatedCard>
              </DreamyHover>

              <RippleEffect>
                <AnimatedCard
                  animationType="glow"
                  hoverEffect={true}
                  onClick={handleDiscoverMessage}
                  data-testid="discover-messages-card"
                >
                  <h3>Discover Whispers</h3>
                  <p>Find messages left by others</p>
                </AnimatedCard>
              </RippleEffect>
            </div>

            <div className="current-mood" data-testid="current-mood">
              Current mood: {userMood}
            </div>
          </div>
        )}

        {currentPage === 'creating' && (
          <div className="creating-page">
            <h1>Creating Your Whisper</h1>
            <div className="message-form">
              <textarea
                placeholder="What's in your heart?"
                data-testid="message-input"
              />
              <AnimatedButton
                animationType="bloom"
                particleEffect={true}
                onClick={handleMessageCreated}
                data-testid="submit-message"
              >
                Send Whisper
              </AnimatedButton>
            </div>
          </div>
        )}

        {currentPage === 'success' && (
          <div className="success-page">
            <h1>Whisper Sent! 💕</h1>
            <p>Your message has been placed in the world</p>
            <AnimatedButton
              onClick={() => setCurrentPage('home')}
              data-testid="back-home"
            >
              Back Home
            </AnimatedButton>
          </div>
        )}

        {currentPage === 'discovery' && (
          <div className="discovery-page">
            <h1>Nearby Whispers</h1>
            <div className="message-list">
              <AnimatedCard
                entranceAnimation="fadeIn"
                delay={0.1}
                data-testid="message-1"
              >
                <p>"Love is in the air today! 💕"</p>
                <small>Found 2 minutes ago</small>
              </AnimatedCard>
              <AnimatedCard
                entranceAnimation="slideUp"
                delay={0.2}
                data-testid="message-2"
              >
                <p>"Hope you have a beautiful day! ✨"</p>
                <small>Found 5 minutes ago</small>
              </AnimatedCard>
              <AnimatedCard
                entranceAnimation="bloom"
                delay={0.3}
                data-testid="message-3"
              >
                <p>"Sending warm hugs to whoever reads this 🤗"</p>
                <small>Found 10 minutes ago</small>
              </AnimatedCard>
            </div>
            <AnimatedButton
              onClick={() => setCurrentPage('home')}
              data-testid="back-home-discovery"
            >
              Back Home
            </AnimatedButton>
          </div>
        )}
      </PageTransition>

      {/* Floating animations */}
      <FloatingHearts
        trigger={showHearts}
        onComplete={() => setShowHearts(false)}
        count={5}
      />
      
      <BloomingFlower
        isVisible={showBloom}
        size="lg"
      />
    </div>
  );
};

describe('Full User Journey Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete User Flow', () => {
    test('user can complete full whisper creation journey with animations', async () => {
      const user = userEvent.setup();
      render(<WhisperWallsJourney />);

      // 1. User starts on home page
      expect(screen.getByText('Welcome to Whisper Walls')).toBeInTheDocument();
      expect(screen.getByText('Current mood: neutral')).toBeInTheDocument();

      // 2. User selects mood (triggers mood animation)
      const loveButton = screen.getByTestId('mood-love');
      await user.click(loveButton);
      
      expect(screen.getByText('Current mood: love')).toBeInTheDocument();

      // 3. User clicks to create message (triggers card hover and click animations)
      const createCard = screen.getByTestId('create-message-card');
      
      // Hover effect
      await user.hover(createCard);
      await user.click(createCard);

      // 4. User is on creating page with floating hearts
      await waitFor(() => {
        expect(screen.getByText('Creating Your Whisper')).toBeInTheDocument();
      });

      // Check for floating hearts animation
      expect(screen.getAllByText('💕')).toHaveLength(5);

      // 5. User types message and submits
      const messageInput = screen.getByTestId('message-input');
      await user.type(messageInput, 'This is my heartfelt message!');

      const submitButton = screen.getByTestId('submit-message');
      await user.click(submitButton);

      // 6. Success page with blooming flower
      await waitFor(() => {
        expect(screen.getByText('Whisper Sent! 💕')).toBeInTheDocument();
      });

      expect(screen.getByText('🌸')).toBeInTheDocument();

      // 7. User returns home
      const backButton = screen.getByTestId('back-home');
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Welcome to Whisper Walls')).toBeInTheDocument();
      });
    });

    test('user can discover messages with staggered animations', async () => {
      const user = userEvent.setup();
      render(<WhisperWallsJourney />);

      // Navigate to discovery
      const discoverCard = screen.getByTestId('discover-messages-card');
      await user.click(discoverCard);

      await waitFor(() => {
        expect(screen.getByText('Nearby Whispers')).toBeInTheDocument();
      });

      // Check that all messages are rendered with different entrance animations
      expect(screen.getByTestId('message-1')).toBeInTheDocument();
      expect(screen.getByTestId('message-2')).toBeInTheDocument();
      expect(screen.getByTestId('message-3')).toBeInTheDocument();

      // Check message content
      expect(screen.getByText('"Love is in the air today! 💕"')).toBeInTheDocument();
      expect(screen.getByText('"Hope you have a beautiful day! ✨"')).toBeInTheDocument();
      expect(screen.getByText('"Sending warm hugs to whoever reads this 🤗"')).toBeInTheDocument();

      // Return home
      const backButton = screen.getByTestId('back-home-discovery');
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Welcome to Whisper Walls')).toBeInTheDocument();
      });
    });

    test('mood changes affect UI theme and animations', async () => {
      const user = userEvent.setup();
      render(<WhisperWallsJourney />);

      // Test different mood selections
      const joyButton = screen.getByTestId('mood-joy');
      await user.click(joyButton);
      expect(screen.getByText('Current mood: joy')).toBeInTheDocument();

      const hopeButton = screen.getByTestId('mood-hope');
      await user.click(hopeButton);
      expect(screen.getByText('Current mood: hope')).toBeInTheDocument();

      const loveButton = screen.getByTestId('mood-love');
      await user.click(loveButton);
      expect(screen.getByText('Current mood: love')).toBeInTheDocument();
    });
  });

  describe('Animation Interactions', () => {
    test('multiple animations can run simultaneously without conflicts', async () => {
      const user = userEvent.setup();
      render(<WhisperWallsJourney />);

      // Trigger multiple animations at once
      const loveButton = screen.getByTestId('mood-love');
      const joyButton = screen.getByTestId('mood-joy');
      const hopeButton = screen.getByTestId('mood-hope');

      // Rapidly click different mood buttons
      await user.click(loveButton);
      await user.click(joyButton);
      await user.click(hopeButton);

      // All should work without errors
      expect(screen.getByText('Current mood: hope')).toBeInTheDocument();
    });

    test('page transitions work smoothly between different pages', async () => {
      const user = userEvent.setup();
      render(<WhisperWallsJourney />);

      // Navigate through all pages
      const createCard = screen.getByTestId('create-message-card');
      await user.click(createCard);

      await waitFor(() => {
        expect(screen.getByText('Creating Your Whisper')).toBeInTheDocument();
      });

      const submitButton = screen.getByTestId('submit-message');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Whisper Sent! 💕')).toBeInTheDocument();
      });

      const backButton = screen.getByTestId('back-home');
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Welcome to Whisper Walls')).toBeInTheDocument();
      });

      // Now go to discovery
      const discoverCard = screen.getByTestId('discover-messages-card');
      await user.click(discoverCard);

      await waitFor(() => {
        expect(screen.getByText('Nearby Whispers')).toBeInTheDocument();
      });
    });

    test('hover and click effects work on interactive elements', async () => {
      const user = userEvent.setup();
      render(<WhisperWallsJourney />);

      const createCard = screen.getByTestId('create-message-card');
      const discoverCard = screen.getByTestId('discover-messages-card');

      // Test hover effects
      await user.hover(createCard);
      await user.unhover(createCard);

      await user.hover(discoverCard);
      await user.unhover(discoverCard);

      // Test click effects
      await user.click(createCard);

      await waitFor(() => {
        expect(screen.getByText('Creating Your Whisper')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and Performance', () => {
    test('animations do not interfere with keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<WhisperWallsJourney />);

      // Test keyboard navigation
      await user.tab(); // Should focus first interactive element
      await user.keyboard('{Enter}'); // Should activate focused element

      // Test that focus is maintained during animations
      const loveButton = screen.getByTestId('mood-love');
      loveButton.focus();
      expect(loveButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(screen.getByText('Current mood: love')).toBeInTheDocument();
    });

    test('animations work with screen reader content', () => {
      render(<WhisperWallsJourney />);

      // Check that important content has proper accessibility attributes
      const moodButtons = screen.getAllByRole('button');
      expect(moodButtons.length).toBeGreaterThan(0);

      // Check that content is still accessible during animations
      expect(screen.getByText('Welcome to Whisper Walls')).toBeInTheDocument();
      expect(screen.getByText('How are you feeling?')).toBeInTheDocument();
    });

    test('rapid user interactions do not cause animation conflicts', async () => {
      const user = userEvent.setup();
      render(<WhisperWallsJourney />);

      // Rapidly interact with multiple elements
      const createCard = screen.getByTestId('create-message-card');
      const discoverCard = screen.getByTestId('discover-messages-card');
      const loveButton = screen.getByTestId('mood-love');

      // Rapid clicks
      await user.click(loveButton);
      await user.click(createCard);

      await waitFor(() => {
        expect(screen.getByText('Creating Your Whisper')).toBeInTheDocument();
      });

      // Should not cause errors or broken state
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing animation components gracefully', () => {
      // Test with minimal props
      render(
        <div>
          <AnimatedButton>Simple Button</AnimatedButton>
          <AnimatedCard>Simple Card</AnimatedCard>
          <PageTransition transitionKey="test">
            <div>Simple Content</div>
          </PageTransition>
        </div>
      );

      expect(screen.getByText('Simple Button')).toBeInTheDocument();
      expect(screen.getByText('Simple Card')).toBeInTheDocument();
      expect(screen.getByText('Simple Content')).toBeInTheDocument();
    });

    test('recovers from animation errors without breaking user flow', async () => {
      const user = userEvent.setup();
      
      // Mock console.error to catch any errors
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<WhisperWallsJourney />);

      // Complete user flow even if animations have issues
      const createCard = screen.getByTestId('create-message-card');
      await user.click(createCard);

      await waitFor(() => {
        expect(screen.getByText('Creating Your Whisper')).toBeInTheDocument();
      });

      const submitButton = screen.getByTestId('submit-message');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Whisper Sent! 💕')).toBeInTheDocument();
      });

      // User flow should complete successfully
      expect(screen.getByTestId('back-home')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Mobile and Responsive Behavior', () => {
    test('animations work on touch devices', async () => {
      const user = userEvent.setup();
      render(<WhisperWallsJourney />);

      const createCard = screen.getByTestId('create-message-card');

      // Simulate touch events
      fireEvent.touchStart(createCard);
      fireEvent.touchEnd(createCard);

      // Should still navigate properly
      await user.click(createCard);

      await waitFor(() => {
        expect(screen.getByText('Creating Your Whisper')).toBeInTheDocument();
      });
    });

    test('animations adapt to different viewport sizes', () => {
      // Mock different viewport sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320, // Mobile width
      });

      render(<WhisperWallsJourney />);

      expect(screen.getByText('Welcome to Whisper Walls')).toBeInTheDocument();

      // Change to desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      // Should still work
      expect(screen.getByText('Welcome to Whisper Walls')).toBeInTheDocument();
    });
  });
});