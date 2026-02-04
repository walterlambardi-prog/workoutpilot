# Copilot Instructions for WorkoutPilot

## 🔍 Quality Assurance

**MANDATORY**: After EVERY code change in `.tsx`, `.ts`, or `.js` files:

1. Run `yarn tsc` to check TypeScript errors
2. Run `yarn lint` to check linting errors
3. Fix ALL errors and warnings before proceeding
4. Never skip these checks - they prevent production bugs

# Copilot Instructions — Tamagui (Web + Mobile)

## Project context

- This repo builds a cross-platform app (iOS/Android/Web) using **Tamagui**.
- Goal: a consistent, professional UI, adapted to each platform (touch vs mouse/keyboard) without duplicating screens.
- Assume there is (or must be) a **design system** based on Tamagui tokens/themes.

## General rules (mandatory)

1. **Use Tamagui** for UI (Stacks, Text, Button, Input, Card, Sheet, Dialog, Popover, Tabs, etc.).
   Do not use arbitrary inline styles or raw CSS unless it’s a documented exception.
2. **No hardcoded** visual values (colors, spacing, radius, shadows, font sizes).
   Use tokens: `p="$4"`, `bg="$background"`, `color="$color"`, `br="$6"`, etc.
3. **Composition > platform conditionals**: avoid `Platform.OS` for UI decisions.
   Prefer:
   - `media` (breakpoints) for layout/density
   - `Adapt` to switch interaction patterns (Popover ↔ Sheet, Dialog ↔ Sheet, Select ↔ Sheet)
4. Every component/screen must:
   - work on **small and large screens**
   - support **dark/light theme**
   - support **touch** and **keyboard/mouse** on web

## How to “understand the code” before writing

Before proposing changes, Copilot must:

- Identify whether it’s editing: `Screen`, `Component`, `Layout`, `Navigation`, `Design system`, `Form`.
- Read existing imports and patterns (e.g. `AppButton`, `AppCard`, `Theme`, `useMedia`, `Adapt`).
- Preserve existing naming/architecture. If it doesn’t exist, propose it without breaking the API.

## Responsive & Adapt (repo standard)

- Layout responsiveness:
  - Use `media` to change `flexDirection`, `gap`, `padding`, `maxWidth`, `display`.
  - On desktop web, avoid overly long line lengths: use `maxWidth` and center content.
- Interaction responsiveness (patterns):
  - Menus/actions: `Popover` on desktop → `Sheet` on mobile using `Adapt`.
  - Select: `Select` adapted to `Sheet` on mobile.
  - Modals: `Dialog` on web → `Sheet` on mobile (if applicable).

## Accessibility and states (non-negotiable)

- All interactive controls must have:
  - states: `hover` (web), `press`, `focusVisible`, `disabled`, `loading`
  - reasonable touch targets (>= 44px height for primary buttons)
- Inputs and forms:
  - label + error message + equivalent `aria`/accessibility label
- On web: do not break keyboard navigation.

## Required UI patterns

- Prefer **design system components**:
  - `AppButton`, `AppText`, `AppInput`, `AppCard`, `AppScreen` (or whatever exists)
- If creating a new component:
  - Expose simple props, support theming, and use tokens.
  - Include a usage example.

## Performance / quality

- Avoid creating inline objects/functions in props when they cause rerenders.
- In lists: keep items lightweight and props stable.
- Do not introduce heavy dependencies just to solve layout/styling.

## Expected output when generating UI

When Copilot writes UI, it must:

- Produce complete components (imports, types, props) that compile.
- Include responsive defaults (at least `sm` and `md`).
- Use tokens and theme.
- Avoid duplicating screens for web/mobile; use `Adapt` when the interaction pattern changes.

**Additional guardrails (Tamagui refactor):**

