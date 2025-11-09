<script>
import { Clipboard } from "lucide-svelte";

const logs = [
	{ timestamp: Date.now(), message: "Application initialized" },
	{ timestamp: Date.now() + 1000, message: "Loading models from database..." },
	{ timestamp: Date.now() + 2000, message: "Found 17 models" },
	{ timestamp: Date.now() + 3000, message: "All processing completed" },
];

let showModal = false;

function getLatestMessage() {
	if (logs.length === 0) return "Ready";

	const lastLog = logs[logs.length - 1];
	const msg = lastLog.message;
	return msg.length > 60 ? msg.substring(0, 57) + "..." : msg;
}

function openModal() {
	showModal = true;
}

function closeModal() {
	showModal = false;
}
</script>

<div class="log-viewer">
  <button
    class="log-button"
    on:click={openModal}
    title="View full logs"
  >
    <Clipboard size={14} />
  </button>

  <div class="log-message">
    {getLatestMessage()}
  </div>

  <div class="log-count">
    {logs.length} logs
  </div>
</div>

{#if showModal}
  <div class="modal-overlay" on:click={closeModal} role="presentation">
    <div class="modal" on:click|stopPropagation role="dialog">
      <div class="modal-header">
        <h3>Application Logs</h3>
        <button class="modal-close" on:click={closeModal}>✕</button>
      </div>
      <div class="modal-content">
        {#each logs as log}
          <div class="log-entry">
            <span class="log-timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
            <span class="log-text">{log.message}</span>
          </div>
        {:else}
          <div class="empty-logs">No logs available</div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .log-viewer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 8px;
    background-color: #1f2937;
    border-top: 1px solid #111827;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 32px;
    z-index: 100;
    box-sizing: border-box;
  }

  .log-button {
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s;
    flex-shrink: 0;
  }

  .log-button:hover {
    color: #ffffff;
  }

  .log-message {
    font-size: 12px;
    color: #d1d5db;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .log-count {
    margin-left: auto;
    font-size: 11px;
    color: #9ca3af;
    padding: 0 8px;
    flex-shrink: 0;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: #1f2937;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid #374151;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #374151;
    background: #111827;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #f9fafb;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .modal-close:hover {
    background: #374151;
    color: #f9fafb;
  }

  .modal-content {
    padding: 16px;
    overflow-y: auto;
    background: #1f2937;
  }

  .log-entry {
    padding: 8px 12px;
    border-bottom: 1px solid #374151;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 12px;
    display: flex;
    gap: 12px;
  }

  .log-entry:last-child {
    border-bottom: none;
  }

  .log-timestamp {
    color: #9ca3af;
    flex-shrink: 0;
    width: 80px;
  }

  .log-text {
    color: #d1d5db;
    flex: 1;
    word-break: break-word;
  }

  .empty-logs {
    text-align: center;
    padding: 40px;
    color: #6b7280;
    font-size: 14px;
  }
</style>
