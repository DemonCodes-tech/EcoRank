import React, { useState } from 'react';
import { AppView, Language } from '../types';
import { LayoutDashboard, Trophy, Leaf, Gift, LogOut, Terminal, MessageSquare, X, Send, Globe, Palette } from 'lucide-react';
import { translations } from '../services/translations';

interface NavbarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  currentUser: string | null;
  onLogout: () => void;
  lang: Language;
  toggleLanguage: () => void;
  onOpenThemes: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView, currentUser, onLogout, lang, toggleLanguage, onOpenThemes }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  const t = translations[lang];

  const navItems = [
    { id: AppView.HOME, label: t.navDashboard, icon: LayoutDashboard },
    { id: AppView.LOG_ACTION, label: t.navScan, icon: Leaf },
    { id: AppView.LEADERBOARD, label: t.navRank, icon: Trophy },
    { id: AppView.REWARDS, label: t.navStore, icon: Gift },
  ];

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("App Feedback");
    const body = encodeURIComponent(feedbackText);
    window.location.href = `mailto:wadeesshaat@gmail.com?subject=${subject}&body=${body}`;
    setIsFeedbackOpen(false);
    setFeedbackText('');
  };

  return (
    <>
      {/* MOBILE TOP HEADER (Fixed) */}
      <header className="md:hidden fixed top-0 w-full bg-eco-950/90 backdrop-blur-md p-4 border-b border-eco-800 flex justify-between items-center z-40 h-16">
         <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-eco-500" />
            <span className="font-mono font-bold text-white tracking-tight">ECO_RANK</span>
         </div>
         <div className="flex items-center gap-3">
             <button 
                onClick={onOpenThemes}
                className="text-eco-400 hover:text-white transition-colors"
             >
                <Palette className="h-5 w-5" />
             </button>
             <button 
                onClick={toggleLanguage}
                className="text-eco-400 hover:text-white transition-colors"
             >
                <Globe className="h-5 w-5" />
             </button>
             <button 
                onClick={() => setIsFeedbackOpen(true)}
                className="text-eco-400 hover:text-white transition-colors"
             >
                <MessageSquare className="h-5 w-5" />
             </button>
             <button onClick={onLogout} className="text-eco-600 hover:text-red-400">
                <div className="text-[10px] border border-current px-2 py-1 font-mono">{t.exit}</div>
             </button>
         </div>
      </header>

      {/* DESKTOP NAV / MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 w-full bg-[#020617]/95 backdrop-blur-md border-t border-eco-500/30 md:relative md:border-t-0 md:bg-transparent z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo (Desktop Only) */}
            <div className="hidden md:flex flex-shrink-0 items-center gap-3">
              <div className="bg-eco-500/10 border border-eco-500 p-2 rounded-none">
                <Terminal className="h-6 w-6 text-eco-400" />
              </div>
              <div>
                  <span className="text-xl font-bold text-white block leading-none font-mono tracking-tighter">
                    ECO_RANK <span className="text-xs text-eco-500 bg-eco-500/10 px-1 border border-eco-500/20">BETA</span>
                  </span>
                  <span className="text-[10px] text-eco-400/60 uppercase tracking-widest block leading-none mt-1 font-mono">
                    v0.9.2
                  </span>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChangeView(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono tracking-wider transition-all duration-200 border border-transparent ${
                      currentView === item.id
                        ? 'bg-eco-500/10 text-eco-400 border-eco-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'text-eco-400/60 hover:text-eco-300 hover:bg-eco-500/5'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* User Profile & Actions (Desktop) */}
            <div className={`hidden md:flex items-center gap-4 ${lang === 'ar' ? 'border-r pr-4' : 'border-l pl-4'} border-eco-800`}>
              <div className={`${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                <div className="text-[10px] text-eco-500 uppercase tracking-widest font-mono">Student</div>
                <div className="text-sm font-bold text-white font-mono">{currentUser}</div>
              </div>
              
              <button
                onClick={onOpenThemes}
                className="p-2 hover:bg-eco-500/10 text-eco-600 hover:text-eco-400 transition-colors border border-transparent hover:border-eco-500/30 rounded"
                title="Change Theme"
              >
                <Palette className="h-5 w-5" />
              </button>

              <button
                onClick={toggleLanguage}
                className="p-2 hover:bg-eco-500/10 text-eco-600 hover:text-eco-400 transition-colors border border-transparent hover:border-eco-500/30 rounded"
                title="Switch Language"
              >
                <Globe className="h-5 w-5" />
              </button>

              {/* Feedback Button - Explicit Label */}
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-eco-500/10 text-eco-600 hover:text-eco-400 transition-colors border border-transparent hover:border-eco-500/30 rounded"
                title="Send Feedback"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs font-mono font-bold uppercase">{t.feedback}</span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 hover:bg-red-900/20 text-eco-600 hover:text-red-400 transition-colors border border-transparent hover:border-red-900/50 rounded"
                title="Terminate Session"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Bottom Nav Items */}
            <div className="flex md:hidden w-full justify-around items-center">
               {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChangeView(item.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                      currentView === item.id
                        ? 'text-eco-400'
                        : 'text-eco-700 hover:text-eco-300'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${currentView === item.id ? 'fill-current' : ''}`} />
                    <span className="text-[9px] mt-1 font-mono font-bold">{item.label}</span>
                  </button>
                ))}
            </div>

          </div>
        </div>
      </nav>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-eco-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] animate-slide-up relative overflow-hidden rounded-lg">
                
                {/* Header */}
                <div className="bg-eco-900/20 border-b border-eco-500/30 p-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-eco-500 uppercase tracking-widest font-bold">>> {t.feedbackModalTitle}</span>
                    <button 
                        onClick={() => setIsFeedbackOpen(false)}
                        className="text-eco-600 hover:text-red-400 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-xs text-eco-400/80 mb-4 font-mono leading-relaxed">
                        {t.feedbackDesc}
                    </p>
                    
                    <form onSubmit={handleSendFeedback} className="space-y-4">
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            className="w-full h-32 bg-black border border-eco-800 text-eco-100 font-mono text-sm p-3 focus:outline-none focus:border-eco-500 focus:ring-1 focus:ring-eco-500 resize-none"
                            placeholder={t.enterMessage}
                            required
                        />
                        
                        <div className="flex justify-end gap-2">
                             <button
                                type="button"
                                onClick={() => setIsFeedbackOpen(false)}
                                className="px-4 py-2 text-xs font-mono text-eco-600 hover:text-eco-400 uppercase tracking-wider"
                            >
                                {t.cancel}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-eco-600 hover:bg-eco-500 text-black text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2"
                            >
                                <Send className="h-3 w-3" /> {t.transmit}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
