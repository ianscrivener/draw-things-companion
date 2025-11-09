<script>
import { getModelsByType } from "../../models.js";
import TwoPaneManager from "../TwoPaneManager.svelte";

const { macModels, stashModels } = getModelsByType("model");
</script>

<TwoPaneManager
  title="Models"
  {macModels}
  {stashModels}
/>
