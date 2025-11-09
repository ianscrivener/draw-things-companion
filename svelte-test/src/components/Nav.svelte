<script>
import { Factory, Image, Settings, SquarePen } from "lucide-svelte";
import { createEventDispatcher } from "svelte";

export const activeSection = "models";

const dispatch = createEventDispatcher();

const navItems = [
	{ id: "models", icon: Image, label: "Models" },
	{ id: "loras", icon: SquarePen, label: "LoRAs" },
	{ id: "controlnets", icon: Factory, label: "ControlNets" },
	{ id: "settings", icon: Settings, label: "Settings" },
];

function handleClick(itemId) {
	dispatch("navigate", itemId);
}
</script>

<nav class="nav">
  {#each navItems as { id, icon, label }}
    <div
      class="nav-item"
      class:active={activeSection === id}
      on:click={() => handleClick(id)}
      role="button"
      tabindex="0"
      on:keypress={(e) => e.key === 'Enter' && handleClick(id)}
    >
      <svelte:component 
        this={icon} 
        size={20} 
        strokeWidth={1.5}
        class="nav-icon {activeSection === id ? 'active' : ''}"
      />
      <div class="nav-label">{label}</div>
    </div>
  {/each}
</nav>

<style>
  .nav {
    width: 80px;
    height: 100%;
    background-color: #f3f4f6;
    border-right: 1px solid #d1d5db;
    display: flex;
    flex-direction: column;
    padding-top: 24px;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    text-align: center;
    font-size: 11px;
    font-weight: 500;
    color: #1f2937;
  }

  .nav-item:hover {
    background-color: #e5e7eb;
  }

  .nav-item.active {
    color: #ff5f57;
    font-weight: 700;
  }

  :global(.nav-icon) {
    margin-bottom: 4px;
    color: #1f2937;
  }

  :global(.nav-icon.active) {
    color: #ff5f57;
  }

  .nav-label {
    font-size: 11px;
  }
</style>
