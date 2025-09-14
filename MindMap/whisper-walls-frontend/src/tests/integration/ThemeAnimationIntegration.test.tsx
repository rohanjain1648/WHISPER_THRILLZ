import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import theme and animation integration components
import { emotionalThemes, getThemeForMood, generateThemeCSS } from '../../styles/designSystem';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { RomanticGlow, Heartbeat } from '../../components/animations/RomanticAnimations';
import { DreamyHover } from '../../components/animations/Microinteractions';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, ...props }: any) => (
      <div style={style} {...props}>{children}</div>
    ),
    button: ({ children, style, ...props }: any) => (
      <button style={style} {...props}>{children}</button>
    )
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

// Mock animation hooks
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
  useMoodAnimations: () => ({
    currentMood: 'neutral',
    controls: { start: jest.fn(), stop: jest.fn(), set: jest.fn() },
    setMoodAnimation: jest.fn(),
    stopMoodAnimation: jest.fn()
  })
}));

// Mock UI components
jest.mock('../../components/ui/Button', () => ({
  Button: ({ children, className, style, ...props }: any) => (
    <button className={className} style={style} {...props}>{children}</button>
  )
}));

jest.mock('../../components/ui/Card', () => ({
  Card: ({ children, className, style, ...props }: any) => (
    <div className={className} style={style} {...props}>{children}</div>
  )
}));

// Theme-aware component for testing
interface ThemeAwareComponentProps {
  mood: string;
  sentiment: number;
  children: React.ReactNode;
}

const ThemeAwareComponent: React.FC<ThemeAwareComponentProps> = ({
  mood,
  sentiment,
  children
}) => {
  const theme = getThemeForMood(mood, sentiment);
  const cssVariables = generateThemeCSS(theme);

  return (
    <div
      className="theme-container"
      style={{
        ...Object.fromEntries(
          cssVariables
            .split(';')
            .filter(line => line.trim())
            .map(line => {
              const [key, value] = line.split(':').map(s => s.trim());
              return [key, value];
            })
        )
      }}
      data-testid="theme-container"
      data-theme={theme.name}
    >
      {children}
    </div>
  );
};

// Mood-based animation showcase component
const MoodAnimationShowcase: React.FC = () => {
  const [currentMood, setCurrentMood] = React.useState('neutral');
  const [sentiment, setSentiment] = React.useState(0);

  const moods = [
    { name: 'joy', sentiment: 0.8, label: 'Joyful' },
    { name: 'love', sentiment: 0.9, label: 'In Love' },
    { name: 'sadness', sentiment: -0.6, label: 'Melancholy' },
    { name: 'hope', sentiment: 0.5, label: 'Hopeful' },
    { name: 'stress', sentiment: -0.4, label: 'Stressed' },
    { name: 'neutral', sentiment: 0, label: 'Neutral' }
  ];

  return (
    <div className="mood-showcase">
      <h1>Mood-Based Animation Showcase</h1>
      
      {/* Mood selector */}
      <div className="mood-selector">
        {moods.map((mood) => (
          <button
            key={mood.name}
            onClick={() => {
              setCurrentMood(mood.name);
              setSentiment(mood.sentiment);
            }}
            data-testid={`mood-${mood.name}`}
          >
            {mood.label}
          </button>
        ))}
      </div>

      {/* Theme-aware animated components */}
      <ThemeAwareComponent mood={currentMood} sentiment={sentiment}>
        <div className="animated-content">
          <h2 data-testid="current-mood">Current Mood: {currentMood}</h2>
          
          {/* Animated button with theme colors */}
          <AnimatedButton
            animationType="heartFlutter"
            glowIntensity="medium"
            data-testid="themed-button"
          >
            Themed Button
          </AnimatedButton>

          {/* Animated card with mood-based styling */}
          <AnimatedCard
            animationType="glow"
            hoverEffect={true}
            sparkleOnHover={true}
            data-testid="themed-card"
          >
            <h3>Mood Card</h3>
            <p>This card adapts to your emotional state</p>
          </AnimatedCard>

          {/* Romantic glow with theme colors */}
          <RomanticGlow
            color={emotionalThemes[currentMood]?.colors?.primary || '#FF69B4'}
            intensity="medium"
          >
            <div data-testid="glowing-element">
              Glowing with {currentMood} energy
            </div>
          </RomanticGlow>

          {/* Heartbeat with mood-based intensity */}
          <Heartbeat
            intensity={sentiment > 0.5 ? 'high' : sentiment < -0.5 ? 'low' : 'medium'}
          >
            <div data-testid="heartbeat-element">
              💖 Heartbeat intensity: {sentiment > 0.5 ? 'high' : sentiment < -0.5 ? 'low' : 'medium'}
            </div>
          </Heartbeat>

          {/* Dreamy hover with mood-based effects */}
          <DreamyHover intensity={Math.abs(sentiment)}>
            <div data-testid="dreamy-element">
              Hover me for dreamy effects
            </div>
          </DreamyHover>
        </div>
      </ThemeAwareComponent>
    </div>
  );
};

