# File Management Functionality

### On App First Run
1. Ensure that the stash directory exists (`STASH_DIR`) ie `mkdir -p [STASH_DIR]/Models` and set `STASH_EXISTS=true`
2. If the stash directory has no model files, transfer all model files from to the stash directory. Ie `mkdir -p [STASH_DIR]/Models/ && cp [DT_BASE_DIR]/Models/*.ckpt [STASH_DIR]/Models/`
3. Copy any missing JSON files to the Stash directory - ie `cp [DT_BASE_DIR]/Models/*.json [STASH_DIR]/Models/`
4. ensure the SQLite3 dataqbase exists - ie `[DTC_APP_DIR]/drawthings_companion.sqlite`

