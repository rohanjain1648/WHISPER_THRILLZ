import { api } from './api';
import type { ApiResponse, MoodEmbedding } from '../types';

export interface VoiceSettings {
  stability: number; // 0.0 to 1.0
  similarityBoost: number; // 0.0 to 1.0
  style: number; // 0.0 to 1.0
  useSpeakerBoost: boolean;
}

export interface VoiceModel {
  modelId: string;
  name: string;
  description: string;
  category: 'premade' | 'cloned' | 'professional';
  labels: Record<string, string>;
  previewUrl?: string;
}

export interface VoiceGenerationRequest {
  text: string;
  voiceId: string;
  modelId?: string;
  voiceSettings?: VoiceSettings;
  outputFormat?: 'mp3_44100_128' | 'mp3_22050_32' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100';
  optimizeStreamingLatency?: number; // 0-4
  emotionalContext?: {
    mood: MoodEmbedding;
    tone: 'empathetic' | 'uplifting' | 'calming' | 'encouraging' | 'romantic' | 'supportive';
    intensity: number; // 0.0 to 1.0
  };
}

export interface VoiceGenerationResponse {
  audioUrl: string;
  audioBlob: Blob;
  duration: number;
  text: string;
  voiceId: string;
  settings: VoiceSettings;
}

export interface MoodNarrationRequest {
  moodEmbedding: MoodEmbedding;
  narrationStyle: 'insights' | 'affirmations' | 'guidance' | 'celebration' | 'comfort';
  personalizedContext?: {
    userName?: string;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    recentEvents?: string[];
    relationshipStatus?: 'single' | 'coupled' | 'complicated';
  };
  voicePreference?: 'warm' | 'gentle' | 'energetic' | 'soothing' | 'professional';
}

export interface GeneratedNarration {
  text: string;
  audioUrl: string;
  audioBlob: Blob;
  duration: number;
  emotionalTone: string;
  keyMessages: string[];
  affirmations: string[];
}

class VoiceService {
  private readonly ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  private readonly DEFAULT_VOICE_SETTINGS: VoiceSettings = {
    stability: 0.75,
    similarityBoost: 0.75,
    style: 0.5,
    useSpeakerBoost: true
  };

  // Predefined voice profiles for different emotional contexts
  private readonly VOICE_PROFILES: Record<string, { voiceId: string; settings: VoiceSettings }> = {
    empathetic: {
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - warm and empathetic
      settings: { stability: 0.8, similarityBoost: 0.8, style: 0.3, useSpeakerBoost: true }
    },
    uplifting: {
      voiceId: 'ErXwobaYiN019PkySvjV', // Antoni - energetic and positive
      settings: { stability: 0.7, similarityBoost: 0.7, style: 0.7, useSpeakerBoost: true }
    },
    calming: {
      voiceId: 'MF3mGyEYCl7XYWbV9V6O', // Elli - soft and calming
      settings: { stability: 0.9, similarityBoost: 0.9, style: 0.2, useSpeakerBoost: true }
    },
    encouraging: {
      voiceId: 'TxGEqnHWrfWFTfGW9XjX', // Josh - confident and encouraging
      settings: { stability: 0.75, similarityBoost: 0.75, style: 0.6, useSpeakerBoost: true }
    },
    romantic: {
      voiceId: 'AZnzlk1XvdvUeBnXmlld', // Domi - romantic and intimate
      settings: { stability: 0.85, similarityBoost: 0.85, style: 0.4, useSpeakerBoost: true }
    },
    supportive: {
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - supportive and understanding
      settings: { stability: 0.8, similarityBoost: 0.8, style: 0.3, useSpeakerBoost: true }
    }
  };

