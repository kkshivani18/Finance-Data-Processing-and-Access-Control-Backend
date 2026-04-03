import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '../../utils';

const RevenueChart = ({ monthlyData = [], weeklyData = [] }) => {
  const [activeTab, setActiveTab] = React.useState('Monthly');

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const incomeData = payload.find(p => p.dataKey === 'income');
      const expenseData = payload.find(p => p.dataKey === 'expense');
      
      const income = incomeData?.value || 0;
      const expense = expenseData?.value || 0;
      const netBalance = income - expense;
      const label = payload[0].payload.label;
      
      return (
        <div className="bg-[#1A1A1A] border border-gray-800 p-4 rounded-xl shadow-2xl backdrop-blur-xl space-y-2">
          <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">{label}</p>
          <p className="text-green-400 text-sm font-bold">📈 Revenue: ${income?.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          <p className="text-red-400 text-sm">📉 Expenses: ${expense?.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          <div className="border-t border-gray-700 pt-2">
            <p className={`text-sm font-bold ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              Net Balance: ${Math.abs(netBalance)?.toLocaleString('en-US', {minimumFractionDigits: 2})} {netBalance < 0 ? '(Loss)' : '(Saving)'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // monthly data 
  const transformedMonthlyData = (monthlyData && Array.isArray(monthlyData)) ? monthlyData.map(item => ({
    label: item.month || 'N/A',
    month: item.month || 'N/A',
    income: item.income || 0,
    expense: item.expense || 0,
  })) : [];

  const transformedWeeklyData = (weeklyData && Array.isArray(weeklyData)) ? weeklyData.map(item => ({
    label: item.day || 'N/A',
    day: item.day || 'N/A',
    income: item.income || 0,
    expense: item.expense || 0,
  })) : [];

  const displayData = activeTab === 'Weekly' ? transformedWeeklyData : transformedMonthlyData;

  const isDataEmpty = !displayData || displayData.length === 0;
  
  // Always create fallback data structure if missing
  const chartData = isDataEmpty ? (
    activeTab === 'Weekly' 
      ? [{ label: 'Mon', day: 'Mon', income: 0, expense: 0 }, { label: 'Tue', day: 'Tue', income: 0, expense: 0 }, { label: 'Wed', day: 'Wed', income: 0, expense: 0 }, { label: 'Thu', day: 'Thu', income: 0, expense: 0 }, { label: 'Fri', day: 'Fri', income: 0, expense: 0 }, { label: 'Sat', day: 'Sat', income: 0, expense: 0 }, { label: 'Sun', day: 'Sun', income: 0, expense: 0 }]
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({ label: month, month: month, income: 0, expense: 0 }))
  ) : displayData;
  
  const totalIncome = chartData.length > 0 ? chartData.reduce((sum, item) => sum + (item.income || 0), 0) : 0;
  const totalExpense = chartData.length > 0 ? chartData.reduce((sum, item) => sum + (item.expense || 0), 0) : 0;

  return (
    <div className="bg-[#0D0D0D] border border-gray-800/50 rounded-[32px] p-8 relative overflow-hidden group">
      <div className="flex items-centre justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-gray-400 text-sm font-medium tracking-wide mr-20 mb-4 uppercase opacity-60">Income vs Expenses</h3>
          <div className="flex items-baseline gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Income</span>
              <span className="text-3xl font-bold text-green-400 tracking-tighter">${totalIncome?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Expenses</span>
              <span className="text-3xl font-bold text-red-400 tracking-tighter">${totalExpense?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-900/40 p-1.5 rounded-2xl border border-gray-800/50">
            {['Weekly', 'Monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  activeTab === tab 
                    ? "bg-white text-black shadow-lg shadow-white/5" 
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isDataEmpty && (
        <div className="mb-4 p-4 bg-gray-900/40 border border-gray-700/50 rounded text-gray-400 text-xs font-mono">
          <p>Showing {activeTab === 'Weekly' ? 7 : 12} bar groups with Income and Expense comparison</p>
        </div>
      )}

      <div className="h-[350px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            barGap="50%"
            barCategoryGap="20%"
          >
            <CartesianGrid vertical={false} stroke="#1A1A1A" strokeDasharray="8 8" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 500 }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 500 }} 
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
              formatter={(value) => (
                <span className="text-xs">
                  {value === 'income' ? '📈 Income' : value === 'expense' ? '📉 Expenses' : value}
                </span>
              )}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)', radius: [12, 12, 12, 12] }} />
            <Bar 
              dataKey="income" 
              radius={[12, 12, 0, 0]}
              barSize={activeTab === 'Weekly' ? 40 : 30}
              fill="#22c55e"
              name="Income"
            />
            <Bar 
              dataKey="expense" 
              radius={[12, 12, 0, 0]}
              barSize={activeTab === 'Weekly' ? 40 : 30}
              fill="#ef4444"
              name="Expense"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none group-hover:bg-blue-500/10 transition-all duration-700"></div>
    </div>
  );
};

export default RevenueChart;
