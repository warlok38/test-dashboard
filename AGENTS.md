# Project Instructions

## General

- Prioritize clean, efficient, and maintainable code.
- Follow best practices and patterns already used in this project before introducing new ones.
- If a task is ambiguous and a reasonable assumption would be risky, ask a clarifying question.
- Favor KISS and apply SOLID principles where they improve maintainability.
- Keep changes scoped to the requested feature or bugfix.
- Follow existing project structure and naming conventions before introducing new abstractions.
- Prefer TypeScript-safe solutions over `any`, casts, or suppressed errors.
- Do not introduce new dependencies unless they clearly reduce complexity.

## Decision discipline

- If project instructions recommend a specific library, framework component, or pattern, use it by default.
- If you believe a custom implementation or different pattern is better, explain the tradeoff and ask for confirmation before implementing it.
- Do not silently bypass existing project preferences for convenience, speed, or minor visual control.

## Next.js / React

- Use client components only when interactivity, browser APIs, hooks, or Ant Design components require them.
- Keep components small enough to read, but avoid splitting files just for the sake of splitting.
- Prefer derived state over duplicated React state.
- Avoid unnecessary `useEffect`; use it mainly for synchronization with external systems.

## Ant Design

When editing or adding Ant Design components:

- This project uses Ant Design v6; avoid older v4/v5 API patterns unless they are still current in the installed types.
- First check the installed `antd` version in `package.json`.
- Prefer Ant Design components, tokens, and the current typed API from the installed package and official Ant Design docs.
- Avoid deprecated props and patterns reported by TypeScript.
- Replace deprecated props with their recommended alternatives, like using `Drawer.size` instead of deprecated `Drawer.width` / `Drawer.height`.
- If TypeScript marks an Ant Design prop as deprecated, treat that as a required cleanup unless preserving old behavior is explicitly necessary.
- Prefer `classNames` / `styles` APIs where Ant Design v6 recommends them.
- Use `@ant-design/icons` for icons instead of custom inline SVGs when a suitable icon exists.

## Styling

- Follow the existing CSS/module/global styling approach used in the touched files.
- Keep layouts responsive for desktop and narrow screens.
- Avoid hardcoded one-off colors when an Ant Design token or existing CSS variable fits.

## State

- Use Redux Toolkit for shared application state.
- Keep local UI-only state inside components.
- Do not put transient modal/input/hover state in Redux unless multiple distant parts of the app need it.

## Commits

- Use Conventional Commits format: `<type>[optional scope]: <description>`.
- Prefer common lowercase types like `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, and `chore`.
- Use `feat` for user-facing features and `fix` for bug fixes.
- Keep the description short, imperative, and focused on what changed.
- Use an optional scope when it adds useful context, like `feat(auth): add login form`.
- Mark breaking changes with `!` before the colon or a `BREAKING CHANGE:` footer.
