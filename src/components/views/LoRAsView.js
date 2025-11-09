'use client';

import TwoPaneManager from '../TwoPaneManager';
import { useModels } from '../../hooks/useModels';

export default function LoRAsView() {
  const {
    macModels,
    stashModels,
    loading,
    saving,
    error,
    hasUnsavedChanges,
    addToMac,
    removeFromMac,
    reorderMac,
    saveChanges,
    cancelChanges,
    reload,
  } = useModels('lora');

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading LoRAs</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <TwoPaneManager
      modelType="lora"
      title="LoRA Models"
      macModels={macModels}
      stashModels={stashModels}
      onReorder={reorderMac}
      onAddToMac={addToMac}
      onRemoveFromMac={removeFromMac}
      onSave={saveChanges}
      onCancel={cancelChanges}
      onReload={reload}
      hasUnsavedChanges={hasUnsavedChanges}
      loading={loading}
      saving={saving}
    />
  );
}
