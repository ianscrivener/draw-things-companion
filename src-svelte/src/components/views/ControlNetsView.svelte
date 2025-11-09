<script>
import { getModelsByType } from "../../models.js";
import TwoPaneManager from "../TwoPaneManager.svelte";

const { macModels, stashModels } = getModelsByType("control");
</script>

<TwoPaneManager
  title="ControlNets"
  {macModels}
  {stashModels}
/>
