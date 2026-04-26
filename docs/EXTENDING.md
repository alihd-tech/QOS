# Extending QOS - Developer Guide

Complete guide to extending QOS with new apps, features, and customizations.

## Table of Contents

1. [Creating a New App](#creating-a-new-app)
2. [App Store Categories](#app-store-categories)
3. [Advanced App Features](#advanced-app-features)
4. [Adding Menu Items](#adding-menu-items)
5. [Custom Wallpapers](#custom-wallpapers)
6. [Styling & Theming](#styling--theming)
7. [Adding Blockchain Features](#adding-blockchain-features)
8. [Testing Your Extensions](#testing-your-extensions)

## Creating a New App

### Step 1: Create the App Component

Create a new file in `components/macos/apps/`:

```typescript
// components/macos/apps/todo-app.tsx
'use client';

import { WindowComponent } from '@/components/macos/window';
import { useState } from 'react';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useOS } from '@/components/macos/os-context';

export function TodoApp() {
  const { focusedWindowId } = useOS();
  const [todos, setTodos] = useState<Array<{ id: string; text: string; done: boolean }>>([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    const newTodo = {
      id: Date.now().toString(),
      text: input,
      done: false
    };
    setTodos([...todos, newTodo]);
    setInput('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white">
      {/* App content doesn't need WindowComponent wrapper - that's handled by the OS */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {todos.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No todos yet. Add one below!
          </div>
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="flex-shrink-0 text-blue-500 hover:text-blue-600"
              >
                <CheckCircle2
                  size={20}
                  fill={todo.done ? 'currentColor' : 'none'}
                />
              </button>
              <span
                className={`flex-1 ${
                  todo.done ? 'line-through text-gray-400' : 'text-gray-800'
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="flex-shrink-0 text-red-500 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-4 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add
        </button>
      </div>
    </div>
  );
}
```

### Step 2: Register the App

Add to `components/macos/app-icons.tsx`:

```typescript
import { TodoApp } from './apps/todo-app';
import { CheckSquare } from 'lucide-react';

// Add to APP_REGISTRY array
{
  id: 'todo',
  name: 'Todo',
  category: 'productivity',
  icon: <CheckSquare size={24} className="text-blue-500" />,
  isSystem: false,
  component: <TodoApp />,
  width: 500,
  height: 600,
  description: 'Manage your daily tasks and todos',
}
```

### Step 3: Add App Store Metadata (Optional)

Create a metadata file for the App Store listing:

```typescript
// In APP_REGISTRY, apps can include optional fields:
{
  id: 'todo',
  name: 'Todo',
  category: 'productivity',
  icon: <CheckSquare size={24} className="text-blue-500" />,
  isSystem: false,
  component: <TodoApp />,
  width: 500,
  height: 600,
  description: 'Manage your daily tasks and todos',
  
  // Optional App Store fields
  rating: 4.8,
  downloads: '12.3K',
  version: '1.0.0',
  developer: 'Your Name',
  screenshots: [
    '/screenshots/todo-1.png',
    '/screenshots/todo-2.png',
  ],
  website: 'https://yoursite.com',
}
```

### Step 4: Test Your App

1. Start dev server: `npm run dev`
2. Open app in browser
3. Connect wallet on login screen
4. Go to App Store
5. Find your app and install
6. Open from dock

## App Store Categories

Valid categories for organizing apps:

```typescript
type Category = 
  | 'system'         // System tools (cannot uninstall)
  | 'productivity'   // Work, notes, todo
  | 'utilities'      // Tools, calculator, terminal
  | 'media'          // Photos, music, video
  | 'entertainment'  // Games, streaming
  | 'developer'      // Dev tools, IDE
  | 'lifestyle'      // Weather, health, travel
```

## Advanced App Features

### Accessing OS State

```typescript
'use client';

import { useOS } from '@/components/macos/os-context';
import { useWallet } from '@solana/wallet-adapter-react';
import { useDevice } from '@/hooks/use-device';

export function MyApp() {
  // Access OS
  const { createWindow, closeWindow, focusedWindowId } = useOS();

  // Access Wallet
  const { publicKey, connected, signMessage } = useWallet();

  // Access Device Info
  const { isMobile, isTablet, isDesktop } = useDevice();

  return (
    <div>
      {connected && <p>Connected: {publicKey?.toBase58()}</p>}
      {isMobile && <p>You're on mobile!</p>}
    </div>
  );
}
```

### Creating Child Windows

Open a new window from within an app:

```typescript
function MyApp() {
  const { createWindow } = useOS();

  const openSettings = () => {
    createWindow('settings', 'Settings');
  };

  return <button onClick={openSettings}>Open Settings</button>;
}
```

### Storing App Data in localStorage

```typescript
const APP_DATA_KEY = 'myapp-data';

export function MyApp() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(APP_DATA_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const saveData = (newData: any) => {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(newData));
    setData(newData);
  };

  return (
    <div>
      {/* App UI using data and saveData */}
    </div>
  );
}
```

### Using Solana to Verify Ownership

```typescript
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function MyApp() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!publicKey) return;

    connection.getBalance(publicKey).then(lamports => {
      setBalance(lamports / LAMPORTS_PER_SOL);
    });
  }, [publicKey, connection]);

  return <div>Your balance: {balance.toFixed(2)} SOL</div>;
}
```

### Responsive App Layout

```typescript
import { useDevice } from '@/hooks/use-device';

export function MyApp() {
  const { isMobile, isTablet, isDesktop } = useDevice();

  if (isMobile) {
    return <MobileLayout />;
  }

  if (isTablet) {
    return <TabletLayout />;
  }

  return <DesktopLayout />;
}

function MobileLayout() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {/* Vertical layout for mobile */}
    </div>
  );
}

function DesktopLayout() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {/* 2-column layout for desktop */}
    </div>
  );
}
```

## Adding Menu Items

Extend menu bar items for specific apps by updating `menu-bar.tsx`:

```typescript
// In menu-bar.tsx, add to the focused app's menu logic:

