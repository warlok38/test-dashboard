# Кастомные иконки

Документ описывает использование библиотеки проектных SVG-иконок и добавление новых
экспортов.

[Вернуться в README](README.md)

## Где находятся иконки

Кастомные иконки расположены в `src/shared/ui/icons` и используются как React-компоненты с
поведением Ant Design icons. Обёртка `@ant-design/icons` `Icon` поддерживает:

- `className`;
- `style`;
- `spin`;
- `rotate`;
- `ref`;
- размер через `fontSize`;
- цвет через `currentColor`.

## Использование

Импортируйте группу иконок из публичного API `@/shared/ui/icons`:

```tsx
import { IconOutlined } from '@/shared/ui/icons'

export function Example() {
  return <IconOutlined.Mountain style={{ color: '#1677ff', fontSize: 20 }} />
}
```

## Добавление outlined-иконки

1. Добавьте SVG-файл в `src/shared/ui/icons/assets/outlined`:

   ```text
   src/shared/ui/icons/assets/outlined/new-icon.svg
   ```

2. Добавьте экспорт в `src/shared/ui/icons/assets/outlined/index.ts`:

   ```ts
   export { default as NewIcon } from './new-icon.svg'
   ```

3. Используйте иконку через `IconOutlined`:

   ```tsx
   import { IconOutlined } from '@/shared/ui/icons'

   export function Example() {
     return <IconOutlined.NewIcon />
   }
   ```

## Добавление filled-иконки

Для filled-иконки выполните те же шаги в `src/shared/ui/icons/assets/filled` и добавьте
экспорт в `src/shared/ui/icons/assets/filled/index.ts`. После этого иконка станет доступна
через `IconFilled`:

```tsx
import { IconFilled } from '@/shared/ui/icons'

export function Example() {
  return <IconFilled.NewIcon />
}
```

## Требования к SVG

Для одноцветных иконок используйте `currentColor`:

```svg
<path d="..." stroke="currentColor" />
```

или:

```svg
<path d="..." fill="currentColor" />
```

Фиксированный цвет наподобие `fill="#252525"` нельзя переопределить через
`style={{ color: ... }}`.

Если SVG нужен как URL, а не inline-компонент, добавьте resource query `?url`:

```ts
import iconUrl from './new-icon.svg?url'
```

## Как устроена библиотека

- [`src/shared/ui/icons/assets/outlined`](../src/shared/ui/icons/assets/outlined) — исходные
  outlined SVG;
- [`src/shared/ui/icons/assets/filled`](../src/shared/ui/icons/assets/filled) — исходные
  filled SVG;
- [`src/shared/ui/icons/assets/index.ts`](../src/shared/ui/icons/assets/index.ts) — группы
  SVG по стилям;
- [`src/shared/ui/icons/createSvgIcon.tsx`](../src/shared/ui/icons/createSvgIcon.tsx) —
  создание Ant-like компонентов;
- [`src/shared/ui/icons/index.ts`](../src/shared/ui/icons/index.ts) — публичные
  `IconOutlined` и `IconFilled`.

SVG из `src` обрабатываются SVGR согласно webpack-конфигурации в
[`next.config.mjs`](../next.config.mjs). `createIconGroup` преобразует namespace экспортов
в типизированный объект React-компонентов.