- No inline styles in components; move to `*.styles.ts` using StyleSheet/Tamagui tokens.
- Use Tamagui tokens (`$color`, `$background`, `$primary`, `$space`) instead of hardcoded values.
- Prefer shared Tamagui primitives (e.g., `TButton`) for buttons; if a reusable primitive is missing, create it under `components/` with `index.tsx` + `*.types.ts` (+ `*.styles.ts` when needed) before using raw Tamagui components.
- Ensure text containers in headers use `flex: 1` and `minWidth: 0` to avoid clipping on mobile.
- Header/Drawer: use `TAppHeader` and `TDrawer` with copy from locales (no hardcoded strings); keep active-route highlight.
- Fix the onboarding.types.ts warning if touched; lint must be clean when you modify that area.
- When modifying UI, audit and delete unused style files/entries and copies left from prior implementations (especially during Tamagui migrations).

## 🗣 Copy & Localization

- Every user-visible string must come from a copy source (e.g., locales/en.json and locales/es.json). Do not hardcode UI text in components, hooks, or utilities.
- When adding or changing copy, update both languages and keep placeholders/variables consistent.
- If you touch a file and remove its usage of a copy key, delete that key from the locale files unless it is still used elsewhere (avoid orphaned translations).
- Reuse existing keys when possible; keep key names descriptive and scoped to the feature/screen for maintainability.

## 📁 File Structure & Organization

### Component Structure

Each screen/component folder MUST include:

- `index.tsx` - Main component logic
- `*.styles.ts` - StyleSheet definitions (StyleSheet.create with theme constants)
- `*.types.ts` - TypeScript interfaces and types

### Screen Header Pattern

**CRITICAL**: All screens MUST use the `ScreenHeader` component for consistent title/subtitle display.

```typescript
// ✅ GOOD - Using ScreenHeader component
import ScreenHeader from '@/components/ScreenHeader';

const MyScreen = () => {
  const { t } = useTranslation();

  return (
    <ScrollView>
      <ScreenHeader
        title={t('myScreen.title')}
        subtitle={t('myScreen.subtitle')}
      />
      {/* Rest of content */}
    </ScrollView>
  );
};

// ❌ BAD - Manual header implementation
const MyScreen = () => {
  return (
    <ScrollView>
      <View style={styles.header}>
        <ThemedText type="title">{t('myScreen.title')}</ThemedText>
        <ThemedText>{t('myScreen.subtitle')}</ThemedText>
      </View>
      {/* Rest of content */}
    </ScrollView>
  );
};
```

**ScreenHeader Props**:

- `title: string` - Main title (required)
- `subtitle?: string` - Optional subtitle text

The component handles all styling, spacing, and theming automatically.

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
// ✅ GOOD - StyleSheet with typed styles and theme constants
import { StyleSheet } from 'react-native';
import { Spacing, ScreenPadding } from '@/constants/theme';

// Tamagui components must still keep layout values in styles files; avoid inline padding/margin.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: ScreenPadding.horizontal,
    paddingTop: ScreenPadding.vertical,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
});

// ❌ BAD - Inline styles and hardcoded values
<View style={{ flex: 1, padding: 16 }}>
```

### Theme System

**CRITICAL**: Always use theme constants - never hardcode values.

#### Spacing Constants

Use `Spacing` from `@/constants/theme` for all margins, paddings, and gaps:

```typescript
import { Spacing } from "@/constants/theme";

// Available spacing values:
Spacing.xxs; // 4px  - Minimal spacing
Spacing.xs; // 6px  - Extra small spacing
Spacing.sm; // 8px  - Small spacing
Spacing.md; // 12px - Medium spacing (default for most UI)
Spacing.lg; // 16px - Standard spacing
Spacing.xl; // 20px - Large spacing
Spacing.xxl; // 24px - Extra large spacing
Spacing.xxxl; // 32px - Double extra large spacing
```

#### Screen Padding Constants

Use `ScreenPadding` for consistent screen layout:

```typescript
import { ScreenPadding } from "@/constants/theme";

