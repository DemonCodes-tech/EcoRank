import React from 'react';
import { Gift, Lock, Timer } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../services/translations';

interface RewardsProps {
    lang: Language;
}

const Rewards: React.FC<RewardsProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="h-[70vh] flex flex-col items-center justify-center p-6 animate-slide-up text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-eco-500 blur-3xl opacity-20 animate-pulse-slow rounded-full"></div>
        <div className="relative bg-eco-900/80 p-6 rounded-full border border-eco-700">
          <Gift className="h-16 w-16 text-eco-300" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-eco-800 p-2 rounded-full border border-eco-600">
            <Lock className="h-5 w-5 text-eco-400" />
        </div>
      </div>

      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.rewardsTitle}</h2>
      <h3 className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-eco-300 to-emerald-500 font-semibold mb-6">
        {t.comingSoon}
      </h3>
      
      <p className="text-eco-200 max-w-md mx-auto mb-8 leading-relaxed">
        {t.rewardsDesc}
      </p>

      <div className="flex items-center gap-2 px-4 py-2 bg-eco-900/50 rounded-lg border border-eco-800 text-eco-400 text-sm">
        <Timer className="h-4 w-4" />
        <span>{t.launching} 😅</span>
      </div>
    </div>
  );
};

export default Rewards;
