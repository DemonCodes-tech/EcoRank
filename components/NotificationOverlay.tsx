
import React, { useEffect, useState } from 'react';
import { Bell, Radio, ArrowRight } from 'lucide-react';
import { translations } from '../services/translations';

interface NotificationOverlayProps {
  title: string;
  time: string;
  onDismiss: () => void;
  lang?: 'en' | 'ar';
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({ title, time, onDismiss, lang = 'en' }) => {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-sm animate-fade-in" onClick={onDismiss}></div>
      
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,255,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      <div className="relative z-10 w-full max-w-sm bg-black border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.5)] animate-slide-up overflow-hidden">
        {/* Animated Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 animate-[shimmer_2s_infinite]"></div>

        <div className="bg-cyan-900/20 p-6 flex flex-col items-center text-center relative z-10">
          
          {/* Icon Animation */}
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-30 animate-pulse rounded-full"></div>
             <div className="relative bg-black p-4 rounded-full border border-cyan-500/50">
                 <Radio className="h-10 w-10 text-cyan-400 animate-pulse" />
             </div>
             <div className="absolute -top-1 -right-1">
                 <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
             </div>
          </div>

          <div className="mb-6 space-y-1">
              <h2 className="text-xs font-mono text-cyan-500 uppercase tracking-[0.3em] font-bold animate-pulse">
                  {t.incomingTransmission}
              </h2>
              <h3 className="text-2xl font-bold text-white uppercase tracking-tight font-mono">
                  {t.protocolAlert}
              </h3>
          </div>

          <div className="w-full bg-cyan-950/50 border border-cyan-700/50 p-4 mb-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyan-400/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="text-cyan-100 text-lg font-mono font-bold uppercase tracking-wider mb-1">
                  {title}
              </div>
              <div className="text-cyan-600 text-[10px] font-mono uppercase tracking-[0.2em]">
                  T-MINUS: {time}
              </div>
          </div>

          <button
            onClick={onDismiss}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 group"
          >
             <span>{t.acknowledge}</span>
             <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </div>
    </div>
  );
};

export default NotificationOverlay;