// Available screen padding values:
ScreenPadding.horizontal; // 16px - Standard horizontal padding for screens
ScreenPadding.vertical; // 24px - Standard top padding for screens
ScreenPadding.bottom; // 32px - Standard bottom padding for scrollable content
```

#### Layout Constants

Use `Layout` for responsive layout constraints:

```typescript
import { Layout } from "@/constants/theme";

// Available layout values:
Layout.maxContentWidth; // 1280px - Maximum content width for web layout
```

**Web vs Mobile Layout**:

- **Mobile**: Content uses full width with horizontal padding (`ScreenPadding.horizontal`)
- **Web**: Content is centered with max width (`Layout.maxContentWidth`) to prevent overly wide layouts on large screens
- Use `TPage` component with `fullWidth={false}` (default) to automatically apply responsive max-width on web
- For full-width layouts (e.g., image galleries, maps), use `fullWidth={true}` prop

```typescript
// ✅ GOOD - Responsive layout with max-width on web
<TPage>
  <TWelcomeHeader title="Home" />
  {/* Content automatically centered and max-width on web */}
</TPage>

// ✅ GOOD - Full-width layout when needed
<TPage fullWidth>
  <ImageGallery />
  {/* Content uses full viewport width */}
</TPage>

// ❌ BAD - Hardcoded max-width
<View style={{ maxWidth: 1280 }}>
  {/* Content */}
</View>
```

#### Example Usage

```typescript
// ✅ GOOD - Using theme constants
import { StyleSheet } from "react-native";
import { Spacing, ScreenPadding } from "@/constants/theme";

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: ScreenPadding.horizontal,
    paddingTop: ScreenPadding.vertical,
    paddingBottom: ScreenPadding.bottom,
  },
  section: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: Spacing.md,
    gap: Spacing.sm,
  },
});

// ❌ BAD - Hardcoded values
const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  section: {
    gap: 12,
    marginBottom: 24,
  },
});
```

#### Color System

- Use constants from `constants/theme.ts`
- Never hardcode color values
- Support light/dark mode with `useThemeColor` hook
- Use semantic color names (`primary`, `textPrimary`, `background`)

### Responsive Design

- Use Dimensions API sparingly
- Prefer flex layouts over fixed dimensions
- Test on multiple screen sizes
- Use percentage or flex for widths

### Touch Event Handling

**CRITICAL**: When using overlays or nested Views with TouchableOpacity, pointer events must be configured correctly:

```typescript
// ✅ GOOD - Proper pointer events configuration
<ImageBackground pointerEvents="box-none">
  <View style={styles.overlay} pointerEvents="none" />
  <View style={styles.content} pointerEvents="box-none">
    <TouchableOpacity onPress={handlePress}>
      <Ionicons name="icon" pointerEvents="none" />
      <Text pointerEvents="none">Button</Text>
    </TouchableOpacity>
  </View>
</ImageBackground>

// ❌ BAD - Overlays/children block touch events
<ImageBackground>
  <View style={styles.overlay} /> {/* Blocks all touches! */}
  <TouchableOpacity onPress={handlePress}>
    <Text>Button</Text> {/* Text captures touch instead of parent */}
  </TouchableOpacity>
