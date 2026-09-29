import React from 'react';
import { 
  LayoutGrid,
  LayoutDashboard, 
  FolderGit2, 
  Code2, 
  AlertTriangle, 
  Wrench, 
  CheckCircle2, 
  History, 
  BrainCircuit, 
  Settings, 
  Zap,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navigationGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'showcase', label: '7-Screen UI Board', icon: LayoutGrid, highlight: true },
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
      ]
    },
    {
      title: 'INTELLIGENCE & ANALYSIS',
      items: [
        { id: 'projects', label: 'Project Health', icon: FolderGit2 },
        { id: 'code-analysis', label: 'Codebase Topology', icon: Code2 },
        { id: 'hindsight', label: 'Hindsight Memory', icon: BrainCircuit, badge: 'Live' },
      ]
    },
    {
      title: 'REPAIR ENGINE',
      items: [
        { id: 'errors', label: 'Error Matrix', icon: AlertTriangle, badge: '24' },
        { id: 'repairs', label: 'AI Patch Studio', icon: Wrench, badge: '22' },
        { id: 'test-results', label: 'Test Suites', icon: CheckCircle2 },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'activity-logs', label: 'Terminal Logs', icon: History },
        { id: 'landing', label: 'Landing Page', icon: Sparkles },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#090d16]/95 border-r border-slate-800/70 flex flex-col justify-between h-screen sticky top-0 z-40 select-none backdrop-blur-xl">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 border-2 border-[#090d16] animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-heading font-extrabold tracking-wider text-white">
                CYVORA
              </h1>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Autonomous Repair Engine</p>
          </div>
        </div>

        {/* Categorized Navigation Menu */}
        <nav className="px-3 py-4 space-y-5">
          {navigationGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase mb-1.5">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-600/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : item.badge === 'Live'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700/50'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.highlight && !item.badge && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Pro Plan Upgrade Card */}
      <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-blue-500/20 shadow-xl">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-white">CYVORA Hindsight Pro</span>
          </div>
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
          Vector memory recall & sandbox containers enabled.
        </p>
        <button 
          onClick={() => setActiveTab('hindsight')}
          className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-1 group"
        >
          <span>Explore Hindsight</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </aside>
  );
}

