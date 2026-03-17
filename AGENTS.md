# AGENTS.md - Agentic Coding Guidelines for IMOOC Jira

## Project Overview

This is a React 17 + TypeScript Jira-clone project using craco, Redux Toolkit, React Query, and Antd.

---

## Commands

### Development

```bash
npm start          # Start development server
```

### Build

```bash
npm run build      # Production build
```

### Testing

```bash
npm test                    # Run all tests in watch mode
npm test -- --watchAll=false    # Run tests once (CI mode)
npm test -- --testPathPattern=filename    # Run single test file
npm test -- --testNamePattern="test name" # Run specific test
```

### Linting & Formatting

```bash
# Prettier formats on pre-commit via husky + lint-staged
# Manual prettier:
npx prettier --write src/**/*.{ts,tsx,js,jsx,css}
```

### Git Hooks

- **Pre-commit**: Runs prettier on staged files
- **Commit-msg**: Runs commitlint (conventional commits format)

---

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - No `any` type or `@ts-ignore`
- Use utility types: `Partial`, `Omit`, `Pick`, `Exclude`
- Use `interface` for object shapes, `type` for unions/aliases
- Path aliases configured in tsconfig.json (baseUrl: "./src")

```typescript
// Good
interface User {
  id: string;
  name: string;
}
type UserOrNull = User | null;

// Avoid
const user: any = ...
```

### Imports

- Use path aliases (configured in tsconfig.json)
- Group imports: external → internal → relative

```typescript
// External (npm)
import React from "react";
import { Button } from "antd";

// Internal (path alias from src/)
import { useAuth } from "context/auth-context";
import { ProjectListScreen } from "screens/project-list";

// Relative
import { MyComponent } from "./my-component";
```

### Naming Conventions

- **Components**: PascalCase (e.g., `ProjectListScreen`)
- **Functions/Variables**: camelCase (e.g., `useHttp`, `handleSubmit`)
- **Files**: PascalCase for components (`ProjectModal.tsx`), camelCase for utilities (`http.ts`)
- **Constants**: SCREAMING_SNAKE_CASE for config values

### React Components

- Use functional components with hooks
- Destructure props
- Extract styled components to bottom of file

```typescript
// Component at top
export const MyComponent = ({ title, onSubmit }: Props) => {
  const [state, setState] = useState(false);

  return (
    <Container>
      <Title>{title}</Title>
      ...
    </Container>
  );
};

// Styled components at bottom
const Container = styled.div`...`;
const Title = styled.h1`...`;
```

### Error Handling

- Use Promise.reject for API errors with message
- Handle 401 (unauthorized) with logout and redirect
- Always handle loading/error states in components

```typescript
// HTTP errors
return Promise.reject({ message: "请重新登录" });

// Component error handling
if (response.ok) {
  return data;
} else {
  return Promise.reject(data);
}
```

### Redux Toolkit

- Use createSlice for state management
- Export actions and selectors
- Use thunks for async operations

```typescript
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
  },
});

export const login = (form: AuthForm) => (dispatch: AppDispatch) =>
  auth.login(form).then((user) => dispatch(setUser(user)));
```

### CSS/Styling

- Use @emotion/styled for component styles
- Use Antd for UI components (customize via craco.config.js)
- Less for global styles (craco-less plugin)

```typescript
import styled from "@emotion/styled";

const Container = styled.div`
  display: flex;
  padding: 1rem;
`;
```

### Testing

- Use @testing-library/react and @testing-library/jest-dom
- Use @testing-library/user-event for user interactions
- Test component behavior, not implementation

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("shows error on failed login", async () => {
  render(<LoginForm />);
  await userEvent.click(screen.getByText("登录"));
  expect(screen.getByText("用户名或密码错误")).toBeInTheDocument();
});
```

---

## Project Structure

```
src/
├── auth-provider.ts     # Auth utilities
├── authenticated-app.tsx # Main authenticated layout
├── components/          # Reusable components
├── context/             # React context (auth, etc.)
├── screens/             # Page components
│   ├── project/         # Project detail page
│   └── project-list/    # Project list page
├── store/               # Redux store and slices
├── types/               # TypeScript type definitions
└── utils/               # Utility functions (http, url, etc.)
```

---

## Key Dependencies

- React 17 + React Router 6 (beta)
- TypeScript (strict mode)
- Redux Toolkit + React Redux
- React Query (TanStack Query)
- Antd 4.x + craco-less
- @emotion/react + @emotion/styled
- Day.js for dates
- qs for query string parsing

---

## Common Patterns

### Custom Hooks

```typescript
export const useHttp = () => {
  const { user } = useAuth();
  return useCallback(
    (...[endpoint, config]: Parameters<typeof http>) =>
      http(endpoint, { ...config, token: user?.token }),
    [user?.token]
  );
};
```

### API Calls

```typescript
export const http = async (endpoint: string, config: Config = {}) => {
  // Handle GET params, token, headers
  // Handle 401 unauthorized
  // Return parsed JSON or reject with error
};
```

### Route Configuration (React Router 6)

```typescript
<Routes>
  <Route path="/projects" element={<ProjectListScreen />} />
  <Route path="/projects/:projectId/*" element={<ProjectScreen />} />
  <Navigate to="/projects" />
</Routes>
```
