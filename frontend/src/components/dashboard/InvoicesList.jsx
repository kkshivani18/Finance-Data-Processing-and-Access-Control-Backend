import React from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { cn } from '../../utils';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const styles = {
    Paid: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    Unpaid: "bg-red-500/10 border-red-500/20 text-red-500",
    Pending: "bg-orange-500/10 border-orange-500/20 text-orange-500"
  };

  return (
    <div className={cn("px-2.5 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest", styles[status])}>
      {status}
    </div>
  );
};

const InvoiceItem = ({ date, user, amount, status }) => (
  <div className="flex items-center justify-between p-4 bg-gray-900/40 border border-gray-800/50 rounded-2xl group hover:bg-gray-900 hover:border-gray-700 transition-all duration-300 cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:text-white transition-colors">
        {format(new Date(date), 'MMM d')}
      </div>
      <div className="flex flex-col">
        <span className="text-white text-sm font-bold tracking-tight">{user}</span>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">in 1 week</span>
      </div>
    </div>

    <div className="flex items-center gap-8">
      <StatusBadge status={status} />
      <div className="flex flex-col items-end min-w-[100px]">
        <span className="text-white text-sm font-bold tracking-tight">${amount?.toLocaleString()}</span>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">amount</span>
      </div>
    </div>
  </div>
);

const InvoicesList = ({ invoices }) => {
  return (
    <div className="bg-[#0D0D0D] border border-gray-800/50 rounded-[32px] p-8 relative overflow-hidden group h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-white text-lg font-bold tracking-tight">Invoices</h3>
        <button className="w-10 h-10 bg-indigo-600 border border-indigo-500/50 rounded-xl flex items-center justify-center text-white hover:bg-indigo-700 transition-all hover:scale-110 shadow-lg shadow-indigo-600/20">
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-4 mb-8 flex-1 relative z-10">
        {invoices.map((invoice, idx) => (
          <InvoiceItem key={idx} {...invoice} />
        ))}
      </div>

      <div className="pt-8 border-t border-gray-800/50 flex items-center justify-between relative z-10">
        <button className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2 group/btn">
          View all invoices
          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700"></div>
    </div>
  );
};

export default InvoicesList;
