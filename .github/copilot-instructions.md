# AI Coding Guidelines for WMS WeChat Mini Program

## Architecture Overview
This is a WeChat Mini Program for warehouse management (WMS) with offline-first capabilities. The app manages inventory, piecework tracking, reconciliation, and audit logs.

**Key Components:**
- `pages/`: Page components (inventory, piecework, login, etc.)
- `components/`: Reusable UI components (advanced-search, chart, offline-status)
- `utils/`: Core utilities for data management, caching, and offline support

## Core Patterns & Conventions

### Data Loading
Use `DataLoader.loadBatch()` for concurrent API calls with caching:
```javascript
DataLoader.loadBatch([
  { type: 'single', url: '/piecework', options: { cache: true, cacheStrategy: SmartCacheManager.CACHE_STRATEGIES.DYNAMIC } },
  { type: 'list', url: '/inventory/items', options: { cache: true, maxItems: 5 } }
], { concurrent: true }).then(results => { /* handle results */ })
```

### Caching Strategy
Apply appropriate cache strategies from `SmartCacheManager`:
- `DYNAMIC`: For frequently changing data (piecework records)
- `STATIC`: For stable reference data (inventory items)
- `SESSION`: For user-specific temporary data

### Offline Support
Wrap API calls with `OfflineManager.createOfflineRequest()` for offline queueing:
```javascript
OfflineManager.createOfflineRequest(app, { url: '/piecework', method: 'POST', data: formData })
```

### Logging
Use structured logging via `Logger`:
```javascript
Logger.info('Page loaded')
Logger.error('API failed', error)
```

### Form Validation
Validate forms using `FormValidator.validate()` with predefined rules:
```javascript
const errors = FormValidator.validate(formData, {
  quantity: ['required', 'positiveInteger'],
  price: ['required', 'number', { rule: 'range', min: 0, max: 9999 }]
})
```

### API Communication
Route all API calls through `ApiService.request()` for consistent error handling and retry logic:
```javascript
ApiService.request({ url: '/inventory/items', method: 'GET' }, true, true)
```

### State Management
Use `globalStateManager` for cross-page state:
```javascript
const { globalStateManager } = require('../../utils')
globalStateManager.set('selectedItem', item)
```

## Development Workflow
- Develop in WeChat Developer Tools
- Test offline functionality by toggling network in dev tools
- Use `Logger.debug()` for development logging
- Cache data aggressively to minimize API calls

## File Structure Conventions
- Pages: `pages/{name}/{name}.js|json|wxml|wxss`
- Components: `components/{name}/{name}.js|json|wxml|wxss`
- Utils: `utils/{utility-name}.js` with class-based exports

## Key Files to Reference
- `utils/data-loader.js`: Batch data loading patterns
- `utils/api-service.js`: API request wrapper
- `utils/offline-manager.js`: Offline queue implementation
- `pages/index/index.js`: Dashboard data loading example
- `components/advanced-search/advanced-search.js`: Component lifecycle patterns</content>
<parameter name="filePath">d:\xm\xmm\-\.github\copilot-instructions.md