'use client';

import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

/**
 * Hook to handle first-run initialization of the app
 */
export function useAppInitialization() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      setLoading(true);
      
      // Check if stash directory is configured
      const stashExists = await invoke('get_config_value', { key: 'STASH_EXISTS' });
      
      if (!stashExists || stashExists !== 'true') {
        setNeedsSetup(true);
        setInitialized(false);
      } else {
        setInitialized(true);
        setNeedsSetup(false);
      }
    } catch (err) {
      console.error('Initialization check failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeApp = async (dtBaseDir, stashDir) => {
    try {
      setLoading(true);
      setError(null);

      // Initialize app with directories
      await invoke('initialize_app', {
        dtBaseDir,
        stashDir,
      });

      // Scan and import models from Mac
      const modelScan = await invoke('scan_mac_models', { modelType: 'model' });
      const loraScan = await invoke('scan_mac_models', { modelType: 'lora' });
      const controlnetScan = await invoke('scan_mac_models', { modelType: 'controlnet' });

      console.log('Model scan results:', {
        models: modelScan,
        loras: loraScan,
        controlnets: controlnetScan,
      });

      setInitialized(true);
      setNeedsSetup(false);

      return {
        success: true,
        results: { modelScan, loraScan, controlnetScan },
      };
    } catch (err) {
      console.error('Initialization failed:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    initialized,
    loading,
    error,
    needsSetup,
    initializeApp,
    recheckInitialization: checkInitialization,
  };
}