</ImageBackground>
```

**Rules**:

- Overlays with `position: absolute` or `StyleSheet.absoluteFillObject` → `pointerEvents="none"`
- Container Views that should pass touches to children → `pointerEvents="box-none"`
- Children inside TouchableOpacity (Text, Icons, etc.) → `pointerEvents="none"`
- Never leave pointerEvents unconfigured when using overlays or complex layouts

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
- Remove unused style entries: if a style is deleted from usage and not referenced elsewhere, delete it from the StyleSheet to avoid orphaned styles.

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
- [ ] **Using `Spacing` and `ScreenPadding` constants (no hardcoded values)**
- [ ] **Screens use `ScreenHeader` component for titles**
- [ ] **All user-visible text comes from translation files**
- [ ] **Removed orphaned styles from StyleSheet**

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

### Product Focus: Workout AI Coach

- The product is an Expo React Native app (web + mobile) to monitor exercise form with MediaPipe and guide users through routines.
- Users create routines with multiple exercise sessions (e.g., squats, push-ups, lateral raises, alternating hammer raises, etc.).
- Provide detailed history and session/routine reports (per-exercise metrics, timestamps, form feedback).
- Include AI (chatbot-style) to generate user-appropriate routines and coaching suggestions.
- UI/UX must feel current and fitness-focused: clean, high-contrast, motion-aware; surfaces should clearly differentiate active vs. resting states.
- Prioritize form verification flows: stable camera permissions, session start/stop, switch camera, and feedback to the user when detection is active or paused.

## 🎨 UI Library: Tamagui

**IMPORTANT**: This project is in the process of migrating to Tamagui for UI components.

### Why Tamagui?

- **Cross-platform**: Works seamlessly on web and native
- **Performance**: Optimized compilation and tree-shaking
- **Theming**: First-class dark/light mode support
- **Type-safe**: Full TypeScript support with autocomplete
- **Modern**: Professional, polished components out of the box

### Migration Status

**Track progress in**: `ui-refactor-tracking.txt` (root directory)

This file contains:

- Phase-by-phase migration plan
- Component refactoring checklist
- Theme configuration status
- Performance metrics before/after
- Blockers and decisions log

**Always check this file before making UI changes** to understand:

- Which components have been migrated to Tamagui
- Which screens are pending refactoring
- Current naming conventions for new components
- Design tokens and theme configuration

### Component Naming Convention

New Tamagui components use the `T` prefix to differentiate from legacy components:

```typescript
// ✅ NEW - Tamagui components
import { TButton } from "@/components/TButton";
import { TCard } from "@/components/TCard";
import { TInput } from "@/components/TInput";

// 🔄 LEGACY - React Native StyleSheet components (being migrated)
import { Button } from "@/components/Button";
import ActionCard from "@/components/ActionCard";
```

### When to Use Tamagui vs Legacy

**Use Tamagui components** for:

- All new features and screens
- When refactoring existing components
- When you need dark/light mode support
- When you need cross-platform consistency

**Legacy components** are acceptable for:

- Quick fixes to existing screens (until refactor)
- Components not yet migrated (check tracking file)

### Tamagui Best Practices

```typescript
// ✅ GOOD - Using Tamagui with typed theme tokens
import { YStack, XStack, Text, Button } from 'tamagui';

const MyComponent = () => (
  <YStack space="$4" padding="$4" backgroundColor="$background">
    <Text fontSize="$6" fontWeight="700" color="$color">
      Title
    </Text>
    <Button size="$4" theme="blue">
      Action
    </Button>
  </YStack>
);

// ❌ BAD - Mixing Tamagui with hardcoded React Native styles
import { View, StyleSheet } from 'react-native';
import { Text } from 'tamagui';

const MyComponent = () => (
  <View style={{ padding: 16 }}> {/* Don't mix! */}
    <Text>Title</Text>
  </View>
);
```

### Theme Tokens

Tamagui uses `$` prefix for design tokens:

```typescript
// Spacing
space = "$2"; // 8px
space = "$4"; // 16px
space = "$6"; // 24px

// Colors
color = "$color"; // Primary text color
backgroundColor = "$background";
borderColor = "$borderColor";

// Sizes
size = "$4"; // Standard button/input size
fontSize = "$6"; // Heading size
```

**Always use theme tokens** instead of hardcoded values to ensure:

- Dark/light mode works correctly
- Consistent spacing across the app
- Easy theme customization

### Integration with Existing Code

During migration, you may need to integrate Tamagui with existing hooks:

```typescript
// ✅ GOOD - Connecting Tamagui theme with existing color scheme
import { useColorScheme } from '@/hooks/useColorScheme';
import { TamaguiProvider } from 'tamagui';
import config from './tamagui.config';

