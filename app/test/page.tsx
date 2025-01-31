'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ConnectionStatus {
  isConnected: boolean;
  error?: string;
  data?: any;
  envVars: {
    url: boolean;
    key: boolean;
  };
}

export default function TestPage() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    envVars: {
      url: false,
      key: false
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkConnection() {
      try {
        // Check environment variables
        const envStatus = {
          url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          key: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        };

        // Test connection by making a simple query
        const { data, error } = await supabase
          .from('votes')
          .select('count')
          .limit(1);

        if (error) throw error;

        setStatus({
          isConnected: true,
          data,
          envVars: envStatus
        });
      } catch (err) {
        console.error('Supabase connection error:', err);
        setStatus(prev => ({
          ...prev,
          isConnected: false,
          error: err instanceof Error ? err.message : 'Unknown error occurred'
        }));
      } finally {
        setLoading(false);
      }
    }

    checkConnection();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Checking Supabase Connection...</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-6">
        {/* Environment Variables Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className={status.envVars.url ? "text-green-500" : "text-red-500"}>
                {status.envVars.url ? "✓" : "✗"}
              </span>
              <span className="ml-2">NEXT_PUBLIC_SUPABASE_URL</span>
            </div>
            <div className="flex items-center">
              <span className={status.envVars.key ? "text-green-500" : "text-red-500"}>
                {status.envVars.key ? "✓" : "✗"}
              </span>
              <span className="ml-2">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
          {status.isConnected ? (
            <div className="text-green-500">
              <p className="flex items-center">
                <span className="mr-2">✓</span>
                Connected to Supabase successfully
              </p>
              {status.data && (
                <pre className="mt-2 bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(status.data, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-red-500">
              <p className="flex items-center">
                <span className="mr-2">✗</span>
                Failed to connect to Supabase
              </p>
              {status.error && (
                <pre className="mt-2 bg-gray-100 p-2 rounded text-sm text-red-600">
                  {status.error}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
