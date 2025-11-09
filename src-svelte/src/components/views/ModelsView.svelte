<script>
import { getModelsByType } from "../../models.js";
import TwoPaneManager from "../TwoPaneManager.svelte";

const { macModels, stashModels } = getModelsByType("model");

console.log("ModelsView - macModels:", macModels);

</script>

<TwoPaneManager
  title="Models"
  {macModels}
  {stashModels}
/>
