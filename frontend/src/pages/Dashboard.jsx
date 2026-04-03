import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Layout from '../components/Layout';
import RevenueChart from '../components/dashboard/RevenueChart';
import SpendingDonut from '../components/dashboard/SpendingDonut';
import CalendarView from '../components/dashboard/CalendarView';
import RecentActivitySummary from '../components/dashboard/RecentActivitySummary';
import AISummary from '../components/dashboard/AISummary';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { dashboardData: data, dashboardLoading: loading, dashboardError: error } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <div className="absolute inset-0 blur-xl bg-indigo-500/20 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  const safeData = data || {
    summary: null,
    categories: [],
    trends: [],
    weekly: [],
    recent: []
  };

  const displayCategories = (safeData.categories && safeData.categories.length > 0) 
    ? safeData.categories.filter(c => c.type === 'expense')
    : [];

  return (
    <Layout title="Dashboard">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 animate-in fade-in slide-in-from-top-4 duration-500">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Revenue Chart - Full Width (12 cols) */}
        <div className="col-span-12">
          <RevenueChart 
            monthlyData={safeData.trends || []}
            weeklyData={safeData.weekly || []}
          />
        </div>

        {/* Calendar - 6 cols */}
        <div className="col-span-6">
          <CalendarView monthlyData={safeData.trends || []} />
        </div>

        {/* Spending Donut - 6 cols */}
        <div className="col-span-6">
          <SpendingDonut 
            data={displayCategories} 
            totalSpending={safeData.summary?.total_expense || 28165} 
          />
        </div>

        {/* Recent Activity & Summary */}
        <div className="col-span-12">
          <RecentActivitySummary 
            recentTransactions={safeData.recent || []}
            summary={safeData.summary}
          />
        </div>

        {/* AI Summary & Forecast */}
        <div className="col-span-12">
          <AISummary 
            insights={safeData.insights}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
