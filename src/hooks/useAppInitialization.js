'use client';

import { useEffect, useState } from 'react';
import * as TauriHandler from '../lib/tauri_handler';

/**
 * Hook to handle first-run initialization of the app
 */
export function useAppInitialization() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      setLoading(true);

      // Check if app is initialized by loading settings
      const loadedConfig = await TauriHandler.app_init();
      setConfig(loadedConfig);

      // Check if settings.json exists and has been initialized
      // If settings.json has 'initialized: true', we're good to go
      if (loadedConfig.initialized === true) {
        setInitialized(true);
        setNeedsSetup(false);
        console.log('[useAppInitialization] App is initialized');
      } else {
        // No settings.json or not initialized - need setup
        setNeedsSetup(true);
        setInitialized(false);
        console.log('[useAppInitialization] App needs first-run setup');
      }
    } catch (err) {
      console.error('Initialization check failed:', err);
      setError(err.message);
      // On error, assume we need setup
      setNeedsSetup(true);
      setInitialized(false);
    } finally {
      setLoading(false);
    }
  };

  const initializeApp = async (dtBaseDir, stashDir) => {
    try {
      setLoading(true);
      setError(null);

      // Initialize app with directories
      await TauriHandler.app_first_run(dtBaseDir, stashDir);

      // Scan and import models from Mac
      const modelScan = await TauriHandler.scan_mac_models('model');
      const loraScan = await TauriHandler.scan_mac_models('lora');
      const controlnetScan = await TauriHandler.scan_mac_models('control');

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
    config,
    initializeApp,
    recheckInitialization: checkInitialization,
  };
}