const getAppMenuItems = (appId: string | null) => {
  switch (appId) {
    case 'safari':
      return [
        { label: 'File', submenu: ['New Tab', 'New Window', 'Close'] },
        { label: 'Edit', submenu: ['Undo', 'Redo', 'Copy', 'Paste'] },
        { label: 'View', submenu: ['Reload', 'Zoom In', 'Zoom Out'] },
      ];
    case 'notes':
      return [
        { label: 'File', submenu: ['New Note', 'Save', 'Delete'] },
        { label: 'Edit', submenu: ['Undo', 'Copy', 'Paste', 'Select All'] },
      ];
    default:
      return [];
  }
};
```

## Custom Wallpapers

### Replace Default Wallpaper

1. Generate or select a new wallpaper image
2. Save to `public/wallpaper.jpg`
3. Update `desktop.tsx` if needed:

```typescript
<div
  className="bg-center bg-cover h-screen"
  style={{
    backgroundImage: 'url(/your-wallpaper.jpg)',
  }}
>
```

### Per-App Backgrounds

```typescript
export function MyApp() {
  return (
    <div
      className="h-full flex flex-col"
      style={{
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* App content */}
    </div>
  );
}
```

## Styling & Theming

### Using Design Tokens

Colors are defined in `app/globals.css`:

```css
:root {
  --primary: 211 100% 50%;        /* Blue */
  --background: 220 14% 96%;      /* Light gray */
  --foreground: 220 9% 12%;       /* Dark text */
  --window-bg: 0 0% 100% / 0.85;  /* Semi-transparent white */
  --dock-bg: 0 0% 100% / 0.45;    /* More transparent */
  --traffic-close: 0 80% 58%;     /* Red */
  --traffic-minimize: 44 95% 55%; /* Yellow */
  --traffic-maximize: 130 60% 48%;/* Green */
}
```

### Using in Components

```typescript
export function MyApp() {
  return (
    <div className="bg-primary text-white">
      {/* Primary blue background */}
    </div>
  );
}
```

### Customizing Theme

Edit `app/globals.css` to change colors globally:

```css
:root {
  --primary: 0 100% 50%;    /* Change to red */
  --background: 260 30% 90%; /* Change to purple-tinted white */
}
```

### Using Glassmorphism

Apply macOS-style blur effects:

```typescript
<div className="glass bg-white/80 backdrop-blur-lg rounded-xl">
  {/* Glassmorphism card */}
</div>

<div className="glass-light bg-white/60 backdrop-blur-md rounded-lg">
  {/* Lighter glass effect */}
</div>
```

## Adding Blockchain Features

### Accept SOL Payments

```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

export function DonateApp() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleDonate = async (amount: number) => {
    if (!publicKey) return;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey('YOUR_WALLET_ADDRESS'),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendTransaction(transaction, connection);
    console.log('Transaction:', signature);
  };

  return (
    <button onClick={() => handleDonate(0.1)}>
      Donate 0.1 SOL
    </button>
  );
}
```

### Check Token Balance

```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

