import React, { useState, useEffect } from 'react';
import { Terminal, Camera, Trophy, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { AppView, Language } from '../types';
import { translations } from '../services/translations';

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
      title: t.tutBetaTitle,
      content: t.tutBetaDesc,
      icon: <AlertTriangle className="h-8 w-8 text-yellow-400" />,
      actionLabel: t.tutBetaBtn
    },
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
      view: AppView.LEADERBOARD,
      title: t.tut3Title,
      content: t.tut3Desc,
      icon: <Trophy className="h-8 w-8 text-yellow-400" />,
      actionLabel: t.tut3Btn
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
  const isWarning = step === 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end md:justify-center p-4 pointer-events-none" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Semi-transparent backdrop to focus attention but show app */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-auto"></div>

      <div className={`w-full max-w-md mx-auto bg-[#0a0a0a]/95 border shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden flex flex-col pointer-events-auto rounded-xl animate-slide-up mb-20 md:mb-0 transition-colors duration-300 ${isWarning ? 'border-yellow-500/50 shadow-yellow-500/20' : 'border-eco-500/50'}`}>
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        {/* Header */}
        <div className={`border-b p-3 flex items-center justify-between relative z-10 transition-colors duration-300 ${isWarning ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-eco-900/40 border-eco-500/30'}`}>
            <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isWarning ? 'text-yellow-500' : 'text-eco-400'}`}>
                >> {isWarning ? 'SYSTEM WARNING' : 'ORIENTATION'}
            </span>
            <div className="flex gap-1">
                {steps.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 w-6 rounded-sm transition-colors ${
                            i === step 
                                ? (isWarning ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-eco-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]') 
                                : i < step 
                                    ? (isWarning ? 'bg-yellow-800' : 'bg-eco-800')
                                    : (isWarning ? 'bg-yellow-900/50' : 'bg-eco-900/50')
                        }`}
                    />
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-row items-start gap-4 relative z-10">
            <div className={`flex-shrink-0 p-3 rounded-lg border mt-1 transition-colors duration-300 ${isWarning ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-eco-500/10 border-eco-500/20'}`}>
                {currentStep.icon}
            </div>
            
            <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2 font-mono uppercase tracking-tight">
                    {currentStep.title}
                </h2>
                
                <p className={`text-xs md:text-sm leading-relaxed mb-6 font-mono ${isWarning ? 'text-yellow-100/90' : 'text-eco-100/80'}`}>
                    {currentStep.content}
                </p>

                <button
                    onClick={handleNext}
                    className={`w-full py-2 text-black font-bold uppercase tracking-wider transition-all font-mono text-sm flex items-center justify-center gap-2 group rounded ${
                        isWarning 
                            ? 'bg-yellow-600 hover:bg-yellow-500' 
                            : 'bg-eco-600 hover:bg-eco-500'
                    }`}
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