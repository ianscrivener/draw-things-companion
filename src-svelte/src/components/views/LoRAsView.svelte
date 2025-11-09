<script>
import { getModelsByType } from "../../models.js";
import TwoPaneManager from "../TwoPaneManager.svelte";

const { macModels, stashModels } = getModelsByType("lora");
</script>

<TwoPaneManager
  title="LoRAs"
  {macModels}
  {stashModels}
/>