const App = () => {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme}>
      {/* App content */}
    </TamaguiProvider>
  );
};
```

### Migration Workflow

1. **Before starting any UI work**: Read `ui-refactor-tracking.txt`
2. **For new components**: Use Tamagui from the start
3. **For existing components**:
   - Check if migration is planned in tracking file
   - If yes, refactor to Tamagui
   - If no, add to tracking file for future work
4. **After changes**: Update tracking file with progress
5. **Always run**: `yarn tsc` and `yarn lint` after Tamagui changes

### Resources

- Official docs: https://tamagui.dev
- Theme configuration: `tamagui.config.ts` (root directory)
- Component examples: Check refactored screens in tracking file

## 🎯 Component Architecture & Custom Hooks

### Core Principle: Separation of Concerns

**MANDATORY PATTERN** for all screens and complex components:

- **Components/Screens** = **100% presentational** (UI structure, layout, rendering)
- **Custom Hooks** = **100% business logic** (state, effects, API calls, computations)
- **Stores** = **Shared state** (cross-component data, persistence)
- **Services** = **External APIs** (native modules, REST, GraphQL)

### When to Create a Custom Hook

**✅ ALWAYS create a custom hook when:**

1. **Screen/component has business logic**
   - State management (`useState`, `useReducer`)
   - Side effects (`useEffect`, subscriptions)
   - API calls or native module interactions
   - Complex computations or derived state
   - Event handlers with logic beyond simple callbacks

2. **Logic exceeds 5-10 lines**
   - If a `useEffect` or function has significant logic, extract it

3. **Logic is reusable**
   - Multiple components need the same behavior
   - Similar patterns across different features

4. **Component file exceeds 100 lines**
   - Sign that business logic should be extracted

**❌ DO NOT create a hook when:**

- Component only renders static content
- Only simple props passing (no state/effects)
- Single `useState` for UI toggle (e.g., modal open/close)
- Logic is <5 lines and won't be reused

### Hook Placement: Co-location Pattern

**Place hooks in a `hooks/` folder within the feature/screen directory:**

```
app/
  exercises/
    stepTracker/
      index.tsx              # Presentational component
      hooks/
        useStepTrackerSession.ts # Business logic hook
      stepTracker.styles.ts
      stepTracker.types.ts

  routine/
    index.tsx
    hooks/
      useRoutineBuilder.ts
    routine.styles.ts
    routine.types.ts
```

**Benefits of co-location:**

- ✅ Keeps related code together
- ✅ Easy to find and understand dependencies
- ✅ Prevents accidental coupling with unrelated features
- ✅ Clear ownership and responsibility

**For shared hooks** (used across multiple features):

```
hooks/
  useAppLanguage.ts       # Global hooks
  useColorScheme.ts
  useThemeColor.ts
```

### Hook Structure Template

```typescript
// app/[feature]/hooks/use[FeatureName].ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

// Import stores, services, types
import { useFeatureStore } from "@/stores/featureStore";
import FeatureService from "@/utils/FeatureService";
import type { StatusKey } from "../feature.types";

export const useFeatureName = () => {
  // 1. Local state
  const [status, setStatus] = useState<StatusKey>("idle");
  const [error, setError] = useState<string>();

  // 2. External state (stores)
  const { data, updateData } = useFeatureStore();

  // 3. Translations
  const { t } = useTranslation();

  // 4. Side effects
  useEffect(() => {
    // Subscriptions, listeners, etc.
    const unsubscribe = FeatureService.onEvent((event) => {
      updateData(event.data);
    });

    return () => unsubscribe();
  }, [updateData]);

  // 5. Callbacks
  const handleAction = useCallback(async () => {
    setStatus("loading");
    try {
      await FeatureService.performAction();
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.unknown"));
      setStatus("error");
    }
  }, [t]);

  // 6. Computed values
  const computedValue = useMemo(() => {
    return data.map(/* transformation */);
  }, [data]);

  // 7. Return public API
  return {
    // State
    status,
    error,
    data: computedValue,

    // Actions
    handleAction,
  };
};
```

### Component Using Hook

```typescript
// app/[feature]/index.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { YStack } from 'tamagui';

