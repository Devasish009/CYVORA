import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, change, changeType = 'positive', subtext, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: {
      bg: 'from-blue-600/20 to-indigo-600/10 text-blue-400 border-blue-500/30',
      spark: '#3b82f6',
    },
    cyan: {
      bg: 'from-cyan-600/20 to-blue-600/10 text-cyan-400 border-cyan-500/30',
      spark: '#06b6d4',
    },
    rose: {
      bg: 'from-rose-600/20 to-red-600/10 text-rose-400 border-rose-500/30',
      spark: '#f43f5e',
    },
    emerald: {
      bg: 'from-emerald-600/20 to-green-600/10 text-emerald-400 border-emerald-500/30',
      spark: '#10b981',
    },
    purple: {
      bg: 'from-purple-600/20 to-indigo-600/10 text-purple-400 border-purple-500/30',
      spark: '#a855f7',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-b from-[#111827]/90 to-[#0f172a]/90 border border-slate-800/80 hover:border-slate-700 glass-panel-hover flex flex-col justify-between space-y-3 group shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 tracking-wide">{title}</span>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${scheme.bg} border shadow-inner`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-1">
          <h3 className="text-2xl font-heading font-extrabold text-white tracking-tight">{value}</h3>
          
          {change && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              changeType === 'positive' 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' 
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
            }`}>
              {changeType === 'positive' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {change}
            </span>
          )}
        </div>

        {/* Dynamic Sparkline Accent Line */}
        <div className="w-full h-1 bg-slate-800/60 rounded-full overflow-hidden mt-1">
          <div 
            className="h-full rounded-full transition-all duration-500" 
            style={{ 
              backgroundColor: scheme.spark, 
              width: color === 'rose' ? '65%' : color === 'emerald' ? '92%' : '80%' 
            }}
          ></div>
        </div>

        {subtext && (
          <p className="text-[10px] text-slate-500 pt-1 font-medium">{subtext}</p>
        )}
      </div>
    </div>
  );
}

