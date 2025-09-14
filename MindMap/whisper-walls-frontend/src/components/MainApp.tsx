import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { MainNavigation } from './navigation';
import { MoodDashboard } from './mood/MoodDashboard';
import { CoupleMoodBlending } from './mood/CoupleMoodBlending';
import { SpotifyAuth, PlaylistManager, PlaylistGenerator } from './spotify';
import { 
  ParticleSystem, 
  ButterflySwarm, 
  MagicalShimmer,
  DreamyInteraction,
  RevealOnScroll
} from './animations';

// Placeholder components for other views
const HomePage: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6">
    <RevealOnScroll animation="butterfly" withParticles>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Your Emotional Journey
        </h1>
        <p className="text-lg text-gray-600">
          Discover the beauty of your emotions through technology that understands the heart.
        </p>
      </div>
    </RevealOnScroll>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <RevealOnScroll animation="bloom" delay={0.2}>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-3xl mb-4 text-center">💝</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Whispers</h3>
          <p className="text-gray-600 text-sm">
            You've discovered 3 beautiful messages this week. Each one a gift from a stranger's heart.
          </p>
        </div>
      </RevealOnScroll>
      
      <RevealOnScroll animation="bloom" delay={0.4}>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-3xl mb-4 text-center">🎵</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Mood Playlist</h3>
          <p className="text-gray-600 text-sm">
            Your current mood suggests uplifting melodies. Let music heal your soul.
          </p>
        </div>
      </RevealOnScroll>
      
      <RevealOnScroll animation="bloom" delay={0.6}>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-3xl mb-4 text-center">💕</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Connection</h3>
          <p className="text-gray-600 text-sm">
            Your emotional journey is unique and beautiful. Keep exploring your heart.
          </p>
        </div>
      </RevealOnScroll>
    </div>
  </div>
);

const WhisperMapPage: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6 text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Whisper Map</h1>
    <p className="text-gray-600 mb-8">Discover heartfelt messages left by others in beautiful locations.</p>
    <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100">
      <div className="text-6xl mb-4">🗺️</div>
      <p className="text-gray-500">Interactive map coming soon...</p>
    </div>
  </div>
);

const CreateWhisperPage: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6 text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Create a Whisper</h1>
    <p className="text-gray-600 mb-8">Leave an anonymous message for someone to discover.</p>
    <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100">
      <div className="text-6xl mb-4">✨</div>
      <p className="text-gray-500">Whisper creation interface coming soon...</p>
    </div>
  </div>
);

const CoupleModePage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <CoupleMoodBlending
      user1Id={user?._id || ''}
      user2Id="partner-user-id" // This would come from relationship data
      user1Name={user?.profile.displayName || user?.email || 'You'}
      user2Name="Your Partner" // This would come from relationship data
    />
  );
};

const PlaylistsPage: React.FC = () => {
  const { user } = useAuth();
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodEmbedding | null>(null);
  
  // Mock current mood - in real app this would come from mood service
  useEffect(() => {
    const mockMood: MoodEmbedding = {
      emotions: {
        joy: 0.7,
        sadness: 0.1,
        anger: 0.05,
        fear: 0.1,
        surprise: 0.3,
        disgust: 0.02,
        trust: 0.8,
        anticipation: 0.6
      },
      sentiment: 0.5,
      intensity: 0.6,
      timestamp: new Date()
    };
    setCurrentMood(mockMood);
  }, []);
  
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <RevealOnScroll animation="butterfly" withParticles>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Mood Playlists
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI-generated music that matches your emotional state. Connect with Spotify to create personalized playlists.
          </p>
        </div>
      </RevealOnScroll>
      
      <RevealOnScroll animation="fadeUp" delay={0.2}>
        <SpotifyAuth onConnectionChange={setIsSpotifyConnected} />
      </RevealOnScroll>
      
      {isSpotifyConnected && currentMood && (
        <>
          <RevealOnScroll animation="bloom" delay={0.4}>
            <PlaylistGenerator 
              moodEmbedding={currentMood}
              onPlaylistGenerated={(playlist) => {
                console.log('Generated playlist:', playlist);
              }}
            />
          </RevealOnScroll>
          
          <RevealOnScroll animation="sparkle" delay={0.6}>
            <PlaylistManager moodEmbedding={currentMood} />
          </RevealOnScroll>
        </>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6 text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Profile Settings</h1>
    <p className="text-gray-600 mb-8">Manage your account and preferences.</p>
    <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100">
      <div className="text-6xl mb-4">⚙️</div>
      <p className="text-gray-500">Profile settings coming soon...</p>
    </div>
  </div>
);

const PreferencesPage: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6 text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Preferences</h1>
    <p className="text-gray-600 mb-8">Customize your Whisper Walls experience.</p>
    <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100">
      <div className="text-6xl mb-4">🎨</div>
      <p className="text-gray-500">Preferences panel coming soon...</p>
    </div>
  </div>
);

export const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'mood-dashboard':
        return <MoodDashboard userId={user?._id || ''} />;
      case 'whisper-map':
        return <WhisperMapPage />;
      case 'create-whisper':
        return <CreateWhisperPage />;
      case 'couple-mode':
        return <CoupleModePage />;
      case 'playlists':
        return <PlaylistsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'preferences':
        return <PreferencesPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 relative overflow-hidden">
      {/* Background effects */}
      <ParticleSystem 
        type="stardust" 
        count={8} 
        intensity="low" 
        direction="random" 
        speed="slow"
        className="opacity-20"
      />
      
      {/* Floating butterflies */}
      <ButterflySwarm 
        count={3} 
        area="large" 
        behavior="gentle"
        className="absolute top-20 right-10 opacity-30"
      />

      {/* Navigation */}
      <MainNavigation 
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Content */}
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="py-8"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Magical shimmer effect on view changes */}
      <MagicalShimmer 
        intensity="subtle" 
        color="rainbow" 
        trigger={currentView === 'mood-dashboard'}
      />
    </div>
  );
};