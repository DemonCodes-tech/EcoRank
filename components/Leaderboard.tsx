
import React, { useEffect, useState, useRef } from 'react';
import { User, Language } from '../types';
import { Medal, Crown, Flame, Users, TrendingUp, Share2 } from 'lucide-react';
import { translations } from '../services/translations';
import AnimatedProfilePicture from './AnimatedProfilePicture';

interface LeaderboardProps {
  users: User[];
  currentUserId: string;
  lang: Language;
  themeId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUserId, lang, themeId }) => {
  const [sortBy, setSortBy] = useState<'points' | 'actions' | 'streak'>('points');

  const sortedUsers = [...users]
    .filter(u => u.name !== 'BT')
    .sort((a, b) => {
      if (sortBy === 'points') return b.totalPoints - a.totalPoints;
      if (sortBy === 'actions') return b.actions.length - a.actions.length;
      if (sortBy === 'streak') return b.currentStreak - a.currentStreak;
      return 0;
    });

  const t = translations[lang];

  // Track the previous points to trigger animation
  const currentUser = users.find(u => u.id === currentUserId);
  const currentPoints = currentUser ? currentUser.totalPoints : 0;
  const currentRank = sortedUsers.findIndex(u => u.id === currentUserId) + 1;
  const prevPointsRef = useRef(currentPoints);
  const [highlightUser, setHighlightUser] = useState(false);

  useEffect(() => {
    // Check if points increased since last render
    if (currentPoints > prevPointsRef.current) {
        setHighlightUser(true);
        // Remove highlight after 2 seconds
        const timer = setTimeout(() => setHighlightUser(false), 2000);
        prevPointsRef.current = currentPoints;
        return () => clearTimeout(timer);
    }
    // Sync ref if points decreased (rare) or initialized
    prevPointsRef.current = currentPoints;
  }, [currentPoints]);


  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-6 w-6 text-yellow-400 fill-yellow-400/20 animate-pulse-slow" />;
      case 1: return <Medal className="h-6 w-6 text-gray-300 fill-gray-300/20" />;
      case 2: return <Medal className="h-6 w-6 text-amber-600 fill-amber-600/20" />;
      default: return <span className="text-eco-500 font-bold w-6 text-center font-mono">{index + 1}</span>;
    }
  };

  const handleShare = () => {
    const text = `I'm currently rank #${currentRank} on the EcoRank leaderboard with ${currentPoints} points! Check out my sustainability score! #EcoRank #Sustainability`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'My EcoRank Score',
        text: text,
        url: url,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-slide-up">
      <div className="text-center mb-8 relative">
        <h2 className="text-3xl font-bold text-white mb-2 font-mono tracking-tight">{t.globalRankings}</h2>
        <p className="text-eco-300 text-sm font-mono uppercase tracking-widest">{t.topContributors}</p>
        
        {currentUser && (
          <button 
            onClick={handleShare}
            className="absolute right-0 top-0 flex items-center gap-2 px-4 py-2 bg-eco-500/20 text-eco-400 border border-eco-500/50 rounded-lg hover:bg-eco-500 hover:text-black transition-all font-mono text-sm uppercase tracking-wider"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        )}
      </div>

      {/* Sorting Controls */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button 
            onClick={() => setSortBy('points')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border rounded-lg transition-all ${
                sortBy === 'points' 
                    ? 'bg-eco-500 text-black border-eco-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                    : 'bg-black/40 text-eco-600 border-eco-800 hover:border-eco-500/50 hover:text-eco-400'
            }`}
        >
            {t.totalPoints}
        </button>
        <button 
            onClick={() => setSortBy('actions')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border rounded-lg transition-all ${
                sortBy === 'actions' 
                    ? 'bg-eco-500 text-black border-eco-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                    : 'bg-black/40 text-eco-600 border-eco-800 hover:border-eco-500/50 hover:text-eco-400'
            }`}
        >
            {t.actions}
        </button>
        <button 
            onClick={() => setSortBy('streak')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border rounded-lg transition-all ${
                sortBy === 'streak' 
                    ? 'bg-orange-500 text-black border-orange-400 font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                    : 'bg-black/40 text-eco-600 border-eco-800 hover:border-orange-500/50 hover:text-orange-400'
            }`}
        >
            {t.streak}
        </button>
      </div>

      <div className="bg-eco-900/40 backdrop-blur-md rounded-xl border border-eco-800 overflow-hidden shadow-xl min-h-[300px] flex flex-col relative">
        {/* Subtle grid pattern inside table container */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

        {sortedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-eco-400 opacity-60">
            <Users className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">{t.noData}</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
            <thead className="bg-eco-950/80 text-eco-500 uppercase text-[10px] font-bold tracking-widest font-mono border-b border-eco-800">
                <tr>
                <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.rank}</th>
                <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.name}</th>
                <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.streak}</th>
                <th className={`px-6 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{t.actions}</th>
                <th className={`px-6 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{t.totalPoints}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-eco-800/50">
                {sortedUsers.map((user, index) => {
                    const isCurrentUser = user.id === currentUserId;
                    const isHighlighted = isCurrentUser && highlightUser;
                    const isEshel = user.name.toLowerCase() === 'eshel';
                    
                    return (
                        <tr 
                            key={user.id} 
                            className={`transition-all duration-700 font-mono ${
                            isHighlighted 
                                ? 'bg-eco-500/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.4)]' 
                                : isEshel
                                    ? 'bg-pink-500/10 hover:bg-pink-500/20 border-l-2 border-pink-500'
                                    : isCurrentUser
                                        ? 'bg-eco-500/10 hover:bg-eco-500/20'
                                        : 'hover:bg-eco-800/30'
                            }`}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${index < 3 ? 'bg-black/40 border border-eco-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : ''}`}>
                                    {getRankIcon(index)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className={`h-10 w-10 flex items-center justify-center text-white font-bold mx-2 transition-all duration-500 ${
                                    isHighlighted 
                                        ? 'scale-110'
                                        : ''
                                }`}>
                                    <AnimatedProfilePicture
                                        profilePicture={user.profilePicture}
                                        borderType={user.borderType}
                                        size="md"
                                        themeId={themeId}
                                    />
                                </div>
                                <div>
                                    <div className={`text-sm font-bold flex items-center gap-2 ${
                                        isEshel ? 'text-pink-400' : isCurrentUser ? 'text-white' : 'text-eco-200'
                                    }`}>
                                        {user.name} 
                                        {isCurrentUser && (
                                            <span className="text-[9px] bg-eco-500/20 text-eco-300 px-1.5 py-0.5 rounded border border-eco-500/30 uppercase tracking-wider">
                                                {t.you}
                                            </span>
                                        )}
                                        {isEshel && (
                                            <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded border border-pink-500/30 uppercase tracking-wider">
                                                SPECIAL
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-eco-500/80 uppercase tracking-wider">
                                        ID: {user.id.slice(-4)} // Lvl {Math.floor(user.totalPoints / 100) + 1}
                                    </div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            {user.currentStreak > 0 ? (
                                <div className="flex items-center gap-1 text-orange-400 font-bold bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20 w-fit" title={`${user.currentStreak} Day Streak`}>
                                    <Flame className={`h-3 w-3 fill-orange-500/20 ${isHighlighted ? 'animate-bounce' : ''}`} />
                                    <span className="text-xs">{user.currentStreak}</span>
                                </div>
                            ) : (
                                <span className="text-eco-800 text-xs">-</span>
                            )}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-xs text-eco-400 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                                <div className="font-bold">{user.actions.length} <span className="text-eco-700 font-normal">LOGS</span></div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-bold rounded border transition-all duration-700 ${
                                    isHighlighted
                                        ? 'bg-eco-400 text-black border-white scale-110 shadow-[0_0_20px_rgba(16,185,129,0.6)]'
                                        : isCurrentUser
                                            ? 'bg-eco-500/20 text-eco-300 border-eco-500/40'
                                            : 'text-eco-500 border-transparent'
                                }`}>
                                    {isHighlighted && <TrendingUp className="h-3 w-3" />}
                                    {user.totalPoints}
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
