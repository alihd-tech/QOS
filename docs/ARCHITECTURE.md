# QOS Architecture

Comprehensive overview of QOS system architecture, component hierarchy, and data flow.

## System Overview

QOS is a web-based operating system built with React and Next.js. It manages:
- **Window Management**: Creating, positioning, sizing, and layering windows
- **App Lifecycle**: Installing, launching, and closing applications
- **State Management**: Centralized OS state through Context API
- **Responsive UI**: Adaptive layouts for desktop and mobile devices
- **Blockchain Integration**: Solana wallet connectivity and identity

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    page.tsx                         │
│         (Login Orchestrator & Router)               │
└────────────┬────────────────────────────────────────┘
             │
     ┌───────┴────────┐
     │                │
┌────▼──────┐   ┌─────▼───────┐
│LoginScreen│   │ OSProvider  │
│ (Wallet   │   │  (Context)  │
│Connection)│   └─────┬───────┘
└───────────┘         │
              ┌───────┴────────────────────┐
              │                            │
         ┌────▼─────┐          ┌───────────▼────┐
         │ Desktop  │          │ MobileShell    │
         └────┬─────┘          └────────────────┘
              │
       ┌──────┼───────────┐
       │      │           │
    ┌──▼──┐ ┌─▼─┐    ┌────▼──┐
    │Menu │ │ Dock    │Windows│
    │Bar  │ └───┘    └───────┘
    └─────┘
       │
    ┌──▼────────────────────┐
    │   App Windows         │
    │ ┌────┐ ┌────┐ ┌────┐ │
    │ │Finder│Safari│Notes│ │
    │ │...          │      │ │
    │ └────┘ └────┘ └────┘ │
    └──────────────────────┘
```

## Core Components

### 1. Entry Point: `page.tsx`

**Responsibility**: Route between login screen and desktop based on wallet connection state

```typescript
export default function Home() {
  const { publicKey } = useWallet();
  const isMounted = useIsMounted();
  
  if (!isMounted) return null;
  if (!publicKey) return <LoginScreen />;
  return <Desktop />;
}
```

**Key Patterns**:
- Hydration safety with `useIsMounted()` hook
- Wallet state drives navigation
- No state management needed at this level

### 2. OS Context: `os-context.tsx`

**Responsibility**: Global operating system state management

```typescript
interface OSContextType {
  // App State
  installedApps: string[];
  installApp(appId: string): void;
  uninstallApp(appId: string): void;
  getAppConfig(appId: string): AppConfig | undefined;
  getAllAppConfigs(): AppConfig[];
  
  // Window State
  openWindows: Window[];
  createWindow(appId: string, appName: string): void;
  closeWindow(windowId: string): void;
  focusWindow(windowId: string): void;
  minimizeWindow(windowId: string): void;
  updateWindowPosition(windowId: string, x: number, y: number): void;
  updateWindowSize(windowId: string, width: number, height: number): void;
  
