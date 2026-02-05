import React from 'react';
import { AppView } from '../types';
import { LayoutDashboard, Trophy, Leaf, Gift, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  currentUser: string | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView, currentUser, onLogout }) => {
  const navItems = [
    { id: AppView.HOME, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.LOG_ACTION, label: 'Log Action', icon: Leaf },
    { id: AppView.LEADERBOARD, label: 'Leaderboard', icon: Trophy },
    { id: AppView.REWARDS, label: 'Rewards', icon: Gift },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-eco-950/90 backdrop-blur-md border-t border-eco-800 md:relative md:border-t-0 md:bg-transparent z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo - Hidden on mobile if needed, but keeping for branding */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="bg-eco-500 p-2 rounded-full">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className="hidden md:block">
                <span className="text-xl font-bold text-white block leading-none">EcoRank</span>
                <span className="text-[9px] text-eco-300 uppercase tracking-widest block leading-none mt-1">MAIS School</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeView(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentView === item.id
                      ? 'bg-eco-500 text-white shadow-lg shadow-eco-500/20'
                      : 'text-eco-200 hover:bg-eco-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Profile / Logout */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-eco-200 text-sm">Hello, <span className="font-bold text-white">{currentUser}</span></span>
            <button
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-red-500/20 text-eco-200 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Nav (Icons only) */}
          <div className="flex md:hidden w-full justify-around items-center">
             {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeView(item.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                    currentView === item.id
                      ? 'text-eco-400'
                      : 'text-eco-600 hover:text-eco-300'
                  }`}
                >
                  <item.icon className={`h-6 w-6 ${currentView === item.id ? 'fill-current' : ''}`} />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </button>
              ))}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;