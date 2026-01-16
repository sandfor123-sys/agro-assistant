'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  HardDrive, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Trash2,
  Settings,
  Zap,
  Shield,
  FileText
} from 'lucide-react';

export default function SystemHealthPage() {
  const [health, setHealth] = useState(null);
  const [logs, setLogs] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [updates, setUpdates] = useState(null);
  const [backups, setBackups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      const [healthRes, logsRes, cacheRes, updatesRes, backupsRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/logs?type=app&lines=50'),
        fetch('/api/cache'),
        fetch('/api/updates'),
        fetch('/api/backup')
      ]);

      const [healthData, logsData, cacheData, updatesData, backupsData] = await Promise.all([
        healthRes.json(),
        logsRes.json(),
        cacheRes.json(),
        updatesRes.json(),
        backupsRes.json()
      ]);

      setHealth(healthData);
      setLogs(logsData.logs || []);
      setCacheStats(cacheData.stats);
      setUpdates(updatesData.data);
      setBackups(backupsData);
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSystemData();
    setRefreshing(false);
  };

  const handleBackup = async (type) => {
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      if (response.ok) {
        await fetchSystemData(); // Refresh backup status
      }
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      await fetch('/api/cache', { method: 'DELETE' });
      await fetchSystemData();
    } catch (error) {
      console.error('Cache clear failed:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5" />;
      case 'unhealthy': return <XCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            System Health Dashboard
          </h1>
          <p className="text-text-secondary mt-2">
            Monitor and manage your AgriAssist platform
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Health Status */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Overall Status</h3>
              <div className={getStatusColor(health.status)}>
                {getStatusIcon(health.status)}
              </div>
            </div>
            <p className={`text-2xl font-bold capitalize ${getStatusColor(health.status)}`}>
              {health.status}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Last checked: {new Date(health.timestamp).toLocaleTimeString()}
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Memory</h3>
              <Database className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {health.checks.memory?.usage || 'N/A'}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {health.checks.memory?.heapUsed || 'N/A'} / {health.checks.memory?.heapTotal || 'N/A'}
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Database</h3>
              <Database className="w-5 h-5 text-primary" />
            </div>
            <p className={`text-2xl font-bold capitalize ${getStatusColor(health.checks.database?.status)}`}>
              {health.checks.database?.status || 'Unknown'}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Connection: {health.checks.database?.responseTime || 'Unknown'}
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Uptime</h3>
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {health.checks.uptime?.formatted || 'N/A'}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {health.checks.uptime?.seconds || 0} seconds
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Backup
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => handleBackup('database')}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Database Backup
            </button>
            <button
              onClick={() => handleBackup('files')}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Files Backup
            </button>
            <button
              onClick={() => handleBackup('full')}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Full Backup
            </button>
          </div>
          {backups && (
            <div className="mt-4 text-sm text-text-secondary">
              <p>Database backups: {backups.backups?.database || 0}</p>
              <p>Files backups: {backups.backups?.files || 0}</p>
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Cache
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleClearCache}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear Cache
            </button>
          </div>
          {cacheStats && (
            <div className="mt-4 text-sm text-text-secondary">
              <p>Cache size: {cacheStats.size} items</p>
              <p>Memory: {Math.round(cacheStats.memoryUsage?.heapUsed / 1024 / 1024)}MB</p>
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Updates
          </h3>
          {updates && (
            <div className="space-y-2 text-sm">
              <p>Outdated packages: {updates.outdated}</p>
              <p>Vulnerabilities: {updates.vulnerabilities}</p>
              <p>Current version: {updates.currentVersion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Recent Logs
        </h3>
        <div className="bg-surface-alt rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="text-xs font-mono text-text-secondary">
            {logs.length > 0 ? logs.join('\n') : 'No logs available'}
          </pre>
        </div>
      </div>
    </div>
  );
}
