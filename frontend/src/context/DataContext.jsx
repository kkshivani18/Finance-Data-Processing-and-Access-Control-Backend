import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user, token } = useAuth();
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    summary: null,
    categories: [],
    trends: [],
    weekly: [],
    recent: [],
    insights: null
  });
  
  // Records data
  const [records, setRecords] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState({
    dashboard: false,
    records: false
  });
  
  const [error, setError] = useState({
    dashboard: '',
    records: ''
  });

  const API_BASE = 'http://localhost:8000';

  const fetchDashboardData = useCallback(async () => {
    if (!token || !user) return;

    setLoading(prev => ({ ...prev, dashboard: true }));
    setError(prev => ({ ...prev, dashboard: '' }));

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [summaryRes, categoriesRes, trendsRes, weeklyRes, recentRes, insightsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/dashboard/summary`, config),
        axios.get(`${API_BASE}/api/dashboard/categories`, config),
        axios.get(`${API_BASE}/api/dashboard/trends`, config),
        axios.get(`${API_BASE}/api/dashboard/weekly`, config),
        axios.get(`${API_BASE}/api/dashboard/recent`, config),
        axios.get(`${API_BASE}/api/dashboard/insights`, config)
      ]);

      const newData = {
        summary: summaryRes.data.data,
        categories: categoriesRes.data.data,
        trends: trendsRes.data.data,
        weekly: weeklyRes.data.data,
        recent: recentRes.data.data,
        insights: insightsRes.data.data
      };

      setDashboardData(newData);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load dashboard data';
      setError(prev => ({ ...prev, dashboard: errorMsg }));
      console.error('Error fetching dashboard data:', err);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  }, [token, user]);

  // Fetch records
  const fetchRecords = useCallback(async () => {
    if (!token || !user) return;
    
    // Check role access
    if (user.role === 'viewer') {
      setError(prev => ({ ...prev, records: 'Access denied' }));
      return;
    }

    setLoading(prev => ({ ...prev, records: true }));
    setError(prev => ({ ...prev, records: '' }));

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API_BASE}/api/records`, config);
      setRecords(response.data.data || []);
    } catch (err) {
      const errorMsg = 'Failed to fetch records: ' + (err.response?.data?.detail || err.message);
      setError(prev => ({ ...prev, records: errorMsg }));
    } finally {
      setLoading(prev => ({ ...prev, records: false }));
    }
  }, [token, user]);

  // Add record
  const addRecord = useCallback(async (formData) => {
    if (!token || user?.role === 'viewer' && user?.role !== 'analyst') return;

    try {
      const payload = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: new Date(formData.date).toISOString()
      };

      const response = await axios.post(
        `${API_BASE}/api/records`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setRecords(prev => [...prev, response.data.data]);
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to add record';
      setError(prev => ({ ...prev, records: errorMsg }));
      return { success: false, error: errorMsg };
    }
  }, [token, user]);

  // Update record
  const updateRecord = useCallback(async (id, formData) => {
    if (!token || user?.role === 'viewer') return;

    try {
      const payload = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: new Date(formData.date).toISOString()
      };

      const response = await axios.put(
        `${API_BASE}/api/records/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setRecords(prev =>
          prev.map(record => record._id === id ? response.data.data : record)
        );
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update record';
      setError(prev => ({ ...prev, records: errorMsg }));
      return { success: false, error: errorMsg };
    }
  }, [token, user]);

  // Delete record (admin only)
  const deleteRecord = useCallback(async (id) => {
    if (!token || user?.role !== 'admin') return;

    try {
      const response = await axios.delete(
        `${API_BASE}/api/records/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setRecords(prev => prev.filter(record => record._id !== id));
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete record';
      setError(prev => ({ ...prev, records: errorMsg }));
      return { success: false, error: errorMsg };
    }
  }, [token, user]);

  const canAccessRecords = useCallback(() => {
    return user?.role === 'analyst' || user?.role === 'admin';
  }, [user]);

  const canEditRecords = useCallback(() => {
    return user?.role === 'analyst' || user?.role === 'admin';
  }, [user]);

  const canDeleteRecords = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  useEffect(() => {
    if (user && token) {
      fetchDashboardData();
    }
  }, [user, token, fetchDashboardData]);

  useEffect(() => {
    if (user && token && canAccessRecords()) {
      fetchRecords();
    }
  }, [user, token, canAccessRecords, fetchRecords]);

  const value = {
    dashboardData,
    dashboardLoading: loading.dashboard,
    dashboardError: error.dashboard,
    fetchDashboardData,

    records,
    recordsLoading: loading.records,
    recordsError: error.records,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,

    // Access control
    canAccessRecords,
    canEditRecords,
    canDeleteRecords
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
