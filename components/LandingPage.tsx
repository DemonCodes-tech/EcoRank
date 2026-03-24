import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Globe, Shield, Zap, ArrowRight, Trophy, Users, BarChart } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  lang: 'en' | 'ar';
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, lang }) => {
  const isAr = lang === 'ar';

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
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-eco-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-eco-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Verification</h3>
              <p className="text-gray-400 leading-relaxed">Our advanced AI analyzes your uploaded photos and videos to verify eco-actions and award points fairly.</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Trophy className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Competitive Leaderboards</h3>
              <p className="text-gray-400 leading-relaxed">Compete with friends, classmates, or colleagues. Climb the ranks and show off your environmental dedication.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                <BarChart className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Detailed Analytics</h3>
              <p className="text-gray-400 leading-relaxed">Track your personal impact over time. See how your small daily actions contribute to a larger global change.</p>
            </div>
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
