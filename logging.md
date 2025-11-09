# Logging for development

With that the app logic is running in the Svelte frontend - Rust logging would not be sufficient for development. So we'll need to add a little bit of extra functionality to Achieve good logging visibility for app development.


### Rust logging functions 

**1) logger()**
 - Logs strings to `/z_logs/logger.log`
 - Frontend JavaScript will call this function to with all development logging 
 - Frontend console logging should largely be avoided for development purposes and used sparingly for front-end related logging. 
 - The Rust function will simply append the string to the logging file. 
 - Log string date and formatting will be added in JavaScript front end. 


**2) log_json_file()**

- Rust funciton writes/overwrites JSON files `/z_logs/*.json*`
- FrontEnd javascript will pass a single argument to Rust- `JSON.Stringify(object)`

**Log files will include;**
```
- mac_ckpts
- mac_models.json
- mac_loras.json
- mac_controls.json
- stash_ckpts.json
- stash_models.json
- stash_loras.json
- stash_controls.json
- settings.json
- deleted_ckpts.json
```


