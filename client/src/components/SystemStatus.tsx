import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import type { SystemHealth } from '../services/api';

interface SystemStatusProps {
  onSystemReady?: () => void;
  showDetailedStatus?: boolean;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ onSystemReady, showDetailedStatus = false }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const healthData = await apiService.checkSystemHealth();
        setHealth(healthData);
        
        if (healthData.ready && onSystemReady) {
          onSystemReady();
        }
      } catch (err: any) {
        setError(err.message || 'Failed to check system status');
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    checkHealth();

    // Set up periodic checks
    const interval = setInterval(checkHealth, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [onSystemReady]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Checking system status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">System Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  // System is ready
  if (health.ready) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">System Ready</h3>
            <p className="text-sm text-green-700 mt-1">All systems are operational and ready to use.</p>
          </div>
        </div>
      </div>
    );
  }

  // System is initializing
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">System Initializing</h3>
          <p className="text-sm text-yellow-700 mt-1">
            {health.message || 'The system is setting up for first-time use. This may take a few minutes.'}
          </p>
          
          {showDetailedStatus && (
            <div className="mt-3 text-xs text-yellow-600">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Status:</span> {health.status}
                </div>
                <div>
                  <span className="font-medium">Cache:</span> {health.cache_status}
                </div>
                {health.cache_exists !== undefined && (
                  <div>
                    <span className="font-medium">Cache Exists:</span> {health.cache_exists ? 'Yes' : 'No'}
                  </div>
                )}
                {health.programs_count !== undefined && (
                  <div>
                    <span className="font-medium">Programs Loaded:</span> {health.programs_count}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-3">
            <div className="flex items-center text-xs text-yellow-600">
              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Please wait while the system finishes setting up...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus; 