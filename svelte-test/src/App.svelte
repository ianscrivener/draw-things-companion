<script>
import LogViewer from "./components/LogViewer.svelte";
import Nav from "./components/Nav.svelte";
import ControlNetsView from "./components/views/ControlNetsView.svelte";
import LoRAsView from "./components/views/LoRAsView.svelte";
import ModelsView from "./components/views/ModelsView.svelte";
import SettingsView from "./components/views/SettingsView.svelte";

let activeSection = "models";

function handleNavigate(section) {
	activeSection = section;
}
</script>

<div class="app-container">
  <!-- Navigation -->
  <Nav {activeSection} on:navigate={(e) => handleNavigate(e.detail)} />

  <!-- Main Content -->
  <div class="main-content">
    {#if activeSection === 'models'}
      <ModelsView />
    {:else if activeSection === 'loras'}
      <LoRAsView />
    {:else if activeSection === 'controlnets'}
      <ControlNetsView />
    {:else if activeSection === 'settings'}
      <SettingsView />
    {:else}
      <ModelsView />
    {/if}
  </div>

  
  <!-- Log Viewer Footer -->
  <LogViewer />
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .app-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    position: relative;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: #f9fafb;
    padding-bottom: 32px; /* Space for log viewer */
  }
</style>
