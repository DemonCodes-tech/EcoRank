
import React, { useState, useEffect } from 'react';
import { Terminal, Camera, Trophy, CheckCircle, ArrowRight, AlertTriangle, Flame, Zap } from 'lucide-react';
import { AppView, Language } from './types';
import { translations } from './translations';

interface TutorialOverlayProps {
  onComplete: () => void;
  onChangeView: (view: AppView) => void;
  lang: Language;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onChangeView, lang }) => {
  const [step, setStep] = useState(0);
  const t = translations[lang];

  const steps = [
    {
      view: AppView.HOME,
      title: t.tut1Title,
      content: t.tut1Desc,
      icon: <Terminal className="h-8 w-8 text-eco-400" />,
      actionLabel: t.tut1Btn
    },
    {
      view: AppView.LOG_ACTION,
      title: t.tut2Title,
      content: t.tut2Desc,
      icon: <Camera className="h-8 w-8 text-blue-400" />,
      actionLabel: t.tut2Btn
    },
    {
      view: AppView.HOME,
      title: t.tutOptTitle,
      content: t.tutOptDesc,
      icon: <Zap className="h-8 w-8 text-yellow-400" />,
      actionLabel: t.tutOptBtn
    },
    {
      view: AppView.PROTOCOLS,
      title: t.tutStreakTitle,
      content: t.tutStreakDesc,
      icon: <Flame className="h-8 w-8 text-orange-500" />,
      actionLabel: t.tutStreakBtn
    },
    {
      view: AppView.LEADERBOARD,
      title: t.tut3Title,
      content: t.tut3Desc,
      icon: <Trophy className="h-8 w-8 text-yellow-400" />,
      actionLabel: t.tut3Btn
    },
    {
      view: AppView.ABOUT,
      title: t.tutAboutTitle,
      content: t.tutAboutDesc,
      icon: <AlertTriangle className="h-8 w-8 text-purple-400" />,
      actionLabel: t.tutAboutBtn
    },
    {
      view: AppView.HOME,
      title: t.tut4Title,
      content: t.tut4Desc,
      icon: <CheckCircle className="h-8 w-8 text-eco-500" />,
      actionLabel: t.tut4Btn
    }
  ];

  // Auto-navigate when step changes
  useEffect(() => {
    onChangeView(steps[step].view);
  }, [step, onChangeView]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end md:justify-center p-4 pointer-events-none" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Semi-transparent backdrop to focus attention but show app */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-auto"></div>

      <div className={`w-full max-w-md mx-auto bg-[#0a0a0a]/95 border shadow-2xl relative overflow-hidden flex flex-col pointer-events-auto rounded-3xl animate-slide-up mb-20 md:mb-0 transition-colors duration-300 border-white/10`}>
        
        {/* Header */}
        <div className={`border-b p-4 flex items-center justify-between relative z-10 transition-colors duration-300 bg-white/5 border-white/5`}>
            <span className={`text-xs font-bold uppercase tracking-wide text-gray-400`}>
                Orientation
            </span>
            <div className="flex gap-1.5">
                {steps.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 w-6 rounded-full transition-colors ${
                            i === step 
                                ? 'bg-eco-500' 
                                : i < step 
                                    ? 'bg-eco-900'
                                    : 'bg-white/10'
                        }`}
                    />
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-row items-start gap-5 relative z-10">
            <div className={`flex-shrink-0 p-3 rounded-2xl border mt-1 transition-colors duration-300 bg-white/5 border-white/10`}>
                {currentStep.icon}
            </div>
            
            <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
                    {currentStep.title}
                </h2>
                
                <p className={`text-sm leading-relaxed mb-6 text-gray-400`}>
                    {currentStep.content}
                </p>

                <button
                    onClick={handleNext}
                    className={`w-full py-3 text-white font-bold transition-all text-sm flex items-center justify-center gap-2 group rounded-xl bg-eco-600 hover:bg-eco-500`}
                >
                    <span>{currentStep.actionLabel}</span>
                    {lang === 'en' 
                        ? <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        : <ArrowRight className="h-4 w-4 group-hover:-translate-x-1 transition-transform rotate-180" />
                    }
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
