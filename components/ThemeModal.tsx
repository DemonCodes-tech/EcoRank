import React from 'react';
import { Theme, themes, applyTheme } from '../services/themes';
import { X, Palette, Check, Zap } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../services/translations';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onThemeSelect: (theme: Theme) => void;
  lang: Language;
}

const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose, currentThemeId, onThemeSelect, lang }) => {
  const t = translations[lang];

  if (!isOpen) return null;

  const handleSelect = (theme: Theme) => {
    applyTheme(theme);
    onThemeSelect(theme);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl h-auto max-h-[90vh] bg-[#0a0a0a] border border-eco-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-slide-up relative overflow-hidden rounded-xl flex flex-col">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        {/* Header */}
        <div className="bg-eco-900/30 border-b border-eco-500/30 p-5 flex items-center justify-between flex-shrink-0 relative z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-eco-500/10 rounded-lg border border-eco-500/30">
                 <Palette className="h-5 w-5 text-eco-400" />
            </div>
            <div>
                <span className="text-sm font-mono text-white uppercase tracking-widest font-bold block">{t.themeSelector}</span>
                <span className="text-[10px] text-eco-500 font-mono tracking-wider">12 PRESETS LOADED</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-eco-600 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {themes.map((theme) => {
                    const isActive = currentThemeId === theme.id;
                    return (
                        <button
                            key={theme.id}
                            onClick={() => handleSelect(theme)}
                            className={`group relative h-40 rounded-xl border-2 transition-all duration-300 text-left flex flex-col justify-end overflow-hidden hover:scale-[1.03] ${
                                isActive 
                                ? 'border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                                : 'border-white/10 hover:border-white/40'
                            }`}
                            style={{
                                backgroundColor: theme.colors[950]
                            }}
                        >
                            {/* Decorative Glow */}
                            <div 
                                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-40 transition-opacity group-hover:opacity-60"
                                style={{ backgroundColor: theme.colors[500] }}
                            ></div>
                            
                            {/* Stripe Pattern */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-20">
                                <div className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)]"></div>
                            </div>

                            {isActive && (
                                <div className="absolute top-3 right-3 p-1 bg-white text-black rounded-full shadow-lg z-20">
                                    <Check className="h-4 w-4 stroke-[3]" />
                                </div>
                            )}
                            
                            {/* Content */}
                            <div className="relative z-10 p-4 w-full bg-gradient-to-t from-black/90 to-transparent">
                                <div className="flex items-center gap-2 mb-1">
                                    <div 
                                        className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                                        style={{ backgroundColor: theme.colors[400], boxShadow: `0 0 10px ${theme.colors[500]}` }}
                                    ></div>
                                    <span 
                                        className="text-xs font-mono font-bold uppercase tracking-widest text-white group-hover:text-white/90"
                                        style={{ textShadow: `0 0 10px ${theme.colors[900]}` }}
                                    >
                                        {theme.name}
                                    </span>
                                </div>
                                <div className="flex gap-1 h-1.5 w-full mt-2 rounded-full overflow-hidden opacity-80">
                                    <div className="flex-1" style={{ backgroundColor: theme.colors[400] }}></div>
                                    <div className="flex-1" style={{ backgroundColor: theme.colors[500] }}></div>
                                    <div className="flex-1" style={{ backgroundColor: theme.colors[600] }}></div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-eco-900/10 border-t border-eco-800 flex items-center justify-between text-[10px] text-eco-600 font-mono uppercase">
            <div className="flex items-center gap-2">
                 <Zap className="h-3 w-3" />
                 <span>UI_MATRIX // V2.4</span>
            </div>
            <span>SELECT PRESET TO INITIALIZE</span>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;