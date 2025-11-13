<script>
import { Folder, Settings } from "lucide-svelte";
import { settings } from "../../models.js";
import { appState } from '../../appState.svelte.js';

import { Highlight } from 'svelte-highlight';
import json from "svelte-highlight/languages/json";
import 'highlight.js/styles/github.css'; // Import a theme stylesheet
import atelierCaveLight from "svelte-highlight/styles/atelier-cave-light";

const init = appState;

// let json_str = JSON.stringify(settings, null, 2);



const format_json = function(jsonObj) {
  let j =JSON.stringify(jsonObj, null, 2);
  return j;
};

</script>

<svelte:head>
  {@html atelierCaveLight}
</svelte:head>


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
            <label>DrawThings App Directory</label>
            <!-- <span class="setting-description">Location of DrawThings app data (from .env file)</span> -->
          </div>
          <div class="setting-control">
            <span class="readonly-value">{settings.DT_BASE_DIR}</span>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <label>Stash Directory</label>
            <!-- <span class="setting-description">External directory for offloading models (saved to settings.json)</span> -->
          </div>
          <div class="setting-control">
            <span class="readonly-value">{settings.STASH_DIR}</span>
            <!-- <input type="text" value={settings.STASH_DIR} readonly />
            <button class="btn-browse" disabled>Browse</button> -->
          </div>
        </div>


        <div class="setting-item">
          <div class="setting-label">
            <label>Companion App Directory</label>
            <!-- <span class="setting-description">Location of DrawThings Companion app data</span> -->
          </div>
          <div class="setting-control">
            <span class="readonly-value">{settings.DTC_APP_DIR}</span>
          </div>
        </div>


        <div class="setting-item">
            <Highlight language={json} code={format_json(appState)} /> 
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
    /* justify-self: left; */
    /* align-items: left; */
    padding: 16px 24px;
    border-bottom: 1px solid #f3f4f6;
    font-size: 11px;
  }

  .setting-item:last-child {
    border-bottom: none;
  }

  .setting-label {
    /* display: flex;
    flex-direction: column; */
    width: 250px;
    vertical-align: middle;
  }

  .setting-label label {
    font-size: 13.5px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 4px;
  }

  .setting-description {
    font-size: 12px;
    color: #6b7280;
  }

  .setting-control {
    /* display: flex; */
    /* align-self: start; */
    gap: 8px;
    width: 100%;
    /* display: flex; */
    vertical-align: middle;
    margin-bottom: 4px;
  }

  .setting-control input {
    /* flex: 1; */
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 12px;
    background: #f9fafb;
    font-family: monospace;
  }

  .readonly-value {
    font-size: 12px;
    color: #6b7280;
    font-family: monospace;
    padding: 8px 12px;

  }
  .readonly-value pre {
    font-size: 11px;
    color: #000;
    font-family: monospace;
    padding: 8px 12px;

  }

  .btn-browse {
    padding: 8px 16px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 12px;
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
