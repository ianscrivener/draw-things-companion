<script>
import { Folder, Settings } from "lucide-svelte";
import { mockConfig } from "../../models.js";
</script>

<div class="container">
  <div class="header">
    <div class="header-title">
      <Settings size={28} />
      <h1>Settings</h1>
    </div>
  </div>

  <div class="content">
    <div class="settings-section">
      <div class="section-header">
        <Folder size={20} />
        <h2>Paths & Locations</h2>
      </div>

      <div class="section-content">
        <div class="setting-item">
          <div class="setting-label">
            <label>DrawThings Directory</label>
            <span class="setting-description">Location of DrawThings app data (from .env file)</span>
          </div>
          <div class="setting-control">
            <span class="readonly-value">{mockConfig.DT_BASE_DIR}</span>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <label>Stash Directory</label>
            <span class="setting-description">External directory for offloading models (saved to settings.json)</span>
          </div>
          <div class="setting-control">
            <input type="text" value={mockConfig.STASH_DIR} readonly />
            <button class="btn-browse" disabled>Browse</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    border-bottom: 1px solid #e5e7eb;
    background: white;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-title h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #111827;
  }

  .content {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
  }

  .settings-section {
    max-width: 800px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .section-header h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  .section-content {
    padding: 8px 0;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #f3f4f6;
  }

  .setting-item:last-child {
    border-bottom: none;
  }

  .setting-label {
    display: flex;
    flex-direction: column;
  }

  .setting-label label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 4px;
  }

  .setting-description {
    font-size: 12px;
    color: #6b7280;
  }

  .setting-control {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .setting-control input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 13px;
    background: #f9fafb;
    font-family: monospace;
    width: 400px;
  }

  .readonly-value {
    font-size: 14px;
    color: #6b7280;
    font-family: monospace;
  }

  .btn-browse {
    padding: 8px 16px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 80px;
  }

  .btn-browse:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #ff5f57;
  }

  .btn-browse:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