  /**
   * Generate voice audio from text using ElevenLabs TTS
   */
  async generateVoice(request: VoiceGenerationRequest): Promise<VoiceGenerationResponse> {
    try {
      const response = await api.post<ApiResponse<VoiceGenerationResponse>>('/voice/generate', {
        ...request,
        voiceSettings: request.voiceSettings || this.DEFAULT_VOICE_SETTINGS
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to generate voice');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error generating voice:', error);
      throw new Error('Failed to generate voice audio');
    }
  }

  /**
   * Generate empathetic mood narration
   */
  async generateMoodNarration(request: MoodNarrationRequest): Promise<GeneratedNarration> {
    try {
      // First, generate the narration text based on mood
      const narrationText = await this.generateNarrationText(request);
      
      // Determine the best voice profile for the mood and style
      const voiceProfile = this.selectVoiceProfile(request.moodEmbedding, request.narrationStyle, request.voicePreference);
      
      // Generate the voice audio
      const voiceResponse = await this.generateVoice({
        text: narrationText.text,
        voiceId: voiceProfile.voiceId,
        voiceSettings: voiceProfile.settings,
        emotionalContext: {
          mood: request.moodEmbedding,
          tone: this.mapNarrationStyleToTone(request.narrationStyle),
          intensity: request.moodEmbedding.intensity
        }
      });

      return {
        text: narrationText.text,
        audioUrl: voiceResponse.audioUrl,
        audioBlob: voiceResponse.audioBlob,
        duration: voiceResponse.duration,
        emotionalTone: narrationText.emotionalTone,
        keyMessages: narrationText.keyMessages,
        affirmations: narrationText.affirmations
      };
    } catch (error) {
      console.error('Error generating mood narration:', error);
      throw new Error('Failed to generate mood narration');
    }
  }

  /**
   * Generate uplifting affirmations based on mood
   */
  async generateAffirmations(moodEmbedding: MoodEmbedding, count: number = 3): Promise<GeneratedNarration[]> {
    try {
      const affirmations = await this.generateAffirmationTexts(moodEmbedding, count);
      const results: GeneratedNarration[] = [];

      for (const affirmation of affirmations) {
        const voiceProfile = this.VOICE_PROFILES.uplifting;
        
        const voiceResponse = await this.generateVoice({
          text: affirmation.text,
          voiceId: voiceProfile.voiceId,
          voiceSettings: voiceProfile.settings,
          emotionalContext: {
            mood: moodEmbedding,
            tone: 'uplifting',
            intensity: 0.8
          }
        });

        results.push({
          text: affirmation.text,
          audioUrl: voiceResponse.audioUrl,
          audioBlob: voiceResponse.audioBlob,
          duration: voiceResponse.duration,
          emotionalTone: 'uplifting',
          keyMessages: [affirmation.message],
          affirmations: [affirmation.text]
        });
      }

      return results;
    } catch (error) {
      console.error('Error generating affirmations:', error);
      throw new Error('Failed to generate affirmations');
    }
  }

  /**
   * Generate couple mood narration
   */
  async generateCoupleNarration(
    user1Mood: MoodEmbedding,
    user2Mood: MoodEmbedding,
    user1Name: string,
    user2Name: string,
    compatibility: number
  ): Promise<GeneratedNarration> {
    try {
      const narrationText = await this.generateCoupleNarrationText(
        user1Mood,
        user2Mood,
        user1Name,
        user2Name,
        compatibility
      );

      const voiceProfile = this.VOICE_PROFILES.romantic;
      
      const voiceResponse = await this.generateVoice({
        text: narrationText.text,
        voiceId: voiceProfile.voiceId,
        voiceSettings: voiceProfile.settings,
        emotionalContext: {
          mood: this.blendMoods(user1Mood, user2Mood),
          tone: 'romantic',
          intensity: 0.7
        }
      });

      return {
        text: narrationText.text,
        audioUrl: voiceResponse.audioUrl,
        audioBlob: voiceResponse.audioBlob,
        duration: voiceResponse.duration,
        emotionalTone: 'romantic',
        keyMessages: narrationText.keyMessages,
        affirmations: narrationText.affirmations
      };
    } catch (error) {
      console.error('Error generating couple narration:', error);
      throw new Error('Failed to generate couple narration');
    }
  }

  /**
   * Get available voice models
   */
  async getAvailableVoices(): Promise<VoiceModel[]> {
    try {
      const response = await api.get<ApiResponse<VoiceModel[]>>('/voice/models');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get voice models');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting voice models:', error);
      throw new Error('Failed to get available voices');
    }
  }

