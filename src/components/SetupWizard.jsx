'use client';

import { useState } from 'react';
import { FolderOpen, HardDrive } from 'lucide-react';

export default function SetupWizard({ config, onComplete }) {
  const [dtBaseDir, setDtBaseDir] = useState(
    config?.DT_BASE_DIR || '/Users/YOUR_USERNAME/Library/Containers/com.liuliu.draw-things/Data/Documents'
  );
  const [stashDir, setStashDir] = useState(
    config?.STASH_DIR || '/Volumes/Extreme2Tb/__DrawThings_Stash__'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await onComplete(dtBaseDir, stashDir);

      if (!result.success) {
        setError(result.error || 'Setup failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-brand flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-12 max-w-xl w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="text-center mb-10">
          <HardDrive size={48} className="text-[#667eea] mb-4 inline-block" />
          <h1 className="m-0 mb-3 text-[28px] font-bold text-gray-800">
            Welcome to DrawThings Companion
          </h1>
          <p className="m-0 text-gray-700 text-lg">
            Let's set up your stash directory to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="dtBaseDir"
              className="flex items-center gap-2 font-bold text-gray-800 text-md"
            >
              <FolderOpen size={18} />
              DrawThings Base Directory
            </label>
            <input
              type="text"
              id="dtBaseDir"
              value={dtBaseDir}
              onChange={(e) => setDtBaseDir(e.target.value)}
              placeholder={dtBaseDir}
              className="px-4 py-3 border-2 border-gray-250 rounded-md text-md transition-all font-mono focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              required
            />
            <p className="m-0 text-base text-gray-500">
              The directory where DrawThings stores its models
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="stashDir"
              className="flex items-center gap-2 font-bold text-gray-800 text-md"
            >
              <FolderOpen size={18} />
              Stash Directory
            </label>
            <input
              type="text"
              id="stashDir"
              value={stashDir}
              onChange={(e) => setStashDir(e.target.value)}
              placeholder={stashDir}
              className="px-4 py-3 border-2 border-gray-250 rounded-md text-md transition-all font-mono focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              required
            />
            <p className="m-0 text-base text-gray-500">
              Where your model backups will be stored (can be on external drive)
            </p>
          </div>

          {error && (
            <div className="bg-error-light border border-[#fcc] rounded-md px-4 py-3 text-[#c33] text-md">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="bg-gray-100 rounded-lg p-5">
            <h3 className="m-0 mb-3 text-[15px] font-bold text-gray-800">
              What will happen next:
            </h3>
            <ul className="m-0 pl-5">
              <li className="mb-2 text-gray-700 text-md last:mb-0">
                The stash directory will be created if it doesn't exist
              </li>
              <li className="mb-2 text-gray-700 text-md last:mb-0">
                All your models will be scanned and cataloged
              </li>
              <li className="mb-2 text-gray-700 text-md last:mb-0">
                A backup copy of all models will be created in the stash
              </li>
              <li className="mb-2 text-gray-700 text-md last:mb-0">
                You'll be able to manage which models stay on your Mac
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="bg-gradient-brand text-white border-none rounded-md px-8 py-4 text-lg font-bold cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(102,126,234,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading || !dtBaseDir || !stashDir}
          >
            {loading ? 'Setting up...' : 'Start Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
