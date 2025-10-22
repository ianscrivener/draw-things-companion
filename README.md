# README

***a companion app for DrawThings: stash models & projects to an external disk to save space on your Mac system disk***

 - manage all DrawThings models; image generation models, LoRAs, ControlNets
 - 'stash' models and projects to an external disk to save space on your main Mac system disk
 - Delete models 
 - Manage the display order for models
 - (coming soon) Create 'Stash Sets' - group of models and settings, eg 'WAN2.2', 'Flux Full' to stremaline DrawThings menus and save disk space  



<br>

---
### Setup

**Configure your Stash directory etc**

```
cp env.samples .env

# Edit .env
DT_BASE_DIR=~/Library/Containers/com.liuliu.draw-things
OFFLOAD_DIR=~/DrawThings_Stash
DTU_APP_DIR=~/.drawthings_companion

```

<br>

---

### Using this app

**Close DrawThings before running this app.** 

This app will **always** copy/backup **all** your models to the stash directory.

You can manage your (1) main models, (2) LoRa models and (3) ControlNet models - each has it's own view.

All three views will have two panes; your Mac on the left and your stash on the right.

On first run, the app will copy all models from your Mac to the stash directory. 

Mark models on your Mac for deletion, rename them and reorder them as you wish. 

For LoRAs you can also change the default LoRA strength.

When you're finished, hit the "Save" button and your Mac will be updated. 

Note: Only the display name for the models are changed - the model file names are never altered.

