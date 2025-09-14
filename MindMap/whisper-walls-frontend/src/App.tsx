import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from './services/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthPage } from './components/auth/AuthPage';
import { MainApp } from './components/MainApp';
import { 
  ParticleSystem, 
  ButterflySwarm, 
  MagicalShimmer,
  DreamyInteraction,
  AnimationOrchestrator,
  useAnimationOrchestrator
} from './components/animations';

// Main app content component
function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [showAuth, setShowAuth] = useState(false);
  const { currentTrigger, triggerSequence, clearTrigger } = useAnimationOrchestrator();
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);

  useEffect(() => {
    checkApiConnection();
    // Trigger welcome animation after a short delay
    setTimeout(() => {
      setShowWelcomeAnimation(true);
    }, 1000);
  }, []);

  const checkApiConnection = async () => {
    try {
      const response = await apiService.healthCheck();
      if (response.success) {
        setIsConnected(true);
        setApiStatus('Connected to Whisper Walls API');
      } else {
        setIsConnected(false);
        setApiStatus('API connection failed');
      }
    } catch (error) {
      setIsConnected(false);
      setApiStatus('Unable to connect to API');
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowAuth(false);
  };

  const handleBeginJourney = () => {
    triggerSequence('joyful-discovery');
    setTimeout(() => {
      setShowAuth(true);
    }, 1500);
  };

  const handleContinueJourney = () => {
    triggerSequence('connection-made');
    setShowAuth(false); // This will show the main app since user is authenticated
  };

  // Show authentication page if requested
  if (showAuth && !isAuthenticated) {
    return <AuthPage onSuccess={() => setShowAuth(false)} />;
  }

  // Show main app if user is authenticated and not showing auth
  if (isAuthenticated && !showAuth) {
    return <MainApp />;
  }

  return (
    <div className="min-h-screen romantic-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background particle effects */}
      <ParticleSystem 
        type="butterflies" 
        count={6} 
        intensity="low" 
        direction="random" 
        speed="slow"
        className="opacity-30"
      />
      
      {/* Floating butterfly swarm */}
      {showWelcomeAnimation && (
        <ButterflySwarm 
          count={4} 
          area="large" 
          behavior="gentle"
          className="absolute top-10 right-10 opacity-40"
        />
      )}

      <MagicalShimmer 
        intensity="subtle" 
        color="pink" 
        trigger={showWelcomeAnimation}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="whisper-card max-w-2xl w-full text-center relative z-10"
        >
        <motion.h1
          className="text-6xl font-bold mb-6 emotional-text"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Whisper Walls
        </motion.h1>
        
        <motion.p
          className="text-xl text-gray-700 mb-8 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Where hearts connect through anonymous whispers left in beautiful places. 
          Share your emotions, discover love notes, and let technology bring souls closer together.
        </motion.p>

        <motion.div
          className="flex items-center justify-center space-x-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-hope-500' : 'bg-stress-500'} animate-pulse`}></div>
          <span className="text-gray-600">{apiStatus}</span>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <DreamyInteraction className="p-4 bg-joy-50 rounded-xl border border-joy-200 cursor-pointer">
            <div className="text-2xl mb-2">💝</div>
            <h3 className="font-semibold text-joy-800">Anonymous Love Notes</h3>
            <p className="text-sm text-joy-600 mt-2">Leave heartfelt messages tied to real locations</p>
          </DreamyInteraction>
          
          <DreamyInteraction className="p-4 bg-hope-50 rounded-xl border border-hope-200 cursor-pointer">
            <div className="text-2xl mb-2">🎵</div>
            <h3 className="font-semibold text-hope-800">Mood Playlists</h3>
            <p className="text-sm text-hope-600 mt-2">AI-generated music that matches your emotions</p>
          </DreamyInteraction>
          
          <DreamyInteraction className="p-4 bg-love-50 rounded-xl border border-love-200 cursor-pointer">
            <div className="text-2xl mb-2">💕</div>
            <h3 className="font-semibold text-love-800">Couple Mode</h3>
            <p className="text-sm text-love-600 mt-2">Blend moods and discover together</p>
          </DreamyInteraction>
        </motion.div>

        {isAuthenticated ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="text-center mb-4">
              <p className="text-gray-600">
                Welcome back, <span className="font-semibold text-love-600">
                  {user?.profile.displayName || user?.email}
                </span>! 💕
              </p>
            </div>
            
            <div className="flex space-x-3 justify-center">
              <DreamyInteraction>
                <motion.button
                  onClick={handleContinueJourney}
                  className="mood-button bg-gradient-to-r from-love-500 to-joy-500 text-white font-semibold shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue Journey
                </motion.button>
              </DreamyInteraction>
              
              <DreamyInteraction>
                <motion.button
                  onClick={handleLogout}
                  className="mood-button bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Out
                </motion.button>
              </DreamyInteraction>
            </div>
          </motion.div>
        ) : (
          <DreamyInteraction>
            <motion.button
              onClick={handleBeginJourney}
              className="mood-button bg-gradient-to-r from-love-500 to-joy-500 text-white font-semibold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              Begin Your Emotional Journey
            </motion.button>
          </DreamyInteraction>
        )}

        <motion.p
          className="text-sm text-gray-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          Platform Status: {import.meta.env.VITE_APP_NAME} v{import.meta.env.VITE_APP_VERSION}
        </motion.p>
        </motion.div>
      </MagicalShimmer>

      {/* Animation Orchestrator for complex sequences */}
      <AnimationOrchestrator 
        trigger={currentTrigger}
        onComplete={clearTrigger}
      />
    </div>
  );
}

// Main App component with providers
function App() {
  return (
    <ThemeProvider defaultTheme="love">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;