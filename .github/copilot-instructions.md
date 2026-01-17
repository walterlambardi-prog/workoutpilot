# Copilot Instructions for Movement

- Follow existing screen/component structure: each screen folder must include at least `index.tsx`, `*.styles.ts`, and `*.types.ts`. Keep logic in `index`, styles in `*.styles`, and shared shapes in `*.types`.
- After each response that involves code changes in .tsx, .ts or .js files, you must run "yarn tsc" and "yarn lint". Fix any errors or warnings before proceeding.

## Development Guidelines

1. **Component Development**: Always create types, styles, and implementation files
2. **State Management**: Use or create a store for complex state, local state for simple UI state
3. **Performance**: Use React.memo, useCallback, and useMemo appropriately
