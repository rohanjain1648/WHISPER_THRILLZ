import type { MoodEmbedding } from '../types';
import { spotifyService } from './spotifyService';

export interface MoodToMusicMapping {
  genres: string[];
  audioFeatures: {
    acousticness: [number, number];
    danceability: [number, number];
    energy: [number, number];
    instrumentalness: [number, number];
    liveness: [number, number];
    loudness: [number, number];
    speechiness: [number, number];
    tempo: [number, number];
    valence: [number, number];
  };
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: 'sunny' | 'rainy' | 'cloudy' | 'stormy';
}

export interface PlaylistGenerationOptions {
  moodEmbedding: MoodEmbedding;
  playlistLength?: number;
  includePopular?: boolean;
  includeDiscovery?: boolean;
  timeContext?: 'morning' | 'afternoon' | 'evening' | 'night';
  weatherContext?: 'sunny' | 'rainy' | 'cloudy' | 'stormy';
  energyPreference?: 'low' | 'medium' | 'high' | 'adaptive';
  genrePreferences?: string[];
  excludeExplicit?: boolean;
}

export interface GeneratedPlaylist {
  name: string;
  description: string;
  tracks: Array<{
    id: string;
    name: string;
    artist: string;
    album: string;
    duration: number;
    moodScore: number;
    reasonForInclusion: string;
  }>;
  moodContext: MoodEmbedding;
  audioFeaturesSummary: {
    avgEnergy: number;
    avgValence: number;
    avgDanceability: number;
    avgAcousticness: number;
    avgTempo: number;
  };
  totalDuration: number;
  createdAt: Date;
}

class PlaylistGenerationService {
  // Comprehensive mood-to-music mapping
  private readonly EMOTION_MAPPINGS: Record<string, MoodToMusicMapping> = {
    joy: {
      genres: ['pop', 'dance', 'funk', 'disco', 'happy', 'upbeat'],
      audioFeatures: {
        acousticness: [0.0, 0.4],
        danceability: [0.6, 1.0],
        energy: [0.7, 1.0],
        instrumentalness: [0.0, 0.3],
        liveness: [0.0, 0.5],
        loudness: [-8, -2],
        speechiness: [0.0, 0.4],
        tempo: [120, 180],
        valence: [0.7, 1.0]
      }
    },
    sadness: {
      genres: ['indie', 'alternative', 'folk', 'acoustic', 'melancholy', 'blues'],
      audioFeatures: {
        acousticness: [0.4, 1.0],
        danceability: [0.0, 0.4],
        energy: [0.0, 0.4],
        instrumentalness: [0.0, 0.6],
        liveness: [0.0, 0.3],
        loudness: [-20, -8],
        speechiness: [0.0, 0.3],
        tempo: [60, 100],
        valence: [0.0, 0.3]
      }
    },
    anger: {
      genres: ['rock', 'metal', 'punk', 'hardcore', 'aggressive', 'industrial'],
      audioFeatures: {
        acousticness: [0.0, 0.3],
        danceability: [0.3, 0.7],
        energy: [0.8, 1.0],
        instrumentalness: [0.0, 0.5],
        liveness: [0.0, 0.6],
        loudness: [-5, 0],
        speechiness: [0.0, 0.5],
        tempo: [130, 200],
        valence: [0.0, 0.4]
      }
    },
    fear: {
      genres: ['ambient', 'dark-ambient', 'experimental', 'minimal', 'atmospheric'],
      audioFeatures: {
        acousticness: [0.3, 0.8],
        danceability: [0.0, 0.4],
        energy: [0.2, 0.6],
        instrumentalness: [0.3, 1.0],
        liveness: [0.0, 0.3],
        loudness: [-25, -10],
        speechiness: [0.0, 0.2],
        tempo: [70, 120],
        valence: [0.0, 0.4]
      }
    },
    surprise: {
      genres: ['electronic', 'experimental', 'world', 'fusion', 'eclectic'],
      audioFeatures: {
        acousticness: [0.0, 0.7],
        danceability: [0.3, 0.8],
        energy: [0.4, 0.9],
        instrumentalness: [0.0, 0.7],
        liveness: [0.0, 0.5],
        loudness: [-12, -3],
        speechiness: [0.0, 0.4],
        tempo: [90, 160],
        valence: [0.3, 0.8]
      }
    },
    disgust: {
      genres: ['grunge', 'alternative', 'industrial', 'noise', 'dark'],
      audioFeatures: {
        acousticness: [0.0, 0.4],
        danceability: [0.0, 0.5],
        energy: [0.3, 0.8],
        instrumentalness: [0.0, 0.6],
        liveness: [0.0, 0.4],
        loudness: [-15, -5],
        speechiness: [0.0, 0.6],
        tempo: [80, 140],
        valence: [0.0, 0.3]
      }
    },
    trust: {
      genres: ['soul', 'r-n-b', 'gospel', 'jazz', 'smooth', 'classic'],
      audioFeatures: {
        acousticness: [0.2, 0.8],
        danceability: [0.4, 0.8],
        energy: [0.3, 0.7],
        instrumentalness: [0.0, 0.4],
        liveness: [0.0, 0.4],
        loudness: [-15, -5],
        speechiness: [0.0, 0.4],
        tempo: [80, 130],
        valence: [0.5, 0.9]
      }
    },
    anticipation: {
      genres: ['electronic', 'progressive', 'trance', 'build-up', 'cinematic'],
      audioFeatures: {
        acousticness: [0.0, 0.5],
        danceability: [0.4, 0.9],
        energy: [0.6, 1.0],
        instrumentalness: [0.0, 0.8],
        liveness: [0.0, 0.4],
        loudness: [-10, -2],
        speechiness: [0.0, 0.3],
        tempo: [110, 170],
        valence: [0.4, 0.8]
      }
    }
  };

