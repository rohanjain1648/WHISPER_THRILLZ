import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ParticleSystem,
  ButterflySwarm,
  SparkleEffect,
  MagicalShimmer,
  DreamyInteraction,
  CursorAttractor,
  EmotionalPulse,
  RevealOnScroll,
  AnimationOrchestrator,
  useAnimationOrchestrator,
  ANIMATION_PRESETS
} from '../animations';
import { FloatingHearts, BloomingFlower } from '../animations/RomanticAnimations';

export const AnimationShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('particles');
  const [showHearts, setShowHearts] = useState(false);
  const [showBloom, setShowBloom] = useState(false);
  const { currentTrigger, triggerSequence, clearTrigger } = useAnimationOrchestrator();

  const demoSections = [
    { id: 'particles', name: 'Particle Systems', icon: '✨' },
    { id: 'butterflies', name: 'Butterfly Swarms', icon: '🦋' },
    { id: 'interactions', name: 'Microinteractions', icon: '💫' },
    { id: 'romantic', name: 'Romantic Animations', icon: '💕' },
    { id: 'sequences', name: 'Animation Sequences', icon: '🎭' }
  ];

  const handleSequenceTrigger = (sequenceName: string) => {
    triggerSequence(sequenceName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <RevealOnScroll animation="butterfly" withParticles>
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Butterflies in Motion
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive animation framework designed to create magical, 
              romantic experiences that bring hearts closer together.
            </p>
          </div>
        </RevealOnScroll>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {demoSections.map((section) => (
            <DreamyInteraction key={section.id}>
              <button
                onClick={() => setActiveDemo(section.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeDemo === section.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.name}
              </button>
            </DreamyInteraction>
          ))}
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 min-h-96 relative overflow-hidden">
          
          {/* Particle Systems Demo */}
          {activeDemo === 'particles' && (
            <RevealOnScroll animation="fadeUp">
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-center mb-8">Particle Systems</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Hearts</h3>
                    <div className="h-32 relative bg-pink-50 rounded-lg">
                      <ParticleSystem 
                        type="hearts" 
                        count={8} 
                        intensity="medium" 
                        direction="up"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Sparkles</h3>
                    <div className="h-32 relative bg-yellow-50 rounded-lg">
                      <ParticleSystem 
                        type="sparkles" 
                        count={10} 
                        intensity="high" 
                        direction="random"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Petals</h3>
                    <div className="h-32 relative bg-rose-50 rounded-lg">
                      <ParticleSystem 
                        type="petals" 
                        count={6} 
                        intensity="low" 
                        direction="down" 
                        speed="slow"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Enhanced Sparkle Effects</h3>
                  <div className="h-40 relative bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                    <SparkleEffect 
                      count={15} 
                      intensity="magical" 
                      color="rainbow" 
                      pattern="heart"
                    />
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          )}

          {/* Butterfly Swarms Demo */}
          {activeDemo === 'butterflies' && (
            <RevealOnScroll animation="butterfly">
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-center mb-8">Butterfly Swarms</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Gentle</h3>
                    <div className="h-48 relative bg-blue-50 rounded-lg">
                      <ButterflySwarm 
                        count={4} 
                        area="medium" 
                        behavior="gentle"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Playful</h3>
                    <div className="h-48 relative bg-green-50 rounded-lg">
                      <ButterflySwarm 
                        count={6} 
                        area="medium" 
                        behavior="playful"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Energetic</h3>
                    <div className="h-48 relative bg-orange-50 rounded-lg">
                      <ButterflySwarm 
                        count={8} 
                        area="medium" 
                        behavior="energetic"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          )}

          {/* Microinteractions Demo */}
          {activeDemo === 'interactions' && (
            <RevealOnScroll animation="sparkle">
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-center mb-8">Dreamy Microinteractions</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dreamy Hover Effects</h3>
                    <DreamyInteraction className="p-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg text-center cursor-pointer">
                      Hover over me for dreamy effects! ✨
                    </DreamyInteraction>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Cursor Attraction</h3>
                    <CursorAttractor 
                      strength={0.3} 
                      range={100} 
                      showTrail={true}
                      className="p-6 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg text-center cursor-pointer"
                    >
                      I'm attracted to your cursor! 🧲
                    </CursorAttractor>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Emotional Pulse - Love</h3>
                    <EmotionalPulse emotion="love" intensity={0.8}>
                      <div className="p-6 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg text-center">
                        Pulsing with love! 💕
                      </div>
                    </EmotionalPulse>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Magical Shimmer</h3>
                    <MagicalShimmer intensity="strong" color="rainbow" trigger={true}>
                      <div className="p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg text-center">
                        Shimmering with magic! ✨
                      </div>
                    </MagicalShimmer>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          )}

          {/* Romantic Animations Demo */}
          {activeDemo === 'romantic' && (
            <RevealOnScroll animation="heart">
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-center mb-8">Romantic Animations</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">Floating Hearts</h3>
                    <button
                      onClick={() => setShowHearts(true)}
                      className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                    >
                      Trigger Hearts 💕
                    </button>
                    <FloatingHearts 
                      trigger={showHearts}
                      count={12}
                      onComplete={() => setShowHearts(false)}
                    />
                  </div>
                  
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">Blooming Flower</h3>
                    <button
                      onClick={() => setShowBloom(!showBloom)}
                      className="px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                    >
                      {showBloom ? 'Hide' : 'Show'} Bloom 🌸
                    </button>
                    <div className="h-32 flex items-center justify-center">
                      <BloomingFlower isVisible={showBloom} size="lg" />
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          )}

          {/* Animation Sequences Demo */}
          {activeDemo === 'sequences' && (
            <RevealOnScroll animation="bloom">
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-center mb-8">Animation Sequences</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DreamyInteraction>
                    <button
                      onClick={() => handleSequenceTrigger('match-found')}
                      className="w-full p-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold"
                    >
                      💕 Match Found Sequence
                    </button>
                  </DreamyInteraction>
                  
                  <DreamyInteraction>
                    <button
                      onClick={() => handleSequenceTrigger('message-sent')}
                      className="w-full p-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-semibold"
                    >
                      📝 Message Sent Sequence
                    </button>
                  </DreamyInteraction>
                  
                  <DreamyInteraction>
                    <button
                      onClick={() => handleSequenceTrigger('mood-detected')}
                      className="w-full p-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold"
                    >
                      🎭 Mood Detected Sequence
                    </button>
                  </DreamyInteraction>
                  
                  <DreamyInteraction>
                    <button
                      onClick={() => handleSequenceTrigger('connection-made')}
                      className="w-full p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold"
                    >
                      🌟 Connection Made Sequence
                    </button>
                  </DreamyInteraction>
                </div>

                <div className="text-center text-gray-600 mt-8">
                  <p>Each sequence combines multiple animations in perfect harmony</p>
                  <p className="text-sm mt-2">
                    Watch as blooms, hearts, butterflies, and sparkles dance together
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          )}
        </div>

        {/* Performance Info */}
        <RevealOnScroll animation="fadeUp" delay={0.5}>
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Performance Optimized</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <div className="font-semibold text-green-600">60 FPS Target</div>
                  <div>Smooth animations on all devices</div>
                </div>
                <div>
                  <div className="font-semibold text-blue-600">Hardware Accelerated</div>
                  <div>GPU-optimized transforms</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-600">Memory Efficient</div>
                  <div>Automatic resource cleanup</div>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>

      {/* Animation Orchestrator */}
      <AnimationOrchestrator 
        trigger={currentTrigger}
        onComplete={clearTrigger}
      />
    </div>
  );
};