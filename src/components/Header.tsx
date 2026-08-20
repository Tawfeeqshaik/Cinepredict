import React from 'react';
import { UserProfile } from '../types';
import { Film, Sparkles, User, LogOut, Clapperboard, Eye, BrainCircuit } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  onRoleToggle: (newRole: 'producer' | 'viewer') => void;
  onLogout: () => void;
  onOpenChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onRoleToggle,
  onLogout,
  onOpenChat
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                CINE<span className="text-emerald-400">PREDICT</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                AI ENGINE 2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Data Science & ML Predictive Intelligence Platform
            </p>
          </div>
        </div>

        {/* Middle Role Switcher Pill */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onRoleToggle('producer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              user.role === 'producer'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Producer Dashboard</span>
          </button>

          <button
            onClick={() => onRoleToggle('viewer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              user.role === 'viewer'
                ? 'bg-teal-400 text-slate-950 font-semibold shadow-md shadow-teal-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Viewer Feed</span>
          </button>
        </div>

        {/* Right Action Menu */}
        <div className="flex items-center gap-3">
          {/* AI Chatbot Launcher */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-emerald-500/50 text-emerald-400 text-xs font-medium transition-all hover:bg-slate-800"
          >
            <BrainCircuit className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="hidden md:inline">AI Assistant</span>
          </button>

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-medium text-slate-200">{user.username}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user.role} Account</p>
            </div>
            <button
              onClick={onLogout}
              title="Log Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