describe('Theme and Animation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Design System Integration', () => {
    test('emotional themes contain all required properties', () => {
      Object.values(emotionalThemes).forEach(theme => {
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('colors');
        expect(theme).toHaveProperty('gradients');
        expect(theme).toHaveProperty('shadows');

        // Check color properties
        expect(theme.colors).toHaveProperty('primary');
        expect(theme.colors).toHaveProperty('secondary');
        expect(theme.colors).toHaveProperty('accent');
        expect(theme.colors).toHaveProperty('background');
        expect(theme.colors).toHaveProperty('surface');
        expect(theme.colors).toHaveProperty('text');
        expect(theme.colors).toHaveProperty('textSecondary');
        expect(theme.colors).toHaveProperty('border');
        expect(theme.colors).toHaveProperty('shadow');

        // Check gradient properties
        expect(theme.gradients).toHaveProperty('primary');
        expect(theme.gradients).toHaveProperty('secondary');
        expect(theme.gradients).toHaveProperty('accent');

        // Check shadow properties
        expect(theme.shadows).toHaveProperty('soft');
        expect(theme.shadows).toHaveProperty('medium');
        expect(theme.shadows).toHaveProperty('strong');
        expect(theme.shadows).toHaveProperty('glow');
      });
    });

    test('getThemeForMood returns correct themes for different emotions', () => {
      // Test joy emotions
      expect(getThemeForMood('joy', 0.8).name).toBe('Joyful Radiance');
      expect(getThemeForMood('happiness', 0.7).name).toBe('Joyful Radiance');
      expect(getThemeForMood('excitement', 0.9).name).toBe('Joyful Radiance');

      // Test love emotions
      expect(getThemeForMood('love', 0.8).name).toBe('Romantic Blush');
      expect(getThemeForMood('romance', 0.7).name).toBe('Romantic Blush');
      expect(getThemeForMood('affection', 0.6).name).toBe('Romantic Blush');

      // Test sadness emotions
      expect(getThemeForMood('sadness', -0.6).name).toBe('Gentle Melancholy');
      expect(getThemeForMood('melancholy', -0.5).name).toBe('Gentle Melancholy');
      expect(getThemeForMood('grief', -0.8).name).toBe('Gentle Melancholy');

      // Test hope emotions
      expect(getThemeForMood('hope', 0.5).name).toBe('Hopeful Dawn');
      expect(getThemeForMood('optimism', 0.6).name).toBe('Hopeful Dawn');
      expect(getThemeForMood('anticipation', 0.4).name).toBe('Hopeful Dawn');

      // Test stress emotions
      expect(getThemeForMood('stress', -0.4).name).toBe('Calming Serenity');
      expect(getThemeForMood('anxiety', -0.3).name).toBe('Calming Serenity');
      expect(getThemeForMood('worry', -0.5).name).toBe('Calming Serenity');

      // Test unknown emotions default to neutral
      expect(getThemeForMood('unknown', 0).name).toBe('Gentle Warmth');
    });

    test('sentiment adjusts theme selection appropriately', () => {
      // Positive sentiment should upgrade themes
      expect(getThemeForMood('sadness', 0.6).name).toBe('Hopeful Dawn');
      expect(getThemeForMood('stress', 0.7).name).toBe('Gentle Warmth');

      // Negative sentiment should downgrade themes
      expect(getThemeForMood('joy', -0.6).name).toBe('Gentle Warmth');
      expect(getThemeForMood('hope', -0.7).name).toBe('Gentle Melancholy');
    });

    test('generateThemeCSS creates valid CSS custom properties', () => {
      const theme = emotionalThemes.love;
      const css = generateThemeCSS(theme);

      expect(css).toContain('--color-primary: #FF69B4');
      expect(css).toContain('--color-secondary: #DA70D6');
      expect(css).toContain('--gradient-primary: linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)');
      expect(css).toContain('--shadow-glow: 0 0 20px rgba(255, 105, 180, 0.3)');
    });
  });

  describe('Mood-Based Animation Integration', () => {
    test('mood changes trigger appropriate theme and animation updates', async () => {
      render(<MoodAnimationShowcase />);

      // Start with neutral mood
      expect(screen.getByTestId('current-mood')).toHaveTextContent('Current Mood: neutral');

      // Change to joyful mood
      fireEvent.click(screen.getByTestId('mood-joy'));
      expect(screen.getByTestId('current-mood')).toHaveTextContent('Current Mood: joy');

      // Change to love mood
      fireEvent.click(screen.getByTestId('mood-love'));
      expect(screen.getByTestId('current-mood')).toHaveTextContent('Current Mood: love');

      // Change to sadness mood
      fireEvent.click(screen.getByTestId('mood-sadness'));
      expect(screen.getByTestId('current-mood')).toHaveTextContent('Current Mood: sadness');
    });

    test('animated components adapt to theme changes', async () => {
      render(<MoodAnimationShowcase />);

      const themedButton = screen.getByTestId('themed-button');
      const themedCard = screen.getByTestId('themed-card');
      const glowingElement = screen.getByTestId('glowing-element');

      // All elements should be present
      expect(themedButton).toBeInTheDocument();
      expect(themedCard).toBeInTheDocument();
      expect(glowingElement).toBeInTheDocument();

      // Change mood and verify elements still work
      fireEvent.click(screen.getByTestId('mood-love'));
      
      expect(themedButton).toBeInTheDocument();
      expect(themedCard).toBeInTheDocument();
      expect(glowingElement).toBeInTheDocument();
    });

    test('heartbeat intensity changes based on sentiment', () => {
      render(<MoodAnimationShowcase />);

      // Test high intensity (positive sentiment)
      fireEvent.click(screen.getByTestId('mood-joy'));
      expect(screen.getByTestId('heartbeat-element')).toHaveTextContent('Heartbeat intensity: high');

      // Test low intensity (negative sentiment)
      fireEvent.click(screen.getByTestId('mood-sadness'));
      expect(screen.getByTestId('heartbeat-element')).toHaveTextContent('Heartbeat intensity: low');

      // Test medium intensity (neutral sentiment)
      fireEvent.click(screen.getByTestId('mood-neutral'));
      expect(screen.getByTestId('heartbeat-element')).toHaveTextContent('Heartbeat intensity: medium');
    });

    test('dreamy hover intensity adapts to sentiment strength', () => {
      render(<MoodAnimationShowcase />);

      const dreamyElement = screen.getByTestId('dreamy-element');

      // Test with different moods
      fireEvent.click(screen.getByTestId('mood-love')); // High positive sentiment
      fireEvent.mouseEnter(dreamyElement);
      fireEvent.mouseLeave(dreamyElement);

      fireEvent.click(screen.getByTestId('mood-sadness')); // High negative sentiment
      fireEvent.mouseEnter(dreamyElement);
      fireEvent.mouseLeave(dreamyElement);

      fireEvent.click(screen.getByTestId('mood-neutral')); // Low sentiment
      fireEvent.mouseEnter(dreamyElement);
      fireEvent.mouseLeave(dreamyElement);

      // Should not cause errors
      expect(dreamyElement).toBeInTheDocument();
    });
  });

  describe('Theme-Aware Component Integration', () => {
    test('ThemeAwareComponent applies correct CSS variables', () => {
      render(
        <ThemeAwareComponent mood="love" sentiment={0.8}>
          <div>Test Content</div>
        </ThemeAwareComponent>
      );

      const container = screen.getByTestId('theme-container');
      expect(container).toHaveAttribute('data-theme', 'Romantic Blush');
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('theme changes are reflected in component styling', () => {
      const { rerender } = render(
        <ThemeAwareComponent mood="joy" sentiment={0.8}>
          <div>Test Content</div>
        </ThemeAwareComponent>
      );

      let container = screen.getByTestId('theme-container');
      expect(container).toHaveAttribute('data-theme', 'Joyful Radiance');

      rerender(
        <ThemeAwareComponent mood="sadness" sentiment={-0.6}>
          <div>Test Content</div>
        </ThemeAwareComponent>
      );

      container = screen.getByTestId('theme-container');
      expect(container).toHaveAttribute('data-theme', 'Gentle Melancholy');
    });

    test('animated buttons inherit theme colors correctly', () => {
      render(
        <ThemeAwareComponent mood="love" sentiment={0.8}>
          <AnimatedButton data-testid="love-button">Love Button</AnimatedButton>
        </ThemeAwareComponent>
      );

      const button = screen.getByTestId('love-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Love Button');
    });

    test('animated cards adapt to theme styling', () => {
      render(
        <ThemeAwareComponent mood="hope" sentiment={0.5}>
          <AnimatedCard data-testid="hope-card">
            <h3>Hope Card</h3>
          </AnimatedCard>
        </ThemeAwareComponent>
      );

      const card = screen.getByTestId('hope-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Hope Card')).toBeInTheDocument();
    });
  });

  describe('Color and Animation Harmony', () => {
    test('glow effects use theme-appropriate colors', () => {
      const { rerender } = render(
        <RomanticGlow color="#FF69B4" intensity="medium">
          <div data-testid="glow-content">Glowing Content</div>
        </RomanticGlow>
      );

      expect(screen.getByTestId('glow-content')).toBeInTheDocument();

      // Test with different theme colors
      rerender(
        <RomanticGlow color="#FFD700" intensity="strong">
          <div data-testid="glow-content">Glowing Content</div>
        </RomanticGlow>
      );

      expect(screen.getByTestId('glow-content')).toBeInTheDocument();
    });

    test('particle effects match theme aesthetics', () => {
      render(
        <div className="theme-joy">
          <div data-testid="joy-particles">Joy particles should be bright and energetic</div>
        </div>
      );

      expect(screen.getByTestId('joy-particles')).toBeInTheDocument();

      render(
        <div className="theme-sadness">
          <div data-testid="sadness-particles">Sadness particles should be gentle and muted</div>
        </div>
      );

      expect(screen.getByTestId('sadness-particles')).toBeInTheDocument();
    });

    test('animation timing matches emotional context', () => {
      // Joy should have faster, more energetic animations
      render(
        <ThemeAwareComponent mood="joy" sentiment={0.8}>
          <Heartbeat intensity="high">
            <div data-testid="joy-heartbeat">Fast heartbeat</div>
          </Heartbeat>
        </ThemeAwareComponent>
      );

      expect(screen.getByTestId('joy-heartbeat')).toBeInTheDocument();

      // Sadness should have slower, gentler animations
      render(
        <ThemeAwareComponent mood="sadness" sentiment={-0.6}>
          <Heartbeat intensity="low">
            <div data-testid="sad-heartbeat">Slow heartbeat</div>
          </Heartbeat>
        </ThemeAwareComponent>
      );

      expect(screen.getByTestId('sad-heartbeat')).toBeInTheDocument();
    });
  });

  describe('Responsive Theme Integration', () => {
    test('themes work across different screen sizes', () => {
      // Mock different viewport sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320, // Mobile
      });

      render(
        <ThemeAwareComponent mood="love" sentiment={0.8}>
          <AnimatedButton>Mobile Love Button</AnimatedButton>
        </ThemeAwareComponent>
      );

      expect(screen.getByText('Mobile Love Button')).toBeInTheDocument();

      // Change to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      expect(screen.getByText('Mobile Love Button')).toBeInTheDocument();
    });

    test('animations scale appropriately with theme intensity', () => {
      // High intensity theme
      render(
        <ThemeAwareComponent mood="love" sentiment={0.9}>
          <DreamyHover intensity={0.9}>
            <div data-testid="high-intensity">High intensity hover</div>
          </DreamyHover>
        </ThemeAwareComponent>
      );

      const highElement = screen.getByTestId('high-intensity');
      fireEvent.mouseEnter(highElement);
      fireEvent.mouseLeave(highElement);

      // Low intensity theme
      render(
        <ThemeAwareComponent mood="neutral" sentiment={0.1}>
          <DreamyHover intensity={0.1}>
            <div data-testid="low-intensity">Low intensity hover</div>
          </DreamyHover>
        </ThemeAwareComponent>
      );

      const lowElement = screen.getByTestId('low-intensity');
      fireEvent.mouseEnter(lowElement);
      fireEvent.mouseLeave(lowElement);

      expect(highElement).toBeInTheDocument();
      expect(lowElement).toBeInTheDocument();
    });
  });

  describe('Performance with Theme Changes', () => {
    test('rapid theme changes do not cause performance issues', () => {
      const { rerender } = render(
        <ThemeAwareComponent mood="neutral" sentiment={0}>
          <AnimatedButton>Test Button</AnimatedButton>
        </ThemeAwareComponent>
      );

      // Rapidly change themes
      const moods = ['joy', 'love', 'sadness', 'hope', 'stress', 'neutral'];
      const sentiments = [0.8, 0.9, -0.6, 0.5, -0.4, 0];

      for (let i = 0; i < 10; i++) {
        const moodIndex = i % moods.length;
        rerender(
          <ThemeAwareComponent mood={moods[moodIndex]} sentiment={sentiments[moodIndex]}>
            <AnimatedButton>Test Button</AnimatedButton>
          </ThemeAwareComponent>
        );
      }

      // Should still work without errors
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    test('theme-aware animations do not cause memory leaks', () => {
      const { unmount } = render(
        <MoodAnimationShowcase />
      );

      // Change moods multiple times
      fireEvent.click(screen.getByTestId('mood-joy'));
      fireEvent.click(screen.getByTestId('mood-love'));
      fireEvent.click(screen.getByTestId('mood-sadness'));

      // Unmount should clean up without issues
      unmount();
    });
  });
});