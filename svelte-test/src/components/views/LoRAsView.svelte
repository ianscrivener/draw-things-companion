<script>
  import TwoPaneManager from '../TwoPaneManager.svelte';
  import { getModelsByType } from '../../models.js';

  const { macModels, stashModels } = getModelsByType('lora');
</script>

<TwoPaneManager
  title="LoRAs"
  {macModels}
  {stashModels}
/>
