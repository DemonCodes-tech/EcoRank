import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Globe, Shield, Zap, ArrowRight, Trophy, Users, BarChart, ChevronDown } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  lang: 'en' | 'ar';
}

const features = [
  {
    id: 'ai',
    icon: <Zap className="w-7 h-7 text-eco-400" />,
    iconBg: 'bg-eco-500/20',
    title: 'AI-Powered Verification',
    shortDesc: 'Our advanced AI analyzes your uploaded photos and videos to verify eco-actions and award points fairly.',
    longDesc: 'Using state-of-the-art machine learning models, EcoRank can instantly recognize eco-friendly activities like recycling, using reusable bags, or planting trees. The AI evaluates the authenticity of your submission and assigns a confidence score, ensuring that the leaderboard remains fair and competitive for everyone. No manual approval needed for high-confidence actions!'
  },
  {
    id: 'leaderboards',
    icon: <Trophy className="w-7 h-7 text-blue-400" />,
    iconBg: 'bg-blue-500/20',
    title: 'Competitive Leaderboards',
    shortDesc: 'Compete with friends, classmates, or colleagues. Climb the ranks and show off your environmental dedication.',
    longDesc: 'Join sections or groups to compete locally, or take on the global leaderboard. Earn points for every verified action, maintain daily streaks for bonus multipliers, and unlock special badges. The leaderboard updates in real-time, providing a fun, gamified way to stay motivated and see how your impact stacks up against top eco-warriors.'
  },
  {
    id: 'analytics',
    icon: <BarChart className="w-7 h-7 text-purple-400" />,
    iconBg: 'bg-purple-500/20',
    title: 'Detailed Analytics',
    shortDesc: 'Track your personal impact over time. See how your small daily actions contribute to a larger global change.',
    longDesc: 'Get comprehensive insights into your environmental journey. View beautiful charts breaking down your actions by category (e.g., Waste Reduction, Energy Saving, Transportation). Track your total points, monitor your weekly progress, and discover which habits you excel at and where you can improve to maximize your eco-impact.'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, lang }) => {
  const isAr = lang === 'ar';
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const toggleFeature = (id: string) => {
    setExpandedFeature(expandedFeature === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-eco-950 text-white overflow-x-hidden font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-eco-950/80 backdrop-blur-md border-b border-eco-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-eco-500/20 p-2.5 rounded-xl">
              <Leaf className="h-6 w-6 text-eco-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight">EcoRank</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <button 
              onClick={onLoginClick}
              className="bg-eco-600 hover:bg-eco-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-eco-500/20 flex items-center gap-2"
            >
              {isAr ? 'تسجيل الدخول' : 'Login / Join'}
              <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-eco-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Gamify Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-eco-400 to-emerald-300">Eco-Impact</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Turn sustainability into a rewarding experience. Log your eco-friendly actions, compete on the leaderboard, and earn rewards while saving the planet.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onLoginClick}
              className="w-full sm:w-auto bg-eco-500 hover:bg-eco-400 text-eco-950 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-eco-500/30 flex items-center justify-center gap-2"
            >
              Start Your Journey
              <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg transition-all border border-white/10 flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose EcoRank?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">A complete ecosystem designed to motivate, track, and reward sustainable habits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.id}
                onClick={() => toggleFeature(feature.id)}
                className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors cursor-pointer flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center`}>
                    {feature.icon}
                  </div>
                  <motion.div
                    animate={{ rotate: expandedFeature === feature.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.shortDesc}</p>
                
                <AnimatePresence>
                  {expandedFeature === feature.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-gray-300 leading-relaxed text-sm">
                          {feature.longDesc}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-white/50">
            <Leaf className="w-5 h-5" />
            <span className="font-bold tracking-wider">ECORANK</span>
          </div>
          <p>© {new Date().getFullYear()} EcoRank System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