import { TButton } from '@/components/TButton';
import { TPage } from '@/components/TPage';
import { TText } from '@/components/TText';

import { useFeatureName } from './hooks/useFeatureName';
import styles from './feature.styles';

const FeatureScreen: React.FC = () => {
  const { t } = useTranslation();
  const { status, error, data, handleAction } = useFeatureName();

  return (
    <TPage>
      <TText>{t('feature.title')}</TText>

      {error && <TText color="$red10">{error}</TText>}

      <YStack gap="$4">
        {data.map((item) => (
          <TText key={item.id}>{item.name}</TText>
        ))}
      </YStack>

      <TButton onPress={handleAction} disabled={status === 'loading'}>
        {t('feature.action')}
      </TButton>
    </TPage>
  );
};

export default FeatureScreen;
```

### Decision Tree: Hook vs Inline Logic

```
Does the component have business logic?
├─ NO → Keep component simple, no hook needed
└─ YES → Is it <5 lines?
    ├─ YES → Can stay inline (but consider future growth)
    └─ NO → Create custom hook
        └─ Will it be reused?
            ├─ YES → Place in shared `hooks/` folder
            └─ NO → Place in feature's `hooks/` subfolder
```

### Examples by Complexity

#### ❌ **BAD - Logic mixed with presentation**

```typescript
const BadScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { activeSession, updateSession } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await api.getData();
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const subscription = NativeModule.onEvent((event) => {
      updateSession(event.data);
    });
    return () => subscription.remove();
  }, [updateSession]);

  const handleSubmit = async () => {
    try {
      await api.submit(data);
      updateSession({ submitted: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <YStack>
      {loading ? <Spinner /> : data.map(/* ... */)}
      <TButton onPress={handleSubmit}>Submit</TButton>
    </YStack>
  );
};
```

#### ✅ **GOOD - Hook extracts all logic**

```typescript
// hooks/useDataManagement.ts
export const useDataManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { activeSession, updateSession } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await api.getData();
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const subscription = NativeModule.onEvent((event) => {
      updateSession(event.data);
    });
    return () => subscription.remove();
  }, [updateSession]);

  const handleSubmit = useCallback(async () => {
    try {
      await api.submit(data);
      updateSession({ submitted: true });
    } catch (error) {
      console.error(error);
    }
  }, [data, updateSession]);

  return { data, loading, handleSubmit };
};

