# Дизайн-токены

Дизайн-токены — единый источник значений для цветов, отступов, типографики, размеров
layout и адаптивных breakpoint-ов проекта.

[Вернуться в README](README.md)

## Расположение

Точка входа — [`src/shared/styles/tokens/index.css`](../src/shared/styles/tokens/index.css).
Она подключается в [`src/app/globals.css`](../src/app/globals.css).

```text
src/shared/styles/tokens/
├── breakpoints.css
├── colors.css
├── font-sizes.css
├── layout.css
├── palette.css
├── space.css
└── index.css
```

## Уровни токенов

- `--space-*` и `--font-size-*` — шкалы отступов и типографики;
- `--layout-*`, `--radius-*`, `--border-width-*` — структурные значения интерфейса;
- `--palette-*` — базовая палитра;
- `--color-*` — семантические цвета компонентов.

В CSS-модулях используйте семантические `--color-*`, а не значения палитры напрямую.
Это сохраняет единый смысл цвета в светлой и тёмной темах.

```css
.panel {
  padding: var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-default);
  background: var(--color-bg-default);
  border: var(--border-width-hairline) solid var(--color-border-interactive);
}
```

## Тема

Текущая тема задаётся атрибутом `html[data-theme='light' | 'dark']`.

- [`ThemeProvider`](../src/shared/theme/ThemeProvider.tsx) синхронизирует тему с
  `localStorage` и Ant Design `ConfigProvider`;
- [`ThemeSwitch`](../src/features/theme-switch/ThemeSwitch.tsx) переключает тему через
  `useTheme`;

Новый семантический цвет или состояние (`hover`, `active`, `disabled`) определяйте сразу
для светлой и тёмной темы.

## Адаптивность

В CSS используйте custom media queries из
[`breakpoints.css`](../src/shared/styles/tokens/breakpoints.css):

```css
@media (--screen-mobile) {
  /* до 767px */
}

@media (--screen-tablet) {
  /* от 768px до 1023px */
}

@media (--screen-medium) {
  /* от 1024px до 1439px */
}

@media (--screen-large) {
  /* от 1440px */
}
```

В клиентских React-компонентах используйте `useScreen` из `@/shared/hooks`:

```tsx
import { useScreen } from '@/shared/hooks'

export function Example() {
  const { isSmallScreen, isTabletScreen } = useScreen()

  return isSmallScreen || isTabletScreen ? <CompactView /> : <DesktopView />
}
```

Не создавайте локальные `matchMedia`, не обращайтесь к `window.innerWidth` и не
дублируйте числовые значения breakpoint-ов в компонентах. `BREAKPOINTS` и `mediaQueries`
предназначены для общей responsive-инфраструктуры и кода, где React-хук неприменим.

## Правила расширения

- Используйте существующий токен, если он соответствует смыслу значения.
- Выносите повторяющееся значение в токен только при подтверждённом переиспользовании.
- Для цветов компонентов добавляйте семантический `--color-*`, а не используйте
  `--palette-*` напрямую.
- Для отступов и типографики используйте `--space-*` и `--font-size-*`.
- Для границ применяйте `--border-width-hairline` или `--border-width-strong`.
- Не добавляйте одноразовый breakpoint. Если существующей системы недостаточно, сначала
  расширьте общие breakpoint-токены.
