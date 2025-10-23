'use client';

import { useState } from 'react';
import { FolderOpen, HardDrive } from 'lucide-react';

export default function SetupWizard({ onComplete }) {
  const [dtBaseDir, setDtBaseDir] = useState(
    '~/Library/Containers/com.liuliu.draw-things/Data/Documents'
  );
  const [stashDir, setStashDir] = useState('~/DrawThings_Stash');
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
    <div className="setup-overlay">
      <div className="setup-container">
        <div className="setup-header">
          <HardDrive size={48} className="setup-icon" />
          <h1>Welcome to DrawThings Companion</h1>
          <p>Let's set up your stash directory to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="dtBaseDir">
              <FolderOpen size={18} />
              DrawThings Base Directory
            </label>
            <input
              type="text"
              id="dtBaseDir"
              value={dtBaseDir}
              onChange={(e) => setDtBaseDir(e.target.value)}
              placeholder="~/Library/Containers/com.liuliu.draw-things/Data/Documents"
              required
            />
            <p className="help-text">
              The directory where DrawThings stores its models
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="stashDir">
              <FolderOpen size={18} />
              Stash Directory
            </label>
            <input
              type="text"
              id="stashDir"
              value={stashDir}
              onChange={(e) => setStashDir(e.target.value)}
              placeholder="~/DrawThings_Stash"
              required
            />
            <p className="help-text">
              Where your model backups will be stored (can be on external drive)
            </p>
          </div>

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="setup-info">
            <h3>What will happen next:</h3>
            <ul>
              <li>The stash directory will be created if it doesn't exist</li>
              <li>All your models will be scanned and cataloged</li>
              <li>A backup copy of all models will be created in the stash</li>
              <li>You'll be able to manage which models stay on your Mac</li>
            </ul>
          </div>

          <button
            type="submit"
            className="btn-setup"
            disabled={loading || !dtBaseDir || !stashDir}
          >
            {loading ? 'Setting up...' : 'Start Setup'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .setup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .setup-container {
          background: white;
          border-radius: 12px;
          padding: 48px;
          max-width: 600px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .setup-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .setup-icon {
          color: #667eea;
          margin-bottom: 16px;
        }

        .setup-header h1 {
          margin: 0 0 12px 0;
          font-size: 28px;
          font-weight: 600;
          color: #333;
        }

        .setup-header p {
          margin: 0;
          color: #666;
          font-size: 16px;
        }

        .setup-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-group input {
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .help-text {
          margin: 0;
          font-size: 13px;
          color: #999;
        }

        .setup-info {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 20px;
        }

        .setup-info h3 {
          margin: 0 0 12px 0;
          font-size: 15px;
          font-weight: 600;
          color: #333;
        }

        .setup-info ul {
          margin: 0;
          padding-left: 20px;
        }

        .setup-info li {
          margin-bottom: 8px;
          color: #666;
          font-size: 14px;
        }

        .setup-info li:last-child {
          margin-bottom: 0;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 6px;
          padding: 12px 16px;
          color: #c33;
          font-size: 14px;
        }

        .btn-setup {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-setup:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-setup:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}
