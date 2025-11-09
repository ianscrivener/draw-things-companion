<script>
  import TwoPaneManager from '../TwoPaneManager.svelte';
  import { getModelsByType } from '../../models.js';

  const { macModels, stashModels } = getModelsByType('control');
</script>

<TwoPaneManager
  title="ControlNets"
  {macModels}
  {stashModels}
/>