// index.tsx
const GoodScreen = () => {
  const { data, loading, handleSubmit } = useDataManagement();

  return (
    <YStack>
      {loading ? <Spinner /> : data.map(/* ... */)}
      <TButton onPress={handleSubmit}>Submit</TButton>
    </YStack>
  );
};
```

### Benefits of This Architecture

**For Components:**

- 📉 **Smaller files**: Typically 50-100 lines vs 200-500 lines
- 🎨 **Clear responsibility**: Only rendering and layout
- 🔍 **Easier to review**: Visual structure is obvious
- ♿ **Accessibility focus**: More room for proper ARIA attributes

**For Hooks:**

- 🧪 **Testable**: Can test logic without rendering components
- 🔁 **Reusable**: Share logic across multiple components
- 📦 **Composable**: Combine multiple hooks for complex features
- 🐛 **Debuggable**: Isolate and fix logic bugs independently

**For Teams:**

- 👥 **Parallel work**: Designer works on component, developer on hook
- 📚 **Easier onboarding**: Clear patterns to follow
- 🔄 **Maintainable**: Changes in logic don't affect UI structure

## 📱 Native Modules & Background Tracking

### Overview

This project uses **custom native modules** for features that require platform-specific APIs (iOS/Android) not available in standard React Native or Expo. The primary example is **stepTracker tracking with background location and step counting**.

**Key principles:**

- Native modules handle **platform-specific APIs** (CMPedometer, CLLocationManager, SensorManager, FusedLocationProvider)
- TypeScript bridge services provide **unified cross-platform API**
- React hooks encapsulate **all business logic** (subscriptions, state, effects)
- Components remain **100% presentational**

### Step Tracker Architecture

Located in `app/exercises/stepTracker/`:

```
stepTracker/
├── index.tsx                  # Presentational component (UI only)
├── hooks/
│   └── useStepTrackerSession.ts   # Business logic hook
├── stepTracker.styles.ts          # StyleSheet with theme constants
└── stepTracker.types.ts           # TypeScript interfaces
```

**Native modules:**

- `ios/workoutpilot/StepTrackerModule.[h|m]` - iOS implementation
- `android/.../StepTrackerModule.kt` - Android implementation
- `utils/StepTrackerService.ts` - TypeScript bridge

**Documentation**: See `STEPTRACKER_BACKGROUND_TRACKING.md` for complete native module setup, permissions, and troubleshooting.

### Native Module Guidelines

#### 1. **Permission Handling**

Always request permissions before using native features:

```typescript
const requestPermissions = async () => {
  const result = await NativeModule.requestPermissions();

  if (result.location !== "granted") {
    setError("Permission denied");
    return false;
  }

  return true;
};
```

**Required permissions (documented in AndroidManifest.xml / Info.plist):**

- iOS: `NSLocationAlwaysAndWhenInUseUsageDescription`, `NSMotionUsageDescription`, `UIBackgroundModes`
- Android: `ACCESS_FINE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`, `ACTIVITY_RECOGNITION`, `FOREGROUND_SERVICE_LOCATION`

#### 2. **Event Subscriptions**

Use `useEffect` to subscribe/unsubscribe from native events:

```typescript
useEffect(() => {
  const unsubscribeSteps = StepTrackerService.onStepUpdate((event) => {
    updateState({ steps: event.steps });
  });

  const unsubscribeLocation = StepTrackerService.onLocationUpdate(
    (event) => {
      addPosition({ latitude: event.latitude, longitude: event.longitude });
    },
  );

  // CRITICAL: Always cleanup on unmount
  return () => {
    unsubscribeSteps();
    unsubscribeLocation();
  };
}, [dependencies]);
```

#### 3. **Background/Foreground Sync**

For background tracking, implement **position persistence** and **foreground resume**:

```typescript
// Native modules save positions to NSUserDefaults/SharedPreferences when app is backgrounded
// TypeScript hook retrieves them on foreground resume

const resumeTrackingIfNeeded = useCallback(async () => {
  const isTracking = await NativeService.isTracking();

  if (isTracking) {
    // Retrieve positions collected while in background
    const pendingPositions = await NativeService.getPendingPositions();

    // Sync to store (prevents route from breaking)
    pendingPositions.forEach((pos) => addPosition(pos));
  }
}, []);

