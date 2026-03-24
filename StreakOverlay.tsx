import React, { useEffect, useState } from 'react';
import { Flame, Skull, XCircle } from 'lucide-react';
import { translations } from './translations';

interface StreakOverlayProps {
  streak: number;
  type: 'started' | 'continued' | 'lost';
  onComplete: () => void;
  lang?: 'en' | 'ar'; // Added lang prop for translations
}

const StreakOverlay: React.FC<StreakOverlayProps> = ({ streak, type, onComplete, lang = 'en' }) => {
  const [visible, setVisible] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    // Hide after animation duration
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500); // Allow exit transition
    }, 4000); // Slightly longer for dramatic effect
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  if (type === 'lost') {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-red-950/90 backdrop-blur-sm animate-fade-in"></div>
          
          <div className="relative z-10 flex flex-col items-center animate-pop-in">
            {/* Broken Streak Animation */}
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-red-600 blur-3xl opacity-20 animate-pulse rounded-full"></div>
              
              <div className="relative bg-black p-8 rounded-full shadow-[0_0_50px_rgba(220,38,38,0.5)] border-4 border-red-600 animate-bounce">
                <Skull className="h-24 w-24 text-red-600 animate-pulse" />
                <XCircle className="absolute -bottom-2 -right-2 h-10 w-10 text-white fill-red-600 animate-ping" />
              </div>
            </div>
    
            <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-black stroke-white text-glow tracking-tighter mb-4 animate-slide-up">
              {t.streakLostTitle || "STREAK TERMINATED"}
            </h2>
            
            <div className="bg-red-900/40 border border-red-500/50 px-6 py-2 rounded mb-6 backdrop-blur-md animate-slide-up">
                 <p className="text-red-200 text-lg font-mono tracking-widest uppercase">
                    -{streak} {t.days || "DAYS"}
                 </p>
            </div>
    
            <p className="text-red-400 text-sm font-mono uppercase tracking-[0.2em] animate-pulse">
                {t.streakLostDesc || "EVIDENCE REJECTED. RESETTING SYSTEM..."}
            </p>
          </div>
          
          {/* Scanlines overlay for extra grit */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"></div>
      
      <div className="relative z-10 flex flex-col items-center animate-pop-in">
        {/* Fire Animation Effect */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-40 animate-pulse-slow rounded-full"></div>
          <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-fire-bounce delay-75 rounded-full"></div>
          
          <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-full shadow-2xl shadow-orange-500/50 border-4 border-orange-300 animate-fire-bounce">
            <Flame className="h-24 w-24 text-white fill-yellow-200 animate-pulse" />
          </div>
          
          {/* Sparkles */}
          <div className="absolute top-0 right-0 animate-ping h-4 w-4 bg-yellow-200 rounded-full"></div>
          <div className="absolute bottom-2 left-2 animate-ping delay-100 h-3 w-3 bg-orange-300 rounded-full"></div>
        </div>

        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-600 text-glow tracking-tighter mb-2 animate-slide-up">
          {type === 'started' ? 'STREAK STARTED!' : 'STREAK IGNITED!'}
        </h2>
        
        <div className="text-white text-2xl font-bold tracking-widest uppercase mb-8 flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="text-6xl text-orange-400">{streak}</span> 
          <div className="flex flex-col text-left text-sm leading-none opacity-80">
            <span>{t.days || "DAY"}</span>
            <span>{t.streak || "STREAK"}</span>
          </div>
        </div>

        <p className="text-orange-200 text-lg font-medium animate-pulse">
            Keep the fire burning! 🔥
        </p>
      </div>
    </div>
  );
};

export default StreakOverlay;