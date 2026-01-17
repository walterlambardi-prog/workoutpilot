# Copilot Instructions for WorkoutPilot

## 🔍 Quality Assurance

**MANDATORY**: After EVERY code change in `.tsx`, `.ts`, or `.js` files:

1. Run `yarn tsc` to check TypeScript errors
2. Run `yarn lint` to check linting errors
3. Fix ALL errors and warnings before proceeding
4. Never skip these checks - they prevent production bugs

## 📁 File Structure & Organization

### Component Structure

Each screen/component folder MUST include:

- `index.tsx` - Main component logic
- `*.styles.ts` - StyleSheet definitions (StyleSheet.create)
- `*.types.ts` - TypeScript interfaces and types

### Platform-Specific Files

Follow Expo Router conventions:

- `filename.tsx` - Default/fallback (used for iOS/Android)
- `filename.web.tsx` - Web-specific implementation
- ❌ NEVER use `filename.native.tsx` with `.web.tsx` - causes conflicts
- Example: `exercises.tsx` (native) + `exercises.web.tsx` (web)

### Directory Structure

```
app/
  (tabs)/
    screenName/
      index.tsx
      screenName.styles.ts
      screenName.types.ts
components/
  ComponentName/
    index.tsx
    ComponentName.styles.ts
    ComponentName.types.ts
hooks/
  useHookName.ts
stores/
  storeName.ts
constants/
  constantName.ts
```

## 🎯 Naming Conventions

### Files & Folders

- **Folders**: Screens use `camelCase` (e.g., `userProfile/`), Components use `PascalCase` (e.g., `UserProfile/`)
- **Components**: `PascalCase` files, default export matches filename
- **Hooks**: `useHookName.ts` with `useCamelCase` function
- **Types**: `*.types.ts` with `PascalCase` interfaces
- **Styles**: `*.styles.ts` with `camelCase` style objects

### Code

