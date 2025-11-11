# DrawThings Companion

***A companion app for DrawThings: stash models & projects to an external disk to save space on your Mac system disk***

## Features

 - Manage all DrawThings models: image generation models, LoRAs, ControlNets
 - 'Stash' models and projects to an external disk to save space on your main Mac system disk
 - Manage the display order for models
 - (coming soon) Create 'Stash Sets' - group of models and settings, eg 'SDXL', 'Flux Full' to streamline DrawThings menus and save disk space

## Tech Stack

- **Frontend:** Svelte 5 (with $state rune for reactivity)
- **Backend:** Tauri v2 (Rust - minimal pass-through only)
- **Storage:** In-memory JavaScript object (no database)
- **Build:** Vite v7
- **Target:** macOS desktop only (M-series silicon)

<br>

---

### Using this app

**Close DrawThings before running this app.** 
 - On first run, you bee asked the location of **Stash Directory**
 - Then app will copy all models from your Mac to the **Stash Directory**
 - This app will **always** copy/backup **all** your models to the **Stash Directory**
 - You can manage your (1) main models, (2) LoRa models and (3) ControlNet models - each has it's own view pane in the app.
 - You'll see two panes; **Your Mac** on the left and the **Stash Directory** on the right.
 - Mark models on **Your Mac** for deletion to save space, rename them and reorder them as you wish. 
 - Display order is controlled by the order of the JSON data files that DrawThings uses
 - For LoRAs you can also change the default LoRA strength
 - When you're finished, hit the "Save" button and your Mac will be updated. 
 - Note: Only the display name for the models are changed - the model file names are never altered.

