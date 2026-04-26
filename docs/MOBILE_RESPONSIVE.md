# Mobile & Responsive Design Guide

Complete guide to QOS's responsive architecture and mobile optimization.

## Table of Contents

1. [Device Detection](#device-detection)
2. [Layout Strategies](#layout-strategies)
3. [Mobile Shell (iOS-style)](#mobile-shell-ios-style)
4. [Desktop Experience](#desktop-experience)
5. [Responsive Components](#responsive-components)
6. [Safe Area Handling](#safe-area-handling)
7. [Touch Optimization](#touch-optimization)
8. [Performance on Mobile](#performance-on-mobile)
9. [Testing](#testing)

## Device Detection

### useDevice Hook

```typescript
// hooks/use-device.ts
import { useState, useEffect } from 'react';

export function useDevice() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);      // < 768px
      setIsTablet(width >= 768 && width < 1024); // 768-1024px
      setIsDesktop(width >= 1024);   // >= 1024px
    };

    // Check on mount
    handleResize();

    // Listen for orientation changes
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet, isDesktop };
}
```

### Usage in Components

```typescript
import { useDevice } from '@/hooks/use-device';

export function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useDevice();

  if (isMobile) {
    return <MobileLayout />;
  }

  if (isTablet) {
    return <TabletLayout />;
  }

  return <DesktopLayout />;
}
```

### Breakpoints

```
Mobile:    0px - 767px    (phones)
Tablet:    768px - 1023px (tablets)
Desktop:   1024px+        (desktops, laptops)
```

## Layout Strategies

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```typescript
// Good: Mobile-first
export function ResponsiveGrid() {
  return (
    <div className="
      grid
      grid-cols-1        // Mobile: 1 column
      md:grid-cols-2     // Tablet: 2 columns
      lg:grid-cols-3     // Desktop: 3 columns
      gap-4
    ">
      {/* Content */}
    </div>
  );
}

// Bad: Desktop-first (requires overrides)
<div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
```

### Responsive Spacing

```typescript
// Smaller padding on mobile, larger on desktop
<div className="
  p-2          // Mobile: p-2
  md:p-4       // Tablet: p-4
  lg:p-6       // Desktop: p-6
">
  Content
</div>
```

### Responsive Typography

```typescript
<h1 className="
  text-2xl     // Mobile
  md:text-3xl  // Tablet
  lg:text-4xl  // Desktop
">
  Responsive Heading
</h1>

<p className="
  text-sm      // Mobile
  md:text-base // Tablet
  lg:text-lg   // Desktop
">
  Responsive paragraph
</p>
```

## Mobile Shell (iOS-style)

### Architecture

The mobile shell provides an iOS-style interface for devices < 768px:

```
┌──────────────────────────┐
│   Status Bar (System)    │
├──────────────────────────┤
│                          │
│                          │
│    Full-Screen App       │
│                          │
│                          │
├──────────────────────────┤
│ [Finder] [Safari] [More] │  ← Tab Bar
└──────────────────────────┘
```

### Mobile Shell Component

```typescript
// components/macos/mobile-shell.tsx
import { useState } from 'react';
import { useOS } from './os-context';
import { useWallet } from '@solana/wallet-adapter-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  appId: string;
}

export function MobileShell() {
  const { openWindows, createWindow, closeWindow, focusedWindowId } = useOS();
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('finder');

  const tabs: TabItem[] = [
    { id: 'finder', label: 'Finder', icon: '📁', appId: 'finder' },
    { id: 'safari', label: 'Safari', icon: '🧭', appId: 'safari' },
    { id: 'more', label: 'More', icon: '⋯', appId: 'appstore' },
  ];

  const handleTabPress = (appId: string) => {
    setActiveTab(appId);
    
    // Check if app window is already open
    const existingWindow = openWindows.find(w => w.appId === appId);
    
    if (!existingWindow) {
      createWindow(appId, appId);
    }
  };

  const currentWindow = openWindows.find(w => w.appId === activeTab);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Status Bar */}
      <div className="bg-gray-100 text-gray-800 px-4 py-2 flex justify-between items-center text-xs font-medium">
        <span>9:41</span>
        {publicKey && (
          <span className="truncate max-w-xs">
            {publicKey.toBase58().slice(0, 8)}...
          </span>
        )}
        <span>🔋</span>
      </div>

      {/* App Content - Full Screen */}
      <div className="flex-1 overflow-hidden">
        {currentWindow ? (
          <div className="w-full h-full">
            {/* Render app component */}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select an app from the tab bar
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="
        border-t border-gray-200
        bg-white
        flex
        safe-bottom
        space-y-0
      ">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabPress(tab.appId)}
            className={`
              flex-1
              py-3
              flex flex-col items-center gap-1
              transition-colors
              ${activeTab === tab.id
                ? 'text-blue-500'
                : 'text-gray-600'
              }
            `}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Features

- **Full-screen apps**: No window chrome or menu bar
- **Tab-based navigation**: Familiar iOS tab bar
- **Status bar**: Time, wallet address, battery
- **Touch-friendly**: Large tap targets (minimum 44x44px)
- **Safe area**: Handles notches and home indicators

## Desktop Experience

### Layout Structure

```
┌─────────────────────────────────────┐
│  Menu Bar (Q icon, status icons)    │
├─────────────────────────────────────┤
│                                     │
│         Wallpaper Background        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ Finder   │  │ Safari   │        │
│  │ Window   │  │ Window   │        │
│  └──────────┘  └──────────┘        │
│                                     │
├─────────────────────────────────────┤
│  Dock (App Icons)                   │
└─────────────────────────────────────┘
```

### Desktop Component Logic

```typescript
// components/macos/desktop.tsx
import { useDevice } from '@/hooks/use-device';
import { MobileShell } from './mobile-shell';
import { MenuBar } from './menu-bar';
import { Dock } from './dock';
import { WindowContainer } from './window';

export function Desktop() {
  const { isMobile } = useDevice();

  // Route based on device type
  if (isMobile) {
    return <MobileShell />;
  }

  // Desktop layout
  return (
    <div className="
      fixed
      inset-0
      overflow-hidden
      bg-center bg-cover
    "
    style={{
      backgroundImage: 'url(/wallpaper.jpg)',
    }}>
      {/* Menu Bar */}
      <MenuBar />

      {/* Windows */}
      <WindowContainer />

      {/* Dock */}
      <Dock />
    </div>
  );
}
```

## Responsive Components

### Responsive Forms

```typescript
export function ResponsiveForm() {
  return (
    <form className="space-y-4">
      {/* Mobile: Stack vertically
           Desktop: 2 columns */}
      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-4
      ">
        <input
          type="text"
          placeholder="First name"
          className="px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Last name"
          className="px-3 py-2 border rounded"
        />
      </div>

      {/* Full width on all sizes */}
      <input
        type="email"
        placeholder="Email"
        className="
          w-full
          px-3 py-2
          border rounded
        "
      />

      {/* Responsive button size */}
      <button className="
        w-full
        px-4
        py-2
        md:py-3
        bg-blue-500
        text-white
        rounded
        font-medium
      ">
        Submit
      </button>
    </form>
  );
}
```

### Responsive Table

```typescript
export function ResponsiveTable() {
  return (
    <div className="overflow-x-auto">
      {/* Desktop: Real table */}
      <table className="hidden md:table w-full border">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Table rows */}
        </tbody>
      </table>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-4">
        {/* Card representation of data */}
      </div>
    </div>
  );
}
```

### Responsive Sidebar

```typescript
export function ResponsiveLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'w-64' : 'w-0'}
        md:w-64
        transition-all
        duration-300
        bg-gray-100
        overflow-hidden
      `}>
        <nav className="p-4 space-y-2">
          {/* Navigation items */}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-4"
        >
          ☰
        </button>
        {/* Main content */}
      </div>
    </div>
  );
}
```

## Safe Area Handling

### Safe Area Insets

For devices with notches, home indicators, or rounded corners:

```css
/* app/globals.css */
@supports (padding-top: env(safe-area-inset-top)) {
  .mobile-safe-top {
    padding-top: env(safe-area-inset-top);
  }
  
  .mobile-safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .mobile-safe-left {
    padding-left: env(safe-area-inset-left);
  }
  
  .mobile-safe-right {
    padding-right: env(safe-area-inset-right);
  }
  
  .mobile-safe-all {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
```

### Usage in Components

```typescript
// Notched phones: Title safe from notch
<div className="pt-2 md:pt-0">
  <h1>Content Safe from Notch</h1>
</div>

// Full-screen app with safe bottom for home indicator
<div className="flex flex-col h-full">
  <div className="flex-1 overflow-auto">
    {/* Scrollable content */}
  </div>
  <div className="border-t p-4 mobile-safe-bottom">
    {/* Tab bar or buttons */}
  </div>
</div>
```

## Touch Optimization

### Touch-Friendly Targets

```typescript
// Minimum 44x44px touch targets (iOS standard)
export function TouchFriendlyButton() {
  return (
    <button className="
      px-4 py-3              // Mobile: min 44px height
      md:px-6 md:py-2        // Desktop: smaller is ok
      bg-blue-500
      text-white
      rounded
    ">
      Tap Me
    </button>
  );
}
```

### Remove Tap Highlight

```css
/* app/globals.css */
@media (max-width: 767px) {
  button, a {
    -webkit-tap-highlight-color: transparent;
  }
}
```

### Touch Events

```typescript
export function TouchGestureApp() {
  const [touches, setTouches] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    console.log('Touch started:', e.touches.length);
  };

  const handleTouchEnd = () => {
    console.log('Touch ended');
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="p-4 bg-blue-100 rounded"
    >
      Touch me!
    </div>
  );
}
```

## Performance on Mobile

### Optimize Images

```typescript
// Bad: Large image on mobile
<img src="/large-image.jpg" alt="Icon" />

// Good: Responsive images
<img
  src="/icon-small.jpg"
  srcSet="/icon-small.jpg 480w, /icon-large.jpg 1024w"
  alt="Icon"
  className="w-full max-w-sm"
/>

// Best: Use Next.js Image
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Icon"
  width={400}
  height={300}
  responsive
  priority={false}
/>
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyComponent = dynamic(
  () => import('./heavy-component'),
  { loading: () => <div>Loading...</div> }
);

export function App() {
  return (
    <>
      <LightComponent />
      <HeavyComponent /> {/* Only loaded when needed */}
    </>
  );
}
```

### Reduce Bundle Size

```typescript
// Bad: Import entire library
import * as moment from 'moment';

// Good: Import only what you need
import format from 'date-fns/format';

// Or use native APIs
const date = new Date().toLocaleDateString();
```

### Disable Unused CSS

Tailwind automatically purges unused styles, but be explicit:

```typescript
// Specify content paths in tailwind.config.ts
content: [
  './app/**/*.{js,ts,jsx,tsx}',
  './components/**/*.{js,ts,jsx,tsx}',
],
```

## Testing

### Device Emulation

```bash
# Using browser DevTools
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select device preset (iPhone, iPad, etc)
4. Test responsiveness
```

### Testing Orientations

```typescript
// Simulate orientation change
// 1. Browser DevTools
// 2. Physical device: Rotate phone
// 3. Code:
window.innerWidth  // Check width after rotation
window.innerHeight // Check height after rotation
```

### Touch Event Testing

```typescript
// Simulate touch events in DevTools console
const touchEvent = new TouchEvent('touchstart', {
  bubbles: true,
  cancelable: true,
  touches: [
    new Touch({
      identifier: 0,
      target: document.getElementById('element'),
      clientX: 100,
      clientY: 200,
    }),
  ],
});

document.getElementById('element').dispatchEvent(touchEvent);
```

### Responsive Testing Checklist

- [ ] Layout reflows correctly at breakpoints
- [ ] Text is readable on mobile (minimum 16px)
- [ ] Touch targets are at least 44x44px
- [ ] Images scale appropriately
- [ ] Horizontal scroll doesn't occur
- [ ] Notch/safe areas don't cover content
- [ ] Form inputs are usable on touch
- [ ] Tab navigation works on mobile tab bar
- [ ] Performance is acceptable (< 3s load)
- [ ] All functionality works on mobile

## Best Practices

1. **Mobile-first**: Design mobile, enhance for larger screens
2. **Test on real devices**: Emulation ≠ real hardware
3. **Performance matters**: Mobile networks are slower
4. **Touch targets**: Minimum 44x44px on mobile
5. **Avoid hover**: Mobile users can't hover - use tap
6. **Safe areas**: Account for notches and home indicators
7. **Font sizes**: Minimum 16px base text on mobile
8. **Landscape mode**: Test both orientations
9. **Scrolling**: Smooth scrolling, avoid jank
10. **Accessibility**: Even more important on mobile

## Resources

- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Tailwind Responsive Prefixes](https://tailwindcss.com/docs/responsive-design)
- [CSS Safe Area](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [iOS HIG](https://developer.apple.com/design/human-interface-guidelines)
- [Material Design Mobile](https://material.io/blog/mobile-design)
