# DrawThings Companion - Svelte Test UI

This is a Svelte-based mockup of the DrawThings Companion UI using test data.

## Features

- **Exact UI match** to the current Next.js application
- **Mock data** - All model data is stored in `src/models.js`
- **No backend** - Pure frontend implementation with JavaScript objects
- **Reactive framework** - Built with Svelte for fast, reactive updates

## Project Structure

```
svelte-test/
├── src/
│   ├── components/
│   │   ├── Nav.svelte              # Navigation sidebar
│   │   ├── TwoPaneManager.svelte   # Main two-pane layout
│   │   └── views/
│   │       ├── ModelsView.svelte
│   │       ├── LoRAsView.svelte
│   │       ├── ControlNetsView.svelte
│   │       └── SettingsView.svelte
│   ├── models.js                    # ALL mock data and helper functions
│   ├── App.svelte                   # Root component
│   ├── main.js                      # Entry point
│   └── app.css                      # Global styles
└── package.json
```

## Running the App

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will run at `http://localhost:5173`

## Mock Data

All test data is defined in `src/models.js`:

- **mockModels** - Main model files (8 items: 4 on Mac HD, 4 stash-only)
- **mockLoras** - LoRA files (8 items: 4 on Mac HD, 4 stash-only)
- **mockControlNets** - ControlNet files (2 items: 1 on Mac HD, 1 stash-only)
- **mockConfig** - Application configuration

Helper functions:
- `getModelsByType(type)` - Returns { macModels, stashModels } for a given type
- `formatFileSize(bytes)` - Formats bytes to human-readable size
- `getDisplayName(model)` - Returns the best display name for a model

## UI Components

### Nav
- Left sidebar with icons and labels
- Highlights active section
- Navigates between: Models, LoRAs, ControlNets, Settings

### TwoPaneManager
- Two-column layout (Mac HD | Stash)
- Model cards with name, filename, and size
- Click to view model details modal
- Header with title and action buttons

### Views
- **ModelsView** - Shows main model files
- **LoRAsView** - Shows LoRA files
- **ControlNetsView** - Shows ControlNet files
- **SettingsView** - Shows configuration paths

## Customizing Mock Data

Edit `src/models.js` to add/modify/remove mock models:

```javascript
export const mockModels = [
  {
    filename: 'my_model.ckpt',
    display_name_original: 'My Model',
    display_name: null,
    model_type: 'model',
    file_size: 23800000000,
    exists_mac_hd: true,
    exists_stash: false,
    mac_display_order: 0,
    created_at: '2025-01-01T10:00:00Z'
  },
  // ... more models
];
```
