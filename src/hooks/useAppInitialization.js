"use client";

import {
  useEffect,
  useState
}
  from "react";
import * as TauriHandler from "../lib/tauri_handler";

// ###############################################
// Hook to handle first-run initialization of the app
// ###############################################
export function useAppInitialization() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    checkInitialization();
  }, []);

  // ###############################################
  // Initialization Check and Setup Functions
  const checkInitialization = async () => {
    try {

      // 1️⃣ show loading state
      setLoading(true);

      // 2️⃣ Check if app is initialized by loading settings ⭐️⭐️⭐️⭐️⭐️
      const loadedConfig = await TauriHandler.app_init();
      setConfig(loadedConfig);

      // 3️⃣ Check if settings.json exists and has been initialized

      // 3️⃣1️⃣ If settings.json has 'initialized: true', we're good to go
      if (loadedConfig.initialized === true) {
        setNeedsSetup(false);
        console.log("[useAppInitialization] App is initialized");
      }
      else {
        // 3️⃣2️⃣ No settings.json or not initialized - need setup
        setNeedsSetup(true);
        console.log("[useAppInitialization] App needs first-run setup");
      }
    }
    catch (err) {
      console.error("Initialization check failed:", err);
      setError(err.message);

      // On error, assume we need setup
      setNeedsSetup(true);
    }
    finally {
      // 4️⃣ hide loading state
      setLoading(false);
    }
  };

  // ###############################################
  // App Initialization Function
  const initializeApp = async (dtBaseDir, stashDir) => {
    try {

      // 1️⃣ Show loading state
      setLoading(true);
      setError(null);

      // 2️⃣ Initialize app with directories
      // Note: Model scanning now happens automatically in app_init() ⭐️⭐️⭐️⭐️⭐️
      await TauriHandler.app_first_run(dtBaseDir, stashDir);
      setNeedsSetup(false);
      return { success: true };
    }
    catch (err) {
      console.error("Initialization failed:", err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    }
    finally {
      // 3️⃣ Hide loading state
      setLoading(false);
    }
  };

  // ###############################################
  // Return Hook State and Functions
  return {
    loading,
    error,
    needsSetup,
    config,
    initializeApp,
    recheckInitialization: checkInitialization,
  };
}