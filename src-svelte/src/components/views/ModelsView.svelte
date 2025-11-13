<script>
// import { getModelsByType } from "../../models.js";
import TwoPaneManager from "../TwoPaneManager.svelte";

// const { macModels, stashModels } = getModelsByType("model");

// console.log("ModelsView - macModels:", macModels);

import { appState } from '../../appState.svelte.js';

const macModels = appState.mac.models;

// setTimeout(() => {
//   macModels[0].display_name_original = "UPDATED NAME!";
//   console.log("updated...");
// }, 5000);


const stashModels = [];

</script>

<TwoPaneManager
  title="Models"
  {macModels}
  {stashModels}
/>
