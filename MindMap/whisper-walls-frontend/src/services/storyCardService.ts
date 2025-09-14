import { User, MoodEmbedding } from '../types';

export interface StoryCard {
  id: string;
  userId: string;
  type: 'memory' | 'dream' | 'value' | 'experience' | 'passion' | 'quirk';
  title: string;
  content: string;
  revealLevel: number; // 1-5, gradual reveal
  emotionalTone: 'nostalgic' | 'hopeful' | 'playful' | 'deep' | 'mysterious' | 'romantic';
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  isActive: boolean;
  viewCount: number;
  likeCount: number;
}

export interface StoryCardReveal {
  cardId: string;
  viewerId: string;
  revealLevel: number;
  timestamp: Date;
  interaction: 'view' | 'like' | 'skip' | 'super_like';
}

export interface CompatibilityScore {
  userId1: string;
  userId2: string;
  overallScore: number;
  categoryScores: {
    values: number;
    interests: number;
    lifestyle: number;
    communication: number;
    dreams: number;
  };
  sharedTags: string[];
  complementaryTraits: string[];
}

export interface StoryCardGenerationContext {
  user: User;
  recentMoods: MoodEmbedding[];
  interests: string[];
  values: string[];
  experiences: string[];
  relationshipGoals: string[];
}

