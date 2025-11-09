# DrawThings Companion - Functions, Datasets & App State


### Notes
1. The app uses the functions below to load 'state' into app memory on app init. State is essentially a combination of JSON file data, directory listings and settings.json stored in memory in a single javascripts object `App_State`
2. App_State is the Tauri frontend - the Tauri backend does not have any awareness of state. 
3. A parquet file with all community models is downloaded and may be referred to, usually when trying to figure out orphan ckpts 

### Function return format
 - return code - 0 for success. 1 for error. May include error code
 - result array - contents vary, may be an array with a single string or an array of objects. 
 - error array - contents vary, 1 or more errors objects

### Function List

|        | Fn Group   | Function Name         | Inputs                                                                       | Relevant Outputs         | Notes                                                                                                                                                 |
| :----: | ---------- | --------------------- | ---------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | CKPT_RW    | copy_ckpt             | ckpt_filename, source, destination                                           | success bool             | Copy ckpt from Mac to Stash,  or Stash to Mac                                                                                                         |
| **2**  | CKPT_RW    | delete_ckpt           | mac\|stash, ckpt_filename                                                    | success bool             | Delete ckpt. Extra confirmation step if the ckpt is not in Stash                                                                                      |
| **3**  | CKPT_RW    | prune_mac             | none                                                                         | success bool             | Copy orphan ckpt from Mac to Stash and delete on Mac                                                                                                  |
| **4**  | CKPT_RW    | delete_orphans        | none                                                                         | success bool             | Delete ckpts from Stash/Orphans                                                                                                                       |
|        |            |                       |                                                                              |                          |                                                                                                                                                       |
| **5**  | CKPT_LS    | is_stashed            | ckpt_filename                                                                | success bool             | Checks if a checkpoint is already in the stash                                                                                                        |
| **6**  | CKPT_LS    | read_ckpts            | mac\|stash, model\|lora\|control                                             | array objects            | Lists ckpts on the filesystem. Returns an array of objects containing ckpt_filename, file_size & file_date                                            |
|        |            |                       |                                                                              |                          |                                                                                                                                                       |
| **7**  | DATA       | read_json             | mac\|stash, model\|lora\|control                                             | array ckpt_objects       | Reads the DrawThings JSON file                                                                                                                        |
| **8**  | DATA       | write_json            | mac\|stash, model\|lora\|control,obj                                         | success bool             | Writes the DrawThings JSON file                                                                                                                       |
| **9**  | DATA       | get_children          | ckpt_filename                                                                | array ckpt_filenames     | For model ckpts. Returns an array of ckpts filenames that are required by this checkpoint. Ie VAE, clip_encoder, test_encoder etc                     |
| **10** | DATA       | get_parents           | ckpt_filename                                                                | array ckpt_filenames     | For VAE, clip_encoder, test_encoder etc. Returns an array of parent ckpts filenames - models that uses this                                           |
| **11** | DATA       | reorder_json          | mac\|stash, model\|lora\|control, <br>ckpt_filename, position                | success bool             | Sets the order for the JSON file - moving the checkpoint<br>object to the specify position                                                            |
| **12** | DATA       | get_type              | ckpt_filename                                                                | type string              | Returns the type of the input checkpoint, ie model, lora, control, VAE, clip_encoder, test_encoder.<br>Checks Mac JSON, Stash JSON & Parquet datasets |
| **13** | DATA       | set_ckpt              | mac\|stash, model\|lora\|control, <br>ckpt_filename, updated settings object | success bool             | Set various checkpoint metadata such as display name, LoRA strength, etc.                                                                             |
|        | DATA       | get_parents           | mac\|stash\|parquet, ckpt_filename                                           | array ckpt_filenames     |                                                                                                                                                       |
|        | DATA       | get_children          | mac\|stash\|parquet, ckpt_filename                                           | array ckpt_filenames     |                                                                                                                                                       |
|        | DATA       | get_settings          | mac\|stash\|parquet, ckpt_filename                                           | ckpt_object              |                                                                                                                                                       |
|        |            |                       |                                                                              |                          |                                                                                                                                                       |
|        | INIT       | app_init              | none                                                                         | success bool             | Initiates the app setup                                                                                                                               |
|        | INIT       | db_init               | none                                                                         | success bool             | (re)Creates CHD B on Mac in xxx                                                                                                                       |
|        | INIT       | check_setup           | none                                                                         | success bool             | Checks that the application is set up correctly                                                                                                       |
|        |            |                       |                                                                              |                          |                                                                                                                                                       |
|        | UPDATES    | check_app_updates     | none                                                                         | success bool             | Checks for updates, updated versions of this application                                                                                              |
|        | UPDATES    | check_parquet_updates | none                                                                         | success bool, has update | Checks for more updated parquet file and downloads if required.                                                                                       |
|        |            |                       |                                                                              |                          |                                                                                                                                                       |
|        | DISK_SPACE | get_disk_space        | mac\|stash                                                                   | bytes free space         | Gets free disk space on Mac or Stash                                                                                                                  |
|        |            |                       |                                                                              |                          |                                                                                                                                                       |
|        | SETTINGS   | read_settings         | none                                                                         | settings_object          | Reads the application settings from the filesystem                                                                                                    |
|        | SETTINGS   | write_settings        | settings_object                                                              | success bool             | Writes application settings from the filesystem                                                                                                       |

### Datasets

|  #  | Data Type |   Location   |        Data        |                                                    |
| :-: | :-------: | :----------: | :----------------: | :------------------------------------------------- |
|  1  |   JSON    |     Mac      |       Models       | `${config.DT_BASE_DIR}/Models/custom.json`         |
|  2  |   JSON    |     Mac      |        Lora        | `${config.DT_BASE_DIR}/Models/custom_lora.json`    |
|  3  |   JSON    |     Mac      |      Control       | `${config.DT_BASE_DIR}/Models/custom_control.json` |
|  4  |   JSON    |    Stash     |       Models       | `${config.STASH_DIR}/Models/custom.json`           |
|  5  |   JSON    |    Stash     |        Lora        | `${config.STASH_DIR}/Models/custom_lora.json`      |
|  6  |   JSON    |    Stash     |      Control       | `${config.STASH_DIR}/Models/custom_control.json`   |
|  7  |   JSON    | App Settings |   settings.json    | `${config.DTC_APP_DIR}/settings.json`              |
|  8  |   JSON    | App Settings | deleted_ckpts.json | `${config.DTC_APP_DIR}/deleted_ckpts.json`         |
|  9  |   Files   |     Mac      |                    | `ls `${config.DT_BASE_DIR}/Models`                 |
| 10  |   Files   |    Stash     |                    | `ls `${config.STASH_DIR}/Models`                   |
| 11  |  Parquet  |    Stash     |                    | `${config.STASH_DIR}/App_Data/ckpt.parquet`        |


### `App_State` - in javascript memory 

```
{
	"mac": {
		"models":[],
		"loras":[],
		"controls":[]
		},
	"stash":{
		"models":[],
		"loras":[],
		"controls":[]
		},
	"ckpts": {
		"mac": [],
		"stash": []
		}
	"settings":{
		"DT_BASE_DIR:  "~/Library/Containers/com.liuliu.draw-things/Data/Documents",
		"STASH_DIR":   "/Volumes/Extreme2Tb/__DrawThings_Stash__",
		"DTC_APP_DIR": "~/.drawthings_companion"
}
```


**Possible future functionality**
 - DrawThings JSON, 'settings.json' and 'deleted_ckpts.json' versioning - perhaps git