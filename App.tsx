import React, { useState, useEffect } from 'react';
import { User, AppView, EcoAction } from './types';
import Navbar from './components/Navbar';
import ActionLog from './components/ActionLog';
import Leaderboard from './components/Leaderboard';
import Rewards from './components/Rewards';
import StreakOverlay from './components/StreakOverlay';
import { Leaf, TrendingUp, Calendar, ArrowRight, Flame, School } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { getStoredUsers, saveStoredUsers } from './services/storageService';

const COLORS = ['#22c55e', '#16a34a', '#15803d', '#4ade80', '#86efac'];

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [users, setUsers] = useState<User[]>([]); // Initialize empty, load in useEffect
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  
  // Streak Animation State
  const [streakData, setStreakData] = useState<{ show: boolean; val: number; type: 'started' | 'continued' }>({ 
    show: false, val: 0, type: 'started' 
  });

  // Load data from "Database" on mount
  useEffect(() => {
    const loadedUsers = getStoredUsers();
    setUsers(loadedUsers);
  }, []);

  // Stats calculation for dashboard
  const userActions = currentUser?.actions || [];
  const recentActions = [...userActions].reverse().slice(0, 5);
  
  // Aggregate categories for chart
  const categoryStats = userActions.reduce((acc, action) => {
    return acc;
  }, {} as Record<string, number>);

  const chartData = userActions.length > 0 
    ? userActions.map((a, i) => ({ name: `Action ${i+1}`, value: a.points }))
    : [{ name: 'Start Logging', value: 100 }];


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
        lastLogDate: ''
      };
      
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setCurrentUser(newUser);
      // Save to DB
      saveStoredUsers(updatedUsers);
    }
    setNameInput('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(AppView.HOME);
  };

  const handlePointsAwarded = (points: number, description: string, comment: string, category: string) => {
    if (!currentUser) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Streak Calculation Logic
    let newStreak = currentUser.currentStreak;
    let streakType: 'started' | 'continued' | null = null;
    let shouldShowAnimation = false;

    if (currentUser.lastLogDate !== todayStr) {
        // Not logged today yet
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (currentUser.lastLogDate === yesterdayStr) {
            // Logged yesterday -> Continue streak
            newStreak += 1;
            streakType = 'continued';
            shouldShowAnimation = true;
        } else {
            // Gap > 1 day or first time -> Reset/Start streak
            newStreak = 1;
            streakType = 'started';
            shouldShowAnimation = true;
        }
    }
    // If lastLogDate === todayStr, we do nothing to the streak (already counted for today)

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

    // Update State and DB
    const updatedUsersList = users.map(u => u.id === currentUser.id ? updatedUser : u);
    
    setCurrentUser(updatedUser);
    setUsers(updatedUsersList);
    saveStoredUsers(updatedUsersList);
    
    // Trigger Animation if streak changed
    if (shouldShowAnimation && streakType) {
        setStreakData({ show: true, val: newStreak, type: streakType });
    }
  };

  // --- Render Methods ---

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2826&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-eco-950/80 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
             <div className="bg-white/10 p-4 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
                 {/* Replaced potentially broken image with reliable Lucide icon */}
                 <School className="h-20 w-20 text-white drop-shadow-md" strokeWidth={1.5} />
             </div>
          </div>
          
          <h2 className="text-eco-300 font-semibold tracking-wide uppercase text-xs md:text-sm mb-2">The Modern American International School</h2>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">EcoRank</h1>
          <p className="text-eco-200 text-lg">Student Sustainability Leaderboard</p>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-eco-300 mb-2">Username</label>
              <input
                id="username"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-eco-500 transition-all"
                placeholder="Enter your name"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-eco-600 hover:bg-eco-500 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-eco-600/20"
            >
              Start Journey
            </button>
          </form>
        </div>
      </div>
      
      {/* Login Screen Footer Credit */}
      <div className="absolute bottom-6 w-full text-center z-10 animate-fade-in" style={{animationDelay: '0.2s'}}>
        <p className="text-eco-400/60 text-xs font-semibold tracking-wide">
            Made by Wadeea, Sharif, Adam, Mohammed from 10B1
        </p>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!currentUser) return null;

    return (
      <div className="space-y-6 animate-slide-up pb-20 md:pb-0">
        {/* Welcome Hero */}
        <div className="bg-gradient-to-r from-eco-900 to-eco-800 rounded-3xl p-8 border border-eco-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-8 opacity-10">
            <Leaf className="h-64 w-64" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {currentUser.name}</h2>
                    <p className="text-eco-200 mb-6">You've made a real difference today.</p>
                </div>
                {/* Small School Branding in Dashboard */}
                <div className="hidden md:block text-right opacity-50">
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Modern American</p>
                    <p className="text-[10px] text-eco-300 uppercase tracking-widest">International School</p>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 min-w-[140px] border border-white/5">
                <div className="flex items-center gap-2 text-eco-400 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider font-bold">Total Score</span>
                </div>
                <div className="text-3xl font-black text-white">{currentUser.totalPoints}</div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 min-w-[140px] border border-white/5">
                <div className="flex items-center gap-2 text-eco-400 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider font-bold">Actions</span>
                </div>
                <div className="text-3xl font-black text-white">{currentUser.actions.length}</div>
              </div>
              
              {/* Streak Card */}
              <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-sm rounded-2xl p-4 min-w-[140px] border border-orange-500/20">
                <div className="flex items-center gap-2 text-orange-400 mb-1">
                  <Flame className="h-4 w-4 animate-pulse" />
                  <span className="text-xs uppercase tracking-wider font-bold">Streak</span>
                </div>
                <div className="text-3xl font-black text-white flex items-baseline gap-1">
                    {currentUser.currentStreak} <span className="text-sm font-medium text-orange-300">Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent History */}
          <div className="bg-eco-900/50 backdrop-blur-md rounded-3xl p-6 border border-eco-800">
            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
            {recentActions.length === 0 ? (
              <div className="text-center py-10 text-eco-500/50">
                <Leaf className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No actions logged yet.</p>
                <button 
                  onClick={() => setCurrentView(AppView.LOG_ACTION)}
                  className="mt-4 text-sm text-eco-400 underline hover:text-eco-300"
                >
                  Log your first action
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActions.map((action) => (
                  <div key={action.id} className="bg-eco-950/50 p-4 rounded-2xl border border-eco-800/50 flex justify-between items-center group hover:border-eco-600 transition-colors">
                    <div>
                      <p className="text-eco-100 font-medium line-clamp-1">{action.description}</p>
                      <p className="text-xs text-eco-500 mt-1">"{action.aiComment}"</p>
                    </div>
                    <span className="font-bold text-eco-400 ml-4">+{action.points}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Chart or CTA */}
          <div className="bg-eco-900/50 backdrop-blur-md rounded-3xl p-6 border border-eco-800 flex flex-col items-center justify-center">
             <h3 className="text-lg font-bold text-white mb-4 w-full text-left">Impact Viz</h3>
             <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#064e3b', borderColor: '#065f46', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <p className="text-xs text-eco-400 mt-2">Points distribution per action</p>
          </div>
        </div>

        {/* Global Rank CTA */}
        <button 
            onClick={() => setCurrentView(AppView.LEADERBOARD)}
            className="w-full bg-gradient-to-r from-emerald-900 to-eco-900 border border-eco-700 p-6 rounded-3xl flex items-center justify-between group hover:border-eco-500 transition-all"
        >
            <div className="flex items-center gap-4">
                <div className="bg-eco-500/20 p-3 rounded-full text-eco-400">
                    <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-left">
                    <h4 className="text-white font-bold text-lg">Check Global Ranking</h4>
                    <p className="text-eco-300 text-sm">See how you compare to other eco-warriors</p>
                </div>
            </div>
            <ArrowRight className="h-6 w-6 text-eco-500 group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    );
  };

  if (!currentUser) {
    return renderLogin();
  }

  return (
    <div className="min-h-screen bg-eco-950 text-eco-50 font-sans selection:bg-eco-500 selection:text-white">
       {/* Background Noise/Gradient */}
       <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-eco-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full"></div>
       </div>

       {/* Streak Overlay - Renders on top of everything when active */}
       {streakData.show && (
         <StreakOverlay 
           streak={streakData.val} 
           type={streakData.type} 
           onComplete={() => setStreakData({ ...streakData, show: false })} 
         />
       )}

      <div className="relative z-10 flex flex-col md:flex-row min-h-screen max-w-7xl mx-auto">
        {/* Navigation - Top on Mobile, Left Sidebar on Desktop (handled via sticky/fixed logic in Navbar component) */}
        
        <div className="w-full md:w-64 md:fixed md:h-screen md:py-8 md:pl-6 z-50">
            <Navbar 
                currentView={currentView} 
                onChangeView={setCurrentView} 
                currentUser={currentUser.name}
                onLogout={handleLogout}
            />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 md:ml-64 overflow-y-auto min-h-screen pb-24 md:pb-8 flex flex-col">
            <header className="md:hidden flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-eco-500" />
                    <span className="font-bold text-xl text-white">EcoRank</span>
                </div>
                <button onClick={handleLogout} className="text-xs text-eco-400 border border-eco-800 px-3 py-1 rounded-full">
                    Logout
                </button>
            </header>

            {currentView === AppView.HOME && renderDashboard()}
            {currentView === AppView.LOG_ACTION && (
                <ActionLog onPointsAwarded={handlePointsAwarded} />
            )}
            {currentView === AppView.LEADERBOARD && (
                <Leaderboard users={users} currentUserId={currentUser.id} />
            )}
            {currentView === AppView.REWARDS && <Rewards />}
            
            {/* Dashboard Footer Credit */}
            <div className="mt-auto pt-10 pb-4 text-center opacity-60">
                 <p className="text-eco-500 text-[10px] uppercase tracking-widest font-bold">
                    Made by Wadeea, Sharif, Adam, Mohammed from 10B1
                 </p>
            </div>
        </main>
      </div>
    </div>
  );
}

export default App;