import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

interface StreakOverlayProps {
  streak: number;
  type: 'started' | 'continued';
  onComplete: () => void;
}

const StreakOverlay: React.FC<StreakOverlayProps> = ({ streak, type, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide after animation duration
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500); // Allow exit transition
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

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
            <span>DAY</span>
            <span>STREAK</span>
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