  /**
   * Generate narration text based on mood and context
   */
  private async generateNarrationText(request: MoodNarrationRequest): Promise<{
    text: string;
    emotionalTone: string;
    keyMessages: string[];
    affirmations: string[];
  }> {
    try {
      const response = await api.post<ApiResponse<any>>('/voice/generate-narration-text', request);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to generate narration text');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error generating narration text:', error);
      
      // Fallback to client-side generation
      return this.generateNarrationTextFallback(request);
    }
  }

  /**
   * Fallback narration text generation
   */
  private generateNarrationTextFallback(request: MoodNarrationRequest): {
    text: string;
    emotionalTone: string;
    keyMessages: string[];
    affirmations: string[];
  } {
    const { moodEmbedding, narrationStyle, personalizedContext } = request;
    const dominantEmotion = this.getDominantEmotion(moodEmbedding);
    const sentiment = moodEmbedding.sentiment;
    const intensity = moodEmbedding.intensity;
    
    const userName = personalizedContext?.userName || 'friend';
    const timeGreeting = this.getTimeGreeting(personalizedContext?.timeOfDay);

    let text = '';
    let emotionalTone = '';
    const keyMessages: string[] = [];
    const affirmations: string[] = [];

    switch (narrationStyle) {
      case 'insights':
        emotionalTone = 'analytical-warm';
        text = `${timeGreeting}, ${userName}. I can sense that ${dominantEmotion} is your dominant emotion right now, `;
        
        if (sentiment > 0.3) {
          text += `and your positive energy is truly beautiful. Your emotional intensity of ${Math.round(intensity * 100)}% shows you're feeling things deeply, which is a gift.`;
          keyMessages.push('Your positive energy is beautiful');
          keyMessages.push('Feeling deeply is a gift');
        } else if (sentiment < -0.3) {
          text += `and I want you to know that it's completely okay to feel this way. Your emotions are valid, and this moment is temporary.`;
          keyMessages.push('Your emotions are valid');
          keyMessages.push('This moment is temporary');
        } else {
          text += `and you seem to be in a balanced emotional state. This equilibrium can be a wonderful foundation for growth.`;
          keyMessages.push('Emotional balance is valuable');
          keyMessages.push('Great foundation for growth');
        }
        break;

      case 'affirmations':
        emotionalTone = 'uplifting';
        text = `${userName}, you are exactly where you need to be right now. `;
        
        if (dominantEmotion === 'joy') {
          text += `Your joy is contagious and lights up the world around you. You deserve all the happiness you're feeling.`;
          affirmations.push('Your joy lights up the world');
          affirmations.push('You deserve happiness');
        } else if (dominantEmotion === 'sadness') {
          text += `Your sensitivity is a superpower. You feel deeply because you love deeply, and that makes you incredibly special.`;
          affirmations.push('Your sensitivity is a superpower');
          affirmations.push('You love deeply');
        } else if (dominantEmotion === 'trust') {
          text += `Your ability to trust and connect with others is a beautiful gift. You create safe spaces wherever you go.`;
          affirmations.push('Your trust is a gift');
          affirmations.push('You create safe spaces');
        } else {
          text += `Your emotional complexity makes you beautifully human. Every feeling you have is part of your unique journey.`;
          affirmations.push('Your complexity is beautiful');
          affirmations.push('Every feeling matters');
        }
        break;

      case 'guidance':
        emotionalTone = 'supportive';
        text = `${userName}, based on your current emotional state, here's some gentle guidance. `;
        
        if (intensity > 0.7) {
          text += `Your emotions are running high right now. Consider taking some deep breaths and grounding yourself in the present moment.`;
          keyMessages.push('Take deep breaths');
          keyMessages.push('Ground yourself in the present');
        } else if (intensity < 0.3) {
          text += `You might be feeling emotionally distant right now. It's okay to reconnect with your feelings at your own pace.`;
          keyMessages.push('Reconnect at your own pace');
          keyMessages.push('Your feelings matter');
        } else {
          text += `Your emotional balance is wonderful. This is a great time for reflection and setting intentions.`;
          keyMessages.push('Great time for reflection');
          keyMessages.push('Set positive intentions');
        }
        break;

      case 'celebration':
        emotionalTone = 'joyful';
        text = `${userName}, let's celebrate this beautiful moment! `;
        
        if (sentiment > 0.2) {
          text += `Your positive energy is absolutely radiant. You're creating ripples of joy that touch everyone around you.`;
          keyMessages.push('Your energy is radiant');
          keyMessages.push('You create ripples of joy');
        } else {
          text += `Even in challenging moments, you're showing incredible strength. That resilience deserves to be celebrated.`;
          keyMessages.push('You show incredible strength');
          keyMessages.push('Your resilience is admirable');
        }
        break;

      case 'comfort':
        emotionalTone = 'soothing';
        text = `${userName}, I'm here with you in this moment. `;
        
        if (sentiment < 0) {
          text += `It's okay to not be okay sometimes. Your feelings are completely valid, and you don't have to carry them alone.`;
          keyMessages.push('It\'s okay to not be okay');
          keyMessages.push('You\'re not alone');
        } else {
          text += `You're doing better than you might realize. Sometimes we need to pause and acknowledge our own strength.`;
          keyMessages.push('You\'re doing better than you think');
          keyMessages.push('Acknowledge your strength');
        }
        break;
    }

    return { text, emotionalTone, keyMessages, affirmations };
  }

  /**
   * Generate affirmation texts
   */
  private async generateAffirmationTexts(moodEmbedding: MoodEmbedding, count: number): Promise<Array<{
    text: string;
    message: string;
  }>> {
    const dominantEmotion = this.getDominantEmotion(moodEmbedding);
    const affirmations: Array<{ text: string; message: string }> = [];

    const affirmationTemplates: Record<string, Array<{ text: string; message: string }>> = {
      joy: [
        { text: "Your joy is a gift to the world. Keep shining your beautiful light.", message: "Embrace your natural radiance" },
        { text: "You deserve all the happiness you're feeling right now and more.", message: "You are worthy of joy" },
        { text: "Your positive energy creates ripples of goodness everywhere you go.", message: "Your impact is meaningful" }
      ],
      sadness: [
        { text: "Your sensitivity is a superpower that allows you to connect deeply with others.", message: "Sensitivity is strength" },
        { text: "It's okay to feel sad. Your emotions are valid and temporary.", message: "All feelings are temporary" },
        { text: "You are stronger than you know, and this difficult moment will pass.", message: "You have inner strength" }
      ],
      trust: [
        { text: "Your ability to trust makes you a beacon of hope for others.", message: "Trust is a gift" },
        { text: "You create safe spaces wherever you go through your open heart.", message: "You create safety for others" },
        { text: "Your faith in goodness makes the world a better place.", message: "Your faith matters" }
      ],
      anger: [
        { text: "Your anger shows you care deeply about what matters to you.", message: "Anger can show your values" },
        { text: "You have the power to transform this energy into positive change.", message: "Transform energy positively" },
        { text: "Your passion, even when intense, comes from a place of caring.", message: "Passion shows you care" }
      ],
      fear: [
        { text: "Courage isn't the absence of fear; it's feeling fear and moving forward anyway.", message: "You can be brave" },
        { text: "Your awareness of challenges shows wisdom and preparation.", message: "Awareness is wisdom" },
        { text: "You've overcome fears before, and you have the strength to do it again.", message: "You've overcome before" }
      ],
      anticipation: [
        { text: "Your excitement about the future shows your beautiful optimism.", message: "Optimism is beautiful" },
        { text: "Good things are coming your way because you're open to receiving them.", message: "Stay open to goodness" },
        { text: "Your anticipation is creating positive energy that attracts wonderful experiences.", message: "Positive energy attracts good" }
      ],
      surprise: [
        { text: "Your openness to surprise makes life an adventure.", message: "Embrace life's adventures" },
        { text: "You handle unexpected moments with grace and adaptability.", message: "You are adaptable" },
        { text: "Life's surprises often bring the most beautiful gifts.", message: "Surprises can be gifts" }
      ],
      disgust: [
        { text: "Your strong values guide you toward what truly matters.", message: "Your values are important" },
        { text: "It's healthy to have boundaries about what you will and won't accept.", message: "Boundaries are healthy" },
        { text: "Your discernment helps you choose what's best for your wellbeing.", message: "Trust your discernment" }
      ]
    };

    const emotionAffirmations = affirmationTemplates[dominantEmotion] || affirmationTemplates.joy;
    
    // Select random affirmations up to the requested count
    const selectedAffirmations = emotionAffirmations
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(count, emotionAffirmations.length));

    return selectedAffirmations;
  }

  /**
   * Generate couple narration text
   */
  private async generateCoupleNarrationText(
    user1Mood: MoodEmbedding,
    user2Mood: MoodEmbedding,
    user1Name: string,
    user2Name: string,
    compatibility: number
  ): Promise<{
    text: string;
    keyMessages: string[];
    affirmations: string[];
  }> {
    const user1Emotion = this.getDominantEmotion(user1Mood);
    const user2Emotion = this.getDominantEmotion(user2Mood);
    const blendedMood = this.blendMoods(user1Mood, user2Mood);
    
    let text = `${user1Name} and ${user2Name}, your hearts are beautifully connected. `;
    const keyMessages: string[] = [];
    const affirmations: string[] = [];

    if (compatibility > 0.8) {
      text += `Your emotional harmony is extraordinary, with ${Math.round(compatibility * 100)}% compatibility. `;
      text += `${user1Name}, your ${user1Emotion} energy blends perfectly with ${user2Name}'s ${user2Emotion} spirit. `;
      text += `Together, you create a beautiful symphony of emotions that strengthens your bond.`;
      
      keyMessages.push('Extraordinary emotional harmony');
      keyMessages.push('Perfect energy blend');
      affirmations.push('You create a beautiful symphony together');
    } else if (compatibility > 0.6) {
      text += `Your emotional connection shows wonderful potential, with ${Math.round(compatibility * 100)}% compatibility. `;
      text += `${user1Name}'s ${user1Emotion} and ${user2Name}'s ${user2Emotion} create an interesting dynamic. `;
      text += `Your differences complement each other, offering opportunities for growth and deeper understanding.`;
      
      keyMessages.push('Wonderful potential for connection');
      keyMessages.push('Differences complement each other');
      affirmations.push('Your differences create opportunities for growth');
    } else {
      text += `Your emotional journey together is unique and valuable. `;
      text += `${user1Name}, your ${user1Emotion} brings one perspective, while ${user2Name}'s ${user2Emotion} offers another. `;
      text += `These contrasts can create beautiful balance and help you both learn from each other.`;
      
      keyMessages.push('Unique and valuable journey');
      keyMessages.push('Contrasts create balance');
      affirmations.push('You help each other learn and grow');
    }

    return { text, keyMessages, affirmations };
  }

  /**
   * Select appropriate voice profile based on mood and preferences
   */
  private selectVoiceProfile(
    moodEmbedding: MoodEmbedding,
    narrationStyle: string,
    voicePreference?: string
  ): { voiceId: string; settings: VoiceSettings } {
    // If user has a specific preference, try to honor it
    if (voicePreference && this.VOICE_PROFILES[voicePreference]) {
      return this.VOICE_PROFILES[voicePreference];
    }

    // Select based on narration style
    const styleMapping: Record<string, string> = {
      insights: 'empathetic',
      affirmations: 'uplifting',
      guidance: 'supportive',
      celebration: 'uplifting',
      comfort: 'calming'
    };

    const mappedStyle = styleMapping[narrationStyle] || 'empathetic';
    return this.VOICE_PROFILES[mappedStyle];
  }

  /**
   * Map narration style to emotional tone
   */
  private mapNarrationStyleToTone(style: string): 'empathetic' | 'uplifting' | 'calming' | 'encouraging' | 'romantic' | 'supportive' {
    const mapping: Record<string, any> = {
      insights: 'empathetic',
      affirmations: 'uplifting',
      guidance: 'supportive',
      celebration: 'uplifting',
      comfort: 'calming'
    };
    return mapping[style] || 'empathetic';
  }

  /**
   * Get dominant emotion from mood embedding
   */
  private getDominantEmotion(moodEmbedding: MoodEmbedding): string {
    return Object.entries(moodEmbedding.emotions)
      .reduce((a, b) => moodEmbedding.emotions[a[0] as keyof typeof moodEmbedding.emotions] > 
                       moodEmbedding.emotions[b[0] as keyof typeof moodEmbedding.emotions] ? a : b)[0];
  }

  /**
   * Blend two moods for couple narration
   */
  private blendMoods(mood1: MoodEmbedding, mood2: MoodEmbedding): MoodEmbedding {
    const blendedEmotions: Record<string, number> = {};
    Object.keys(mood1.emotions).forEach(emotion => {
      blendedEmotions[emotion] = (
        mood1.emotions[emotion as keyof typeof mood1.emotions] + 
        mood2.emotions[emotion as keyof typeof mood2.emotions]
      ) / 2;
    });

    return {
      emotions: blendedEmotions as any,
      sentiment: (mood1.sentiment + mood2.sentiment) / 2,
      intensity: (mood1.intensity + mood2.intensity) / 2,
      timestamp: new Date()
    };
  }

  /**
   * Get time-appropriate greeting
   */
  private getTimeGreeting(timeOfDay?: string): string {
    const greetings: Record<string, string> = {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      night: 'Hello'
    };
    
    if (timeOfDay && greetings[timeOfDay]) {
      return greetings[timeOfDay];
    }
    
    // Auto-detect based on current time
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Hello';
  }
}

export const voiceService = new VoiceService();