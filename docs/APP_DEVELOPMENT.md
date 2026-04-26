# QOS App Development Guide

Advanced patterns and best practices for developing high-quality QOS apps.

## Table of Contents

1. [App Structure Best Practices](#app-structure-best-practices)
2. [Performance Optimization](#performance-optimization)
3. [State Management Patterns](#state-management-patterns)
4. [Handling Async Operations](#handling-async-operations)
5. [Accessibility](#accessibility)
6. [Testing](#testing)
7. [Debugging](#debugging)

## App Structure Best Practices

### Component Organization

```
components/macos/apps/
├── my-advanced-app.tsx      (Main component)
├── hooks/
│   ├── useMyAppData.ts       (Custom data hook)
│   └── useMyAppSettings.ts   (Settings hook)
├── utils/
│   ├── parse.ts              (Data parsing)
│   └── format.ts             (Data formatting)
├── types/
│   └── index.ts              (TypeScript types)
└── constants/
    └── defaults.ts           (Default values)
```

### Type-Safe App Development

```typescript
// types/index.ts
export interface Item {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface AppState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

// hooks/useMyAppData.ts
import { useCallback, useEffect, useState } from 'react';
import type { Item, AppState } from '../types';

export function useMyAppData() {
  const [state, setState] = useState<AppState>({
    items: [],
    loading: false,
    error: null,
  });

  const addItem = useCallback((title: string) => {
    setState(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now().toString(),
          title,
          completed: false,
          createdAt: new Date(),
        },
      ],
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  }, []);

  return { ...state, addItem, removeItem };
}

// my-advanced-app.tsx
import { useMyAppData } from './hooks/useMyAppData';
import type { Item } from './types';

export function MyAdvancedApp() {
  const { items, loading, error, addItem, removeItem } = useMyAppData();

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="bg-red-100 text-red-800 p-3">
          {error}
        </div>
      )}
      {/* UI using typed data */}
    </div>
  );
}
```

## Performance Optimization

### Memoization

```typescript
import { memo, useCallback } from 'react';

// Memoize list items
const ItemRow = memo(function ItemRow({ item, onDelete }: ItemRowProps) {
  return (
    <div className="flex items-center justify-between p-3">
      <span>{item.title}</span>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  );
});

// Parent component
export function ItemList({ items, onDelete }: ItemListProps) {
  // Use useCallback to maintain referential equality
  const handleDelete = useCallback((id: string) => {
    onDelete(id);
  }, [onDelete]);

  return (
    <div>
      {items.map(item => (
        <ItemRow
          key={item.id}
          item={item}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### useMemo for Expensive Computations

```typescript
import { useMemo } from 'react';

export function StatsApp({ items }: { items: Item[] }) {
  // Compute stats only when items change
  const stats = useMemo(() => {
    return {
      total: items.length,
      completed: items.filter(i => i.completed).length,
      pending: items.filter(i => !i.completed).length,
      completionRate: items.length > 0
        ? (items.filter(i => i.completed).length / items.length) * 100
        : 0,
    };
  }, [items]);

  return (
    <div>
      <div>Total: {stats.total}</div>
      <div>Completed: {stats.completed}</div>
      <div>Completion: {stats.completionRate.toFixed(1)}%</div>
    </div>
  );
}
```

### Lazy Loading Lists

```typescript
import { useState, useCallback, useRef, useEffect } from 'react';

const ITEMS_PER_PAGE = 50;

export function LargeListApp({ allItems }: { allItems: Item[] }) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev =>
            Math.min(prev + ITEMS_PER_PAGE, allItems.length)
          );
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = listRef.current?.lastElementChild;
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [allItems.length]);

  const visibleItems = allItems.slice(0, displayCount);

  return (
    <div ref={listRef} className="space-y-2 overflow-auto">
      {visibleItems.map(item => (
        <ItemRow key={item.id} item={item} />
      ))}
      {displayCount < allItems.length && (
        <div className="text-center text-gray-500 py-4">
          Scroll to load more...
        </div>
      )}
    </div>
  );
}
```

### Virtual Scrolling for Very Large Lists

```typescript
import { FixedSizeList } from 'react-window';

export function VirtualListApp({ items }: { items: Item[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className="px-3 py-2 border-b">
      {items[index].title}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={48}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

## State Management Patterns

### useState for Simple State

```typescript
const [count, setCount] = useState(0);

// ✓ Good for simple values
// ✗ Not for complex interdependent state
```

### useReducer for Complex State

```typescript
interface State {
  items: Item[];
  selectedId: string | null;
  filter: 'all' | 'completed' | 'pending';
  loading: boolean;
}

type Action =
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'SET_FILTER'; payload: State['filter'] }
  | { type: 'SET_LOADING'; payload: boolean };

function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.payload),
      };
    case 'SELECT_ITEM':
      return { ...state, selectedId: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function ComplexApp() {
  const [state, dispatch] = useReducer(appReducer, {
    items: [],
    selectedId: null,
    filter: 'all',
    loading: false,
  });

  return (
    <div>
      {/* Use dispatch(action) to update state */}
      <button
        onClick={() =>
          dispatch({
            type: 'ADD_ITEM',
            payload: { id: '1', title: 'New', completed: false },
          })
        }
      >
        Add
      </button>
    </div>
  );
}
```

### Context for App-Wide State (Advanced)

```typescript
// AppContext.ts
import { createContext, useContext, useReducer } from 'react';

interface AppContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be inside AppProvider');
  return context;
}

// Usage in MyApp
export function MyAdvancedApp() {
  const { state, dispatch } = useAppContext();

  return (
    <AppProvider>
      <div>
        {/* Components can dispatch actions */}
      </div>
    </AppProvider>
  );
}
```

## Handling Async Operations

### useEffect for Data Fetching

```typescript
import { useEffect, useState } from 'react';

export function WeatherApp() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Prevent state updates on unmounted component

    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/weather');
        const data = await response.json();

        if (isMounted) {
          setWeather(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to fetch weather'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array = run once on mount

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return <div>{/* Display weather */}</div>;
}
```

### Abort Controller for Cancellation

```typescript
import { useEffect, useState } from 'react';

export function SearchApp() {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const search = async () => {
      try {
        const response = await fetch(`/api/search?q=${query}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        setResults(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          console.log('Request cancelled');
        }
      }
    };

    if (query) {
      search();
    } else {
      setResults([]);
    }

    return () => controller.abort();
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {/* Display results */}
    </div>
  );
}
```

### Debouncing for Expensive Operations

```typescript
import { useEffect, useState, useRef } from 'react';

export function DebounceExample() {
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      // Perform expensive operation
      console.log('Searching for:', value);
      // setResults(...)
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value]);

  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
      placeholder="Type to search..."
    />
  );
}
```

## Accessibility

### Semantic HTML

```typescript
// ✓ Good
<main>
  <section>
    <h1>App Title</h1>
    <article>Content</article>
  </section>