- **Components**: `PascalCase` (e.g., `UserProfile`)
- **Functions/Variables**: `camelCase` (e.g., `handleSubmit`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
- **Types/Interfaces**: `PascalCase` (e.g., `UserProfile`)
- **Enums**: `PascalCase` for name, `UPPER_SNAKE_CASE` for values

## 💻 TypeScript Standards

### Type Safety

```typescript
// ✅ GOOD - Explicit types
interface UserProps {
  id: string;
  name: string;
  onPress: () => void;
}

const User: React.FC<UserProps> = ({ id, name, onPress }) => {
  // ...
};

// ❌ BAD - Implicit any
const User = ({ id, name, onPress }) => {
  // implicit any
  // ...
};
```

### Avoid `any`

- Use `unknown` if type is truly unknown
- Use generics for flexible types
- Use union types for specific options
- Use `@ts-expect-error` with comment if absolutely necessary

### Null Safety

```typescript
// ✅ GOOD - Handle null/undefined
const userName = user?.name ?? "Anonymous";

// ❌ BAD - Unsafe access
const userName = user.name;
```

## ⚛️ React/React Native Best Practices

### Component Design

```typescript
// ✅ GOOD - Small, focused components
const UserAvatar: React.FC<AvatarProps> = React.memo(({ uri, size }) => {
  return <Image source={{ uri }} style={{ width: size, height: size }} />;
});

// ❌ BAD - Large, unfocused components
const UserScreen = () => {
  // 500+ lines of code
};
```

### Performance Optimization

```typescript
// ✅ GOOD - Memoize callbacks and computed values
const handlePress = useCallback(() => {
  navigation.navigate("Details", { id });
}, [id, navigation]);

const sortedData = useMemo(
  () => data.sort((a, b) => a.name.localeCompare(b.name)),
  [data],
);

// ❌ BAD - Recreate on every render
const handlePress = () => navigation.navigate("Details", { id });
const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
```

### State Management

- **Local UI state**: `useState` (toggles, form inputs)
- **Shared state**: Context or state management library
- **Server state**: React Query or SWR
- **Avoid prop drilling**: Use Context for deep component trees

### Hooks Rules

- Always use at top level (never in conditions/loops)
- Custom hooks start with `use`
- Extract complex logic into custom hooks
- Keep hooks focused and single-purpose

## 🎨 Styling Guidelines

### Use StyleSheet.create

```typescript
// ✅ GOOD - StyleSheet with typed styles
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});

// ❌ BAD - Inline styles
<View style={{ flex: 1, padding: 16 }}>
```

### Theme System

- Use constants from `constants/theme.ts`
- Never hardcode colors or spacing
- Support light/dark mode
- Use semantic color names (`primary`, `textPrimary`)

### Responsive Design

- Use Dimensions API sparingly
- Prefer flex layouts over fixed dimensions
- Test on multiple screen sizes
- Use percentage or flex for widths

## 🚨 Error Handling

### Try-Catch Blocks

```typescript
// ✅ GOOD - Proper error handling
const fetchUser = async (id: string) => {
  try {
    const response = await api.getUser(id);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("Failed to fetch user", { id, error });
      showToast("Could not load user data");
    }
    throw error;
  }
};

// ❌ BAD - Silent failures
const fetchUser = async (id: string) => {
  try {
    return await api.getUser(id);
  } catch (error) {
    // Silent failure
  }
};
```

### Error Boundaries

- Wrap top-level components
- Show user-friendly error messages
- Log errors for debugging

## ♿ Accessibility

### Required Practices

```typescript
// ✅ GOOD - Accessible button
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Add to favorites"
  accessibilityRole="button"
  accessibilityHint="Double tap to add this item to your favorites"
  onPress={handlePress}
>
  <Text>Add</Text>
</TouchableOpacity>

// ❌ BAD - No accessibility props
<TouchableOpacity onPress={handlePress}>
  <Text>Add</Text>
</TouchableOpacity>
```

### Guidelines

- All interactive elements need accessibility labels
- Use semantic accessibility roles
- Ensure sufficient color contrast (WCAG AA)
- Test with screen readers

## 🧪 Testing (Future)

### Test Structure

- Unit tests: Individual functions/components
- Integration tests: Feature flows
- E2E tests: Critical user journeys
- Aim for 80%+ coverage on business logic

## 📝 Code Documentation

### JSDoc Comments

```typescript
/**
 * Processes pose landmarks from MediaPipe and calculates exercise form metrics
 * @param landmarks - Array of 33 pose landmarks from MediaPipe
 * @param exerciseType - Type of exercise being performed
 * @returns Exercise metrics including angle, form score, and rep count
 * @throws {Error} If landmarks array is invalid or incomplete
 */
const processPoseLandmarks = (
  landmarks: PoseLandmark[],
  exerciseType: ExerciseType,
): ExerciseMetrics => {
  // Implementation
};
```

### Component Documentation

- Document complex components with JSDoc
- Explain non-obvious behavior
- Include usage examples for reusable components
- Document props with descriptions

## 🔐 Security

### Sensitive Data

- Never commit API keys, secrets, or tokens
- Use environment variables for configuration
- Sanitize user input
- Validate data from external sources

### Permissions

- Request minimal permissions needed
- Explain why permissions are needed
- Handle permission denials gracefully

## 📦 Dependencies

### Adding Dependencies

1. Check if functionality exists in React Native core
2. Verify package is actively maintained
3. Check bundle size impact
4. Review security vulnerabilities
5. Prefer packages with TypeScript support

### Version Control

- Commit `yarn.lock` and `.yarn/install-state.gz`
- Commit `.yarn/cache/` for Zero-Installs
- Keep dependencies up to date

## 🚀 Performance

### Optimization Checklist

- [ ] Use `React.memo` for expensive components
- [ ] Use `useCallback` for callbacks passed to child components
- [ ] Use `useMemo` for expensive computations
- [ ] Avoid anonymous functions in render
- [ ] Use `FlatList`/`SectionList` for long lists (not ScrollView)
- [ ] Implement pagination for large datasets
- [ ] Optimize images (compress, use appropriate formats)
- [ ] Profile with React DevTools Profiler

### Image Optimization

- Use WebP format when possible
- Compress images before adding to project
- Use appropriate sizes (don't load 4K for thumbnails)
- Lazy load images off-screen

## 🌐 Platform-Specific Code

### Web vs Native

```typescript
// ✅ GOOD - Platform-specific implementations in separate files
// exercises.tsx (native)
import { RNMediapipe } from "@thinksys/react-native-mediapipe";

// exercises.web.tsx (web)
import { PoseLandmarker } from "@mediapipe/tasks-vision";
```

### Platform Checks

```typescript
// Use when slight differences in same file
import { Platform } from "react-native";

if (Platform.OS === "web") {
  // Web-specific code
} else {
  // Native code
}
```

## 📋 Code Review Checklist

Before submitting code:

- [ ] TypeScript errors resolved (`yarn tsc`)
- [ ] Linting errors resolved (`yarn lint`)
- [ ] Code follows naming conventions
- [ ] Components are properly typed
- [ ] No `any` types (without justification)
- [ ] Error handling implemented
- [ ] Accessibility props added
- [ ] Performance optimizations applied
- [ ] No console.logs in production code
- [ ] Comments explain "why" not "what"
- [ ] Tests written (when applicable)

## 🎯 Project-Specific

### Expo Router

- Use file-based routing
- Follow `(tabs)` group convention
- Use typed routes with `useRouter`
- Handle deep linking properly

### MediaPipe Integration

- Web: Use `@mediapipe/tasks-vision`
- Native: Use `@thinksys/react-native-mediapipe`
- Handle camera permissions properly
- Clean up resources on unmount

### State Management

- Start with local state
- Promote to Context when shared
- Consider Zustand/Redux for complex global state
- Keep stores modular and focused
