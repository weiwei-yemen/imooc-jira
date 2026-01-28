# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jira-like task management application built with React, TypeScript, and React Query. It's a learning project from an online course that demonstrates best practices for React application architecture.
use NODE_OPTIONS=--openssl-legacy-provider npm start to start server.

## Development Commands

### Core Development

- `npm start` - Start development server (uses craco)
- `npm run build` - Build for production
- `npm test` - Run tests in watch mode

### Backend Mock Server

The application uses `jira-dev-tool` for mocking the backend API during development. The mock server runs on `http://localhost:3001` (configured in `.env.development`).

### Code Quality

- Uses Prettier for formatting (configured in `.prettierrc.json`)
- ESLint rules extend `react-app`, `react-app/jest`, and `prettier`
- Husky + lint-staged run Prettier on staged files before commits

## Architecture

### Application Structure

**Entry Point Flow:**

- `src/index.tsx` → Loads jira-dev-tool, sets up providers (AppProviders)
- `src/context/index.tsx` → AppProviders wraps app with QueryClientProvider, BrowserRouter, and AuthProvider
- `src/App.tsx` → Routes to AuthenticatedApp or UnauthenticatedApp based on auth state

### Key Architectural Patterns

**1. Authentication Flow:**

- `src/auth-provider.ts` - Handles login/register/logout, stores token in localStorage (`__auth_provider_token__`)
- `src/context/auth-context.tsx` - AuthProvider manages user state, bootstrapUser() restores session on refresh
- On 401 responses, `src/utils/http.ts` automatically logs out and reloads

**2. HTTP Client Pattern:**

- `src/utils/http.ts` - Centralized fetch wrapper
  - Automatically includes Bearer token from auth context
  - Converts GET requests to query params, POST/PUT to JSON body
  - Handles 401 by logging out
  - Uses `useHttp()` hook to auto-inject user token

**3. Routing Architecture:**

- React Router v6 with nested routes
- Main routes: `/projects` (list), `/projects/:projectId/*` (detail with kanban/epic)
- Uses lazy loading for authenticated/unauthenticated apps

**4. Data Layer:**

- React Query for server state management
- Type definitions in `src/types/` for domain entities (Project, Task, Kanban, Epic, User, etc.)
- Utility functions in `src/utils/` organized by domain (e.g., `utils/project.ts`, `utils/task.ts`)

### Component Organization

**Screens:** Feature-level components in `src/screens/`

- `project-list/` - Project listing with search/filter
- `project/` - Project detail with kanban/epic sub-routes
- `kanban/` - Kanban board with drag-and-drop
- `epic/` - Epic management

**Shared Components:** `src/components/`

- `lib.tsx` - Common styled components (Row, ScreenContainer, FullPageLoading, ErrorBox)
- Domain-specific selects: `user-select.tsx`, `project-popover.tsx`, `task-type-select.tsx`
- `drag-and-drop.tsx` - Drag and drop utilities

### Key Technical Details

**Styling:**

- Emotion (@emotion/styled) for component styling
- Ant Design (antd) UI library with theme customization via craco
- Primary color: `rgb(0, 82, 204)`, Base font size: `16px` (see `craco.config.js`)

**Drag and Drop:**

- Uses `react-beautiful-dnd` for kanban board
- Reordering logic in `src/utils/reorder.ts`

**Performance Monitoring:**

- `@welldone-software/why-did-you-render` enabled in dev mode (`src/wdyr.ts`)
- Custom Profiler component in `src/components/profiler.tsx`

**TypeScript Configuration:**

- `baseUrl: ./src` for clean imports
- Strict mode enabled
- Path aliases work from `src/` directory

### Import Patterns

Due to `baseUrl: ./src` in tsconfig.json:

- Use clean imports: `import { http } from "utils/http"` (not `../../utils/http`)
- Auth provider imported as: `import * as auth from "auth-provider"`

### Environment Variables

- `.env.development` - `REACT_APP_API_URL=http://localhost:3001`
- Mock server provided by `jira-dev-tool` package

## Common Patterns

### Custom Hooks

- `useMount()` - Run callback on mount only
- `useDebounce()` - Debounce values
- `useArray()` - Array state management with helpers
- `useDocumentTitle()` - Manage document title with optional restoration
- `useMountedRef()` - Track if component is mounted

### Utility Functions

- `cleanObject()` - Remove empty/null/undefined values from objects
- `isVoid()` - Check if value is empty/null/undefined
- `subset()` - Extract specific keys from object

## Testing

- Uses React Testing Library
- `@testing-library/react-hooks` for hook testing
- MSW (Mock Service Worker) for API mocking (installed but setup not visible)
