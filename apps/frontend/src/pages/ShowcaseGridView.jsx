import React from 'react';
import LandingPage from './LandingPage';
import DashboardView from './DashboardView';
import ProjectOverviewView from './ProjectOverviewView';
import ErrorsView from './ErrorsView';
import RepairProcessView from './RepairProcessView';
import TestResultsView from './TestResultsView';
import ActivityLogsView from './ActivityLogsView';

export default function ShowcaseGridView({ onNavigate }) {
  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
            UI/UX Production Showcase Grid
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-1">CYVORA 7-Screen Case Study Board</h2>
          <p className="text-xs text-slate-400 mt-0.5">Showing all 7 desktop screens rendered live in the exact composite layout.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
          >
            Open Interactive Dashboard ➔
          </button>
        </div>
      </div>

      {/* TOP ROW: 1. Landing Page (Left ~50%) | 2. Main Dashboard (Right ~50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-[#0b0f17] shadow-2xl relative group">
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span>1. Landing Page (Home)</span>
            <span className="text-blue-400 text-[10px]">Screen 1</span>
          </div>
          <div className="p-4 transform scale-95 origin-top">
            <LandingPage onStartAnalysis={() => onNavigate('dashboard')} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-[#0b0f17] p-4 shadow-2xl">
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-between mb-4">
            <span>2. Main Dashboard</span>
            <span className="text-blue-400 text-[10px]">Screen 2</span>
          </div>
          <DashboardView onNavigate={onNavigate} />
        </div>
      </div>

      {/* MIDDLE ROW: 3. Project Overview (Left ~50%) | 4. Error Detection (Right ~50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-[#0b0f17] p-4 shadow-2xl">
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-between mb-4">
            <span>3. Project Overview</span>
            <span className="text-blue-400 text-[10px]">Screen 3</span>
          </div>
          <ProjectOverviewView onStartAnalysis={() => onNavigate('dashboard')} />
        </div>

        <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-[#0b0f17] p-4 shadow-2xl">
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-between mb-4">
            <span>4. Error Detection</span>
            <span className="text-blue-400 text-[10px]">Screen 4</span>
          </div>
          <ErrorsView onSelectError={() => onNavigate('repairs')} />
        </div>
      </div>

      {/* BOTTOM ROW: 5. AI Repair Process (Left ~45%) | 6. Test Results (Center ~25%) | 7. Activity Logs (Right ~30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-2xl border border-slate-800/80 overflow-hidden bg-[#0b0f17] p-4 shadow-2xl">
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-between mb-4">
            <span>5. AI Repair Process (Hero Feature)</span>
            <span className="text-blue-400 text-[10px]">Screen 5</span>
          </div>
          <RepairProcessView onBackToErrors={() => onNavigate('errors')} />
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-slate-800/80 overflow-hidden bg-[#0b0f17] p-4 shadow-2xl">
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-between mb-4">
            <span>6. Test Results</span>
            <span className="text-blue-400 text-[10px]">Screen 6</span>
          </div>
          <TestResultsView />
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-slate-800/80 overflow-hidden bg-[#0b0f17] p-4 shadow-2xl">
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-between mb-4">
            <span>7. Activity Logs</span>
            <span className="text-blue-400 text-[10px]">Screen 7</span>
          </div>
          <ActivityLogsView />
        </div>
      </div>
    </div>
  );
}