  // Focus Management
  focusedWindowId: string | null;
  bringToFront(windowId: string): void;
}
```

**Storage**: Uses localStorage for persistence

```typescript
const STORAGE_KEY = 'qos-installed-apps';
const WINDOW_STATE_KEY = 'qos-window-state';
```

**App Registration**: Centralized in `app-icons.tsx` with app metadata

### 3. Desktop Container: `desktop.tsx`

**Responsibility**: 
- Detect device type (mobile vs desktop)
- Route to appropriate shell
- Manage overall layout

```typescript
function Desktop() {
  const { isMobile, isTablet } = useDevice();
  
  if (isMobile) return <MobileShell />;
  return (
    <div className="bg-center bg-cover h-screen overflow-hidden">
      <MenuBar />
      <WindowContainer />
      <Dock />
    </div>
  );
}
```

### 4. Menu Bar: `menu-bar.tsx`

**Responsibility**:
- Display QOS logo (Q icon)
- Show current app menu items
- Display system status (time, battery, Wi-Fi, wallet address)

**Structure**:
```
┌──────────────────────────────────────────────┐
│ Q │ App Menu │  ─  │            Status Icons│
└──────────────────────────────────────────────┘
```

**Features**:
- Dynamic menu based on focused app
- Wallet address display with disconnect option
- Time sync with browser
- Status icon animations

### 5. Dock: `dock.tsx`

**Responsibility**:
- Display icons for installed apps only
- Show app launch indicator
- Handle app launching

**Features**:
- Hover magnification animation
- System apps (Finder, Settings, App Store) always visible
- Dynamic population from installed apps
- Click to launch or focus

### 6. Window Component: `window.tsx`

**Responsibility**: 
- Render draggable, resizable window container
- Manage window chrome (title bar, traffic lights)
- Handle mouse interactions

**Window Structure**:
```
┌─────────────────────────────────┐
│ 🔴 🟡 🟢 │ Title        │ ─ □ ✕ │ ← Toolbar
├─────────────────────────────────┤
│                                 │
│   App Content                   │
│                                 │
├─────────────────────────────────┤
│ (Resize handles on edges)       │
└─────────────────────────────────┘
```

**Mouse Events**:
- Drag anywhere on title bar
- Resize from corners & edges
- Traffic lights for window control
- Click to focus

### 7. Mobile Shell: `mobile-shell.tsx`

**Responsibility**: 
- Provide iOS-style interface for mobile devices
- Show tab bar navigation
- Full-screen app display
- Touch-optimized interactions

**Features**:
- Bottom tab bar with app icons
- Full-screen app display
- No window chrome (windows are full-screen)
- Safe area insets for notched phones
- Swipe-friendly spacing

## Wallet Integration

### Provider Stack

```
┌───────────────────────────────────┐
│  app/layout.tsx                  │
│  (WalletProvider wrapper)        │
├───────────────────────────────────┤
│  @solana/wallet-adapter-react    │
│  (State & connection logic)      │
├───────────────────────────────────┤
│  components/wallet/wallet-provider│
│  (Adapter configuration)          │
├───────────────────────────────────┤
│  Phantom & Solflare Adapters     │
│  (Wallet implementations)         │
└───────────────────────────────────┘
```

### Login Flow

```
1. User sees LoginScreen
2. Click "Connect Wallet"
3. WalletModal opens with options
4. Select Phantom or Solflare
5. Wallet extension/mobile opens
6. User approves connection
7. publicKey becomes available
8. page.tsx detects publicKey change
9. Routes to Desktop
10. MenuBar shows wallet address
```

## Data Flow: Installing an App

```
1. AppStore (app) renders
2. User clicks "Install" on Weather
3. appstore-app.tsx calls: os.installApp('weather')
4. os-context.tsx:
   - Adds 'weather' to installedApps array
   - Saves to localStorage
   - Triggers context update
5. Dock component re-renders
6. Weather icon appears in dock
7. User can now click to launch
8. createWindow('weather') creates window instance
9. Window mounts weather-app.tsx component
```

## Data Flow: Opening a Window

```
1. User clicks app icon in dock
2. dock.tsx calls: os.createWindow(appId, appName)
3. os-context.tsx:
   - Generates unique windowId
   - Creates Window object
   - Adds to openWindows array
   - Sets focusedWindowId to new window
   - Increments zIndex for layering
4. Desktop re-renders
5. Window component mounts with app component
6. App renders inside window container
7. User can now interact with app
```

## Data Flow: Dragging a Window

```
1. User mouseDown on window title bar
2. window.tsx captures position (startX, startY)
3. windowMouseDown handler:
   - Calls os.focusWindow(windowId)
   - Sets isDragging = true
   - Records initial position
4. Global mousemove listener:
   - Calculates delta (currentX - startX)
   - Calls os.updateWindowPosition(windowId, newX, newY)
   - Style updated with transform/position
5. mouseUp:
   - Sets isDragging = false
   - Cleans up event listeners
6. Window position persisted to state
```

## State Management Patterns

### Context API Flow

```typescript
// Create OS context
const OSContext = createContext<OSContextType | undefined>(undefined);

// Provider component
export function OSProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OSState>(initialState);
  
  const createWindow = (appId: string, appName: string) => {
    const newWindow = { id, appId, title: appName, ... };
    setState(prev => ({
      ...prev,
      openWindows: [...prev.openWindows, newWindow],
      focusedWindowId: newWindow.id
    }));
  };
  
  return (
    <OSContext.Provider value={{ ...state, createWindow, ... }}>
      {children}
    </OSContext.Provider>
  );
}

// Usage hook
export function useOS() {
  const context = useContext(OSContext);
  if (!context) throw new Error('useOS must be inside OSProvider');
  return context;
}
```

### localStorage Persistence

```typescript
// Save on install
localStorage.setItem(STORAGE_KEY, JSON.stringify(installedApps));

