import { MoodEmbedding, User, Relationship } from '../types';

export interface ConversationPrompt {
  id: string;
  type: 'icebreaker' | 'bonding' | 'healing' | 'reflection' | 'activity';
  title: string;
  content: string;
  context: string;
  emotionalTone: 'supportive' | 'playful' | 'intimate' | 'curious' | 'healing';
  difficulty: 'easy' | 'medium' | 'deep';
  estimatedTime: number; // minutes
  tags: string[];
}

export interface ConversationContext {
  userMood: MoodEmbedding;
  partnerMood?: MoodEmbedding;
  blendedMood?: MoodEmbedding;
  relationship?: Relationship;
  recentInteractions: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  relationshipStage: 'new' | 'developing' | 'established' | 'challenging';
}

export interface ActivitySuggestion {
  id: string;
  title: string;
  description: string;
  type: 'indoor' | 'outdoor' | 'virtual' | 'creative' | 'physical';
  duration: number;
  moodBoost: number;
  connectionLevel: 'light' | 'moderate' | 'deep';
  requirements: string[];
}

class ConversationService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
  }

  /**
   * Generate context-aware conversation starters based on current emotional state
   */
  async generateConversationStarters(context: ConversationContext): Promise<ConversationPrompt[]> {
    try {
      const prompt = this.buildConversationPrompt(context);
      
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
              content: `You are an empathetic relationship coach who creates beautiful, heart-touching conversation starters. Your responses should feel natural, emotionally appropriate, and designed to bring people closer together. Always consider the emotional context and create prompts that feel organic and meaningful.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseConversationResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating conversation starters:', error);
      return this.getFallbackConversationStarters(context);
    }
  }

  /**
   * Generate bonding activities based on shared mood
   */
  async generateBondingActivities(context: ConversationContext): Promise<ActivitySuggestion[]> {
    try {
      const prompt = this.buildActivityPrompt(context);
      
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
              content: `You are a creative relationship coach who suggests meaningful activities that bring couples closer together. Focus on activities that match their emotional state and help them connect on a deeper level. Consider their mood, time of day, and relationship stage.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseActivityResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating bonding activities:', error);
      return this.getFallbackActivities(context);
    }
  }

  /**
   * Generate healing conversation prompts for emotional distance
   */
  async generateHealingPrompts(context: ConversationContext): Promise<ConversationPrompt[]> {
    try {
      const prompt = this.buildHealingPrompt(context);
      
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
              content: `You are a compassionate relationship therapist who helps couples bridge emotional gaps. Create gentle, non-confrontational conversation starters that encourage empathy, understanding, and emotional healing. Focus on rebuilding connection and trust.`
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
      return this.parseConversationResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating healing prompts:', error);
      return this.getFallbackHealingPrompts(context);
    }
  }

  /**
   * Build conversation prompt based on context
   */
  private buildConversationPrompt(context: ConversationContext): string {
    const moodDescription = this.describeMood(context.userMood);
    const partnerMoodDescription = context.partnerMood ? this.describeMood(context.partnerMood) : null;
    const blendedMoodDescription = context.blendedMood ? this.describeMood(context.blendedMood) : null;

    return `
Generate 5 beautiful, emotionally appropriate conversation starters based on this context:

Current User Mood: ${moodDescription}
${partnerMoodDescription ? `Partner Mood: ${partnerMoodDescription}` : ''}
${blendedMoodDescription ? `Shared Emotional State: ${blendedMoodDescription}` : ''}
Time of Day: ${context.timeOfDay}
Relationship Stage: ${context.relationshipStage}
Recent Interactions: ${context.recentInteractions.join(', ') || 'None'}

Please provide conversation starters that:
1. Feel natural and emotionally appropriate
2. Match the current emotional context
3. Encourage deeper connection and understanding
4. Are specific and actionable
5. Range from light to meaningful

Format each as:
Title: [Engaging title]
Content: [The actual conversation starter]
Type: [icebreaker/bonding/reflection]
Tone: [supportive/playful/intimate/curious]
Difficulty: [easy/medium/deep]
Time: [estimated minutes]
Tags: [relevant tags]
    `;
  }

  /**
   * Build activity suggestion prompt
   */
  private buildActivityPrompt(context: ConversationContext): string {
    const moodDescription = context.blendedMood ? 
      this.describeMood(context.blendedMood) : 
      this.describeMood(context.userMood);

    return `
Suggest 4 meaningful bonding activities based on this emotional context:

Shared Mood: ${moodDescription}
Time of Day: ${context.timeOfDay}
Relationship Stage: ${context.relationshipStage}

Please suggest activities that:
1. Match the current emotional state
2. Are appropriate for the time of day
3. Help strengthen the relationship
4. Are practical and achievable
5. Range from simple to more involved

Format each as:
Title: [Activity name]
Description: [What to do]
Type: [indoor/outdoor/virtual/creative/physical]
Duration: [minutes]
Connection Level: [light/moderate/deep]
Requirements: [what's needed]
    `;
  }

  /**
   * Build healing conversation prompt for emotional distance
   */
  private buildHealingPrompt(context: ConversationContext): string {
    const emotionalGap = this.calculateEmotionalDistance(context);
    
    return `
Create 3 gentle conversation starters to help bridge emotional distance:

Emotional Context: ${emotionalGap}
Relationship Stage: ${context.relationshipStage}
Recent Challenges: ${context.recentInteractions.join(', ') || 'General distance'}

Please provide healing prompts that:
1. Are non-confrontational and gentle
2. Encourage empathy and understanding
3. Help rebuild emotional connection
4. Feel safe and supportive
5. Focus on positive reconnection

Format as conversation starters with healing focus.
    `;
  }

  /**
   * Describe mood in natural language
   */
  private describeMood(mood: MoodEmbedding): string {
    const emotions = mood.emotions;
    const dominant = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([emotion]) => emotion);

    const intensity = mood.intensity > 0.7 ? 'strongly' : mood.intensity > 0.4 ? 'moderately' : 'gently';
    const sentiment = mood.sentiment > 0.3 ? 'positive' : mood.sentiment < -0.3 ? 'challenging' : 'neutral';

    return `${intensity} feeling ${dominant.join(' and ')}, with a ${sentiment} overall sentiment`;
  }

  /**
   * Calculate emotional distance between partners
   */
  private calculateEmotionalDistance(context: ConversationContext): string {
    if (!context.partnerMood || !context.userMood) {
      return 'individual emotional processing needed';
    }

    const userEmotions = context.userMood.emotions;
    const partnerEmotions = context.partnerMood.emotions;

    let distance = 0;
    Object.keys(userEmotions).forEach(emotion => {
      distance += Math.abs(userEmotions[emotion as keyof typeof userEmotions] - 
                          partnerEmotions[emotion as keyof typeof partnerEmotions]);
    });

    if (distance > 3) return 'significant emotional distance detected';
    if (distance > 1.5) return 'moderate emotional differences present';
    return 'minor emotional adjustment needed';
  }

  /**
   * Parse GPT response into conversation prompts
   */
  private parseConversationResponse(response: string): ConversationPrompt[] {
    const prompts: ConversationPrompt[] = [];
    const sections = response.split(/(?=Title:|^\d+\.)/m).filter(s => s.trim());

    sections.forEach((section, index) => {
      try {
        const lines = section.split('\n').filter(l => l.trim());
        const prompt: Partial<ConversationPrompt> = {
          id: `prompt_${Date.now()}_${index}`,
        };

        lines.forEach(line => {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();

          switch (key.toLowerCase().trim()) {
            case 'title':
              prompt.title = value;
              break;
            case 'content':
              prompt.content = value;
              break;
            case 'type':
              prompt.type = value as ConversationPrompt['type'];
              break;
            case 'tone':
              prompt.emotionalTone = value as ConversationPrompt['emotionalTone'];
              break;
            case 'difficulty':
              prompt.difficulty = value as ConversationPrompt['difficulty'];
              break;
            case 'time':
              prompt.estimatedTime = parseInt(value) || 10;
              break;
            case 'tags':
              prompt.tags = value.split(',').map(t => t.trim());
              break;
          }
        });

        if (prompt.title && prompt.content) {
          prompts.push(prompt as ConversationPrompt);
        }
      } catch (error) {
        console.error('Error parsing conversation prompt:', error);
      }
    });

    return prompts;
  }

  /**
   * Parse activity response
   */
  private parseActivityResponse(response: string): ActivitySuggestion[] {
    const activities: ActivitySuggestion[] = [];
    const sections = response.split(/(?=Title:|^\d+\.)/m).filter(s => s.trim());

    sections.forEach((section, index) => {
      try {
        const lines = section.split('\n').filter(l => l.trim());
        const activity: Partial<ActivitySuggestion> = {
          id: `activity_${Date.now()}_${index}`,
        };

        lines.forEach(line => {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();

          switch (key.toLowerCase().trim()) {
            case 'title':
              activity.title = value;
              break;
            case 'description':
              activity.description = value;
              break;
            case 'type':
              activity.type = value as ActivitySuggestion['type'];
              break;
            case 'duration':
              activity.duration = parseInt(value) || 30;
              break;
            case 'connection level':
              activity.connectionLevel = value as ActivitySuggestion['connectionLevel'];
              break;
            case 'requirements':
              activity.requirements = value.split(',').map(r => r.trim());
              break;
          }
        });

        if (activity.title && activity.description) {
          activities.push({
            ...activity,
            moodBoost: Math.random() * 0.3 + 0.7, // 0.7-1.0
          } as ActivitySuggestion);
        }
      } catch (error) {
        console.error('Error parsing activity suggestion:', error);
      }
    });

    return activities;
  }

  /**
   * Fallback conversation starters when API fails
   */
  private getFallbackConversationStarters(context: ConversationContext): ConversationPrompt[] {
    const fallbacks: ConversationPrompt[] = [
      {
        id: 'fallback_1',
        type: 'bonding',
        title: 'Share a Beautiful Memory',
        content: 'What\'s a moment from this week that made you smile? I\'d love to hear about it.',
        context: 'General connection',
        emotionalTone: 'supportive',
        difficulty: 'easy',
        estimatedTime: 10,
        tags: ['memories', 'positive', 'sharing']
      },
      {
        id: 'fallback_2',
        type: 'reflection',
        title: 'Dreams and Hopes',
        content: 'If you could make one dream come true this month, what would it be?',
        context: 'Future planning',
        emotionalTone: 'curious',
        difficulty: 'medium',
        estimatedTime: 15,
        tags: ['dreams', 'future', 'aspirations']
      },
      {
        id: 'fallback_3',
        type: 'icebreaker',
        title: 'Gratitude Moment',
        content: 'What\'s something small that happened today that you\'re grateful for?',
        context: 'Gratitude practice',
        emotionalTone: 'supportive',
        difficulty: 'easy',
        estimatedTime: 5,
        tags: ['gratitude', 'mindfulness', 'present']
      }
    ];

    return fallbacks;
  }

  /**
   * Fallback activities when API fails
   */
  private getFallbackActivities(context: ConversationContext): ActivitySuggestion[] {
    return [
      {
        id: 'fallback_activity_1',
        title: 'Sunset Appreciation',
        description: 'Watch the sunset together and share what you\'re grateful for today',
        type: 'outdoor',
        duration: 30,
        moodBoost: 0.8,
        connectionLevel: 'moderate',
        requirements: ['Clear evening', 'Comfortable seating']
      },
      {
        id: 'fallback_activity_2',
        title: 'Create Together',
        description: 'Make something beautiful together - draw, cook, or build something meaningful',
        type: 'creative',
        duration: 60,
        moodBoost: 0.9,
        connectionLevel: 'deep',
        requirements: ['Art supplies or ingredients', 'Shared space']
      }
    ];
  }

  /**
   * Fallback healing prompts
   */
  private getFallbackHealingPrompts(context: ConversationContext): ConversationPrompt[] {
    return [
      {
        id: 'healing_fallback_1',
        type: 'healing',
        title: 'Understanding Each Other',
        content: 'I\'ve been thinking about us lately. How are you feeling about our connection right now?',
        context: 'Emotional check-in',
        emotionalTone: 'healing',
        difficulty: 'medium',
        estimatedTime: 20,
        tags: ['healing', 'connection', 'understanding']
      },
      {
        id: 'healing_fallback_2',
        type: 'healing',
        title: 'Appreciation Focus',
        content: 'I want you to know that I appreciate you. What\'s one thing I do that makes you feel loved?',
        context: 'Positive reinforcement',
        emotionalTone: 'supportive',
        difficulty: 'easy',
        estimatedTime: 10,
        tags: ['appreciation', 'love', 'positive']
      }
    ];
  }
}

export const conversationService = new ConversationService();