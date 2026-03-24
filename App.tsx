
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { User, AppView, EcoAction, Language, Reminder } from './types';
import { Navbar } from './components/Navbar';
import ActionLog from './components/ActionLog';
import Leaderboard from './components/Leaderboard';
import Rewards from './components/Rewards';
import Reminders from './components/Reminders';
import StreakOverlay from './components/StreakOverlay';
import NotificationOverlay from './components/NotificationOverlay';
import TutorialOverlay from './components/TutorialOverlay';
import ModTutorialOverlay from './components/ModTutorialOverlay';
import Onboarding from './components/Onboarding';
import ThemeModal from './components/ThemeModal';
import About from './components/About';
import Analytics from './components/Analytics';
import FAQ from './components/FAQ';
import Profile from './components/Profile';
import Moderation from './components/Moderation';
import { ArrowRight, Terminal, Code, AlertTriangle, Ghost, Globe, Cpu, HardDrive, Wifi, Zap, Loader2, Moon, Star, Heart, Leaf, Lightbulb, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { getLeaderboard, getCurrentUser, saveUserUpdate, saveStoredUsers, getStoredUsers } from './services/storageService';
import { getLogicalDateStr, getYesterdayLogicalDateStr } from './services/dateUtils';
import { translations } from './services/translations';
import { getSavedTheme, applyTheme, Theme, getSavedMode } from './services/themes';
import { playSound } from './services/soundService';

import { LandingPage } from './components/LandingPage';

const COLORS = ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7'];

// Helper to detect older or low-end devices (pre-2020)
const isOlderDevice = () => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  
  // iOS < 14 (Released Sept 2020)
  const iosMatch = ua.match(/OS (\d+)_/);
  if (iosMatch && parseInt(iosMatch[1], 10) < 14) return true;
  
  // Android < 11 (Released Sept 2020)
  const androidMatch = ua.match(/Android (\d+)/);
  if (androidMatch && parseInt(androidMatch[1], 10) < 11) return true;
  
  // macOS < 11 (Big Sur, late 2020)
  const macMatch = ua.match(/Mac OS X 10_(\d+)/);
  if (macMatch && parseInt(macMatch[1], 10) <= 15) return true;
  
  // Hardware heuristics for Windows/Linux/Unknown
  const cores = navigator.hardwareConcurrency;
  const memory = (navigator as any).deviceMemory;
  
  if (cores && cores <= 4) return true;
  if (memory && memory <= 4) return true;
  
  return false;
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [originalAdminUser, setOriginalAdminUser] = useState<User | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [sectionInput, setSectionInput] = useState('10b1'); // Default section
  const [users, setUsers] = useState<User[]>([]); 
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [lang, setLang] = useState<Language>('en'); 
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(getSavedTheme());
  const [isForgotPin, setIsForgotPin] = useState(false);
  const [forgotPinStep, setForgotPinStep] = useState<1 | 2>(1); // 1: username, 2: new pin
  const [resetUsername, setResetUsername] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    const saved = localStorage.getItem('eco_onboarding_complete');
    if (saved) return saved === 'true';
    
    // Skip heavy onboarding on older devices
    if (isOlderDevice()) {
        localStorage.setItem('eco_onboarding_complete', 'true');
        return true;
    }
    return false;
  });

  // Low Power Mode State
  const [isLowPowerMode, setIsLowPowerMode] = useState(() => {
      const saved = localStorage.getItem('eco_low_opt');
      if (saved) return JSON.parse(saved);
      
      // Auto-detect reduced motion preference
      if (typeof window !== 'undefined' && window.matchMedia) {
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              return true;
          }
      }
      
      // Auto-detect older devices (pre-2020 or low-end)
      return isOlderDevice();
  });

  const [isLoading, setIsLoading] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [displayPoints, setDisplayPoints] = useState(0);
  const [streakData, setStreakData] = useState<{ show: boolean; val: number; type: 'started' | 'continued' | 'lost' }>({ 
    show: false, val: 0, type: 'started' 
  });
  const [activeAlert, setActiveAlert] = useState<{ title: string; time: string } | null>(null);
  const lastAlertTimeRef = useRef<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    // Minimal boot sequence
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('eco_low_opt', JSON.stringify(isLowPowerMode));
  }, [isLowPowerMode]);

  useEffect(() => {
    const initApp = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setDisplayPoints(user.totalPoints);
      }
      
      const leaderboardData = await getLeaderboard();
      setUsers(leaderboardData);
      
      if (user && (user.role === 'admin' || user.role === 'moderator')) {
        const allUsers = await getStoredUsers();
        setUsers(allUsers);
      }
      
      applyTheme(currentTheme, true);
      setIsLoading(false);
    };
    initApp();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    if (displayPoints !== currentUser.totalPoints) {
        const diff = currentUser.totalPoints - displayPoints;
        const step = Math.ceil(Math.abs(diff) / 20) || 1; 
        const timer = setInterval(() => {
            setDisplayPoints(prev => {
                const remaining = currentUser.totalPoints - prev;
                if (Math.abs(remaining) <= step) {
                    clearInterval(timer);
                    return currentUser.totalPoints;
                }
                return prev + (diff > 0 ? step : -step);
            });
        }, 30);
        return () => clearInterval(timer);
    }
  }, [currentUser?.totalPoints, displayPoints]);

  useEffect(() => {
      if (!currentUser || !currentUser.reminders) return;
      const checkInterval = setInterval(() => {
          const now = new Date();
          const currentHours = String(now.getHours()).padStart(2, '0');
          const currentMinutes = String(now.getMinutes()).padStart(2, '0');
          const currentTimeStr = `${currentHours}:${currentMinutes}`;
          if (lastAlertTimeRef.current === currentTimeStr) return;
          const matchingReminder = currentUser.reminders?.find(r => r.time === currentTimeStr && r.isEnabled);
          if (matchingReminder) {
              setActiveAlert({ title: matchingReminder.title, time: matchingReminder.time });
              lastAlertTimeRef.current = currentTimeStr;
              playSound('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', 0.5);
          }
      }, 30000);
      return () => clearInterval(checkInterval);
  }, [currentUser]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme, true);
  };

  const toggleLowPowerMode = () => {
    setIsLowPowerMode((prev: boolean) => !prev);
  };

  const userActions = currentUser?.actions || [];
  const recentActions = [...userActions].reverse().slice(0, 5);
  const chartData = userActions.length > 0 
    ? userActions.map((a, i) => ({ name: `Log ${i+1}`, value: a.points }))
    : [{ name: 'No Data', value: 100 }];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    if (!passwordInput.trim()) {
        alert(t.passwordRequired);
        return;
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim(), pin: passwordInput.trim() })
      });

      if (response.ok) {
        const { token, ...user } = await response.json();
        if (token) localStorage.setItem('token', token);
        setCurrentUser(user);
        setDisplayPoints(user.totalPoints);
        
        // After login, if admin/mod, load all users
        if (user.role === 'admin' || user.role === 'moderator') {
          const allUsers = await getStoredUsers();
          setUsers(allUsers);
        } else {
          const leaderboardData = await getLeaderboard();
          setUsers(leaderboardData);
        }
      } else {
        const err = await response.json();
        alert(err.error || t.accountNotFound);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
    
    setNameInput('');
    setPasswordInput('');
  };

  const handleCreateUser = (name: string, pin: string, section: string, role: 'student' | 'moderator' | 'admin' | 'beta') => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      pin,
      section,
      role,
      totalPoints: 0,
      actions: [],
      currentStreak: 0,
      lastLogDate: '',
      reminders: [],
      createdBy: currentUser?.id
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    return newUser;
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
  };

  const handleUpdateUser = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      saveUserUpdate(updatedUser);
      setUsers(prevUsers => {
          return prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
      });
  };

  const handleUpdateUsers = (updatedUsers: User[]) => {
      setUsers(updatedUsers);
      saveStoredUsers(updatedUsers);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    setCurrentUser(null);
    setOriginalAdminUser(null);
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

  const handleModTutorialComplete = () => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, hasCompletedModTutorial: true };
    const updatedUsersList = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setCurrentUser(updatedUser);
    setUsers(updatedUsersList);
    saveStoredUsers(updatedUsersList);
  };

  const handleAddReminder = (title: string, time: string) => {
      if (!currentUser) return;
      const newReminder: Reminder = {
          id: Date.now().toString(),
          title,
          time,
          isEnabled: true
      };
      const updatedUser = { ...currentUser, reminders: [...(currentUser.reminders || []), newReminder] };
      const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      setCurrentUser(updatedUser);
      setUsers(updatedUsers);
      saveStoredUsers(updatedUsers);
  };

  const handleDeleteReminder = (id: string) => {
      if (!currentUser) return;
      const updatedUser = { 
          ...currentUser, 
          reminders: (currentUser.reminders || []).filter(r => r.id !== id) 
      };
      const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      setCurrentUser(updatedUser);
      setUsers(updatedUsers);
      saveStoredUsers(updatedUsers);
  };

  const handleActionRejected = () => {
    if (!currentUser) return;
    
    // Increment rejection count
    const newRejectionCount = (currentUser.rejectionCount || 0) + 1;
    let newCheatingFlags = currentUser.cheatingFlags || 0;
    let newDailyLimit = currentUser.dailyLimit || 25;
    let pointsDeduction = 0;
    
    // Check for Flags (Every 3 rejections = 1 Flag)
    if (newRejectionCount % 3 === 0) {
        newCheatingFlags += 1;
        
        // Apply Penalties based on Flag Level
        if (newCheatingFlags === 1) {
            // First Flag: Warning (Handled by UI notification mostly, but we can log it)
            alert(t.warningTitle + ": Suspicious activity detected. Future violations will result in point deductions.");
        } else if (newCheatingFlags === 2) {
            // Second Flag: -10 Points
            pointsDeduction = 10;
            alert(t.warningTitle + ": 2nd Violation. 10 Points deducted.");
        } else if (newCheatingFlags >= 3) {
            // Third Flag: Reduce Daily Limit
            newDailyLimit = 22;
            alert(t.warningTitle + ": Critical Violation. Daily limit reduced to 22.");
        }
    }

    const lostStreak = currentUser.currentStreak;
    // Reset streak if it was active (existing logic)
    const newStreak = 0;

    const updatedUser: User = {
        ...currentUser,
        currentStreak: newStreak,
        rejectionCount: newRejectionCount,
        cheatingFlags: newCheatingFlags,
        dailyLimit: newDailyLimit,
        totalPoints: Math.max(0, currentUser.totalPoints - pointsDeduction)
    };

    const updatedUsersList = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setCurrentUser(updatedUser);
    setUsers(updatedUsersList);
    saveStoredUsers(updatedUsersList);
    
    if (lostStreak > 0) {
        setStreakData({ show: true, val: lostStreak, type: 'lost' });
    }
  };

  const handleActionPendingReview = (proposedPoints: number, description: string, comment: string, category: string, confidenceScore: number, videoData: string, mimeType: string) => {
    if (!currentUser) return;
    
    // Find a random moderator
    const moderators = users.filter(u => u.role === 'moderator');
    let assignedTo = '';
    if (moderators.length > 0) {
        const randomMod = moderators[Math.floor(Math.random() * moderators.length)];
        assignedTo = randomMod.id;
    } else {
        // Fallback to admin if no moderators
        const admins = users.filter(u => u.role === 'admin');
        if (admins.length > 0) {
            assignedTo = admins[0].id;
        }
    }

    const newAction: EcoAction = {
      id: Date.now().toString(),
      description,
      points: 0, // 0 until approved
      proposedPoints,
      timestamp: Date.now(),
      aiComment: comment,
      confidenceScore,
      status: 'pending_review',
      assignedTo,
      videoData,
      mimeType
    };

    const updatedUser: User = {
      ...currentUser,
      actions: [...currentUser.actions, newAction]
    };
    const updatedUsersList = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setCurrentUser(updatedUser);
    setUsers(updatedUsersList);
    saveStoredUsers(updatedUsersList);
    
    alert(`Action flagged for review (Confidence: ${confidenceScore}%). Sent to moderator.`);
  };

  const handlePointsAwarded = (points: number, description: string, comment: string, category: string, confidenceScore?: number) => {
    if (!currentUser) return;
    const todayStr = getLogicalDateStr();
    let newStreak = currentUser.currentStreak;
    let streakType: 'started' | 'continued' | null = null;
    let shouldShowAnimation = false;

    if (currentUser.lastLogDate !== todayStr) {
        const yesterdayStr = getYesterdayLogicalDateStr();

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
      aiComment: comment,
      confidenceScore,
      status: 'approved'
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

  const handleApproveAction = (userId: string, actionId: string) => {
    const updatedUsersList = users.map(u => {
      if (u.id === userId) {
        const actionIndex = u.actions.findIndex(a => a.id === actionId);
        if (actionIndex > -1) {
          const action = u.actions[actionIndex];
          const updatedAction = { ...action, status: 'approved' as const, points: action.proposedPoints || 0 };
          const updatedActions = [...u.actions];
          updatedActions[actionIndex] = updatedAction;
          return { ...u, actions: updatedActions, totalPoints: u.totalPoints + (action.proposedPoints || 0) };
        }
      }
      return u;
    });
    setUsers(updatedUsersList);
    saveStoredUsers(updatedUsersList);
    alert('Action approved.');
  };

  const handleRejectAction = (userId: string, actionId: string) => {
    const updatedUsersList = users.map(u => {
      if (u.id === userId) {
        const actionIndex = u.actions.findIndex(a => a.id === actionId);
        if (actionIndex > -1) {
          const updatedAction = { ...u.actions[actionIndex], status: 'rejected' as const };
          const updatedActions = [...u.actions];
          updatedActions[actionIndex] = updatedAction;
          return { ...u, actions: updatedActions };
        }
      }
      return u;
    });
    setUsers(updatedUsersList);
    saveStoredUsers(updatedUsersList);
    alert('Action rejected.');
  };

  const handleReassignModerator = (userId: string, actionId: string) => {
    const moderators = users.filter(u => u.role === 'moderator' && u.id !== currentUser?.id);
    if (moderators.length === 0) {
      alert('No other moderators available.');
      return;
    }
    const randomMod = moderators[Math.floor(Math.random() * moderators.length)];
    
    const updatedUsersList = users.map(u => {
      if (u.id === userId) {
        const actionIndex = u.actions.findIndex(a => a.id === actionId);
        if (actionIndex > -1) {
          const updatedAction = { ...u.actions[actionIndex], assignedTo: randomMod.id };
          const updatedActions = [...u.actions];
          updatedActions[actionIndex] = updatedAction;
          return { ...u, actions: updatedActions };
        }
      }
      return u;
    });
    setUsers(updatedUsersList);
    saveStoredUsers(updatedUsersList);
    alert(`Reassigned to moderator: ${randomMod.name}`);
  };

  const handleSendToAdmin = (userId: string, actionId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    let adminName = 'Wadeea'; // Default boys admin
    if (user.section && user.section.toLowerCase().includes('g')) {
      adminName = 'Eshel'; // Girls admin if section has 'g' or similar logic?
      // Wait, the prompt says "Eshel is for the girls admin and Wadeea is the boys admin"
      // We don't have a strict gender field, but we can check if the section is a girls section or just find the admin by name.
    }
    // Let's just find admin by name. If section contains 'g' -> Eshel, else Wadeea.
    // Or we can just look up Eshel and Wadeea directly.
    const isGirl = user.section?.toLowerCase().includes('g');
    const targetAdminName = isGirl ? 'Eshel' : 'Wadeea';
    
    const admin = users.find(u => u.role === 'admin' && u.name.toLowerCase() === targetAdminName.toLowerCase());
    
    // Fallback to any admin if specific one not found
    const fallbackAdmin = users.find(u => u.role === 'admin');
    const assignedAdmin = admin || fallbackAdmin;

    if (!assignedAdmin) {
      alert('No admin found.');
      return;
    }

    const updatedUsersList = users.map(u => {
      if (u.id === userId) {
        const actionIndex = u.actions.findIndex(a => a.id === actionId);
        if (actionIndex > -1) {
          const updatedAction = { ...u.actions[actionIndex], assignedTo: assignedAdmin.id };
          const updatedActions = [...u.actions];
          updatedActions[actionIndex] = updatedAction;
          return { ...u, actions: updatedActions };
        }
      }
      return u;
    });
    setUsers(updatedUsersList);
    saveStoredUsers(updatedUsersList);
    alert(`Sent to admin: ${assignedAdmin.name}`);
  };

  const handleForgotPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotPinStep === 1) {
      const user = users.find(u => u.name.toLowerCase() === resetUsername.trim().toLowerCase());
      if (user) {
        setResetUser(user);
        setForgotPinStep(2);
      } else {
        alert(lang === 'ar' ? 'المستخدم غير موجود' : 'User not found');
      }
    } else if (forgotPinStep === 2) {
      if (resetUser && newPinInput.trim()) {
        const updatedUser = { 
          ...resetUser, 
          pendingPin: newPinInput.trim(),
          pinResetStatus: 'pending' as const
        };
        const updatedUsersList = users.map(u => u.id === resetUser.id ? updatedUser : u);
        setUsers(updatedUsersList);
        saveStoredUsers(updatedUsersList);
        alert(lang === 'ar' ? 'تم إرسال طلب إعادة تعيين رمز PIN إلى المشرف' : 'PIN reset request sent to moderator');
        setIsForgotPin(false);
        setForgotPinStep(1);
        setResetUsername('');
        setNewPinInput('');
        setResetUser(null);
      }
    }
  };

  const renderBootScreen = () => {
      return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-eco-950 flex flex-col items-center justify-center overflow-hidden"
          >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center gap-6"
              >
                  <div className="w-20 h-20 bg-eco-500 rounded-2xl flex items-center justify-center shadow-lg shadow-eco-500/20">
                      <Leaf className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">EcoRank</h2>
                  <Loader2 className="h-5 w-5 text-eco-500 animate-spin" />
              </motion.div>
          </motion.div>
      );
  };

  const renderLogin = () => (
    <motion.div 
        key="login"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full min-h-screen flex items-center justify-center p-4 relative z-10"
    >
      <div className="w-full max-w-md my-auto">
        <div className="absolute top-4 left-4 z-50">
            <button onClick={() => setShowLogin(false)} className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-full hover:bg-white/10 transition-all text-xs font-medium">
                <ArrowRight className={`h-4 w-4 ${lang === 'ar' ? '' : 'rotate-180'}`} />
                {lang === 'ar' ? 'العودة' : 'Back'}
            </button>
        </div>
        <div className="absolute top-4 right-4 z-50">
            <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-1 bg-eco-900/40 border border-eco-500/30 text-eco-400 rounded-full hover:bg-eco-500/20 transition-all text-xs font-medium">
                <Globe className="h-4 w-4" />
                {lang === 'en' ? 'العربية' : 'English'}
            </button>
        </div>
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-eco-500/10 rounded-2xl mb-6">
                        <Leaf className="h-8 w-8 text-eco-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{t.loginTitle}</h1>
                    <p className="text-gray-400 text-sm">{t.loginSubtitle}</p>
                </div>
                {isForgotPin ? (
                  <form onSubmit={handleForgotPinSubmit} className="space-y-6">
                    <div className="space-y-4">
                      {forgotPinStep === 1 && (
                        <div className="relative group">
                          <input type="text" value={resetUsername} onChange={(e) => setResetUsername(e.target.value)} className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-eco-500 focus:ring-1 focus:ring-eco-500 transition-all rounded-xl text-center" placeholder={lang === 'ar' ? 'أدخل اسم المستخدم' : 'Enter Username'} />
                        </div>
                      )}
                      {forgotPinStep === 2 && (
                        <div className="relative group">
                          <input type="password" value={newPinInput} onChange={(e) => setNewPinInput(e.target.value)} className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-eco-500 focus:ring-1 focus:ring-eco-500 transition-all rounded-xl text-center" placeholder={lang === 'ar' ? 'رمز PIN الجديد' : 'New PIN'} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <button type="submit" className="w-full py-3.5 bg-eco-600 hover:bg-eco-500 text-white font-bold text-lg tracking-wide transition-all hover:shadow-lg hover:shadow-eco-500/20 rounded-xl">
                        {forgotPinStep === 1 ? (lang === 'ar' ? 'التالي' : 'Next') : (lang === 'ar' ? 'إرسال الطلب' : 'Submit Request')}
                      </button>
                      <button type="button" onClick={() => { setIsForgotPin(false); setForgotPinStep(1); setResetUsername(''); setNewPinInput(''); setResetUser(null); }} className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-lg tracking-wide transition-all rounded-xl">
                        {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-4">
                          <div className="relative group">
                              <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-eco-500 focus:ring-1 focus:ring-eco-500 transition-all rounded-xl text-center" placeholder={t.enterUsername} />
                          </div>
                          <div className="relative group">
                              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-eco-500 focus:ring-1 focus:ring-eco-500 transition-all rounded-xl text-center" placeholder={t.enterPin} />
                          </div>
                          <div className="relative group">
                              <select 
                                  value={sectionInput} 
                                  onChange={(e) => setSectionInput(e.target.value)}
                                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-eco-500 focus:ring-1 focus:ring-eco-500 transition-all rounded-xl text-center appearance-none cursor-pointer"
                              >
                                  <option value="9b1" className="bg-gray-900">9B1 (Standard)</option>
                                  <option value="9b2" className="bg-gray-900">9B2 (Standard)</option>
                                  <option value="9g1" className="bg-gray-900">9G1 (Girls)</option>
                                  <option value="9g2" className="bg-gray-900">9G2 (Girls)</option>
                                  <option value="10b1" className="bg-gray-900">10B1 (Standard)</option>
                                  <option value="10b2" className="bg-gray-900">10B2 (Standard)</option>
                                  <option value="10g1" className="bg-gray-900">10G1 (Girls)</option>
                                  <option value="11b1" className="bg-gray-900">11B1 (Clean Zone)</option>
                                  <option value="11b2" className="bg-gray-900">11B2 (Clean Zone)</option>
                                  <option value="11g1" className="bg-gray-900">11G1 (Girls)</option>
                                  <option value="12b1" className="bg-gray-900">12B1 (Standard)</option>
                                  <option value="12b2" className="bg-gray-900">12B2 (Standard)</option>
                                  <option value="12g1" className="bg-gray-900">12G1 (Girls)</option>
                                  <option value="12g2" className="bg-gray-900">12G2 (Girls)</option>
                                </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                  <ArrowRight className="h-4 w-4 rotate-90" />
                              </div>
                          </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button type="submit" className="w-full py-3.5 bg-eco-600 hover:bg-eco-500 text-white font-bold text-lg tracking-wide transition-all hover:shadow-lg hover:shadow-eco-500/20 rounded-xl">{t.startSession}</button>
                        <button type="button" onClick={() => setHasSeenOnboarding(false)} className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold text-lg tracking-wide transition-all rounded-xl">
                          {lang === 'ar' ? 'عرض الدليل التعليمي' : 'View Tutorial'}
                        </button>
                        <button type="button" onClick={() => setIsForgotPin(true)} className="text-sm text-gray-400 hover:text-eco-400 transition-colors">
                          {lang === 'ar' ? 'نسيت رمز PIN؟' : 'Forgot PIN?'}
                        </button>
                      </div>
                  </form>
                )}
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-gray-500 font-medium">{t.systemStatus} • v1.0.0</p>
                    <p className="text-[10px] text-gray-600 mt-2">{(t as any).copyright}</p>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );

  const renderDashboard = () => {
    if (!currentUser) return null;
    const isEshel = currentUser.name.toLowerCase() === 'eshel';
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6 relative z-10"
      >
        <div className={`border ${isEshel ? 'border-pink-500/20 bg-transparent' : 'border-white/10 bg-transparent'} p-8 relative overflow-hidden rounded-3xl`}>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className={`text-sm font-medium ${isEshel ? 'text-pink-400' : 'text-eco-400'} mb-1 flex items-center gap-2`}>Welcome back</div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">{currentUser.name}</h2>
                    <div className={`text-sm ${isEshel ? 'text-pink-300/60' : 'text-gray-400'} mt-1`}>Section {currentUser.section || 'N/A'}</div>
                </div>
                <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${isEshel ? 'bg-pink-500/10 text-pink-400' : 'bg-eco-500/10 text-eco-400'} rounded-full text-xs font-medium`}>
                        <span className={`w-2 h-2 ${isEshel ? 'bg-pink-500' : 'bg-eco-500'} rounded-full animate-pulse`}></span>
                        {t.live}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`bg-transparent p-4 rounded-2xl border border-white/5`}>
                <div className={`text-xs font-medium ${isEshel ? 'text-pink-400' : 'text-gray-400'} mb-1`}>{t.score}</div>
                <div className="text-3xl font-bold text-white tabular-nums">{displayPoints}</div>
              </div>
              <div className={`bg-transparent p-4 rounded-2xl border border-white/5`}>
                <div className={`text-xs font-medium ${isEshel ? 'text-pink-400' : 'text-gray-400'} mb-1`}>{t.logs}</div>
                <div className="text-3xl font-bold text-white">{currentUser.actions.length}</div>
              </div>
              <div className={`bg-transparent p-4 rounded-2xl border border-white/5`}>
                <div className="text-xs font-medium text-orange-400 mb-1">{t.streak}</div>
                <div className="text-3xl font-bold text-white flex items-baseline gap-1">{currentUser.currentStreak} <span className="text-sm font-normal text-gray-500">{t.days}</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-white/10 bg-transparent p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-4 bg-eco-500 rounded-full"></div>
                {t.recentActivity}
            </h3>
            {recentActions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">{t.noData}</div>
            ) : (
              <div className="space-y-3">
                {recentActions.map((action, idx) => (
                  <motion.div 
                    key={action.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex justify-between items-center text-sm p-3 hover:bg-white/5 transition-colors rounded-xl group"
                  >
                    <div className="flex-1">
                        <div className="text-gray-200 font-medium group-hover:text-white transition-colors">{action.description}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <span className="font-bold text-eco-400 bg-eco-500/10 px-2 py-1 rounded-lg">+{action.points}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          <div className="border border-white/10 bg-transparent p-6 flex flex-col rounded-3xl">
             <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-4 bg-eco-500 rounded-full"></div>
                {t.impactAnalysis}
             </h3>
             <div className="h-[200px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }} 
                        itemStyle={{ color: '#fff' }} 
                        cursor={false}
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
            <button onClick={() => setCurrentView(AppView.LEADERBOARD)} className="w-full bg-transparent border border-white/10 text-white py-4 text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 rounded-2xl group">
                {t.viewRankings} 
                <span className="bg-white/10 p-1 rounded-full group-hover:bg-white/20 transition-colors">
                    {lang === 'en' ? <ArrowRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4 rotate-180" />}
                </span>
            </button>
        </div>
      </motion.div>
    );
  };

  if (isLoading) return renderBootScreen();

  return (
    <MotionConfig reducedMotion={isLowPowerMode ? "always" : "never"}>
      <div className={`min-h-screen bg-transparent text-gray-100 transition-colors duration-500 ${isLowPowerMode ? 'low-power-mode' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        
        <AnimatePresence>
        </AnimatePresence>

        {/* Parrot Theme Animation Layer */}
        {currentTheme.id === 'parrot' && (
            <div className="parrot-container">
                {/* Parallax Background */}
                <div className="jungle-leaves-bg"></div>
                <div className="jungle-leaves"></div>
                
                {/* Foreground Branch */}
                <div className="foreground-branch"></div>
                
                {/* Animals */}
                <div className="pixel-snake-new"></div>
                
                <div className="pixel-spider-container">
                    <div className="spider-thread"></div>
                    <div className="pixel-spider"></div>
                </div>

                {/* Parrots */}
                <div className="pixel-macaw macaw-1"></div>
            </div>
        )}

        {/* Pixel Cat Theme Animation Layer */}
        {(currentTheme.id === 'pixel-cat-gray' || currentTheme.id === 'pixel-cat-white') && (
            <div className="pixel-cat-container" style={{ background: currentTheme.id === 'pixel-cat-white' ? 'radial-gradient(circle at center, #94a3b8 0%, #0f172a 100%)' : undefined }}>
                <div className={`pixel-cat-figure ${currentTheme.id === 'pixel-cat-white' ? 'white-cat' : 'gray-cat'}`}></div>
                <div className="pixel-yarn yarn-1"></div>
                <div className="pixel-yarn yarn-2"></div>
                <div className="pixel-yarn yarn-3"></div>
                <div className="pixel-mouse mouse-1"></div>
                <div className="pixel-mouse mouse-2"></div>
                <div className="pixel-fish fish-1"></div>
                <div className="pixel-fish fish-2"></div>
            </div>
        )}

        {/* Smiski Theme Animation Layer */}
        {currentTheme.id === 'smiski' && (
            <div className="smiski-container">
                <div className="smiski-figure smiski-headphones"></div>
                <div className="smiski-figure smiski-hula"></div>
                <div className="smiski-figure smiski-laptop"></div>
                <div className="smiski-figure smiski-skate"></div>
                <div className="smiski-figure smiski-lotus hidden md:block"></div>
            </div>
        )}

        {/* Custom Theme Animation Layer */}
        {currentTheme.id.startsWith('custom-') && currentTheme.customImageUrl && (
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" style={{ background: currentTheme.isAbstract ? `url(${currentTheme.customImageUrl}) center/cover no-repeat` : 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' }}>
                {!currentTheme.isAbstract && (
                    <div 
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-contain bg-no-repeat bg-center"
                        style={{ 
                            backgroundImage: `url(${currentTheme.customImageUrl})`,
                            imageRendering: 'pixelated',
                            filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.5))',
                            animation: currentTheme.customAnimation === 'float' ? 'custom-float 6s ease-in-out infinite' : 
                                       currentTheme.customAnimation === 'bounce' ? 'custom-bounce 2s infinite' :
                                       currentTheme.customAnimation === 'spin' ? 'custom-spin 4s linear infinite' :
                                       currentTheme.customAnimation === 'pulse' ? 'custom-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                        }}
                    ></div>
                )}
            </div>
        )}

        {!hasSeenOnboarding ? (
          <AnimatePresence mode="wait">
            <Onboarding 
              onComplete={() => {
                setHasSeenOnboarding(true);
                localStorage.setItem('eco_onboarding_complete', 'true');
              }} 
              lang={lang} 
              toggleLanguage={toggleLanguage} 
            />
          </AnimatePresence>
        ) : !currentUser ? (
          <AnimatePresence mode="wait">
              {showLogin ? renderLogin() : <LandingPage key="landing" onLoginClick={() => setShowLogin(true)} lang={lang} />}
          </AnimatePresence>
        ) : (
          <>
              {currentUser.hasCompletedTutorial === false && (
                  <TutorialOverlay onComplete={handleTutorialComplete} onChangeView={setCurrentView} lang={lang} />
              )}

              {currentView === AppView.MODERATION && !currentUser.hasCompletedModTutorial && (
                  <ModTutorialOverlay onComplete={handleModTutorialComplete} lang={lang} />
              )}

              <Navbar 
                  currentView={currentView} 
                  onChangeView={setCurrentView} 
                  currentUser={currentUser} 
                  onLogout={handleLogout} 
                  lang={lang}
                  toggleLanguage={toggleLanguage}
                  onOpenThemes={() => setIsThemeModalOpen(true)}
                  isLowPowerMode={isLowPowerMode}
                  toggleLowPowerMode={toggleLowPowerMode}
              />

              {originalAdminUser && (
                  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
                      <button 
                          onClick={() => {
                              setCurrentUser(originalAdminUser);
                              setDisplayPoints(originalAdminUser.totalPoints);
                              setOriginalAdminUser(null);
                              setCurrentView(AppView.HOME);
                          }}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 border border-purple-400 transition-all"
                      >
                          <Shield className="w-4 h-4" />
                          {lang === 'ar' ? 'العودة للمشرف' : 'Back to Admin'}
                      </button>
                  </div>
              )}

              {/* Website Layout Main Content Area */}
              <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-16rem)]">
                  <AnimatePresence mode="wait">
                      {currentView === AppView.HOME && (
                          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                              {renderDashboard()}
                          </motion.div>
                      )}
                      {currentView === AppView.LEADERBOARD && (
                          <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                              <Leaderboard users={users} currentUserId={currentUser.id} lang={lang} />
                          </motion.div>
                      )}
                      {currentView === AppView.LOG_ACTION && (
                          <motion.div key="log" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                              <ActionLog 
                                  onPointsAwarded={handlePointsAwarded} 
                                  onActionPendingReview={handleActionPendingReview}
                                  onActionRejected={handleActionRejected}
                                  currentStreak={currentUser.currentStreak}
                                  lang={lang} 
                                  section={currentUser.section}
                                  userName={currentUser.name}
                                  isLowPowerMode={isLowPowerMode}
                              />
                          </motion.div>
                      )}
                      {currentView === AppView.REWARDS && (
                          <motion.div key="rewards" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                              <Rewards lang={lang} />
                          </motion.div>
                      )}
                      {currentView === AppView.PROTOCOLS && (
                          <motion.div key="protocols" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                              <Reminders 
                                  reminders={currentUser.reminders || []} 
                                  onAdd={handleAddReminder} 
                                  onDelete={handleDeleteReminder}
                                  currentStreak={currentUser.currentStreak}
                                  lastLogDate={currentUser.lastLogDate}
                                  lang={lang} 
                              />
                          </motion.div>
                      )}
                      {currentView === AppView.PROFILE && currentUser && (
                          <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                              <Profile 
                                  currentUser={currentUser} 
                                  users={users} 
                                  onUpdateUser={handleUpdateUser} 
                                  onUpdateUsers={handleUpdateUsers} 
                                  onSwitchUser={(user) => {
                                      if (currentUser.role === 'admin') {
                                          setOriginalAdminUser(currentUser);
                                      }
                                      setCurrentUser(user);
                                      setDisplayPoints(user.totalPoints);
                                      setCurrentView(AppView.HOME);
                                  }}
                                  lang={lang} 
                              />
                          </motion.div>
                      )}
                      {currentView === AppView.MODERATION && (
                          <motion.div key="moderation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                              <Moderation 
                                  currentUser={currentUser}
                                  users={users}
                                  onApprove={handleApproveAction}
                                  onReject={handleRejectAction}
                                  onReassignModerator={handleReassignModerator}
                                  onSendToAdmin={handleSendToAdmin}
                              />
                          </motion.div>
                      )}
                      {currentView === AppView.ABOUT && (
                          <motion.div key="about" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                              <About lang={lang} />
                          </motion.div>
                      )}
                      {currentView === AppView.ANALYTICS && (
                          <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                              <Analytics user={currentUser} lang={lang} />
                          </motion.div>
                      )}
                      {currentView === AppView.FAQ && (
                          <motion.div key="faq" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                              <FAQ lang={lang} />
                          </motion.div>
                      )}
                  </AnimatePresence>
              </main>

              {/* Website Footer */}
              <footer className="py-12 border-t border-white/5 bg-black/20 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-eco-500/10 p-2 rounded-xl">
                      <Leaf className="h-5 w-5 text-eco-500" />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">EcoRank</span>
                  </div>
                  <div className="text-gray-500 text-sm font-mono">
                    © 2026 Student Sustainability Initiative
                  </div>
                  <div className="flex gap-6">
                    <button onClick={() => setCurrentView(AppView.ABOUT)} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">{t.navAbout}</button>
                    <button onClick={() => setCurrentView(AppView.FAQ)} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">{t.navFAQ}</button>
                  </div>
                </div>
              </footer>
          </>
        )}
        
        {streakData.show && <StreakOverlay streak={streakData.val} type={streakData.type} onComplete={() => setStreakData(prev => ({ ...prev, show: false }))} lang={lang} />}
        {activeAlert && <NotificationOverlay title={activeAlert.title} time={activeAlert.time} onDismiss={() => setActiveAlert(null)} lang={lang} />}
        <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} currentThemeId={currentTheme.id} onThemeSelect={handleThemeChange} lang={lang} currentUser={currentUser} />
      </div>
    </MotionConfig>
  );
}

export default App;
