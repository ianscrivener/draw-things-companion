<script>
import { getDisplayName, formatFileSize } from "../models.js";
import { HardDrive, Archive, Save, X } from "lucide-svelte";

export let title = "Models";
export let macModels = [];
export let stashModels = [];

let selectedModel = null;
let showModal = false;

function handleModelClick(model) {
	selectedModel = model;
	showModal = true;
}

function closeModal() {
	showModal = false;
	selectedModel = null;
}
</script>

<div class="container">
  <!-- Header -->
  <div class="header">
    <h1>{title}</h1>
    <div class="header-actions">
      <button class="btn-secondary" disabled>
        <X size={18} />
        Cancel
      </button>
      <button class="btn-primary" disabled>
        <Save size={18} />
        Save Changes
      </button>
    </div>
  </div>

  <!-- Two Pane Layout -->
  <div class="content">
    <!-- Mac HD Pane -->
    <div class="pane">
      <div class="pane-header">
        <HardDrive size={16} />
        <h2>Macintosh HD</h2>
        <span class="pane-count">{macModels.length}</span>
      </div>
      <div class="pane-content">
        {#each macModels as model, index (model.filename)}
          <div
            class="model-item"
            on:click={() => handleModelClick(model)}
            role="button"
            tabindex="0"
          >
            <div class="model-order">{index + 1}</div>
            <div class="model-info">
              <div class="model-name">{getDisplayName(model)}</div>
              <div class="model-details">
                <span class="model-size">{formatFileSize(model.file_size)}</span>
                {#if model.lora_strength}
                  <span class="lora-strength">Strength: {(model.lora_strength / 10).toFixed(1)}</span>
                {/if}
              </div>
            </div>
          </div>
        {:else}
          <div class="empty-state">
            <p>No models on Mac HD</p>
            <p class="empty-hint">Drag models from Stash to add them</p>
          </div>
        {/each}
      </div>
    </div>

    <!-- Stash Pane -->
    <div class="pane">
      <div class="pane-header">
        <Archive size={16} />
        <h2>Stash</h2>
        <span class="pane-count">{stashModels.length}</span>
      </div>
      <div class="pane-content">
        {#each stashModels as model (model.filename)}
          <div
            class="model-item"
            on:click={() => handleModelClick(model)}
            role="button"
            tabindex="0"
          >
            <div class="model-info full-width">
              <div class="model-name">{getDisplayName(model)}</div>
              <div class="model-details">
                <span class="model-size">{formatFileSize(model.file_size)}</span>
                {#if model.lora_strength}
                  <span class="lora-strength">Strength: {(model.lora_strength / 10).toFixed(1)}</span>
                {/if}
              </div>
            </div>
          </div>
        {:else}
          <div class="empty-state">
            <p>No models in stash</p>
            <p class="empty-hint">Models removed from Mac HD will appear here</p>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Modal -->
  {#if showModal && selectedModel}
    <div class="modal-overlay" on:click={closeModal} role="presentation">
      <div class="modal" on:click|stopPropagation role="dialog">
        <div class="modal-header">
          <h3>Model Details</h3>
          <button class="modal-close" on:click={closeModal}>✕</button>
        </div>
        <div class="modal-content">
          <div class="detail-row">
            <span class="detail-label">Filename:</span>
            <span class="detail-value">{selectedModel.filename}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Display Name:</span>
            <span class="detail-value">{getDisplayName(selectedModel)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">File Size:</span>
            <span class="detail-value">{formatFileSize(selectedModel.file_size)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">On Mac HD:</span>
            <span class="detail-value">{selectedModel.exists_mac_hd ? 'Yes' : 'No'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">In Stash:</span>
            <span class="detail-value">{selectedModel.exists_stash ? 'Yes' : 'No'}</span>
          </div>
          {#if selectedModel.lora_strength}
            <div class="detail-row">
              <span class="detail-label">LoRA Strength:</span>
              <span class="detail-value">{(selectedModel.lora_strength / 10).toFixed(1)}</span>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
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
    padding: 12px 32px;
    border-bottom: 1px solid #e5e7eb;
    background: white;
  }

  .header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #111827;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .btn-primary, .btn-secondary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-primary {
    background: #ff5f57;
    color: white;
    border: none;
  }

  .btn-primary:hover:not(:disabled) {
    background: #ff4842;
  }

  .btn-secondary {
    background: white;
    color: #374151;
    border: 1px solid #e5e7eb;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #f9fafb;
  }

  .btn-primary:disabled, .btn-secondary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    flex: 1;
    overflow: hidden;
  }

  .pane {
    background: white;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-right: 2px solid #e5e7eb;
  }

  .pane:last-child {
    border-right: none;
  }

  .pane-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 24px;
    border-bottom: 1px solid #e5e7eb;
    background: #f3f4f6;
  }

  .pane-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    flex: 1;
  }

  .pane-count {
    background: #e5e7eb;
    color: #374151;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
  }

  .pane-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .model-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    margin-bottom: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background: white;
  }

  .model-item:hover {
    border-color: #ff5f57;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .model-order {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 700;
    color: #374151;
    flex-shrink: 0;
  }

  .model-info {
    flex: 1;
    min-width: 0;
  }

  .model-info.full-width {
    width: 100%;
  }

  .model-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .model-details {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: #6b7280;
  }

  .lora-strength {
    color: #ff5f57;
    font-weight: 600;
  }

  .empty-state {
    text-align: center;
    padding: 60px 24px;
    color: #6b7280;
  }

  .empty-state p {
    margin: 8px 0;
    font-size: 14px;
  }

  .empty-hint {
    font-size: 14px;
    color: #9ca3af;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #6b7280;
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
    background: #f3f4f6;
  }

  .modal-content {
    padding: 24px;
    overflow-y: auto;
  }

  .detail-row {
    display: flex;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .detail-label {
    font-weight: 600;
    color: #374151;
    width: 140px;
    flex-shrink: 0;
  }

  .detail-value {
    color: #6b7280;
    word-break: break-all;
  }
</style>