class StoryCardService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
  }

  /**
   * Generate story cards based on user profile and interests
   */
  async generateStoryCards(context: StoryCardGenerationContext): Promise<StoryCard[]> {
    try {
      const prompt = this.buildStoryCardPrompt(context);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a creative storyteller who helps people share their authentic selves through beautiful, engaging story cards. Create story cards that feel personal, genuine, and designed to spark meaningful connections. Each card should reveal something unique about the person while maintaining an air of mystery and intrigue.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseStoryCardResponse(data.choices[0].message.content, context.user.id);
    } catch (error) {
      console.error('Error generating story cards:', error);
      return this.getFallbackStoryCards(context);
    }
  }

  /**
   * Calculate compatibility between two users based on their story cards
   */
  async calculateCompatibility(user1Cards: StoryCard[], user2Cards: StoryCard[]): Promise<CompatibilityScore> {
    try {
      const prompt = this.buildCompatibilityPrompt(user1Cards, user2Cards);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a relationship compatibility expert who analyzes story cards to determine how well two people might connect. Focus on shared values, complementary traits, and potential for meaningful connection rather than surface-level similarities.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.6,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseCompatibilityResponse(data.choices[0].message.content, user1Cards[0]?.userId, user2Cards[0]?.userId);
    } catch (error) {
      console.error('Error calculating compatibility:', error);
      return this.getFallbackCompatibility(user1Cards, user2Cards);
    }
  }

  /**
   * Get story cards for discovery feed
   */
  async getDiscoveryCards(userId: string, preferences: any): Promise<StoryCard[]> {
    // In a real implementation, this would query the database
    // For now, return mock data
    return this.getMockDiscoveryCards();
  }

  /**
   * Record story card interaction
   */
  async recordInteraction(cardId: string, viewerId: string, interaction: StoryCardReveal['interaction']): Promise<void> {
    // In a real implementation, this would save to database
    console.log(`Recording interaction: ${interaction} on card ${cardId} by user ${viewerId}`);
  }

  /**
   * Get reveal level for a specific card and viewer
   */
  getRevealLevel(cardId: string, viewerId: string): number {
    // In a real implementation, this would check database for interaction history
    // For now, return a random reveal level between 1-3
    return Math.floor(Math.random() * 3) + 1;
  }

  /**
   * Build story card generation prompt
   */
  private buildStoryCardPrompt(context: StoryCardGenerationContext): string {
    const moodDescription = this.describeMoods(context.recentMoods);
    
    return `
Create 5 unique story cards for this person based on their profile:

Interests: ${context.interests.join(', ')}
Values: ${context.values.join(', ')}
Recent Experiences: ${context.experiences.join(', ')}
Relationship Goals: ${context.relationshipGoals.join(', ')}
Recent Mood: ${moodDescription}

Create story cards that:
1. Feel authentic and personal
2. Spark curiosity and conversation
3. Reveal different aspects of their personality
4. Are designed for gradual reveal (levels 1-5)
5. Include a mix of types: memory, dream, value, experience, passion

Format each card as:
Type: [memory/dream/value/experience/passion/quirk]
Title: [Engaging title]
Content: [The story content - keep it intriguing but not too revealing]
Reveal Level: [1-5]
Emotional Tone: [nostalgic/hopeful/playful/deep/mysterious/romantic]
Tags: [relevant tags separated by commas]
    `;
  }

  /**
   * Build compatibility analysis prompt
   */
  private buildCompatibilityPrompt(user1Cards: StoryCard[], user2Cards: StoryCard[]): string {
    const user1Summary = user1Cards.map(card => `${card.type}: ${card.title} - ${card.tags.join(', ')}`).join('\n');
    const user2Summary = user2Cards.map(card => `${card.type}: ${card.title} - ${card.tags.join(', ')}`).join('\n');

    return `
Analyze compatibility between these two people based on their story cards:

Person 1 Story Cards:
${user1Summary}

Person 2 Story Cards:
${user2Summary}

Provide compatibility analysis with:
1. Overall compatibility score (0-100)
2. Category scores for: values, interests, lifestyle, communication, dreams
3. Shared interests/values
4. Complementary traits that could work well together
5. Brief explanation of the compatibility

Format as:
Overall Score: [0-100]
Values: [0-100]
Interests: [0-100]
Lifestyle: [0-100]
Communication: [0-100]
Dreams: [0-100]
Shared: [list shared elements]
Complementary: [list complementary traits]
    `;
  }

  /**
   * Parse GPT response into story cards
   */
  private parseStoryCardResponse(response: string, userId: string): StoryCard[] {
    const cards: StoryCard[] = [];
    const sections = response.split(/(?=Type:|^\d+\.)/m).filter(s => s.trim());

    sections.forEach((section, index) => {
      try {
        const lines = section.split('\n').filter(l => l.trim());
        const card: Partial<StoryCard> = {
          id: `card_${Date.now()}_${index}`,
          userId,
          createdAt: new Date(),
          isActive: true,
          viewCount: 0,
          likeCount: 0,
        };

        lines.forEach(line => {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();

          switch (key.toLowerCase().trim()) {
            case 'type':
              card.type = value as StoryCard['type'];
              break;
            case 'title':
              card.title = value;
              break;
            case 'content':
              card.content = value;
              break;
            case 'reveal level':
              card.revealLevel = parseInt(value) || 1;
              break;
            case 'emotional tone':
              card.emotionalTone = value as StoryCard['emotionalTone'];
              break;
            case 'tags':
              card.tags = value.split(',').map(t => t.trim());
              break;
          }
        });

        if (card.title && card.content && card.type) {
          cards.push(card as StoryCard);
        }
      } catch (error) {
        console.error('Error parsing story card:', error);
      }
    });

    return cards;
  }

  /**
   * Parse compatibility response
   */
  private parseCompatibilityResponse(response: string, userId1: string, userId2: string): CompatibilityScore {
    const lines = response.split('\n').filter(l => l.trim());
    const compatibility: Partial<CompatibilityScore> = {
      userId1,
      userId2,
      categoryScores: {
        values: 0,
        interests: 0,
        lifestyle: 0,
        communication: 0,
        dreams: 0,
      },
      sharedTags: [],
      complementaryTraits: [],
    };

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      switch (key.toLowerCase().trim()) {
        case 'overall score':
          compatibility.overallScore = parseInt(value) || 0;
          break;
        case 'values':
          compatibility.categoryScores!.values = parseInt(value) || 0;
          break;
        case 'interests':
          compatibility.categoryScores!.interests = parseInt(value) || 0;
          break;
        case 'lifestyle':
          compatibility.categoryScores!.lifestyle = parseInt(value) || 0;
          break;
        case 'communication':
          compatibility.categoryScores!.communication = parseInt(value) || 0;
          break;
        case 'dreams':
          compatibility.categoryScores!.dreams = parseInt(value) || 0;
          break;
        case 'shared':
          compatibility.sharedTags = value.split(',').map(t => t.trim());
          break;
        case 'complementary':
          compatibility.complementaryTraits = value.split(',').map(t => t.trim());
          break;
      }
    });

    return compatibility as CompatibilityScore;
  }

  /**
   * Describe recent moods
   */
  private describeMoods(moods: MoodEmbedding[]): string {
    if (!moods || moods.length === 0) return 'balanced and open';
    
    const latestMood = moods[0];
    const emotions = latestMood.emotions;
    const dominant = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([emotion]) => emotion);

    return `${dominant.join(' and ')} with ${latestMood.sentiment > 0 ? 'positive' : 'reflective'} outlook`;
  }

  /**
   * Fallback story cards when API fails
   */
  private getFallbackStoryCards(context: StoryCardGenerationContext): StoryCard[] {
    return [
      {
        id: 'fallback_1',
        userId: context.user.id,
        type: 'memory',
        title: 'A Moment That Changed Everything',
        content: 'There was this one sunset that made me realize what truly matters in life...',
        revealLevel: 2,
        emotionalTone: 'nostalgic',
        tags: ['growth', 'reflection', 'nature'],
        createdAt: new Date(),
        isActive: true,
        viewCount: 0,
        likeCount: 0,
      },
      {
        id: 'fallback_2',
        userId: context.user.id,
        type: 'dream',
        title: 'My Secret Adventure',
        content: 'If I could disappear for a month, I would...',
        revealLevel: 3,
        emotionalTone: 'hopeful',
        tags: ['adventure', 'dreams', 'travel'],
        createdAt: new Date(),
        isActive: true,
        viewCount: 0,
        likeCount: 0,
      },
      {
        id: 'fallback_3',
        userId: context.user.id,
        type: 'quirk',
        title: 'My Weird Superpower',
        content: 'I have this strange ability to always find the perfect song for any moment...',
        revealLevel: 1,
        emotionalTone: 'playful',
        tags: ['music', 'quirky', 'fun'],
        createdAt: new Date(),
        isActive: true,
        viewCount: 0,
        likeCount: 0,
      }
    ];
  }

  /**
   * Fallback compatibility calculation
   */
  private getFallbackCompatibility(user1Cards: StoryCard[], user2Cards: StoryCard[]): CompatibilityScore {
    const sharedTags = this.findSharedTags(user1Cards, user2Cards);
    const overallScore = Math.min(90, 60 + (sharedTags.length * 5));

    return {
      userId1: user1Cards[0]?.userId || '',
      userId2: user2Cards[0]?.userId || '',
      overallScore,
      categoryScores: {
        values: Math.floor(Math.random() * 30) + 60,
        interests: Math.floor(Math.random() * 30) + 60,
        lifestyle: Math.floor(Math.random() * 30) + 60,
        communication: Math.floor(Math.random() * 30) + 60,
        dreams: Math.floor(Math.random() * 30) + 60,
      },
      sharedTags,
      complementaryTraits: ['creative', 'thoughtful', 'adventurous'],
    };
  }

  /**
   * Find shared tags between two sets of cards
   */
  private findSharedTags(cards1: StoryCard[], cards2: StoryCard[]): string[] {
    const tags1 = new Set(cards1.flatMap(card => card.tags));
    const tags2 = new Set(cards2.flatMap(card => card.tags));
    
    return Array.from(tags1).filter(tag => tags2.has(tag));
  }

  /**
   * Mock discovery cards for development
   */
  private getMockDiscoveryCards(): StoryCard[] {
    return [
      {
        id: 'mock_1',
        userId: 'user_123',
        type: 'memory',
        title: 'The Night I Saw a Shooting Star',
        content: 'I was camping alone when the most incredible thing happened...',
        revealLevel: 1,
        emotionalTone: 'mysterious',
        tags: ['nature', 'solitude', 'wonder'],
        createdAt: new Date(),
        isActive: true,
        viewCount: 12,
        likeCount: 8,
      },
      {
        id: 'mock_2',
        userId: 'user_456',
        type: 'passion',
        title: 'Why I Wake Up at 5 AM',
        content: 'Most people think I\'m crazy, but there\'s something magical about...',
        revealLevel: 2,
        emotionalTone: 'hopeful',
        tags: ['morning', 'routine', 'passion'],
        createdAt: new Date(),
        isActive: true,
        viewCount: 24,
        likeCount: 15,
      },
      {
        id: 'mock_3',
        userId: 'user_789',
        type: 'quirk',
        title: 'My Collection of Lost Things',
        content: 'I have a drawer full of things people have left behind...',
        revealLevel: 1,
        emotionalTone: 'playful',
        tags: ['collecting', 'memories', 'quirky'],
        createdAt: new Date(),
        isActive: true,
        viewCount: 18,
        likeCount: 11,
      }
    ];
  }
}

export const storyCardService = new StoryCardService();