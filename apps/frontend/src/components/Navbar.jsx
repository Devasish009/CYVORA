import React, { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, Activity, ShieldCheck, Sparkles } from 'lucide-react';
import apiService from '../services/api';

export default function Navbar({ activeProject, setActiveProject, onAnalyzeClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await apiService.getProjects();
        if (res.success && Array.isArray(res.data)) {
          setProjects(res.data);
          if (res.data.length > 0 && !activeProject) {
            setActiveProject(res.data[0].id);
          }
        }
      } catch (e) {
        console.error("Navbar project load error:", e);
      }
    }
    loadProjects();
  }, []);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onAnalyzeClick();
    }, 600);
  };

  const notifications = [
    { title: 'Database Connected', desc: 'SQLAlchemy / SQLite database persistent engine initialized.', time: 'Live', unread: true },
    { title: 'Hindsight Memory Layer Active', desc: 'Vector & relational incident memory ready for recall.', time: 'Live', unread: false },
  ];

  return (
    <header className="h-16 px-6 glass-nav sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80">
      {/* Left: Project Selector & Status Badge */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <select
            value={activeProject}
            onChange={(e) => setActiveProject(e.target.value)}
            className="appearance-none bg-slate-900/90 border border-slate-700/70 hover:border-slate-600 text-slate-100 text-xs font-semibold py-2 pl-3.5 pr-8 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer shadow-inner transition-colors"
          >
            {projects.length > 0 ? (
              projects.map(p => (
                <option key={p.id} value={p.id}>📁 {p.name} ({p.framework})</option>
              ))
            ) : (
              <option value="none">No projects registered</option>
            )}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="ml-1 font-semibold text-[11px] tracking-wide">AI Engine Online</span>
        </div>
      </div>

      {/* Right: Search, Notifications, User Profile */}
      <div className="flex items-center gap-3.5">
        {/* Search Bar */}
        <div className="relative w-64 hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects, errors, patches..."
            className="w-full bg-slate-900/80 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-12 py-2 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
          />
          <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-800 border border-slate-700/60 rounded">
            Ctrl K
          </kbd>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 group shrink-0"
        >
          {analyzing ? (
            <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-200" />
          ) : (
            <Activity className="w-3.5 h-3.5 text-cyan-200 group-hover:rotate-12 transition-transform" />
          )}
          <span>{analyzing ? 'Scanning...' : 'Run AI Scan'}</span>
        </button>

        {/* Notifications Button with Popover */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 right-2 animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl glass-panel p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[10px] text-cyan-400 font-semibold cursor-pointer">Mark all as read</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:bg-slate-800/80 transition-colors text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{n.title}</span>
                      <span className="text-[10px] font-normal text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800/80">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-extrabold border border-blue-400/40 shadow-md shadow-blue-500/20">
            CY
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-extrabold text-white flex items-center gap-1">
              CYVORA User
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Developer</div>
          </div>
        </div>
      </div>
    </header>
  );
}