// Listen to AppState changes
useEffect(() => {
  const subscription = AppState.addEventListener("change", (nextState) => {
    if (nextState === "active") {
      void resumeTrackingIfNeeded();
    }
  });

  return () => subscription.remove();
}, [resumeTrackingIfNeeded]);
```

**Why this is critical:**

- iOS/Android may suspend React Native bridge when app is backgrounded
- Native events continue but may not reach JavaScript
- Position persistence ensures **complete route tracking** even in background

#### 4. **State Management with Native Modules**

Use Zustand stores for **persistent session state**:

```typescript
// stores/stepTrackerSessionStore.ts
export const useStepTrackerSessionStore = create<WalkingStore>()(
  persist(
    (set) => ({
      activeSession: null,

      startActiveSession: () =>
        set({
          activeSession: {
            steps: 0,
            positions: [],
            distanceKm: 0,
            startedAt: Date.now(),
          },
        }),

      addPositionToActiveSession: (position) =>
        set((state) => {
          if (!state.activeSession) return state;

          // Prevent duplicates
          const lastPos = state.activeSession.positions.at(-1);
          if (
            lastPos &&
            lastPos.latitude === position.latitude &&
            lastPos.longitude === position.longitude
          ) {
            return state;
          }

          return {
            activeSession: {
              ...state.activeSession,
              positions: [...state.activeSession.positions, position],
            },
          };
        }),
    }),
    {
      name: "stepTracker-session-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

**Benefits:**

- ✅ Session survives app restarts
- ✅ Native module can resume tracking after crash/kill
- ✅ User doesn't lose progress

#### 5. **Error Handling**

Native modules can fail (permissions denied, sensors unavailable, GPS off):

```typescript
const startTracking = async () => {
  try {
    const result = await NativeModule.startTracking();

    if (!result.success) {
      setStatus("error");
      setErrorMessage(result.message);
      return;
    }

    setStatus("tracking");
  } catch (error) {
    setStatus("error");
    setErrorMessage(
      error instanceof Error ? error.message : t("errors.unknown"),
    );
  }
};
```

**Always show user-friendly errors:**

- Use translation keys from `locales/en.json` and `locales/es.json`
- Display in UI with `<TText color="$red10">{errorMessage}</TText>`

### When to Create Native Modules

**Use native modules for:**

- ✅ Background location tracking
- ✅ Step counting (hardware sensors)
- ✅ Health data (HealthKit, Google Fit)
- ✅ Foreground services with notifications (Android)
- ✅ Camera/ML processing (MediaPipe)

**Do NOT use native modules for:**

- ❌ Simple API calls (use fetch/axios)
- ❌ UI rendering (use Tamagui)
- ❌ State management (use Zustand)
- ❌ Features available in Expo SDK

### Testing Native Features

**Device requirements:**

- ❌ Emulators/simulators: Limited sensor support, unreliable for testing
- ✅ Real devices: Required for step counting, background location, notifications

**Testing checklist:**

1. Start tracking → verify metrics update
2. Minimize app (Home button) → walk → return → verify route continued
3. Kill app → reopen → verify session restored
4. Deny permissions → verify error messages shown
5. Check battery usage (background tracking should be optimized)

### Documentation Requirements

When adding/modifying native modules:

1. **Update `STEPTRACKER_BACKGROUND_TRACKING.md`** (or create similar docs):
   - Architecture overview
   - Native implementation details
   - Permission requirements
   - Build instructions
   - Troubleshooting guide

2. **Update this file** (copilot-instructions.md):
   - New patterns or conventions
   - Hook usage examples
   - Common pitfalls to avoid

3. **Add translations**:
   - `locales/en.json` and `locales/es.json`
   - Error messages, status labels, action buttons

### Common Pitfalls

❌ **Don't forget to cleanup subscriptions:**

```typescript
// BAD - Memory leak
useEffect(() => {
  NativeService.onEvent(() => {});
  // Missing cleanup!
}, []);

// GOOD
useEffect(() => {
  const unsubscribe = NativeService.onEvent(() => {});
  return () => unsubscribe();
}, []);
```

❌ **Don't call native methods synchronously:**

```typescript
// BAD - Native methods are always async
const start = () => {
  NativeModule.startTracking(); // Missing await!
};

// GOOD
const start = async () => {
  await NativeModule.startTracking();
};
```

❌ **Don't ignore AppState changes:**

```typescript
// BAD - Route breaks when returning from background
// Missing AppState listener

// GOOD - Syncs pending positions
useEffect(() => {
  const subscription = AppState.addEventListener("change", handleResume);
  return () => subscription.remove();
}, []);
```

### Example: Complete Native Feature Implementation

See `app/exercises/stepTracker/` for reference implementation showing:

- ✅ TypeScript bridge (`utils/StepTrackerService.ts`)
- ✅ Custom hook (`hooks/useStepTrackerSession.ts`)
- ✅ Presentational component (`index.tsx`)
- ✅ Zustand store with persistence (`stores/stepTrackerSessionStore.ts`)
- ✅ Native modules (iOS Objective-C, Android Kotlin)
- ✅ Background position persistence
- ✅ AppState synchronization
- ✅ Error handling and permissions
- ✅ Complete documentation (`STEPTRACKER_BACKGROUND_TRACKING.md`)

This is the **recommended pattern** for all future native features.
