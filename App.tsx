import React, { useState, useEffect } from 'react';
import { User, AppView, EcoAction, Language } from './types';
import Navbar from './components/Navbar';
import ActionLog from './components/ActionLog';
import Leaderboard from './components/Leaderboard';
import Rewards from './components/Rewards';
import StreakOverlay from './components/StreakOverlay';
import TutorialOverlay from './components/TutorialOverlay';
import ThemeModal from './components/ThemeModal';
import { ArrowRight, Terminal, Code, AlertTriangle, Ghost, Globe } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { getStoredUsers, saveStoredUsers } from './services/storageService';
import { translations } from './services/translations';
import { getSavedTheme, applyTheme, Theme } from './services/themes';

const COLORS = ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7'];

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [users, setUsers] = useState<User[]>([]); 
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [showBetaPopup, setShowBetaPopup] = useState(true);
  const [lang, setLang] = useState<Language>('en'); // Language State
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(getSavedTheme());

  const [streakData, setStreakData] = useState<{ show: boolean; val: number; type: 'started' | 'continued' }>({ 
    show: false, val: 0, type: 'started' 
  });

  const t = translations[lang]; // Helper for current language

  useEffect(() => {
    const loadedUsers = getStoredUsers();
    setUsers(loadedUsers);
    
    // Apply initial theme
    applyTheme(currentTheme);
  }, []);

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    // applyTheme is called inside handleThemeChange via ThemeModal helper, but doing it here ensures state consistency
    applyTheme(theme);
  };

  const userActions = currentUser?.actions || [];
  const recentActions = [...userActions].reverse().slice(0, 5);
  
  const chartData = userActions.length > 0 
    ? userActions.map((a, i) => ({ name: `Log ${i+1}`, value: a.points }))
    : [{ name: 'No Data', value: 100 }];


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const existingUser = users.find(u => u.name.toLowerCase() === nameInput.toLowerCase());
    if (existingUser) {
      setCurrentUser(existingUser);
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: nameInput,
        totalPoints: 0,
        actions: [],
        currentStreak: 0,
        lastLogDate: '',
        hasCompletedTutorial: false
      };
      
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setCurrentUser(newUser);
      saveStoredUsers(updatedUsers);
    }
    setNameInput('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(AppView.HOME);
  };

  const handleTutorialComplete = () => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, hasCompletedTutorial: true };
    const updatedUsersList = users.map(u => u.id === currentUser.id ? updatedUser : u);
    
    setCurrentUser(updatedUser);
    setUsers(updatedUsersList);
    saveStoredUsers(updatedUsersList);
  };

  const handlePointsAwarded = (points: number, description: string, comment: string, category: string) => {
    if (!currentUser) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let newStreak = currentUser.currentStreak;
    let streakType: 'started' | 'continued' | null = null;
    let shouldShowAnimation = false;

    if (currentUser.lastLogDate !== todayStr) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (currentUser.lastLogDate === yesterdayStr) {
            newStreak += 1;
            streakType = 'continued';
            shouldShowAnimation = true;
        } else {
            newStreak = 1;
            streakType = 'started';
            shouldShowAnimation = true;
        }
    }

    const newAction: EcoAction = {
      id: Date.now().toString(),
      description,
      points,
      timestamp: Date.now(),
      aiComment: comment
    };

    const updatedUser: User = {
      ...currentUser,
      totalPoints: currentUser.totalPoints + points,
      actions: [...currentUser.actions, newAction],
      currentStreak: newStreak,
      lastLogDate: todayStr
    };

    const updatedUsersList = users.map(u => u.id === currentUser.id ? updatedUser : u);
    
    setCurrentUser(updatedUser);
    setUsers(updatedUsersList);
    saveStoredUsers(updatedUsersList);
    
    if (shouldShowAnimation && streakType) {
        setStreakData({ show: true, val: newStreak, type: streakType });
    }
  };

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Language Toggle Login */}
        <div className="absolute top-4 right-4 z-50">
            <button 
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1 bg-eco-900/40 border border-eco-500/30 text-eco-400 rounded-md hover:bg-eco-500/20 transition-all text-xs font-mono"
            >
                <Globe className="h-4 w-4" />
                {lang === 'en' ? 'العربية' : 'English'}
            </button>
        </div>

        <div className="bg-[#0a0a0a] border border-eco-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <div className="bg-eco-900/20 border-b border-eco-500/30 p-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>

            <div className="p-8">
                <div className="text-center mb-10">
                    <div className="inline-block p-4 border border-eco-500/20 rounded-full mb-4 bg-eco-500/5">
                        <Terminal className="h-12 w-12 text-eco-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white font-mono mb-1 tracking-tight">{t.loginTitle} <span className="text-eco-500 text-sm align-top">BETA</span></h1>
                    <p className="text-eco-500/60 text-xs font-mono uppercase tracking-widest">{t.loginSubtitle}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-1">
                        <div className="relative group">
                            <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="w-full px-4 py-3 bg-black border border-eco-800 text-eco-100 font-mono placeholder-eco-800 focus:outline-none focus:border-eco-500 focus:ring-1 focus:ring-eco-500 transition-all text-center"
                                placeholder={t.enterUsername}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-eco-600 hover:bg-eco-500 text-black font-bold font-mono uppercase tracking-wider transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    >
                        {t.startSession}
                    </button>
                </form>

                <div className="mt-8 pt-4 border-t border-eco-900/50 text-center">
                    <p className="text-[9px] text-eco-600 font-mono">
                         {t.systemStatus}<br/>
                         [WADEEA, SHARIF, ADAM, MOHAMMED - 10B1]
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!currentUser) return null;

    return (
      <div className="space-y-6 animate-slide-up pb-20 md:pb-0 font-mono">
        {/* Technical Header */}
        <div className="border border-eco-500/30 bg-black/40 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-20">
             <Code className="h-32 w-32 text-eco-500" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="text-[10px] text-eco-500 uppercase tracking-widest mb-1">{t.welcome}</div>
                    <h2 className="text-3xl font-bold text-white uppercase">{currentUser.name}</h2>
                </div>
                <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-eco-500/10 border border-eco-500/20 rounded text-[9px] text-eco-400 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-eco-500 rounded-full animate-pulse"></span>
                        {t.live}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-eco-800 bg-black/50 p-3 hover:border-eco-500/50 transition-colors">
                <div className="text-[9px] text-eco-500 uppercase tracking-wider mb-1">{t.score}</div>
                <div className="text-2xl font-bold text-white">{currentUser.totalPoints}</div>
              </div>
              <div className="border border-eco-800 bg-black/50 p-3 hover:border-eco-500/50 transition-colors">
                <div className="text-[9px] text-eco-500 uppercase tracking-wider mb-1">{t.logs}</div>
                <div className="text-2xl font-bold text-white">{currentUser.actions.length}</div>
              </div>
              <div className="border border-eco-800 bg-black/50 p-3 hover:border-eco-500/50 transition-colors">
                <div className="text-[9px] text-orange-400 uppercase tracking-wider mb-1">{t.streak}</div>
                <div className="text-2xl font-bold text-white flex gap-1">
                    {currentUser.currentStreak} <span className="text-xs self-end mb-1 text-eco-600">{t.days}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Logs */}
          <div className="border border-eco-500/20 bg-black/40 p-4">
            <h3 className="text-xs font-bold text-eco-400 uppercase tracking-widest mb-4 border-b border-eco-800 pb-2">
                >> {t.recentActivity}
            </h3>
            {recentActions.length === 0 ? (
              <div className="text-center py-8 text-eco-700 text-xs">
                [{t.noData}]
              </div>
            ) : (
              <div className="space-y-2">
                {recentActions.map((action) => (
                  <div key={action.id} className="flex justify-between items-start text-xs p-2 hover:bg-eco-500/5 border-l-2 border-transparent hover:border-eco-500 transition-all">
                    <div className="flex-1">
                      <span className="text-eco-300">[{new Date(action.timestamp).toLocaleTimeString()}]</span>
                      <span className="text-gray-400 mx-2">{action.description}</span>
                    </div>
                    <span className="font-bold text-eco-400">+{action.points}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data Viz */}
          <div className="border border-eco-500/20 bg-black/40 p-4 flex flex-col">
             <h3 className="text-xs font-bold text-eco-400 uppercase tracking-widest mb-4 border-b border-eco-800 pb-2">
                >> {t.impactAnalysis}
             </h3>
             <div className="h-[150px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#000', borderColor: '#064e3b', fontSize: '10px', fontFamily: 'monospace' }}
                        itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <button 
            onClick={() => setCurrentView(AppView.LEADERBOARD)}
            className="w-full bg-eco-900/20 border border-eco-500/30 text-eco-400 py-3 text-xs font-bold uppercase tracking-widest hover:bg-eco-500/10 transition-colors flex items-center justify-center gap-2"
        >
            {t.viewRankings} 
            {lang === 'en' ? <ArrowRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4 rotate-180" />}
        </button>

        <div className="mt-6 flex justify-center">
            <a 
                href="mailto:demon?subject=Feedback&body=Thx%20for%20the%20help%20;)"
                className="group flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
            >
                <div className="p-1.5 rounded-md bg-eco-900/30 border border-eco-800 group-hover:border-eco-500/50">
                    <Ghost className="h-3 w-3 text-eco-500" />
                </div>
                <span className="text-[10px] font-mono text-eco-600 group-hover:text-eco-400 uppercase tracking-widest">
                    {t.sendFeedbackToDemon}
                </span>
            </a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050a0e] text-gray-100 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Beta Popup Warning */}
      {showBetaPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="max-w-sm w-full bg-[#0a0a0a] border border-yellow-500/50 shadow-[0_0_40px_rgba(234,179,8,0.15)] animate-slide-up relative overflow-hidden">
                <div className="relative z-10 p-1">
                    <div className="bg-yellow-900/20 border-b border-yellow-500/30 p-3 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest font-bold">>> {t.betaTitle}</span>
                        <div className="flex items-center gap-2">
                             <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-6 text-center font-mono">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                            </div>
                        </div>
                        
                        <div className="mb-6 space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
                            <p className="uppercase font-bold text-yellow-500">{t.betaDesc}</p>
                            
                            <div className="bg-yellow-500/10 border-l-2 border-yellow-500 p-3 my-4 mx-1 text-left">
                                <p className="text-white font-bold tracking-wider text-base">{t.eligible}</p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowBetaPopup(false)}
                            className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase tracking-wider transition-all"
                        >
                            {t.understand}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {!currentUser ? (
        renderLogin()
      ) : (
        <div className="flex flex-col min-h-screen">
            
            {/* Tutorial Overlay for new users */}
            {currentUser.hasCompletedTutorial === false && (
                <TutorialOverlay onComplete={handleTutorialComplete} onChangeView={setCurrentView} lang={lang} />
            )}

            {/* Desktop Navigation placement */}
            {currentUser && (
               <Navbar 
                  currentView={currentView} 
                  onChangeView={setCurrentView} 
                  currentUser={currentUser.name} 
                  onLogout={handleLogout} 
                  lang={lang}
                  toggleLanguage={toggleLanguage}
                  onOpenThemes={() => setIsThemeModalOpen(true)}
               />
            )}

          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 pt-20 md:pt-4 scrollbar-hide pb-24 md:pb-4">
               <div className="max-w-7xl mx-auto w-full">
                {currentView === AppView.HOME && renderDashboard()}
                {currentView === AppView.LEADERBOARD && <Leaderboard users={users} currentUserId={currentUser.id} lang={lang} />}
                {currentView === AppView.LOG_ACTION && <ActionLog onPointsAwarded={handlePointsAwarded} lang={lang} />}
                {currentView === AppView.REWARDS && <Rewards lang={lang} />}
               </div>
            </main>
          </div>
        </div>
      )}
      
      {/* Streak Overlay */}
      {streakData.show && (
          <StreakOverlay 
            streak={streakData.val} 
            type={streakData.type} 
            onComplete={() => setStreakData(prev => ({ ...prev, show: false }))} 
          />
      )}
      
      {/* Theme Modal */}
      <ThemeModal 
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentThemeId={currentTheme.id}
        onThemeSelect={handleThemeChange}
        lang={lang}
      />
    </div>
  );
}

export default App;
