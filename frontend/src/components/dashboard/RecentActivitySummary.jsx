import React from 'react';
import { ChevronRight, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../utils';

const TransactionItem = ({ transaction }) => {
  const isIncome = transaction.type === 'income';
  const icon = isIncome ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  const bgColor = isIncome ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500';

  return (
    <div className="flex items-center justify-between p-4 bg-gray-900/40 border border-gray-800/50 rounded-2xl group hover:bg-gray-900 hover:border-gray-700 transition-all duration-300 cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={cn("w-11 h-11 rounded-2xl border flex items-center justify-center", bgColor)}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-white text-sm font-bold tracking-tight">{transaction.description || transaction.category}</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
            {format(new Date(transaction.date), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className={cn("px-2.5 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest", isIncome ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500")}>
          {transaction.category}
        </div>
        <div className="flex flex-col items-end min-w-[100px]">
          <span className={cn("text-sm font-bold tracking-tight", isIncome ? 'text-green-400' : 'text-red-400')}>
            {isIncome ? '+' : '-'}${Math.abs(transaction.amount)?.toLocaleString('en-US', {minimumFractionDigits: 2})}
          </span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{transaction.type}</span>
        </div>
      </div>
    </div>
  );
};

const RecentActivitySummary = ({ recentTransactions = [], summary = null }) => {
  // Calculate transaction stats
  const totalTransactions = recentTransactions.length;
  const incomeCount = recentTransactions.filter(t => t.type === 'income').length;
  const expenseCount = recentTransactions.filter(t => t.type === 'expense').length;
  const totalIncome = recentTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = recentTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="bg-[#0D0D0D] border border-gray-800/50 rounded-[32px] p-8 relative overflow-hidden group h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-indigo-400" />
          <h3 className="text-white text-lg font-bold tracking-tight">Recent Activity</h3>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8 relative z-10">
        <div className="p-4 bg-gray-900/40 border border-gray-800/50 rounded-2xl">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Total</div>
          <div className="text-2xl font-bold text-white">{totalTransactions}</div>
          <div className="text-[9px] text-gray-600 mt-1">Transactions</div>
        </div>

        <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl">
          <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest mb-2">Income</div>
          <div className="text-2xl font-bold text-green-400">{incomeCount}</div>
          <div className="text-[9px] text-green-600/70 mt-1">${totalIncome?.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
        </div>

        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
          <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-2">Expenses</div>
          <div className="text-2xl font-bold text-red-400">{expenseCount}</div>
          <div className="text-[9px] text-red-600/70 mt-1">${totalExpense?.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
        </div>

        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
          <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-2">Net</div>
          <div className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${Math.abs(totalIncome - totalExpense)?.toLocaleString('en-US', {maximumFractionDigits: 0})}
          </div>
          <div className={`text-[9px] mt-1 ${totalIncome - totalExpense >= 0 ? 'text-green-600/70' : 'text-red-600/70'}`}>
            {totalIncome - totalExpense >= 0 ? 'Positive' : 'Deficit'}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-4 mb-8 flex-1 relative z-10 overflow-y-auto max-h-[300px]">
        {recentTransactions && recentTransactions.length > 0 ? (
          recentTransactions.map((transaction, idx) => (
            <TransactionItem key={idx} transaction={transaction} />
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            No recent transactions
          </div>
        )}
      </div>

      {/* Footer */}
      {recentTransactions && recentTransactions.length > 0 && (
        <div className="pt-8 border-t border-gray-800/50 relative z-10">
        </div>
      )}

      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700"></div>
    </div>
  );
};

export default RecentActivitySummary;
