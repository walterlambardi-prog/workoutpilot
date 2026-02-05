# 🎨 Color System Rules (Tamagui)

## CRITICAL - NO EXCEPTIONS

### FORBIDDEN - Never use hardcoded colors:

```tsx
// ❌ BAD - Hardcoded hex colors
<View style={{ backgroundColor: "#dbeafe" }} />
<Text style={{ color: "#2563eb" }}>Title</Text>
backgroundColor={isDark ? "#1e3a8a" : "#dbeafe"}

// ❌ BAD - Hardcoded RGB/RGBA
<View style={{ backgroundColor: "rgba(0,0,0,0.5)" }} />
backgroundColor: "rgb(59, 130, 246)"

// ❌ BAD - String color names
<Text style={{ color: "white" }}>Text</Text>
color="blue"
```

### REQUIRED - Use Tamagui theme tokens:

```tsx
// ✅ GOOD - Semantic theme tokens
<YStack backgroundColor="$background" borderColor="$borderColor">
  <Text color="$color">Title</Text>
</YStack>

// ✅ GOOD - Semantic color tokens (auto light/dark adaptation)
<TButton variant="primary" /> // Uses $primary token
<Text color="$error">Error message</Text>
<View backgroundColor="$success" />

// ✅ GOOD - Stats card color tokens (auto light/dark)
<YStack backgroundColor="$blue3">
  <Text color="$blue11">Value</Text>
</YStack>
```

## Available Tamagui Color Tokens

(defined in `tamagui.config.ts`)

### Base tokens (auto light/dark):

- `$background` - Main background color
- `$backgroundHover` - Background on hover
- `$backgroundPress` - Background on press
- `$color` - Primary text color
- `$borderColor` - Border color
- `$placeholderColor` - Placeholder text

### Semantic tokens:

- `$primary` - Primary/tint color
- `$onPrimary` - Text on primary background (white/dark)
- `$success` - Success/green (adapts to light/dark)
- `$error` - Error/red (adapts to light/dark)
- `$warning` - Warning/orange (adapts to light/dark)
- `$info` - Info/blue (adapts to light/dark)

### Stats card color pairs (for colored data displays):

- `$blue3` / `$blue11` - Background / Text (light blue in light mode, dark blue in dark mode)
- `$green3` / `$green11` - Background / Text (light green → dark green)
- `$purple3` / `$purple11` - Background / Text
- `$orange3` / `$orange11` - Background / Text

## When you need a new color:

1. **First**: Check if existing tokens can be reused
2. **If not**: Add to `tamagui.config.ts` following the pattern:

```typescript
// In tokens.color section
myColorLight: "#hexvalue", // Light mode
myColorDark: "#hexvalue",  // Dark mode

// In lightTheme
myColor: tokens.color.myColorLight,

// In darkTheme
myColor: tokens.color.myColorDark,
```

3. **Never**: Add inline hex colors to components

## Type assertions for Tamagui tokens:

```tsx
// When TypeScript complains about token types, use `as any`:
backgroundColor={colors.bg as any}
color={`$${colorScheme}11` as any}
```

## Exception - Special cases only:

Hardcoded colors are ONLY acceptable in these specific cases:

### Documented Exceptions:

#### 1. Shadow Colors

- `shadowColor: "#000"` - Shadows always use black (React Native platform convention)

#### 2. MediaPipe/Camera Overlays

**Files:** `components/Exercises/`

- **Web**: `index.web.tsx` - Video gradient overlays for UI compositing
  - Linear gradients: `rgba(0,0,0,0.55)`, `rgba(0,0,0,0.25)`, `rgba(0,0,0,0.65)`
  - Control backgrounds: `rgba(20,20,24,0.55)`, `rgba(0,0,0,0.25)`
- **Native**: `hooks/useExerciseSessionNative.ts` - Pose detection UI colors
  - Countdown background: `rgba(7,12,22,0)`, `rgba(15,23,42,0.45)` (light/dark)
  - Feedback background: `rgba(15,23,42,0.15)`, `rgba(248,250,252,0.12)`
  - Text colors: `rgba(226,232,240,0.9)`, `rgba(148,163,184,0.9)`
- **Pose Drawing**: `utils/poseDrawing.ts` - MediaPipe visualization
  - Stroke: `#38bdf8` (cyan)
  - Fill: `#f472b6` (pink)

**Reason**: These colors are hardcoded for MediaPipe rendering/compositing. Changing them affects pose detection visualization accuracy and video overlay compositing.

#### 3. Map Styling (Leaflet)

**Files:** `components/MapView/index.tsx`, `components/MapView/index.web.tsx`

- Path color: `#0a7ea4` (matches theme tint)
- Marker stroke: `#086f8f` (darker variant)
- Map background: `#0b1220` (dark background)

**Reason**: Leaflet library doesn't support theme tokens in path configuration. Colors must be hex strings injected into Leaflet options.

## Code Review Checklist:

- ❌ Reject PRs with hex colors outside `tamagui.config.ts`
- ❌ Reject `isDark ? "#xxx" : "#yyy"` patterns (use theme tokens instead)
- ❌ Reject RGB/RGBA colors outside documented exceptions
- ✅ Approve use of `$tokenName` for all colors
- ✅ Approve new tokens added to `tamagui.config.ts` with light/dark variants

## Files with hardcoded colors found (need refactoring):

### ✅ Completed Refactoring:

- ✅ `app/home/hooks/useHome.ts` - Refactored to use theme tokens ($iconCyan, $iconRed, etc.)
- ✅ `app/routineAnalysis/index.tsx` - ActivityIndicator now uses $success token
- ✅ `app/routineAnalysis/routineAnalysis.styles.ts` - Removed hardcoded white, uses $onPrimary
- ✅ `components/AppLoader/index.tsx` - Uses theme.color token instead of ternary
- ✅ `components/TStreakCard/index.tsx` - Refactored to use streak tokens
- ✅ `components/TButton/TButton.styles.ts` - Uses $onPrimary token
- ✅ `app/onboarding/onboarding.data.ts` - Accepts colors from theme
- ✅ `app/onboarding/onboarding.styles.ts` - Pagination dots use theme tokens
- ✅ `app/onboarding/index.tsx` - Passes theme tokens to data factory
- ✅ `app/routine/index.tsx` - Uses $overlay token
- ✅ `components/ThemedText/index.tsx` - Link color uses tint token

### Remaining (Low Priority):

- `app/aiCoach/index.tsx` - placeholderTextColor fallback (minor)

### Documented Exceptions (Do NOT refactor):

- `components/MapView/` - Leaflet library constraint (see Exception section above)
- `components/Exercises/` - MediaPipe compositing requirement (see Exception section above)
