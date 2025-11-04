# app_first_run() & app_init()


### app_first_run() - Runs ONLY on First Launch

**File**: src/lib/tauri_handlers/app_first_run.js

**Purpose**: One-time setup to create app infrastructure

**What it does**:
1. Takes user-provided directory paths (from setup wizard)
2. Creates settings.json with initialized: true flag
3. Saves settings to two locations (primary + backup in stash)
4. Creates SQLite database schema with three tables:
- ckpt_models - model metadata
- ckpt_x_ckpt - model relationships
- config - app configuration
5. Creates necessary directories

**Key characteristic**: Write-heavy, creates persistent storage structure

---

### app_init() - Runs on EVERY App Start

**File**: src/lib/tauri_handlers/app_init.js

**Purpose**: Load configuration and sync models with current state

**What it does**:
1. Loads config from .env + settings.json
2. Expands paths (like ~ to /Users/username)
3. Applies default directories if missing
4. Scans DrawThings directory for models/LoRAs/ControlNets
5. Updates database with any new/changed models
6. Returns the merged configuration

**Key characteristic**: Read-only for config, but actively syncs models from disk to database


---

### How They Work Together

```
  App Launches
      ↓
  Call app_init() [ALWAYS runs]
      ├─ Loads config
      └─ Checks: Does settings.json have "initialized: true"?
          │
          ├─ YES → needsSetup = false
          │   └─ App runs normally
          │       └─ app_init() syncs models on every startup
          │
          └─ NO → needsSetup = true
              └─ Show SetupWizard
                  └─ User provides paths
                      └─ Call app_first_run(dtBaseDir, stashDir) [ONE TIME]
                          └─ Creates settings.json with initialized: true
                          └─ Creates database
                          └─ Next launch: app_init() will find initialized=true
```
  ---
  **Why Both Are Needed**

  | Need                            | Solution                                    |
  |---------------------------------|---------------------------------------------|
  | Create database once            | app_first_run()                             |
  | Keep models synced every launch | app_init()                                  |
  | Know if setup is complete       | app_first_run() sets initialized: true flag |
  | Load config every time          | app_init() reads the flag                   |

  ---
**Analogy**
 - `app_first_run()` = Installing software (create folders, database, config)
 - `app_init()` = Starting software (load config, check for new files)

The confusion is understandable because `app_init()` also does model scanning, which feels like "initialization." But it's really synchronization - keeping the database updated with what's actually on disk.