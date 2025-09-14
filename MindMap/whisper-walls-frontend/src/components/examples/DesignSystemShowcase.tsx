import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { emotionalThemes } from '../../styles/designSystem';
import {
  Button,
  Card,
  Input,
  Badge,
  Container,
  Grid,
  Flex,
  Stack,
  Typography,
  Heading,
  Text,
  Caption
} from '../ui';
import {
  DreamyInteraction,
  RevealOnScroll,
  EmotionalPulse,
  MagicalShimmer,
  ParticleSystem,
  SparkleEffect,
  useAnimationOrchestrator
} from '../animations';

export const DesignSystemShowcase: React.FC = () => {
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const { triggerSequence } = useAnimationOrchestrator();

  return (
    <div className="relative min-h-screen">
      {/* Background particles */}
      <ParticleSystem 
        type="sparkles" 
        count={8} 
        intensity="low" 
        direction="random" 
        speed="slow"
        className="opacity-20"
      />
      
      <Container size="2xl" className="py-12 relative z-10">
        <Stack spacing="xl">
          {/* Header */}
          <RevealOnScroll animation="butterfly" withParticles>
            <div className="text-center">
              <MagicalShimmer intensity="subtle" color="rainbow" trigger={true}>
                <Heading level={1} gradient glow className="mb-4">
                  Whisper Walls Design System
                </Heading>
              </MagicalShimmer>
              <Text size="lg" color="textSecondary">
                Emotional UI components that adapt to different moods and feelings
              </Text>
            </div>
          </RevealOnScroll>

        {/* Theme Selector */}
        <RevealOnScroll animation="fadeUp" delay={0.2}>
          <Card variant="elevated" padding="lg">
            <Heading level={3} className="mb-4">Theme Selection</Heading>
            <Text className="mb-4">
              Current theme: <Badge variant="primary">{currentTheme.name}</Badge>
            </Text>
            <Grid cols={3} gap="md" responsive={{ sm: 1, md: 2, lg: 3 }}>
              {Object.entries(availableThemes).map(([key, theme]) => (
                <DreamyInteraction key={key}>
                  <Button
                    variant={themeName === key ? 'primary' : 'outline'}
                    theme={key as keyof typeof emotionalThemes}
                    onClick={() => {
                      setTheme(key as keyof typeof emotionalThemes);
                      triggerSequence('mood-detected');
                    }}
                    fullWidth
                  >
                    {theme.name}
                  </Button>
                </DreamyInteraction>
              ))}
            </Grid>
          </Card>
        </RevealOnScroll>

        {/* Typography Showcase */}
        <Card variant="elevated" padding="lg">
          <Heading level={3} className="mb-6">Typography System</Heading>
          <Stack spacing="md">
            <div>
              <Caption>Heading 1</Caption>
              <Heading level={1}>The quick brown fox jumps</Heading>
            </div>
            <div>
              <Caption>Heading 2</Caption>
              <Heading level={2}>The quick brown fox jumps</Heading>
            </div>
            <div>
              <Caption>Heading 3</Caption>
              <Heading level={3}>The quick brown fox jumps</Heading>
            </div>
            <div>
              <Caption>Body Text</Caption>
              <Text>
                This is body text that demonstrates the emotional typography system. 
                It's designed to be warm, readable, and emotionally engaging.
              </Text>
            </div>
            <div>
              <Caption>Gradient Text</Caption>
              <Typography variant="h4" gradient>
                Emotional gradient text that captures hearts
              </Typography>
            </div>
          </Stack>
        </Card>

        {/* Button Showcase */}
        <RevealOnScroll animation="fadeLeft" delay={0.4}>
          <Card variant="elevated" padding="lg">
            <Heading level={3} className="mb-6">Button Variants</Heading>
            <Grid cols={2} gap="md" responsive={{ sm: 1, md: 2 }}>
              <Stack spacing="md">
                <Caption>Primary Buttons</Caption>
                <DreamyInteraction><Button variant="primary" size="sm">Small Primary</Button></DreamyInteraction>
                <DreamyInteraction><Button variant="primary" size="md">Medium Primary</Button></DreamyInteraction>
                <DreamyInteraction><Button variant="primary" size="lg">Large Primary</Button></DreamyInteraction>
                <DreamyInteraction><Button variant="primary" size="xl">Extra Large</Button></DreamyInteraction>
              </Stack>
              
              <Stack spacing="md">
                <Caption>Button Variants</Caption>
                <DreamyInteraction><Button variant="secondary">Secondary</Button></DreamyInteraction>
                <DreamyInteraction><Button variant="accent">Accent</Button></DreamyInteraction>
                <DreamyInteraction><Button variant="ghost">Ghost</Button></DreamyInteraction>
                <DreamyInteraction><Button variant="outline">Outline</Button></DreamyInteraction>
              </Stack>
            </Grid>
            
            <div className="mt-6">
              <Caption>Special States</Caption>
              <Flex gap="md" wrap="wrap" className="mt-2">
                <DreamyInteraction><Button variant="primary" isLoading>Loading</Button></DreamyInteraction>
                <Button variant="primary" disabled>Disabled</Button>
                <DreamyInteraction>
                  <Button 
                    variant="primary" 
                    leftIcon={<span>💕</span>}
                    rightIcon={<span>✨</span>}
                  >
                    With Icons
                  </Button>
                </DreamyInteraction>
              </Flex>
            </div>
          </Card>
        </RevealOnScroll>

        {/* Input Showcase */}
        <Card variant="elevated" padding="lg">
          <Heading level={3} className="mb-6">Input Components</Heading>
          <Grid cols={2} gap="lg" responsive={{ sm: 1, md: 2 }}>
            <Stack spacing="md">
              <Input
                label="Default Input"
                placeholder="Enter your thoughts..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="With Left Icon"
                placeholder="Search..."
                leftIcon={<span>🔍</span>}
              />
              <Input
                label="With Right Icon"
                placeholder="Password"
                type="password"
                rightIcon={<span>👁️</span>}
              />
            </Stack>
            
            <Stack spacing="md">
              <Input
                variant="filled"
                label="Filled Variant"
                placeholder="Filled input style"
              />
              <Input
                variant="outlined"
                label="Outlined Variant"
                placeholder="Outlined input style"
              />
              <Input
                variant="underlined"
                label="Underlined Variant"
                placeholder="Underlined input style"
              />
            </Stack>
          </Grid>
        </Card>

        {/* Card Showcase */}
        <RevealOnScroll animation="bloom" delay={0.8}>
          <div>
            <Heading level={3} className="mb-6">Card Variants</Heading>
            <Grid cols={2} gap="md" responsive={{ sm: 1, md: 2, lg: 3 }}>
              <DreamyInteraction>
                <Card variant="default" padding="lg">
                  <Heading level={4} className="mb-2">Default Card</Heading>
                  <Text>This is a default card with standard styling.</Text>
                </Card>
              </DreamyInteraction>
              
              <EmotionalPulse emotion="joy" intensity={0.6}>
                <Card variant="elevated" padding="lg" hover>
                  <Heading level={4} className="mb-2">Elevated Card</Heading>
                  <Text>This card has elevation and hover effects.</Text>
                </Card>
              </EmotionalPulse>
              
              <DreamyInteraction>
                <Card variant="outlined" padding="lg">
                  <Heading level={4} className="mb-2">Outlined Card</Heading>
                  <Text>This card uses outline styling.</Text>
                </Card>
              </DreamyInteraction>
              
              <MagicalShimmer intensity="medium" color="purple" trigger={true}>
                <Card variant="glass" padding="lg">
                  <Heading level={4} className="mb-2">Glass Card</Heading>
                  <Text>This card has a glass morphism effect.</Text>
                </Card>
              </MagicalShimmer>
              
              <EmotionalPulse emotion="love" intensity={0.8}>
                <Card variant="gradient" padding="lg" glow>
                  <Heading level={4} className="mb-2" color="inherit">Gradient Card</Heading>
                  <Text color="inherit">This card uses gradient background with glow.</Text>
                  <div className="absolute inset-0 pointer-events-none">
                    <SparkleEffect count={3} intensity="subtle" color="gold" />
                  </div>
                </Card>
              </EmotionalPulse>
            </Grid>
          </div>
        </RevealOnScroll>

        {/* Badge Showcase */}
        <Card variant="elevated" padding="lg">
          <Heading level={3} className="mb-6">Badge Components</Heading>
          <Stack spacing="md">
            <div>
              <Caption>Badge Variants</Caption>
              <Flex gap="sm" wrap="wrap" className="mt-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
              </Flex>
            </div>
            
            <div>
              <Caption>Badge Sizes</Caption>
              <Flex gap="sm" align="center" className="mt-2">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </Flex>
            </div>
            
            <div>
              <Caption>Dot Badges</Caption>
              <Flex gap="sm" align="center" className="mt-2">
                <Badge dot size="sm" variant="primary" />
                <Badge dot size="md" variant="success" />
                <Badge dot size="lg" variant="error" pulse />
              </Flex>
            </div>
          </Stack>
        </Card>

        {/* Color Palette */}
        <Card variant="elevated" padding="lg">
          <Heading level={3} className="mb-6">Current Theme Colors</Heading>
          <Grid cols={4} gap="md" responsive={{ sm: 2, md: 3, lg: 4 }}>
            {Object.entries(currentTheme.colors).map(([name, color]) => (
              <div key={name} className="text-center">
                <div 
                  className="w-full h-16 rounded-lg mb-2 border"
                  style={{ backgroundColor: color }}
                />
                <Caption>{name}</Caption>
                <Text size="sm" color="textSecondary" className="font-mono text-xs">
                  {color}
                </Text>
              </div>
            ))}
          </Grid>
        </Card>

        {/* Emotional States Demo */}
        <RevealOnScroll animation="heart" delay={1.2} withParticles particleType="hearts">
          <EmotionalPulse emotion="love" intensity={1}>
            <Card variant="gradient" padding="lg" glow>
              <Heading level={3} color="inherit" className="mb-4">
                Emotional Responsiveness
              </Heading>
              <Text color="inherit" className="mb-4">
                This design system adapts to different emotional states, creating a more 
                empathetic and engaging user experience. Each theme represents a different 
                emotional context and provides appropriate visual feedback.
              </Text>
              <DreamyInteraction>
                <Button 
                  variant="accent" 
                  size="lg"
                  onClick={() => triggerSequence('connection-made')}
                >
                  Experience the Magic ✨
                </Button>
              </DreamyInteraction>
              
              {/* Floating sparkles */}
              <div className="absolute inset-0 pointer-events-none">
                <SparkleEffect 
                  count={8} 
                  intensity="magical" 
                  color="rainbow" 
                  pattern="random"
                />
              </div>
            </Card>
          </EmotionalPulse>
        </RevealOnScroll>
        </Stack>
      </Container>
    </div>
  );
};