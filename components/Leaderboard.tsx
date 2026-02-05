import React from 'react';
import { User } from '../types';
import { Medal, Crown, Flame, Users } from 'lucide-react';

interface LeaderboardProps {
  users: User[];
  currentUserId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUserId }) => {
  const sortedUsers = [...users].sort((a, b) => b.totalPoints - a.totalPoints);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-6 w-6 text-yellow-400 fill-yellow-400/20" />;
      case 1: return <Medal className="h-6 w-6 text-gray-300 fill-gray-300/20" />;
      case 2: return <Medal className="h-6 w-6 text-amber-600 fill-amber-600/20" />;
      default: return <span className="text-eco-500 font-bold w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-slide-up pb-24 md:pb-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Global Rankings</h2>
        <p className="text-eco-300">Top contributors to a greener future</p>
      </div>

      <div className="bg-eco-900/40 backdrop-blur-md rounded-3xl border border-eco-800 overflow-hidden shadow-xl min-h-[300px] flex flex-col">
        {sortedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-eco-400 opacity-60">
            <Users className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">No active users yet.</p>
            <p className="text-sm">Be the first to join the movement!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-eco-900/80 text-eco-400 uppercase text-xs font-semibold tracking-wider">
                <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Streak</th>
                <th className="px-6 py-4 text-right">Actions</th>
                <th className="px-6 py-4 text-right">Total Points</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-eco-800">
                {sortedUsers.map((user, index) => (
                <tr 
                    key={user.id} 
                    className={`transition-colors duration-150 ${
                    user.id === currentUserId 
                        ? 'bg-eco-500/20 hover:bg-eco-500/30' 
                        : 'hover:bg-eco-800/30'
                    }`}
                >
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-eco-950/50">
                        {getRankIcon(index)}
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-eco-600 to-emerald-800 flex items-center justify-center text-white font-bold mr-4 border border-eco-500/30">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className={`text-sm font-medium ${user.id === currentUserId ? 'text-white' : 'text-eco-100'}`}>
                                {user.name} {user.id === currentUserId && '(You)'}
                            </div>
                            <div className="text-xs text-eco-400">
                                Eco Warrior Lvl {Math.floor(user.totalPoints / 100) + 1}
                            </div>
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       {user.currentStreak > 0 && (
                           <div className="flex items-center gap-1 text-orange-400 font-bold" title={`${user.currentStreak} Day Streak`}>
                               <Flame className="h-4 w-4 fill-orange-500/20" />
                               <span>{user.currentStreak}</span>
                           </div>
                       )}
                       {user.currentStreak === 0 && <span className="text-eco-700 text-xs">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-eco-300">
                    {user.actions.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-eco-500/10 text-eco-300 border border-eco-500/20">
                        {user.totalPoints} pts
                    </span>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;