</main>

// ✗ Bad
<div>
  <div>
    <div>App Title</div>
    <div>Content</div>
  </div>
</div>
```

### ARIA Labels

```typescript
// Button without text
<button
  aria-label="Close window"
  onClick={close}
>
  ✕
</button>

// List navigation
<ul role="navigation" aria-label="Main navigation">
  <li><a href="/">Home</a></li>
  <li><a href="/about">About</a></li>
</ul>

// Live region for dynamic content
<div aria-live="polite" aria-atomic="true">
  {notification}
</div>
```

### Keyboard Navigation

```typescript
export function AccessibleApp() {
  const [focused, setFocused] = useState(0);
  const items = ['Item 1', 'Item 2', 'Item 3'];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        setFocused(prev => Math.max(0, prev - 1));
        break;
      case 'ArrowDown':
        setFocused(prev => Math.min(items.length - 1, prev + 1));
        break;
      case 'Enter':
        // Handle selection
        break;
    }
  };

  return (
    <ul onKeyDown={handleKeyDown} role="listbox">
      {items.map((item, i) => (
        <li
          key={i}
          role="option"
          tabIndex={focused === i ? 0 : -1}
          aria-selected={focused === i}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

### Color Contrast

```typescript
// ✓ Good contrast (WCAG AA compliant)
<div className="text-gray-800 bg-white">Dark text on light background</div>

// ✗ Bad contrast
<div className="text-gray-300 bg-white">Light text on light background</div>
```

## Testing

### Unit Testing with Jest

```typescript
// __tests__/utils.test.ts
import { formatDate, calculateStats } from '../utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('Jan 15, 2024');
    });
  });

  describe('calculateStats', () => {
    it('calculates completion rate', () => {
      const items = [
        { id: '1', completed: true },
        { id: '2', completed: false },
      ];
      const stats = calculateStats(items);
      expect(stats.completionRate).toBe(50);
    });
  });
});
```

### Component Testing with React Testing Library

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoApp } from '../todo-app';

describe('TodoApp', () => {
  it('adds a todo', () => {
    render(<TodoApp />);

    const input = screen.getByPlaceholderText('Add a new todo...');
    const button = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'Test todo' } });
    fireEvent.click(button);

    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('deletes a todo', () => {
    render(<TodoApp />);

    const input = screen.getByPlaceholderText('Add a new todo...');
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Add'));

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });
});
```

## Debugging

### Console Logging Best Practices

```typescript
'use client';

export function DebugApp() {
  useEffect(() => {
    console.log('[v0] App mounted');
    console.log('[v0] Current state:', { /* ... */ });

    return () => {
      console.log('[v0] App unmounted');
    };
  }, []);

  const handleAction = async (id: string) => {
    console.log('[v0] Action started:', id);

    try {
      const result = await fetch(`/api/action/${id}`);
      console.log('[v0] Action result:', result);
    } catch (error) {
      console.error('[v0] Action error:', error);
    }
  };

  return <div>{/* UI */}</div>;
}
```

### React DevTools

- Install React DevTools browser extension
- Inspect component tree
- View state and props
- Trigger re-renders
- Pause on re-render

### Debugging localStorage

```typescript
// In browser console:
// View all stored data
Object.entries(localStorage).forEach(([k, v]) => {
  console.log(k, JSON.parse(v));
});

// Clear specific key
localStorage.removeItem('qos-installed-apps');

// Clear everything
localStorage.clear();
```

### Network Debugging

```typescript
// Intercept fetch calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('[v0] Fetch:', args[0]);
  const response = await originalFetch(...args);
  console.log('[v0] Response:', response.status);
  return response;
};
```

## Best Practices Summary

- ✓ Use TypeScript for type safety
- ✓ Keep components small and focused
- ✓ Memoize expensive computations
- ✓ Use useCallback for event handlers
- ✓ Handle loading and error states
- ✓ Clean up effects and listeners
- ✓ Write accessible markup
- ✓ Test critical functionality
- ✓ Log with descriptive messages
- ✓ Document complex logic

- ✗ Don't use index as key in lists
- ✗ Don't ignore linting warnings
- ✗ Don't create functions in render
- ✗ Don't forget to clean up effects
- ✗ Don't mutate state directly
- ✗ Don't store sensitive data in localStorage
- ✗ Don't assume user has fast internet
- ✗ Don't ignore console errors

Happy developing!