export function TokenCheckApp() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!publicKey) return;

    const checkBalance = async () => {
      // Example: Check USDC balance
      const USDC_MINT = new PublicKey(
        'EPjFWaLb3odcccccccccccccccccccccccccccccccccc'
      );

      const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const balance = await connection.getTokenAccountBalance(ata);
      console.log('USDC Balance:', balance.value.uiAmount);
    };

    checkBalance();
  }, [publicKey, connection]);

  return <div>{/* Display balance */}</div>;
}
```

### Verify Message Signature

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SignerWalletAdapterProps } from '@solana/web3.js';
import nacl from 'tweetnacl';

export function SignatureCheckApp() {
  const { publicKey, signMessage } = useWallet();

  const verifyMessage = async () => {
    if (!publicKey || !signMessage) return;

    const message = new TextEncoder().encode('Sign this message to verify');
    const signature = await signMessage(message);

    const verified = nacl.sign.detached.verify(
      message,
      signature,
      publicKey.toBytes()
    );

    console.log('Signature valid:', verified);
  };

  return <button onClick={verifyMessage}>Verify Signature</button>;
}
```

## Testing Your Extensions

### Manual Testing

1. **Install**: Open App Store, click Install
2. **Launch**: Click dock icon
3. **Close**: Click red traffic light
4. **Minimize**: Click yellow traffic light
5. **Drag**: Move window by title bar
6. **Resize**: Drag from corners
7. **Uninstall**: Open App Store, click Uninstall

### Testing on Mobile

```bash
# Use browser DevTools device emulation:
# 1. Open DevTools (F12)
# 2. Click device icon (top-left)
# 3. Select iPhone/iPad preset
# 4. Verify iOS layout appears
```

### LocalStorage Debugging

```typescript
// In browser console:
localStorage.getItem('qos-installed-apps');
JSON.parse(localStorage.getItem('qos-installed-apps'));

// Clear all data:
localStorage.clear();
```

### Console Logging

```typescript
'use client';

export function MyApp() {
  useEffect(() => {
    console.log('[v0] App mounted');
    console.log('[v0] Current wallet:', publicKey?.toBase58());
    
    return () => console.log('[v0] App unmounted');
  }, [publicKey]);

  return <div>{/* App content */}</div>;
}
```

### Error Handling

```typescript
function MyApp() {
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      // Your code
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[v0] Error:', message);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded">
        Error: {error}
      </div>
    );
  }

  return <div>{/* App content */}</div>;
}
```

## Common Patterns

### Loading State

```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  try {
    setLoading(true);
    // Async operation
  } finally {
    setLoading(false);
  }
};

return (
  <button disabled={loading} onClick={handleAction}>
    {loading ? 'Loading...' : 'Click me'}
  </button>
);
```

### Modal/Dialog

```typescript
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <button onClick={() => setIsOpen(true)}>Open Modal</button>
    
    {isOpen && (
      <div className="fixed inset-0 bg-black/40 glass flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm">
          <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
          <p className="text-gray-600 mb-6">Are you sure?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Action
                setIsOpen(false);
              }}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
```

### Lists with Search

```typescript
const [search, setSearch] = useState('');

const filtered = items.filter(item =>
  item.name.toLowerCase().includes(search.toLowerCase())
);

return (
  <div className="flex flex-col gap-4">
    <input
      type="text"
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder="Search items..."
      className="px-3 py-2 border rounded-lg"
    />
    <div className="space-y-2">
      {filtered.length === 0 ? (
        <p className="text-gray-400">No items found</p>
      ) : (
        filtered.map(item => <ItemRow key={item.id} item={item} />)
      )}
    </div>
  </div>
);
```

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for deeper understanding
- Check existing apps in `components/macos/apps/` for examples
- Review [APP_DEVELOPMENT.md](./APP_DEVELOPMENT.md) for advanced patterns
- Join community for questions and feedback

Happy building!
