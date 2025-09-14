import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { conversationService, ConversationContext } from '../../services/conversationService';
import ConversationStarters from '../../components/conversation/ConversationStarters';
import BondingActivities from '../../components/conversation/BondingActivities';
import HealingPrompts from '../../components/conversation/HealingPrompts';
import ConversationDashboard from '../../components/conversation/ConversationDashboard';

// Mock the hooks
jest.mock('../../hooks/useMood', () => ({
  useMood: () => ({
    currentMood: {
      emotions: {
        joy: 0.7,
        sadness: 0.2,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.3,
        disgust: 0.1,
        trust: 0.8,
        anticipation: 0.6
      },
      sentiment: 0.6,
      intensity: 0.7,
      timestamp: new Date()
    },
    blendedMood: {
      emotions: {
        joy: 0.6,
        sadness: 0.3,
        anger: 0.1,
        fear: 0.2,
        surprise: 0.4,
        disgust: 0.1,
        trust: 0.7,
        anticipation: 0.5
      },
      sentiment: 0.4,
      intensity: 0.6,
      timestamp: new Date()
    }
  })
}));

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      profile: {
        displayName: 'Test User'
      }
    }
  })
}));

// Mock OpenAI API
global.fetch = jest.fn();

describe('ConversationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: `Title: Share Your Day
Content: What was the highlight of your day today? I'd love to hear what made you smile.
Type: bonding
Tone: supportive
Difficulty: easy
Time: 10
Tags: daily, sharing, positive

Title: Dream Together
Content: If we could go anywhere in the world together, where would you want to explore?
Type: reflection
Tone: curious
Difficulty: medium
Time: 15
Tags: dreams, travel, future`
          }
        }]
      })
    });
  });

  describe('generateConversationStarters', () => {
    it('should generate conversation starters based on mood context', async () => {
      const context: ConversationContext = {
        userMood: {
          emotions: {
            joy: 0.7,
            sadness: 0.2,
            anger: 0.1,
            fear: 0.1,
            surprise: 0.3,
            disgust: 0.1,
            trust: 0.8,
            anticipation: 0.6
          },
          sentiment: 0.6,
          intensity: 0.7,
          timestamp: new Date()
        },
        recentInteractions: [],
        timeOfDay: 'evening',
        relationshipStage: 'established'
      };

      const prompts = await conversationService.generateConversationStarters(context);

      expect(prompts).toHaveLength(2);
      expect(prompts[0]).toMatchObject({
        title: 'Share Your Day',
        content: expect.stringContaining('highlight of your day'),
        type: 'bonding',
        emotionalTone: 'supportive',
        difficulty: 'easy',
        estimatedTime: 10,
        tags: ['daily', 'sharing', 'positive']
      });
    });

    it('should handle API errors gracefully with fallback prompts', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const context: ConversationContext = {
        userMood: {
          emotions: {
            joy: 0.5,
            sadness: 0.3,
            anger: 0.1,
            fear: 0.2,
            surprise: 0.2,
            disgust: 0.1,
            trust: 0.6,
            anticipation: 0.4
          },
          sentiment: 0.2,
          intensity: 0.5,
          timestamp: new Date()
        },
        recentInteractions: [],
        timeOfDay: 'morning',
        relationshipStage: 'new'
      };

      const prompts = await conversationService.generateConversationStarters(context);

      expect(prompts).toHaveLength(3);
      expect(prompts[0].title).toBe('Share a Beautiful Memory');
      expect(prompts[1].title).toBe('Dreams and Hopes');
      expect(prompts[2].title).toBe('Gratitude Moment');
    });
  });

  describe('generateBondingActivities', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: `Title: Sunset Picnic
Description: Pack your favorite snacks and watch the sunset together while sharing what you're grateful for
Type: outdoor
Duration: 60
Connection Level: moderate
Requirements: Blanket, snacks, clear evening

Title: Cook Together
Description: Choose a new recipe and create something delicious together, taking turns being the chef
Type: indoor
Duration: 90
Connection Level: deep
Requirements: Ingredients, kitchen space, recipe`
            }
          }]
        })
      });
    });

    it('should generate bonding activities based on mood', async () => {
      const context: ConversationContext = {
        userMood: {
          emotions: {
            joy: 0.8,
            sadness: 0.1,
            anger: 0.1,
            fear: 0.1,
            surprise: 0.4,
            disgust: 0.1,
            trust: 0.9,
            anticipation: 0.7
          },
          sentiment: 0.8,
          intensity: 0.8,
          timestamp: new Date()
        },
        recentInteractions: [],
        timeOfDay: 'afternoon',
        relationshipStage: 'established'
      };

      const activities = await conversationService.generateBondingActivities(context);

      expect(activities).toHaveLength(2);
      expect(activities[0]).toMatchObject({
        title: 'Sunset Picnic',
        description: expect.stringContaining('sunset together'),
        type: 'outdoor',
        duration: 60,
        connectionLevel: 'moderate',
        requirements: ['Blanket', 'snacks', 'clear evening']
      });
    });
  });

  describe('generateHealingPrompts', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: `Title: Understanding Each Other
Content: I've been thinking about us lately. How are you feeling about our connection right now?
Type: healing
Tone: healing
Difficulty: medium
Time: 20
Tags: healing, connection, understanding

Title: Appreciation Focus
Content: I want you to know that I appreciate you. What's one thing I do that makes you feel loved?
Type: healing
Tone: supportive
Difficulty: easy
Time: 10
Tags: appreciation, love, positive`
            }
          }]
        })
      });
    });

    it('should generate healing prompts for emotional distance', async () => {
      const context: ConversationContext = {
        userMood: {
          emotions: {
            joy: 0.3,
            sadness: 0.6,
            anger: 0.2,
            fear: 0.4,
            surprise: 0.2,
            disgust: 0.1,
            trust: 0.4,
            anticipation: 0.3
          },
          sentiment: -0.3,
          intensity: 0.6,
          timestamp: new Date()
        },
        partnerMood: {
          emotions: {
            joy: 0.2,
            sadness: 0.7,
            anger: 0.3,
            fear: 0.5,
            surprise: 0.1,
            disgust: 0.2,
            trust: 0.3,
            anticipation: 0.2
          },
          sentiment: -0.4,
          intensity: 0.7,
          timestamp: new Date()
        },
        recentInteractions: ['emotional distance', 'communication gap'],
        timeOfDay: 'evening',
        relationshipStage: 'challenging'
      };

      const prompts = await conversationService.generateHealingPrompts(context);

      expect(prompts).toHaveLength(2);
      expect(prompts[0]).toMatchObject({
        title: 'Understanding Each Other',
        content: expect.stringContaining('connection right now'),
        type: 'healing',
        emotionalTone: 'healing',
        difficulty: 'medium'
      });
    });
  });
});

describe('ConversationStarters Component', () => {
  it('should render conversation starters and handle interactions', async () => {
    render(<ConversationStarters />);

    // Check if the component renders
    expect(screen.getByText('Conversation Starters')).toBeInTheDocument();
    expect(screen.getByText('New Conversation Starters')).toBeInTheDocument();

    // Click generate button
    const generateButton = screen.getByText('New Conversation Starters');
    fireEvent.click(generateButton);

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByText('Creating Magic...')).toBeInTheDocument();
    });

    // Wait for prompts to load
    await waitFor(() => {
      expect(screen.getByText('Share Your Day')).toBeInTheDocument();
      expect(screen.getByText('Dream Together')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Test prompt selection
    const firstPrompt = screen.getByText('Share Your Day');
    fireEvent.click(firstPrompt);

    // Check if modal opens
    await waitFor(() => {
      expect(screen.getByText('Use This Prompt')).toBeInTheDocument();
    });
  });

  it('should handle favorite functionality', async () => {
    render(<ConversationStarters />);

    // Generate prompts first
    const generateButton = screen.getByText('New Conversation Starters');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Share Your Day')).toBeInTheDocument();
    });

    // Find and click heart icon
    const heartButtons = screen.getAllByRole('button');
    const heartButton = heartButtons.find(button => 
      button.querySelector('svg')?.classList.contains('w-5')
    );

    if (heartButton) {
      fireEvent.click(heartButton);
      // Heart should turn solid (favorited)
      expect(heartButton.querySelector('svg')).toHaveClass('text-pink-500');
    }
  });
});

describe('BondingActivities Component', () => {
  it('should render bonding activities with proper metadata', async () => {
    render(<BondingActivities />);

    expect(screen.getByText('Bonding Activities')).toBeInTheDocument();

    // Generate activities
    const generateButton = screen.getByText('Generate New Activities');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Sunset Picnic')).toBeInTheDocument();
      expect(screen.getByText('Cook Together')).toBeInTheDocument();
    });

    // Check activity metadata
    expect(screen.getByText('60 min')).toBeInTheDocument();
    expect(screen.getByText('moderate connection')).toBeInTheDocument();
    expect(screen.getByText('90 min')).toBeInTheDocument();
    expect(screen.getByText('deep connection')).toBeInTheDocument();
  });

  it('should handle activity completion', async () => {
    render(<BondingActivities />);

    // Generate activities
    const generateButton = screen.getByText('Generate New Activities');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Sunset Picnic')).toBeInTheDocument();
    });

    // Click on activity to open modal
    const activity = screen.getByText('Sunset Picnic');
    fireEvent.click(activity);

    await waitFor(() => {
      expect(screen.getByText('Start Activity')).toBeInTheDocument();
    });

    // Mark as completed
    const startButton = screen.getByText('Start Activity');
    fireEvent.click(startButton);

    // Activity should be marked as completed
    await waitFor(() => {
      expect(screen.queryByText('Start Activity')).not.toBeInTheDocument();
    });
  });
});

describe('HealingPrompts Component', () => {
  it('should render healing prompts with safety guidelines', async () => {
    const partnerMood = {
      emotions: {
        joy: 0.2,
        sadness: 0.7,
        anger: 0.3,
        fear: 0.5,
        surprise: 0.1,
        disgust: 0.2,
        trust: 0.3,
        anticipation: 0.2
      },
      sentiment: -0.4,
      intensity: 0.7,
      timestamp: new Date()
    };

    render(<HealingPrompts partnerMood={partnerMood} />);

    expect(screen.getByText('Healing Conversations')).toBeInTheDocument();
    expect(screen.getByText('Emotional Connection Status')).toBeInTheDocument();
    expect(screen.getByText('Remember: Your Safety Matters')).toBeInTheDocument();

    // Generate healing prompts
    const generateButton = screen.getByText('Generate Healing Prompts');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Understanding Each Other')).toBeInTheDocument();
      expect(screen.getByText('Appreciation Focus')).toBeInTheDocument();
    });
  });

  it('should show emotional distance indicator', async () => {
    const partnerMood = {
      emotions: {
        joy: 0.1,
        sadness: 0.8,
        anger: 0.4,
        fear: 0.6,
        surprise: 0.1,
        disgust: 0.3,
        trust: 0.2,
        anticipation: 0.1
      },
      sentiment: -0.6,
      intensity: 0.8,
      timestamp: new Date()
    };

    render(<HealingPrompts partnerMood={partnerMood} />);

    expect(screen.getByText('Emotional Connection Status')).toBeInTheDocument();
    expect(screen.getByText(/Current emotional distance:/)).toBeInTheDocument();
  });
});

describe('ConversationDashboard Component', () => {
  it('should render all tabs and handle navigation', () => {
    render(<ConversationDashboard />);

    expect(screen.getByText('Conversation Hub')).toBeInTheDocument();
    expect(screen.getByText('Conversation Starters')).toBeInTheDocument();
    expect(screen.getByText('Bonding Activities')).toBeInTheDocument();
    expect(screen.getByText('Healing Conversations')).toBeInTheDocument();

    // Test tab navigation
    const activitiesTab = screen.getByText('Bonding Activities');
    fireEvent.click(activitiesTab);

    expect(screen.getByText('Generate New Activities')).toBeInTheDocument();

    // Test healing tab
    const healingTab = screen.getByText('Healing Conversations');
    fireEvent.click(healingTab);

    expect(screen.getByText('Generate Healing Prompts')).toBeInTheDocument();
  });

  it('should show relationship insights when relationship data is provided', () => {
    const relationship = {
      bondingMetrics: {
        closeness: 75,
        empathy: 80,
        trust: 85
      },
      lastInteraction: new Date().toISOString()
    };

    render(<ConversationDashboard relationship={relationship} />);

    expect(screen.getByText('Relationship Insights')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Emotional Closeness')).toBeInTheDocument();
    expect(screen.getByText('Empathy Level')).toBeInTheDocument();
    expect(screen.getByText('Trust Score')).toBeInTheDocument();
  });

  it('should show mood indicator when current mood is available', () => {
    render(<ConversationDashboard />);

    expect(screen.getByText('Current Mood')).toBeInTheDocument();
    expect(screen.getByText(/Currently feeling/)).toBeInTheDocument();
  });

  it('should show recommendation banner when partner mood is available', () => {
    const partnerMood = {
      emotions: {
        joy: 0.6,
        sadness: 0.3,
        anger: 0.1,
        fear: 0.2,
        surprise: 0.4,
        disgust: 0.1,
        trust: 0.7,
        anticipation: 0.5
      },
      sentiment: 0.4,
      intensity: 0.6,
      timestamp: new Date()
    };

    render(<ConversationDashboard partnerMood={partnerMood} />);

    expect(screen.getByText(/Recommended:/)).toBeInTheDocument();
    expect(screen.getByText(/Based on your current emotional connection/)).toBeInTheDocument();
  });
});

describe('Integration Tests', () => {
  it('should handle complete conversation flow', async () => {
    render(<ConversationDashboard />);

    // Start with conversation starters
    expect(screen.getByText('New Conversation Starters')).toBeInTheDocument();
    
    const generateButton = screen.getByText('New Conversation Starters');
    fireEvent.click(generateButton);

    // Wait for prompts to load
    await waitFor(() => {
      expect(screen.getByText('Share Your Day')).toBeInTheDocument();
    });

    // Select a prompt
    const prompt = screen.getByText('Share Your Day');
    fireEvent.click(prompt);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText('Use This Prompt')).toBeInTheDocument();
    });

    // Use the prompt
    const useButton = screen.getByText('Use This Prompt');
    fireEvent.click(useButton);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Use This Prompt')).not.toBeInTheDocument();
    });

    // Switch to bonding activities
    const activitiesTab = screen.getByText('Bonding Activities');
    fireEvent.click(activitiesTab);

    // Generate activities
    const generateActivitiesButton = screen.getByText('Generate New Activities');
    fireEvent.click(generateActivitiesButton);

    await waitFor(() => {
      expect(screen.getByText('Sunset Picnic')).toBeInTheDocument();
    });
  });

  it('should handle error states gracefully', async () => {
    // Mock API failure
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<ConversationStarters />);

    const generateButton = screen.getByText('New Conversation Starters');
    fireEvent.click(generateButton);

    // Should show fallback prompts
    await waitFor(() => {
      expect(screen.getByText('Share a Beautiful Memory')).toBeInTheDocument();
      expect(screen.getByText('Dreams and Hopes')).toBeInTheDocument();
      expect(screen.getByText('Gratitude Moment')).toBeInTheDocument();
    });
  });
});