import React from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { cn } from '../../utils';

const CalendarView = ({ selectedDate = new Date(), monthlyData = [] }) => {
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const currentMonthNum = currentMonth.getMonth() + 1;
  const monthData = monthlyData.find(m => m.monthNum === currentMonthNum);
  const currentBalance = monthData ? monthData.net : 0;
  const isPositive = currentBalance >= 0;

  return (
    <div className="bg-[#0D0D0D] border border-gray-800/50 rounded-[32px] p-8 relative overflow-hidden group h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <button 
          onClick={prevMonth}
          className="w-10 h-10 bg-gray-900/40 border border-gray-800/50 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all hover:bg-gray-800"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-white text-lg font-bold tracking-tight flex-1 text-center">
          {format(currentMonth, 'MMMM, yyyy')}
        </span>
        <button 
          onClick={nextMonth}
          className="w-10 h-10 bg-gray-900/40 border border-gray-800/50 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all hover:bg-gray-800"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-2 relative z-10 flex-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
          <div key={idx} className="text-[10px] text-gray-600 font-black text-center mb-4 uppercase tracking-[0.2em]">{day}</div>
        ))}
        {days.map((day, idx) => (
          <div 
            key={idx} 
            className={cn(
              "h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer mx-auto relative group/day",
              isSameDay(day, new Date()) 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-gray-500 hover:text-white hover:bg-gray-800/50"
            )}
          >
            {format(day, 'd')}
            {isSameDay(day, new Date()) && (
              <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-gray-800/50 relative z-10">
        <div className="flex items-center justify-between p-6 bg-gray-900/20 border border-gray-800/30 rounded-[24px] group-hover:bg-gray-900/40 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
              <TrendingUp size={20} className={isPositive ? "text-emerald-400" : "text-red-400"} />
            </div>
            <div>
              <div className={`text-4xl font-bold tracking-tighter ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                ${Math.abs(currentBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 opacity-60">
                {format(currentMonth, 'MMMM')} Balance
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700"></div>
    </div>
  );
};

export default CalendarView;
