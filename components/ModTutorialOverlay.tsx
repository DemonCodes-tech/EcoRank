import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface ModTutorialOverlayProps {
  onComplete: () => void;
  lang: Language;
}

const ModTutorialOverlay: React.FC<ModTutorialOverlayProps> = ({ onComplete, lang }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Moderation",
      content: "As a moderator, you review actions that the AI flagged due to low confidence scores.",
      icon: <Shield className="h-8 w-8 text-indigo-400" />,
      actionLabel: "Next"
    },
    {
      title: "Review Evidence",
      content: "Watch the video, read the AI's comment, and check the confidence score to make your decision.",
      icon: <CheckCircle className="h-8 w-8 text-blue-400" />,
      actionLabel: "Next"
    },
    {
      title: "Make a Decision",
      content: "You can Approve or Reject the action. If you're unsure, you can send it to another Mod or escalate to an Admin.",
      icon: <RefreshCw className="h-8 w-8 text-purple-400" />,
      actionLabel: "Got it!"
    }
  ];

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"></div>

      <div className={`w-full max-w-md mx-auto bg-[#0a0a0a]/95 border shadow-2xl relative overflow-hidden flex flex-col pointer-events-auto rounded-3xl animate-slide-up mb-20 md:mb-0 transition-colors duration-300 border-indigo-500/30`}>
        
        <div className={`border-b p-4 flex items-center justify-between relative z-10 transition-colors duration-300 bg-indigo-500/10 border-indigo-500/20`}>
            <span className={`text-xs font-bold uppercase tracking-wide text-indigo-400`}>
                Moderator Training
            </span>
            <div className="flex gap-1.5">
                {steps.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 w-6 rounded-full transition-colors ${
                            i === step ? 'bg-indigo-500' : 'bg-gray-700'
                        }`}
                    />
                ))}
            </div>
        </div>

        <div className="p-8 flex flex-col items-center text-center relative z-10">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-colors duration-300 bg-gray-800/50 border border-gray-700`}>
                {currentStep.icon}
            </div>
            
            <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 text-white`}>
                {currentStep.title}
            </h3>
            
            <p className={`text-lg leading-relaxed mb-8 transition-colors duration-300 text-gray-400`}>
                {currentStep.content}
            </p>

            <button 
                onClick={handleNext}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white`}
            >
                {currentStep.actionLabel}
                <ArrowRight className="h-5 w-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ModTutorialOverlay;
