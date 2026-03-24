
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppView, Language, User } from '../types';
import { LayoutDashboard, Trophy, Leaf, Gift, LogOut, Terminal, MessageSquare, X, Send, Globe, Palette, Info, Menu, Volume2, VolumeX, Check, Zap, ZapOff, Lightbulb, PieChart as PieChartIcon, HelpCircle, User as UserIcon, Shield } from 'lucide-react';
import { translations } from '../services/translations';
import { toggleMute, getMuteState } from '../services/soundService';
import AnimatedProfilePicture from './AnimatedProfilePicture';

interface NavbarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  currentUser: User | null;
  onLogout: () => void;
  lang: Language;
  toggleLanguage: () => void;
  onOpenThemes: () => void;
  isLowPowerMode: boolean;
  toggleLowPowerMode: () => void;
  onPointsAwarded?: (points: number, description: string, comment: string, category: string) => void;
  currentThemeId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView, currentUser, onLogout, lang, toggleLanguage, onOpenThemes, isLowPowerMode, toggleLowPowerMode, onPointsAwarded, currentThemeId }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [isMuted, setIsMuted] = useState(getMuteState());

  const handleToggleMute = () => {
    const newState = toggleMute();
    setIsMuted(newState);
  };
  
  const t = translations[lang];

  const navItems = [
    { id: AppView.HOME, label: t.navDashboard, icon: LayoutDashboard },
    { id: AppView.PROFILE, label: t.navProfile, icon: UserIcon },
    { id: AppView.LOG_ACTION, label: t.navScan, icon: Leaf },
    { id: AppView.PROTOCOLS, label: t.navProtocols, icon: Terminal },
    { id: AppView.LEADERBOARD, label: t.navRank, icon: Trophy },
    { id: AppView.REWARDS, label: t.navStore, icon: Gift },
    { id: AppView.ANALYTICS, label: t.navAnalytics, icon: PieChartIcon },
    { id: AppView.ABOUT, label: t.navAbout, icon: Info },
    { id: AppView.FAQ, label: t.navFAQ, icon: HelpCircle },
  ];

  if (currentUser?.role === 'moderator' || currentUser?.role === 'admin') {
    navItems.push({ id: AppView.MODERATION, label: 'Moderation', icon: Shield });
  }

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("App Feedback");
    const body = encodeURIComponent(feedbackText);
    window.location.href = `mailto:wadeesshaat@gmail.com?subject=${subject}&body=${body}`;
    setShowFeedbackSuccess(true);
    setFeedbackText('');
    setTimeout(() => handleCloseFeedback(), 2500);
  };

  const handleCloseFeedback = () => {
      setIsFeedbackOpen(false);
      setTimeout(() => setShowFeedbackSuccess(false), 300);
  };

  return (
    <>
      {/* Top Navbar (Fixed Header) */}
      <nav 
        className="fixed top-0 left-0 right-0 w-full bg-eco-950/90 backdrop-blur-lg border-b border-eco-500/30 z-[50] h-16"
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* Logo Area */}
            <button 
              className="flex flex-shrink-0 items-center gap-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500 rounded-lg p-1" 
              onClick={() => onChangeView(AppView.HOME)}
              aria-label="Go to Home"
            >
              <div className="bg-eco-500/10 p-2 rounded-xl" aria-hidden="true">
                <Leaf className="h-5 w-5 text-eco-500" />
              </div>
              <div className="flex flex-col">
                  <span className="text-lg font-bold text-white leading-none tracking-tight flex items-center gap-2">
                    EcoRank
                  </span>
              </div>
            </button>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
                </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block" role="navigation" aria-label="Desktop Navigation">
              <div className="ml-10 flex items-baseline space-x-1" role="menubar">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    role="menuitem"
                    aria-current={currentView === item.id ? 'page' : undefined}
                    onClick={() => onChangeView(item.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500 ${
                      currentView === item.id
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {currentView === item.id && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 bg-white/10 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-2" role="toolbar" aria-label="Quick Actions">
               <div className="flex items-center gap-3 border-r border-eco-800 pr-4 mr-1" aria-label="User Info">
                  <div className="text-right">
                    <div className={`text-[9px] ${currentUser?.name?.toLowerCase() === 'eshel' ? 'text-pink-500' : 'text-eco-500'} uppercase tracking-widest font-mono`} aria-hidden="true">User</div>
                    <div className={`text-xs font-bold ${currentUser?.name?.toLowerCase() === 'eshel' ? 'text-pink-400' : 'text-white'} font-mono`}>{currentUser?.name}</div>
                  </div>
                  <AnimatedProfilePicture
                    profilePicture={currentUser?.profilePicture}
                    borderType={currentUser?.borderType}
                    size="sm"
                    themeId={currentThemeId}
                  />
               </div>

               <div className="flex items-center gap-2">
                  <button onClick={handleToggleMute} className="p-2 text-eco-400 hover:text-white hover:bg-eco-500/10 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500" aria-label={isMuted ? "Unmute sound" : "Mute sound"} title={isMuted ? "Unmute" : "Mute"}>
                    {isMuted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
                  </button>
                  <button onClick={onOpenThemes} className="p-2 text-eco-400 hover:text-white hover:bg-eco-500/10 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500" aria-label="Open themes" title="Themes">
                    <Palette className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button onClick={toggleLowPowerMode} className="p-2 text-eco-400 hover:text-white hover:bg-eco-500/10 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500" aria-label={isLowPowerMode ? "Disable Low Power Mode" : "Enable Low Power Mode"} title={isLowPowerMode ? "High Quality" : "Low Power Mode"}>
                    {isLowPowerMode ? <ZapOff className="h-4 w-4" aria-hidden="true" /> : <Zap className="h-4 w-4" aria-hidden="true" />}
                  </button>
                  <button onClick={toggleLanguage} className="p-2 text-eco-400 hover:text-white hover:bg-eco-500/10 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500" aria-label="Toggle language" title="Language">
                    <Globe className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button onClick={() => setIsFeedbackOpen(true)} className="p-2 text-eco-400 hover:text-white hover:bg-eco-500/10 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500" aria-label="Open feedback form" title="Feedback">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button onClick={onLogout} className="ml-2 px-3 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded text-xs font-mono uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500" aria-label="Log out">
                    {t.exit}
                  </button>
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div 
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation Menu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="fixed top-16 left-0 right-0 bg-eco-950/95 backdrop-blur-xl border-b border-eco-500/30 z-[49] md:hidden overflow-hidden shadow-2xl"
            >
                <div className="p-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
                    {/* User Info Mobile */}
                    <div className="flex items-center justify-between border-b border-eco-800 pb-4">
                        <div className="flex items-center gap-3">
                            <AnimatedProfilePicture
                                profilePicture={currentUser?.profilePicture}
                                borderType={currentUser?.borderType}
                                size="md"
                                themeId={currentThemeId}
                            />
                            <div>
                                <div className={`text-[10px] ${currentUser?.name?.toLowerCase() === 'eshel' ? 'text-pink-500' : 'text-eco-500'} uppercase tracking-widest font-mono`} aria-hidden="true">User</div>
                                <div className={`text-sm font-bold ${currentUser?.name?.toLowerCase() === 'eshel' ? 'text-pink-400' : 'text-white'} font-mono`}>{currentUser?.name}</div>
                            </div>
                        </div>
                        <button onClick={onLogout} className="px-3 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded text-xs font-mono uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500" aria-label="Log out">
                            {t.exit}
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="grid grid-cols-2 gap-2" role="menu" aria-label="Mobile Navigation Links">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                role="menuitem"
                                aria-current={currentView === item.id ? 'page' : undefined}
                                onClick={() => {
                                    onChangeView(item.id);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`relative flex items-center gap-3 p-3 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500 ${
                                    currentView === item.id 
                                    ? 'text-eco-400' 
                                    : 'hover:bg-eco-500/10 text-gray-400'
                                }`}
                            >
                                {currentView === item.id && (
                                    <motion.div
                                        layoutId="mobile-navbar-active"
                                        className="absolute inset-0 bg-eco-500/20 border border-eco-500/30 rounded-lg"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        aria-hidden="true"
                                    />
                                )}
                                <item.icon className="h-5 w-5 relative z-10" aria-hidden="true" />
                                <span className="font-mono text-sm font-bold relative z-10">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-eco-800" role="toolbar" aria-label="Mobile Quick Actions">
                        <div className="flex gap-2">
                            <button onClick={handleToggleMute} className="p-2 text-eco-400 hover:bg-eco-500/10 rounded transition-colors border border-eco-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500" aria-label={isMuted ? "Unmute sound" : "Mute sound"}>
                                {isMuted ? <VolumeX className="h-5 w-5" aria-hidden="true" /> : <Volume2 className="h-5 w-5" aria-hidden="true" />}
                            </button>
                            <button onClick={onOpenThemes} className="p-2 text-eco-400 hover:bg-eco-500/10 rounded transition-colors border border-eco-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500" aria-label="Open themes">
                                <Palette className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button onClick={toggleLowPowerMode} className="p-2 text-eco-400 hover:bg-eco-500/10 rounded transition-colors border border-eco-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500" aria-label={isLowPowerMode ? "Disable Low Power Mode" : "Enable Low Power Mode"}>
                                {isLowPowerMode ? <ZapOff className="h-5 w-5" aria-hidden="true" /> : <Zap className="h-5 w-5" aria-hidden="true" />}
                            </button>
                            <button onClick={toggleLanguage} className="p-2 text-eco-400 hover:bg-eco-500/10 rounded transition-colors border border-eco-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500" aria-label="Toggle language">
                                <Globe className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                        <button onClick={() => { setIsFeedbackOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 px-4 py-2 bg-eco-500/10 hover:bg-eco-500/20 text-eco-400 rounded transition-colors border border-eco-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500" aria-label="Open feedback form">
                            <MessageSquare className="h-4 w-4" aria-hidden="true" />
                            <span className="text-xs font-mono uppercase">{t.feedbackModalTitle}</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 shadow-2xl animate-slide-up relative overflow-hidden rounded-3xl flex flex-col">
                
                {showFeedbackSuccess ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center animate-fade-in min-h-[300px]">
                         {/* Success state content */}
                         <div className="w-16 h-16 bg-eco-500/20 rounded-full flex items-center justify-center mb-4">
                             <Check className="h-8 w-8 text-eco-500" />
                         </div>
                         <h3 className="text-2xl font-bold text-white mb-2">
                             {lang === 'ar' ? 'شكراً للدعم' : 'Thank you for the support'}
                        </h3>
                        <p className="text-gray-400 text-sm">Your feedback has been received.</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="bg-white/5 border-b border-white/5 p-6 flex items-center justify-between flex-shrink-0 relative z-10 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-2xl">
                                    <MessageSquare className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-white block">{t.feedbackModalTitle}</span>
                                    <span className="text-xs text-gray-500">We value your input</span>
                                </div>
                            </div>
                            <button onClick={handleCloseFeedback} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-gray-400 mb-6 leading-relaxed">{t.feedbackDesc}</p>
                            <form onSubmit={handleSendFeedback} className="space-y-4">
                                <textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl text-white text-sm p-4 focus:outline-none focus:border-eco-500 focus:ring-1 focus:ring-eco-500 resize-none transition-all placeholder:text-gray-500"
                                    placeholder={t.enterMessage}
                                    required
                                />
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={handleCloseFeedback} className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                        {t.cancel}
                                    </button>
                                    <button type="submit" className="px-5 py-2.5 bg-eco-600 hover:bg-eco-500 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-eco-500/20">
                                        <Send className="h-4 w-4" /> {t.transmit}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}
    </>
  );
};