// Load on init
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
setInstalledApps(saved);
```

## Responsive Design Architecture

### Device Detection: `use-device.ts`

```typescript
export function useDevice() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => removeEventListener('resize', handleResize);
  }, []);
  
  return { isMobile, isTablet, isDesktop: !isMobile };
}
```

### Breakpoints

- **Mobile**: < 768px (iOS-style shell)
- **Tablet**: 768px - 1024px (Adaptive layout)
- **Desktop**: > 1024px (Full window management)

### Responsive Component Behavior

```typescript
function Desktop() {
  const { isMobile } = useDevice();
  
  // Mobile: Full-screen apps in tab bar
  if (isMobile) return <MobileShell />;
  
  // Desktop: Windows with menu bar and dock
  return (
    <>
      <MenuBar />
      <WindowContainer />
      <Dock />
    </>
  );
}
```

## App System Architecture

### App Registration

Apps are defined in `app-icons.tsx`:

```typescript
const APP_REGISTRY: AppConfig[] = [
  {
    id: 'finder',
    name: 'Finder',
    category: 'system',
    icon: <FolderIcon />,
    isSystem: true,
    component: <FinderApp />,
    width: 800,
    height: 600,
    description: 'Browse files and folders'
  },
  // More apps...
];
```

### App Lifecycle

```
1. App defined in APP_REGISTRY
2. Dock shows icon if installed
3. User clicks icon
4. createWindow() creates Window instance
5. Window renders app component
6. App has access to:
   - WindowComponent (chrome)
   - useOS() (for state)
   - useWallet() (for blockchain)
7. User closes window
8. Window removed from openWindows
9. App component unmounts
```

### System vs Installable Apps

**System Apps** (isSystem: true):
- Always installed
- Cannot be uninstalled
- Examples: Finder, Settings, App Store

**Installable Apps** (isSystem: false):
- Default not installed
- Can be installed via App Store
- Removed from dock on uninstall
- Examples: Calculator, Notes, Weather

## Communication Patterns

### Parent to Child Props

```typescript
// Window component
<WindowComponent
  title="App Name"
  appId="appid"
  icon={<IconComponent />}
>
  {children}
</WindowComponent>

// Inside app
function MyApp() {
  return <WindowComponent title="My App" {...props}>
    {/* App UI */}
  </WindowComponent>
}
```

### Child to Parent via Context

```typescript
function MyApp() {
  const os = useOS(); // Access parent state
  
  const handleAction = () => {
    os.createWindow('newapp', 'New App');
  };
  
  return <button onClick={handleAction}>Open</button>;
}
```

### Global State via Hooks

```typescript
// In any component
const { publicKey, connected } = useWallet();
const { isMobile } = useDevice();
const { openWindows, focusedWindowId } = useOS();
```

## Performance Optimizations

### Code Splitting

Apps are imported dynamically:

```typescript
const FinderApp = dynamic(() => import('./apps/finder-app'));
const WeatherApp = dynamic(() => import('./apps/weather-app'));
```

### Memoization

```typescript
const MemoizedWindow = memo(WindowComponent, (prev, next) => {
  return prev.position === next.position &&
         prev.size === next.size &&
         prev.focused === next.focused;
});
```

### Event Delegation

Mouse events use event bubbling:

```typescript
document.addEventListener('mousemove', handleMouseMove); // Global
document.addEventListener('mouseup', handleMouseUp);     // Global
// vs
element.addEventListener('mousedown', handleMouseDown);   // Local
```

### localStorage Caching

State is persisted and restored instantly:

```typescript
// Instant load from localStorage
const [installedApps, setInstalledApps] = useState(
  () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
);
```

## Extension Points

### Adding a New App

1. Create `components/macos/apps/newapp-app.tsx`
2. Register in `app-icons.tsx`
3. Access `useOS()`, `useWallet()`, `useDevice()`

### Adding a Wallet

1. Import wallet adapter from `@solana/wallet-adapter-wallets`
2. Add to `wallets` array in `wallet-provider.tsx`
3. Automatically available in LoginScreen modal

### Adding Menu Items

1. Update MenuBar app menu logic
2. Create menu item components
3. Dispatch actions via `useOS()`

### Custom Storage

1. Extend localStorage in `os-context.tsx`
2. Or use IndexedDB for larger data
3. Persist on state change

## Error Handling

### Try-Catch in Context

```typescript
const installApp = (appId: string) => {
  try {
    const exists = APP_REGISTRY.find(app => app.id === appId);
    if (!exists) throw new Error(`App ${appId} not found`);
    
    setState(prev => ({
      ...prev,
      installedApps: [...prev.installedApps, appId]
    }));
  } catch (error) {
    console.error('Failed to install app:', error);
  }
};
```

### Component Error Boundaries

Wrap critical components:

```typescript
<ErrorBoundary>
  <WindowContainer />
</ErrorBoundary>
```

## Conclusion

QOS uses a simple but effective architecture:
- **Single context for global state** (OSProvider)
- **Props for component configuration**
- **Hooks for custom behavior** (useOS, useWallet, useDevice)
- **localStorage for persistence**
- **Responsive design with mobile shell**
- **Modular app system for extensibility**

This makes it easy to add features while maintaining code organization.
