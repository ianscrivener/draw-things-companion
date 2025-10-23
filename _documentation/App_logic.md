# App Logic

### App Config
The main app config is `src/app_config.json`


### Variables & filepaths
The user is encouraged to set a `.env` file for their local environment variables. There is a `env.sample` file as follows;
```
DT_BASE_DIR=~/Library/Containers/com.liuliu.draw-things
STASH_DIR=~/DrawThings_Stash
DTU_APP_DIR=~/.drawthings_companion
```

### Stash Directory filestructure

`STASH_DIR` will have the following file structure;

```
Data     
    Clip_encoders
    Controls
    Database
    LoRAs
    Main_models
    Projects
    Text_encoders
    Upscalers
    VAEs
README.md        a default readme to explain the use of the stash directory 

```

### Database & db backup

The main database will be `${STASH_DIR}/Data/Database/drawthings_companion.sqlite3`

The database will be copied to `${DTU_APP_DIR}/drawthings_companion_backup.sqlite3` every `${config.db_backup_interval_minutes}` minutes.

### Cannot find Stash directory
In the event that the application cannot find the stash directory (`${STASH_DIR}` a pop-up message will be displayed. It may be that the stash directory is on an external drive that hasn't been plugged in. 

---

### DrawThings data inspection 


#### **(1) Read DrawThings JSON files**

1. Main Models: `${DT_BASE_DIR}/Data/Documents/Models/custom.json`
2. LoRAs: `${DT_BASE_DIR}/Data/Documents/Models/custom_lora.json`
3. ControlNets: `${DT_BASE_DIR}/Data/Documents/Models/custom_controlnet.json`
4. Configs: `${DT_BASE_DIR}/Data/Documents/Models/custom_configs.json`
5. Prompt Styles: `${DT_BASE_DIR}/Data/Documents/Models/custom_prompt_style.json`

#### **(2) Get hashes for all JSON files**
1. `shasum -a 256 ${DT_BASE_DIR}/Data/Documents/Models/custom.json`
2. `shasum -a 256 ${DT_BASE_DIR}/Data/Documents/Models/custom_lora.json`
3. `shasum -a 256 ${DT_BASE_DIR}/Data/Documents/Models/custom_controlnet.json`
4. `shasum -a 256 ${DT_BASE_DIR}/Data/Documents/Models/custom_configs.json`
5. `shasum -a 256 ${DT_BASE_DIR}/Data/Documents/Models/custom_prompt_style.json`

#### **(3) List checkpoint files**
`ls ${DT_BASE_DIR}/Data/Documents/Models/*.ckpt`

#### **(4) Get hashes for all checkpoint files**


#### **(5) List projects**
`ls ${DT_BASE_DIR}/Data/Documents/*sqlite3`

#### **(6) Get hashes for all projects sqlite3 files**