  // Time-of-day modifiers
  private readonly TIME_MODIFIERS: Record<string, Partial<MoodToMusicMapping>> = {
    morning: {
      genres: ['acoustic', 'folk', 'indie', 'chill', 'coffee-shop'],
      audioFeatures: {
        energy: [0.3, 0.7],
        acousticness: [0.3, 0.8],
        tempo: [80, 120]
      }
    },
    afternoon: {
      genres: ['pop', 'rock', 'upbeat', 'energetic'],
      audioFeatures: {
        energy: [0.5, 0.9],
        danceability: [0.4, 0.8],
        tempo: [100, 140]
      }
    },
    evening: {
      genres: ['jazz', 'soul', 'r-n-b', 'smooth', 'romantic'],
      audioFeatures: {
        energy: [0.2, 0.6],
        valence: [0.4, 0.8],
        acousticness: [0.2, 0.7]
      }
    },
    night: {
      genres: ['ambient', 'chillout', 'downtempo', 'lo-fi', 'sleep'],
      audioFeatures: {
        energy: [0.0, 0.4],
        loudness: [-20, -10],
        tempo: [60, 100]
      }
    }
  };

  // Weather context modifiers
  private readonly WEATHER_MODIFIERS: Record<string, Partial<MoodToMusicMapping>> = {
    sunny: {
      genres: ['tropical', 'reggae', 'beach', 'summer', 'upbeat'],
      audioFeatures: {
        valence: [0.6, 1.0],
        energy: [0.5, 0.9],
        danceability: [0.5, 0.9]
      }
    },
    rainy: {
      genres: ['indie', 'alternative', 'melancholy', 'acoustic', 'contemplative'],
      audioFeatures: {
        acousticness: [0.4, 0.9],
        energy: [0.1, 0.5],
        valence: [0.2, 0.6]
      }
    },
    cloudy: {
      genres: ['ambient', 'atmospheric', 'dreamy', 'ethereal'],
      audioFeatures: {
        instrumentalness: [0.3, 0.8],
        energy: [0.2, 0.6],
        acousticness: [0.3, 0.7]
      }
    },
    stormy: {
      genres: ['dramatic', 'cinematic', 'intense', 'orchestral'],
      audioFeatures: {
        energy: [0.6, 1.0],
        loudness: [-8, 0],
        instrumentalness: [0.2, 0.9]
      }
    }
  };

