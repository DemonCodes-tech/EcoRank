import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Language } from '../types';
import { translations } from '../services/translations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { getLogicalDateStr } from '../services/dateUtils';
import { Flame, Loader2 } from 'lucide-react';

interface AnalyticsProps {
  user: User;
  lang: Language;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const Analytics: React.FC<AnalyticsProps> = ({ user, lang }) => {
  const t = translations[lang];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200); // Simulate fetch delay
    return () => clearTimeout(timer);
  }, []);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    user.actions.forEach(action => {
      counts[action.category] = (counts[action.category] || 0) + action.points;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [user.actions]);

  const activityData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const logicalDate = new Date(d.getTime() - 4 * 60 * 60 * 1000);
      const year = logicalDate.getFullYear();
      const month = String(logicalDate.getMonth() + 1).padStart(2, '0');
      const day = String(logicalDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }).reverse();

    const pointsPerDay: Record<string, number> = {};
    const actionsPerDay: Record<string, number> = {};

    last7Days.forEach(date => {
      pointsPerDay[date] = 0;
      actionsPerDay[date] = 0;
    });

    user.actions.forEach(action => {
      const actionDate = new Date(action.timestamp);
      const logicalDate = new Date(actionDate.getTime() - 4 * 60 * 60 * 1000);
      const year = logicalDate.getFullYear();
      const month = String(logicalDate.getMonth() + 1).padStart(2, '0');
      const day = String(logicalDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (pointsPerDay[dateStr] !== undefined) {
        pointsPerDay[dateStr] += action.points;
        actionsPerDay[dateStr] += 1;
      }
    });

    return last7Days.map(date => ({
      date: date.substring(5), // MM-DD
      points: pointsPerDay[date],
      actions: actionsPerDay[date]
    }));
  }, [user.actions]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-48 bg-white/10 rounded-xl"></div>
          <div className="h-4 w-64 bg-white/5 rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-80 animate-pulse flex flex-col gap-4">
            <div className="h-6 w-32 bg-white/10 rounded-lg"></div>
            <div className="flex-1 bg-white/5 rounded-2xl flex items-center justify-center">
               <Loader2 className="w-8 h-8 text-eco-500/20 animate-spin" />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-80 animate-pulse flex flex-col gap-4">
            <div className="h-6 w-48 bg-white/10 rounded-lg"></div>
            <div className="flex-1 bg-white/5 rounded-2xl flex items-center justify-center">
               <Loader2 className="w-8 h-8 text-eco-500/20 animate-spin" />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-64 animate-pulse flex flex-col gap-4 lg:col-span-2">
            <div className="flex justify-between items-center">
              <div className="h-6 w-40 bg-white/10 rounded-lg"></div>
              <div className="h-8 w-32 bg-white/10 rounded-full"></div>
            </div>
            <div className="flex-1 bg-white/5 rounded-2xl flex items-center justify-center">
               <Loader2 className="w-8 h-8 text-eco-500/20 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 animate-slide-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 font-mono tracking-tight">{t.navAnalytics}</h2>
        <p className="text-eco-400 text-sm opacity-80">Track your sustainability impact over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points by Category */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/20 border border-white/10 rounded-3xl p-6 backdrop-blur-md"
        >
          <h3 className="text-lg font-bold text-white mb-6 font-mono">Points by Category</h3>
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                {t.noData}
              </div>
            )}
          </div>
        </motion.div>

        {/* Activity Trends */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/20 border border-white/10 rounded-3xl p-6 backdrop-blur-md"
        >
          <h3 className="text-lg font-bold text-white mb-6 font-mono">Activity Trends (Last 7 Days)</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="points" name="Points" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="actions" name="Actions" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* Streak Consistency */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/20 border border-white/10 rounded-3xl p-6 backdrop-blur-md lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white font-mono">Streak Consistency</h3>
            <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Current: {user.currentStreak} Days
            </div>
          </div>
          <div className="h-48">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#f59e0b" fontSize={12} tickLine={false} axisLine={false} hide />
                <RechartsTooltip 
                  cursor={{ fill: '#333', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                />
                <Bar dataKey="actions" name="Actions Logged" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
