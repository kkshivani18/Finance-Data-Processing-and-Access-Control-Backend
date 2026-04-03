import React from 'react';
import { TrendingUp, TrendingDown, Zap, AlertCircle } from 'lucide-react';
import { cn } from '../../utils';

const AISummary = ({ insights = null, loading = false }) => {
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  if (loading) {
    return (
      <div className="bg-[#0D0D0D] border border-gray-800/50 rounded-[32px] p-8 relative overflow-hidden group">
        <div className="h-40 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading Insights</div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  const trend = insights.trend;
  const trendIcon = trend === 'increasing' ? <TrendingUp size={20} /> : <TrendingDown size={20} />;
  const trendColor = trend === 'increasing' ? 'text-red-400' : trend === 'decreasing' ? 'text-green-400' : 'text-blue-400';
  const trendBgColor = trend === 'increasing' ? 'bg-red-500/10' : trend === 'decreasing' ? 'bg-green-500/10' : 'bg-blue-500/10';
  const trendBorderColor = trend === 'increasing' ? 'border-red-500/20' : trend === 'decreasing' ? 'border-green-500/20' : 'border-blue-500/20';

  return (
    <div className="bg-[#0D0D0D] border border-gray-800/50 rounded-[32px] p-8 relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <Zap size={20} className="text-yellow-400" />
          <h3 className="text-white text-lg font-bold tracking-tight">AI Summary & Forecast</h3>
        </div>
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest", trendBgColor, trendBorderColor, trendColor)}>
          {trendIcon}
          <span>{trend}</span>
          {insights.trend_percent !== 0 && <span>{Math.abs(insights.trend_percent).toFixed(1)}%</span>}
        </div>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-2xl relative z-10">
        <p className="text-gray-300 text-sm leading-relaxed font-medium">
          {insights.summary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        {/* Current Month */}
        <div className="p-4 bg-gray-900/40 border border-gray-800/50 rounded-2xl">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Current Month Spending</div>
          <div className="text-2xl font-bold text-white">${insights.current_month_spending?.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
          <div className="text-[9px] text-gray-600 mt-1">{insights.days_passed} of {insights.days_passed + insights.days_remaining} days</div>
        </div>

        {/* Projected */}
        <div className={cn("p-4 border rounded-2xl", trend === 'increasing' ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20')}>
          <div className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", trend === 'increasing' ? 'text-red-500' : 'text-green-500')}>Projected Month End</div>
          <div className={cn("text-2xl font-bold", trend === 'increasing' ? 'text-red-400' : 'text-green-400')}>
            ${insights.projected_month_spending?.toLocaleString('en-US', {maximumFractionDigits: 0})}
          </div>
          <div className={cn("text-[9px] mt-1", trend === 'increasing' ? 'text-red-600/70' : 'text-green-600/70')}>
            {Math.ceil(insights.days_remaining)} days left
          </div>
        </div>

        {/* Daily Average */}
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
          <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-2">Daily Average</div>
          <div className="text-2xl font-bold text-blue-400">${insights.daily_average?.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
          <div className="text-[9px] text-blue-600/70 mt-1">per day</div>
        </div>

        {/* Previous Month */}
        <div className="p-4 bg-gray-900/40 border border-gray-800/50 rounded-2xl">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Previous Month</div>
          <div className="text-2xl font-bold text-white">${insights.previous_month_spending?.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
          <div className="text-[9px] text-gray-600 mt-1">total spending</div>
        </div>
      </div>

      {/* Top Categories */}
      {insights.top_categories && insights.top_categories.length > 0 && (
        <div className="mb-6 relative z-10">
          <div className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Top Spending Categories</div>
          <div className="space-y-3">
            {insights.top_categories.map((category, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white">{capitalizeFirstLetter(category.category)}</span>
                    <span className="text-xs text-gray-500">${category.amount?.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                  </div>
                  <div className="w-full bg-gray-900/40 border border-gray-800/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full" 
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-gray-600 mt-1">{category.percentage?.toFixed(1)}% of spending</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation Banner */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3 relative z-10">
        <AlertCircle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
        <div className="text-[11px] text-yellow-600/90 font-medium leading-relaxed">
          {trend === 'increasing' && "Your spending is trending up compared to last month. Consider setting stricter budget limits in high-spending categories."}
          {trend === 'decreasing' && "Great job! Your spending is lower than last month. Continue maintaining this discipline."}
          {trend === 'stable' && "Your spending pace is consistent with last month. Monitor your top categories to identify optimization opportunities."}
        </div>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-700"></div>
    </div>
  );
};

export default AISummary;