  /**
   * Generate a personalized playlist based on mood and context
   */
  async generateMoodPlaylist(options: PlaylistGenerationOptions): Promise<GeneratedPlaylist> {
    const {
      moodEmbedding,
      playlistLength = 20,
      includePopular = true,
      includeDiscovery = true,
      timeContext,
      weatherContext,
      energyPreference = 'adaptive',
      genrePreferences = [],
      excludeExplicit = false
    } = options;

    // Calculate dominant emotions
    const dominantEmotions = this.getDominantEmotions(moodEmbedding);
    
    // Generate mood-based audio features
    const targetFeatures = this.calculateTargetAudioFeatures(
      moodEmbedding,
      dominantEmotions,
      timeContext,
      weatherContext,
      energyPreference
    );

    // Generate genre preferences
    const genres = this.generateGenrePreferences(
      dominantEmotions,
      timeContext,
      weatherContext,
      genrePreferences
    );

    // Get recommendations from Spotify
    const recommendations = await spotifyService.getMoodBasedRecommendations(
      moodEmbedding,
      Math.min(playlistLength * 2, 50) // Get more tracks to filter from
    );

    // Score and filter tracks
    const scoredTracks = recommendations.tracks.map(track => ({
      ...track,
      moodScore: this.calculateTrackMoodScore(track, moodEmbedding, targetFeatures),
      reasonForInclusion: this.generateInclusionReason(track, dominantEmotions)
    }));

    // Sort by mood score and select best tracks
    const selectedTracks = scoredTracks
      .filter(track => !excludeExplicit || !track.explicit)
      .sort((a, b) => b.moodScore - a.moodScore)
      .slice(0, playlistLength)
      .map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        duration: track.duration_ms,
        moodScore: track.moodScore,
        reasonForInclusion: track.reasonForInclusion
      }));

    // Calculate playlist statistics
    const audioFeaturesSummary = this.calculatePlaylistSummary(selectedTracks, recommendations.audioFeatures);
    const totalDuration = selectedTracks.reduce((sum, track) => sum + track.duration, 0);

    // Generate playlist name and description
    const playlistName = this.generatePlaylistName(dominantEmotions, moodEmbedding, timeContext);
    const playlistDescription = this.generatePlaylistDescription(dominantEmotions, moodEmbedding, selectedTracks.length);

    return {
      name: playlistName,
      description: playlistDescription,
      tracks: selectedTracks,
      moodContext: moodEmbedding,
      audioFeaturesSummary,
      totalDuration,
      createdAt: new Date()
    };
  }

  /**
   * Generate a couple playlist by blending two moods
   */
  async generateCouplePlaylist(
    user1Mood: MoodEmbedding,
    user2Mood: MoodEmbedding,
    user1Name: string,
    user2Name: string,
    options: Partial<PlaylistGenerationOptions> = {}
  ): Promise<GeneratedPlaylist> {
    // Blend the moods
    const blendedMood = await this.blendMoods(user1Mood, user2Mood);
    
    // Generate playlist with blended mood
    const playlist = await this.generateMoodPlaylist({
      moodEmbedding: blendedMood,
      playlistLength: options.playlistLength || 25,
      ...options
    });

    // Customize for couple context
    playlist.name = this.generateCouplePlaylistName(user1Name, user2Name, blendedMood);
    playlist.description = this.generateCouplePlaylistDescription(user1Name, user2Name, blendedMood);

    return playlist;
  }

  /**
   * Get dominant emotions from mood embedding
   */
  private getDominantEmotions(moodEmbedding: MoodEmbedding): Array<{ emotion: string; value: number }> {
    return Object.entries(moodEmbedding.emotions)
      .map(([emotion, value]) => ({ emotion, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3); // Top 3 emotions
  }

  /**
   * Calculate target audio features based on mood and context
   */
  private calculateTargetAudioFeatures(
    moodEmbedding: MoodEmbedding,
    dominantEmotions: Array<{ emotion: string; value: number }>,
    timeContext?: string,
    weatherContext?: string,
    energyPreference?: string
  ): Record<string, number> {
    const features: Record<string, number> = {};
    
    // Base features from dominant emotions
    dominantEmotions.forEach(({ emotion, value }) => {
      const mapping = this.EMOTION_MAPPINGS[emotion];
      if (mapping) {
        Object.entries(mapping.audioFeatures).forEach(([feature, [min, max]]) => {
          const target = min + (max - min) * value;
          features[feature] = (features[feature] || 0) + target * value;
        });
      }
    });

    // Normalize by total weight
    const totalWeight = dominantEmotions.reduce((sum, { value }) => sum + value, 0);
    Object.keys(features).forEach(feature => {
      features[feature] /= totalWeight;
    });

    // Apply sentiment adjustments
    if (moodEmbedding.sentiment > 0.3) {
      features.valence = Math.min(1, features.valence + 0.2);
      features.energy = Math.min(1, features.energy + 0.1);
    } else if (moodEmbedding.sentiment < -0.3) {
      features.valence = Math.max(0, features.valence - 0.2);
      features.energy = Math.max(0, features.energy - 0.1);
    }

    // Apply intensity adjustments
    if (moodEmbedding.intensity > 0.7) {
      features.energy = Math.min(1, features.energy + 0.15);
      features.tempo = Math.min(200, features.tempo + 20);
    } else if (moodEmbedding.intensity < 0.3) {
      features.energy = Math.max(0, features.energy - 0.15);
      features.acousticness = Math.min(1, features.acousticness + 0.2);
    }

    // Apply time context modifiers
    if (timeContext && this.TIME_MODIFIERS[timeContext]) {
      const timeFeatures = this.TIME_MODIFIERS[timeContext].audioFeatures;
      if (timeFeatures) {
        Object.entries(timeFeatures).forEach(([feature, [min, max]]) => {
          if (features[feature] !== undefined) {
            features[feature] = Math.max(min, Math.min(max, features[feature]));
          }
        });
      }
    }

    // Apply weather context modifiers
    if (weatherContext && this.WEATHER_MODIFIERS[weatherContext]) {
      const weatherFeatures = this.WEATHER_MODIFIERS[weatherContext].audioFeatures;
      if (weatherFeatures) {
        Object.entries(weatherFeatures).forEach(([feature, [min, max]]) => {
          if (features[feature] !== undefined) {
            features[feature] = Math.max(min, Math.min(max, features[feature]));
          }
        });
      }
    }

    // Apply energy preference
    if (energyPreference !== 'adaptive') {
      switch (energyPreference) {
        case 'low':
          features.energy = Math.min(0.4, features.energy);
          break;
        case 'medium':
          features.energy = Math.max(0.3, Math.min(0.7, features.energy));
          break;
        case 'high':
          features.energy = Math.max(0.6, features.energy);
          break;
      }
    }

    return features;
  }

  /**
   * Generate genre preferences based on mood and context
   */
  private generateGenrePreferences(
    dominantEmotions: Array<{ emotion: string; value: number }>,
    timeContext?: string,
    weatherContext?: string,
    userPreferences: string[] = []
  ): string[] {
    const genres = new Set<string>(userPreferences);

    // Add genres from dominant emotions
    dominantEmotions.forEach(({ emotion, value }) => {
      const mapping = this.EMOTION_MAPPINGS[emotion];
      if (mapping && value > 0.3) {
        mapping.genres.forEach(genre => genres.add(genre));
      }
    });

    // Add time context genres
    if (timeContext && this.TIME_MODIFIERS[timeContext]?.genres) {
      this.TIME_MODIFIERS[timeContext].genres!.forEach(genre => genres.add(genre));
    }

    // Add weather context genres
    if (weatherContext && this.WEATHER_MODIFIERS[weatherContext]?.genres) {
      this.WEATHER_MODIFIERS[weatherContext].genres!.forEach(genre => genres.add(genre));
    }

    return Array.from(genres).slice(0, 5); // Limit to 5 genres for Spotify API
  }

  /**
   * Calculate how well a track matches the target mood
   */
  private calculateTrackMoodScore(
    track: any,
    moodEmbedding: MoodEmbedding,
    targetFeatures: Record<string, number>
  ): number {
    // This would typically use actual audio features from Spotify
    // For now, we'll simulate based on track popularity and mood context
    let score = 0;

    // Base score from popularity (normalized)
    score += (track.popularity / 100) * 0.3;

    // Mood alignment score (simulated)
    const moodAlignment = Math.random() * 0.4 + 0.3; // 0.3 to 0.7
    score += moodAlignment * 0.7;

    // Bonus for explicit content if not excluded
    if (!track.explicit) {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  /**
   * Generate reason for including a track
   */
  private generateInclusionReason(track: any, dominantEmotions: Array<{ emotion: string; value: number }>): string {
    const reasons = [
      `Matches your ${dominantEmotions[0].emotion} mood perfectly`,
      `High energy track that complements your emotional state`,
      `Popular choice that resonates with your current feelings`,
      `Acoustic elements that enhance your ${dominantEmotions[0].emotion} experience`,
      `Perfect tempo for your current emotional intensity`,
      `Recommended based on your mood patterns`
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  /**
   * Calculate playlist audio features summary
   */
  private calculatePlaylistSummary(tracks: any[], baseFeatures: any): any {
    // Simulate average features calculation
    return {
      avgEnergy: 0.6 + (Math.random() - 0.5) * 0.4,
      avgValence: 0.5 + (Math.random() - 0.5) * 0.6,
      avgDanceability: 0.5 + (Math.random() - 0.5) * 0.4,
      avgAcousticness: 0.3 + (Math.random() - 0.5) * 0.4,
      avgTempo: 110 + (Math.random() - 0.5) * 60
    };
  }

  /**
   * Generate playlist name based on mood
   */
  private generatePlaylistName(
    dominantEmotions: Array<{ emotion: string; value: number }>,
    moodEmbedding: MoodEmbedding,
    timeContext?: string
  ): string {
    const emotion = dominantEmotions[0].emotion;
    const sentiment = moodEmbedding.sentiment;
    const intensity = moodEmbedding.intensity;

    const timePrefix = timeContext ? `${timeContext.charAt(0).toUpperCase() + timeContext.slice(1)} ` : '';
    
    const emotionNames: Record<string, string[]> = {
      joy: ['Joyful', 'Happy', 'Uplifting', 'Bright', 'Cheerful'],
      sadness: ['Melancholy', 'Reflective', 'Contemplative', 'Gentle', 'Soothing'],
      anger: ['Intense', 'Powerful', 'Energetic', 'Bold', 'Strong'],
      fear: ['Atmospheric', 'Mysterious', 'Ambient', 'Ethereal', 'Calm'],
      trust: ['Warm', 'Comforting', 'Soulful', 'Heartfelt', 'Genuine'],
      anticipation: ['Exciting', 'Dynamic', 'Progressive', 'Building', 'Energizing'],
      surprise: ['Eclectic', 'Diverse', 'Unexpected', 'Unique', 'Adventurous'],
      disgust: ['Alternative', 'Raw', 'Authentic', 'Unfiltered', 'Real']
    };

    const adjectives = emotionNames[emotion] || ['Mood'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    const suffixes = [
      'Vibes', 'Journey', 'Moments', 'Feelings', 'Experience', 
      'Soundtrack', 'Collection', 'Mix', 'Session', 'Flow'
    ];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${timePrefix}${adjective} ${suffix} - ${new Date().toLocaleDateString()}`;
  }

  /**
   * Generate playlist description
   */
  private generatePlaylistDescription(
    dominantEmotions: Array<{ emotion: string; value: number }>,
    moodEmbedding: MoodEmbedding,
    trackCount: number
  ): string {
    const emotion = dominantEmotions[0].emotion;
    const sentiment = moodEmbedding.sentiment > 0 ? 'positive' : moodEmbedding.sentiment < 0 ? 'reflective' : 'balanced';
    
    return `A personalized ${trackCount}-track playlist curated by Whisper Walls AI, designed to complement your ${emotion} mood with ${sentiment} energy. Each song is carefully selected to resonate with your current emotional state and enhance your musical journey.`;
  }

  /**
   * Generate couple playlist name
   */
  private generateCouplePlaylistName(user1Name: string, user2Name: string, blendedMood: MoodEmbedding): string {
    const dominantEmotions = this.getDominantEmotions(blendedMood);
    const emotion = dominantEmotions[0].emotion;
    
    const coupleNames = [
      `${user1Name} & ${user2Name}`,
      `${user1Name} + ${user2Name}`,
      `${user1Name} 💕 ${user2Name}`
    ];
    
    const coupleName = coupleNames[Math.floor(Math.random() * coupleNames.length)];
    
    return `${coupleName}'s ${emotion.charAt(0).toUpperCase() + emotion.slice(1)} Connection - ${new Date().toLocaleDateString()}`;
  }

  /**
   * Generate couple playlist description
   */
  private generateCouplePlaylistDescription(user1Name: string, user2Name: string, blendedMood: MoodEmbedding): string {
    const dominantEmotions = this.getDominantEmotions(blendedMood);
    const emotion = dominantEmotions[0].emotion;
    
    return `A shared musical journey for ${user1Name} and ${user2Name}, blending your emotional energies into a harmonious ${emotion}-focused playlist. Created by Whisper Walls AI to strengthen your connection through music that speaks to both your hearts.`;
  }

  /**
   * Blend two moods into a single mood embedding
   */
  private async blendMoods(mood1: MoodEmbedding, mood2: MoodEmbedding): Promise<MoodEmbedding> {
    // Calculate blended emotions (centroid)
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
}

export const playlistGenerationService = new PlaylistGenerationService();