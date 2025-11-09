<script>
import TwoPaneManager from "../TwoPaneManager.svelte";
import { getModelsByType } from "../../models.js";

const { macModels, stashModels } = getModelsByType("model");
</script>

<TwoPaneManager
  title="Models"
  {macModels}
  {stashModels}
/>
