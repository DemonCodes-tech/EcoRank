
import React, { useState, useEffect } from 'react';
import { Reminder, Language } from './types';
import { translations } from './translations';
import { Clock, Flame, CloudRain, Zap, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLogicalDateStr } from './dateUtils';

interface RemindersProps {
  reminders: Reminder[];
  onAdd: (title: string, time: string) => void;
  onDelete: (id: string) => void;
  lang: Language;
  currentStreak?: number;
  lastLogDate?: string;
}

const Reminders: React.FC<RemindersProps> = ({ lang, currentStreak = 0, lastLogDate = '' }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  const t = translations[lang];

  // Countdown Timer Logic
  useEffect(() => {
    const updateTimer = () => {
        const now = new Date();
        const deadline = new Date();
        
        // If it's before 4 AM, the deadline is 4 AM today.
        // If it's 4 AM or later, the deadline is 4 AM tomorrow.
        if (now.getHours() < 4) {
            deadline.setHours(4, 0, 0, 0);
        } else {
            deadline.setHours(28, 0, 0, 0); // 4 AM tomorrow
        }
        
        const diff = deadline.getTime() - now.getTime();
        
        if (diff <= 0) {
            setTimeLeft('00h 00m 00s');
        } else {
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        }
    };
    
    // Initial call
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine Streak State
  const todayStr = getLogicalDateStr();
  const isLoggedToday = lastLogDate === todayStr;
  const isStreakActive = currentStreak > 0;

  return (
    <div className="max-w-3xl mx-auto p-4 animate-slide-up min-h-[70vh] flex flex-col items-center justify-center">
      <div className="text-center mb-12">
         <h2 className="text-3xl font-bold text-white mb-3 font-mono tracking-tight">{t.streakProtocolName}</h2>
         <p className="text-eco-400 text-sm max-w-md mx-auto leading-relaxed opacity-80">{t.streakRule}</p>
      </div>

      {/* CENTRAL STREAK DISPLAY */}
      <div className="flex justify-center transform scale-100 md:scale-125 transition-transform duration-500">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`relative w-72 h-72 rounded-full flex flex-col items-center justify-center p-8 border-[6px] transition-all duration-500 ${
            isStreakActive 
                ? 'bg-gradient-to-b from-orange-950/80 to-black border-orange-500 shadow-[0_0_80px_rgba(249,115,22,0.4)]' 
                : 'bg-gray-900/50 border-gray-700 shadow-none'
        }`}>
            {/* Background Glow for active streak */}
            {isStreakActive && (
                <motion.div 
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-orange-500/10 rounded-full"
                ></motion.div>
            )}

            {isStreakActive ? (
                <>
                    {/* Living Fire */}
                    <div className="relative mb-4">
                        <motion.div
                            animate={{ 
                                scale: [1, 1.1, 1],
                                filter: ["drop-shadow(0 0 15px rgba(249,115,22,0.6))", "drop-shadow(0 0 25px rgba(249,115,22,0.9))", "drop-shadow(0 0 15px rgba(249,115,22,0.6))"]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <Flame className="h-24 w-24 text-orange-500 fill-orange-500" />
                        </motion.div>
                        <motion.div 
                            animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                            className="absolute -top-4 right-2 h-2 w-2 bg-yellow-300 rounded-full"
                        />
                         <motion.div 
                            animate={{ y: [0, -15, 0], opacity: [0, 1, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                            className="absolute -top-2 left-2 h-1.5 w-1.5 bg-orange-300 rounded-full"
                        />
                    </div>
                    
                    <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl font-black text-white font-mono flex items-baseline gap-2 mb-2"
                    >
                        {currentStreak}
                        <span className="text-base font-normal text-orange-400 uppercase tracking-widest">{t.days}</span>
                    </motion.div>

                    <div className="text-center w-full relative z-10">
                        <div className="text-[10px] text-orange-300 uppercase tracking-widest mb-1 opacity-80">{t.timeLeft}</div>
                        <div className="text-xl font-mono font-bold text-white bg-black/60 px-4 py-1.5 rounded-full border border-orange-500/30 flex items-center justify-center gap-2 mx-auto w-fit shadow-lg backdrop-blur-sm">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                                <Clock className="h-4 w-4 text-orange-400" />
                            </motion.div>
                            {timeLeft}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Dead Fire */}
                    <div className="relative mb-4 grayscale opacity-40">
                        <Flame className="h-24 w-24 text-gray-600 fill-gray-800" />
                        <motion.div 
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-2 -right-4"
                        >
                            <CloudRain className="h-10 w-10 text-blue-400/50" />
                        </motion.div>
                    </div>
                    
                    <div className="text-2xl font-bold text-gray-500 font-mono uppercase tracking-tight mb-2">
                        {t.statusInactive}
                    </div>
                    
                    <p className="text-[11px] text-gray-500 text-center max-w-[180px] font-mono leading-tight">
                        Upload evidence now to ignite the flame.
                    </p>
                </>
            )}
            
            {/* Status Badge */}
            <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`absolute -bottom-5 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider border shadow-lg flex items-center gap-2 ${
                isLoggedToday 
                    ? 'bg-green-900 border-green-500 text-green-400 shadow-green-900/50' 
                    : isStreakActive 
                        ? 'bg-red-900 border-red-500 text-red-200 shadow-red-900/50'
                        : 'bg-gray-800 border-gray-600 text-gray-500'
            }`}>
                 {isStreakActive && !isLoggedToday && (
                    <motion.span 
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <AlertTriangle className="w-3 h-3" />
                    </motion.span>
                 )}
                 {isStreakActive 
                    ? (isLoggedToday ? t.statusStable : t.statusCritical) 
                    : "System Cold"}
            </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reminders;
