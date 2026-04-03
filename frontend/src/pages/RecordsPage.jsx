import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Layout from '../components/Layout';
import { Plus, Edit2, Trash2, Search, Filter, FileText } from 'lucide-react';
import { cn } from '../utils';

const RecordsPage = () => {
  const { user } = useAuth();
  const { 
    records, 
    recordsLoading: loading, 
    recordsError: error,
    addRecord, 
    updateRecord, 
    deleteRecord,
    canAccessRecords,
    canEditRecords,
    canDeleteRecords
  } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [localError, setLocalError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'income',
    category: 'salary',
    date: new Date().toISOString().split('T')[0]
  });

  const isAdmin = user?.role === 'admin';
  const isAnalyst = user?.role === 'analyst';

  // Check access permission
  if (!canAccessRecords()) {
    return (
      <Layout title="Financial Records">
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-6">
            <FileText size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to access records. Only Analyst and Admin roles can view records.</p>
        </div>
      </Layout>
    );
  }

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!isAdmin) {
      setLocalError('Only admins can add records');
      return;
    }
    
    try {
      if (!formData.description || !formData.amount) {
        throw new Error('Description and amount are required');
      }

      if (parseFloat(formData.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const result = await addRecord(formData);
      if (result.success) {
        resetForm();
        setShowForm(false);
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to add record');
    }
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!canEditRecords()) {
      setLocalError('You do not have permission to edit records');
      return;
    }
    
    try {
      if (!formData.description || !formData.amount) {
        throw new Error('Description and amount are required');
      }

      if (parseFloat(formData.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const result = await updateRecord(editingId, formData);
      if (result.success) {
        resetForm();
        setShowForm(false);
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to update record');
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!canDeleteRecords()) {
      setLocalError('Only admins can delete records');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      setLocalError('');
      const result = await deleteRecord(id);
      if (!result.success) {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError('Failed to delete record: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEditRecord = (record) => {
    if (!canEditRecords()) {
      setLocalError('You do not have permission to edit records');
      return;
    }
    setEditingId(record._id);
    setFormData({
      description: record.description,
      amount: record.amount.toString(),
      type: record.type,
      category: record.category,
      date: new Date(record.date).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      type: 'income',
      category: 'salary',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
  };

  const getFilteredRecords = () => {
    return records.filter(record => {
      const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filters.type === '' || record.type === filters.type;
      const matchesCategory = filters.category === '' || record.category === filters.category;
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      const matchesStartDate = filters.startDate === '' || recordDate >= filters.startDate;
      const matchesEndDate = filters.endDate === '' || recordDate <= filters.endDate;

      return matchesSearch && matchesType && matchesCategory && matchesStartDate && matchesEndDate;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      type: '',
      category: '',
      startDate: '',
      endDate: ''
    });
  };

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

  const filteredRecords = getFilteredRecords();

  const totalIncome = filteredRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalExpense = filteredRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const netAmount = totalIncome - totalExpense;

  return (
    <Layout title="Financial Records">
      {(error || localError) && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
          <p className="text-sm font-bold">{localError || error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-[#0D0D0D] border border-gray-800/50 rounded-[32px] p-8 group hover:bg-gray-900/40 transition-all">
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4">Total Income</div>
          <div className="text-4xl font-bold text-white tracking-tighter">
            ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black rounded-lg">
              {filteredRecords.filter(r => r.type === 'income').length} transactions
            </span>
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-gray-800/50 rounded-[32px] p-8 group hover:bg-gray-900/40 transition-all">
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4">Total Expense</div>
          <div className="text-4xl font-bold text-white tracking-tighter">
            ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black rounded-lg">
              {filteredRecords.filter(r => r.type === 'expense').length} transactions
            </span>
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-gray-800/50 rounded-[32px] p-8 group hover:bg-gray-900/40 transition-all">
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4">Net Balance</div>
          <div className={`text-4xl font-bold tracking-tighter ${netAmount >= 0 ? 'text-indigo-400' : 'text-orange-400'}`}>
            ${netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-lg">
              Summary
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 bg-[#0D0D0D] border border-gray-800/50 rounded-2xl pl-12 pr-4 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all w-80"
            />
          </div>
          
          <select 
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="h-12 bg-[#0D0D0D] border border-gray-800/50 rounded-2xl px-4 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="h-12 bg-[#0D0D0D] border border-gray-800/50 rounded-2xl px-4 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="salary">Salary</option>
            <option value="food">Food</option>
            <option value="transportation">Transportation</option>
            <option value="entertainment">Entertainment</option>
            <option value="utilities">Utilities</option>
            <option value="other">Other</option>
          </select>

          <input 
            type="date" 
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="h-12 bg-[#0D0D0D] border border-gray-800/50 rounded-2xl px-4 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all"
            placeholder="Start Date"
          />

          <input 
            type="date" 
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            className="h-12 bg-[#0D0D0D] border border-gray-800/50 rounded-2xl px-4 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all"
            placeholder="End Date"
          />

          {(searchTerm || filters.type || filters.category || filters.startDate || filters.endDate) && (
            <button
              onClick={clearFilters}
              className="h-12 px-4 bg-gray-800/30 border border-gray-700 rounded-2xl text-gray-400 hover:text-white text-sm font-bold transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
        
        {isAdmin && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="h-12 px-8 bg-indigo-600 border border-indigo-500/50 rounded-2xl flex items-center gap-3 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 font-bold"
          >
            {showForm ? 'Cancel' : (
              <>
                <Plus size={20} />
                Add Record
              </>
            )}
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (isAdmin || isAnalyst) && (
        <div className="bg-[#0D0D0D] border border-gray-800/50 rounded-[32px] p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-xl font-bold text-white mb-8">{editingId ? 'Edit Record' : 'Add New Record'}</h2>
          <form onSubmit={editingId ? handleUpdateRecord : handleAddRecord} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-12 bg-gray-900/40 border border-gray-800/50 rounded-2xl px-5 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all"
                  placeholder="e.g., Monthly salary..."
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full h-12 bg-gray-900/40 border border-gray-800/50 rounded-2xl px-5 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={isAnalyst}
                  className="w-full h-12 bg-gray-900/40 border border-gray-800/50 rounded-2xl px-5 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-12 bg-gray-900/40 border border-gray-800/50 rounded-2xl px-5 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="salary">Salary</option>
                  <option value="food">Food</option>
                  <option value="transportation">Transportation</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="utilities">Utilities</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-12 bg-gray-900/40 border border-gray-800/50 rounded-2xl px-5 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="h-12 px-8 bg-transparent border border-gray-800 text-gray-400 font-bold rounded-2xl hover:bg-gray-800 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button type="submit" className="h-12 px-10 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5">
                {editingId ? 'Update Record' : 'Create Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-[#0D0D0D] border border-gray-800/50 rounded-[32px] overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-6">
              <FileText size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Records Yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Create your first financial record to get started with tracking your finances.</p>
            {isAdmin && (
              <button
                onClick={() => setShowForm(true)}
                className="h-12 px-8 bg-indigo-600 border border-indigo-500/50 rounded-2xl text-white hover:bg-indigo-700 transition-all font-bold"
              >
                + Add Your First Record
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="px-8 py-6 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Description</th>
                  <th className="px-8 py-6 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Amount</th>
                  <th className="px-8 py-6 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Category</th>
                  <th className="px-8 py-6 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Date</th>
                  {(isAdmin || isAnalyst) && <th className="px-8 py-6 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{record.description}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`text-sm font-black ${
                        record.type === 'income' ? 'text-emerald-400' : 'text-orange-400'
                      }`}>
                        {record.type === 'income' ? '+' : '-'}${record.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest",
                        record.type === 'income' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                          : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                      )}>
                        {record.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </td>
                    {(isAdmin || isAnalyst) && (
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="w-9 h-9 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteRecord(record._id)}
                              className="w-9 h-9 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecordsPage;
