import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '../../utils';
import { Info } from 'lucide-react';

const COLORS = ['#FF8A00', '#FF3D00', '#FFD600', '#00E0FF', '#7000FF', '#4B5563'];

const SpendingDonut = ({ data, totalSpending }) => {
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const generateInsights = () => {
    if (!data || data.length === 0) {
      return "No spending data available.";
    }

    const sorted = [...data].sort((a, b) => b.amount - a.amount);
    
    if (sorted.length === 1) {
      return `Your spending is concentrated on ${capitalizeFirstLetter(sorted[0].category)} (${((sorted[0].amount / totalSpending) * 100).toFixed(1)}% of total).`;
    }

    if (sorted.length === 2) {
      const pct1 = ((sorted[0].amount / totalSpending) * 100).toFixed(1);
      const pct2 = ((sorted[1].amount / totalSpending) * 100).toFixed(1);
      return `Most expenses come from ${capitalizeFirstLetter(sorted[0].category)} (${pct1}%) and ${capitalizeFirstLetter(sorted[1].category)} (${pct2}%).`;
    }

    const pct1 = ((sorted[0].amount / totalSpending) * 100).toFixed(1);
    const pct2 = ((sorted[1].amount / totalSpending) * 100).toFixed(1);
    return `Most expenses come from ${capitalizeFirstLetter(sorted[0].category)} (${pct1}%) and ${capitalizeFirstLetter(sorted[1].category)} (${pct2}%). Monitor these categories to optimize spending.`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A1A] border border-gray-800 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-white font-bold text-sm mb-1">{capitalizeFirstLetter(payload[0].payload.category)}</p>
          <p className="text-red-400 text-xs font-bold">${payload[0].value?.toLocaleString()}</p>
          <p className="text-gray-500 text-[10px] mt-1">{((payload[0].value / totalSpending) * 100).toFixed(1)}% of spending</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0D0D0D] border border-gray-800/50 rounded-[32px] p-8 relative overflow-hidden group h-full flex flex-col">
      <div className="flex items-center justify-center mb-6 relative z-10">
        <h3 className="text-white text-lg font-bold tracking-tight">Spending</h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="w-full h-[220px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={8}
                dataKey="amount"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />}
                position={{ x: 0, y: 0 }}
                offset={20}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-2xl font-bold text-white tracking-tight leading-none">${totalSpending?.toLocaleString()}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 opacity-60">Total</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-6 w-full px-4">
          {data.map((item, index) => (
            <div key={item.category} className="flex items-center gap-2.5 group/item cursor-pointer">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-gray-400 text-[11px] font-bold group-hover/item:text-gray-200 transition-colors">{capitalizeFirstLetter(item.category)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-900/20 border border-gray-800/30 rounded-2xl flex items-start gap-3 relative z-10 group-hover:bg-gray-900/40 transition-all duration-300">
        <Info size={16} className="text-gray-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
          {generateInsights()}
        </p>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-orange-500/10 transition-all duration-700"></div>
    </div>
  );
};

export default SpendingDonut;
