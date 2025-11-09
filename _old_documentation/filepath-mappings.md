# Filepath Mappings

DrawThings and this companion app use a certain number of specific filepaths - read from the environment file `.env` (see `env.sample`)

The app variables below are used both by the JavaScript front end and the Rust backend. 

<br>


---
### DT_BASE_DIR
`DT_BASE_DIR=~/Library/Containers/com.liuliu.draw-things/Data/Documents`

The main DrawThings directory. This is fixed and cannot be changed without breaking drawthings functionality 


|Variable|Directory|Notes|
|--|--|--|
|JSON_CONF|`[DT_BASE_DIR]/*.json`|The three (3) main JSON config files: **custom_controlnet.json**, **custom_lora.json**, **custom.json** | 
|PROJECTS|`[DT_BASE_DIR]/*.sqlite3`|This directory also creates as some subdirectoriescustom_controlnet| 
|MODELS|`[DT_BASE_DIR]/Models/*.ckpt`|All models are in this subdirectory, main models, LoRAs, ControlNets upscaler models|
|SCRIPTS|`[DT_BASE_DIR]/Scripts/*.js`|  There's also a JSON file with script data. **CURRENTLY UNUSED** |

<br>

---

### STASH_DIR
The file path location for the stash directory, usually an external drive. 

**Default:** `STASH_DIR=~/DrawThings_Stash`


<br>

---
### DTC_APP_DIR

Hidden directory for this Companion app. Stores things such as SQLite database, soem app settings etc.  

**Default:** `DTC_APP_DIR=~/.drawthings_companion`