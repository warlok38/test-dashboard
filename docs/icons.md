# Custom Icons

Документ описывает библиотеку кастомных SVG-иконок проекта: где хранить иконки, как добавлять новые экспорты и как использовать их в компонентах.

## Для чего это нужно

Кастомные иконки лежат в `src/shared/ui/icons` и используются как React-компоненты с поведением, близким к Ant Design icons.

Иконки обёрнуты в `@ant-design/icons` `Icon`, поэтому поддерживают базовые props Ant-иконок:

- `className`;
- `style`;
- `spin`;
- `rotate`;
- `ref`;
- размер через `fontSize`;
- цвет через `currentColor`, если SVG использует `fill="currentColor"` или `stroke="currentColor"`.

## Как использовать

Импортируйте нужную группу иконок из `@/shared/ui/icons`.

```tsx
import { IconOutlined } from '@/shared/ui/icons'

export function Example() {
  return <IconOutlined.Truck style={{ color: '#1677ff', fontSize: 20 }} />
}
```

Filled-иконки используются аналогично.

```tsx
import { IconFilled } from '@/shared/ui/icons'

export function Example() {
  return <IconFilled.CheckCircle />
}
```

## Как добавить outlined-иконку

1. Добавьте SVG-файл в `src/shared/ui/icons/assets/outlined`.

```text
src/shared/ui/icons/assets/outlined/mountain.svg
```

2. Добавьте экспорт в `src/shared/ui/icons/assets/outlined/index.ts`.

```ts
export { default as Mountain } from './mountain.svg'
```

3. Используйте иконку через `IconOutlined`.

```tsx
import { IconOutlined } from '@/shared/ui/icons'
;<IconOutlined.Mountain />
```

## Как добавить filled-иконку

1. Добавьте SVG-файл в `src/shared/ui/icons/assets/filled`.

```text
src/shared/ui/icons/assets/filled/check-circle.svg
```

2. Добавьте экспорт в `src/shared/ui/icons/assets/filled/index.ts`.

```ts
export { default as CheckCircle } from './check-circle.svg'
```

3. Используйте иконку через `IconFilled`.

```tsx
import { IconFilled } from '@/shared/ui/icons'
;<IconFilled.CheckCircle />
```

## Требования к SVG

Для одноцветных иконок используйте `currentColor`.

```svg
<path d="..." stroke="currentColor" />
```

или:

```svg
<path d="..." fill="currentColor" />
```

Если внутри SVG указан фиксированный цвет, например `fill="#252525"`, цвет через `style={{ color: ... }}` не будет управлять этой частью иконки.

## Расположение по FSD

Иконки находятся в `src/shared/ui/icons`, потому что это переиспользуемая UI-инфраструктура без бизнес-логики.

- `src/shared/ui/icons/assets/outlined` — исходные SVG для outlined-иконок.
- `src/shared/ui/icons/assets/filled` — исходные SVG для filled-иконок.
- `src/shared/ui/icons/assets/index.ts` — группирует SVG-assets по стилям.
- `src/shared/ui/icons/createSvgIcon.tsx` — создаёт Ant-like компонент из SVG.
- `src/shared/ui/icons/index.ts` — публичный API: `IconOutlined` и `IconFilled`.

## Как работает внутри

SVG импортируется из `src` через SVGR. Next.js получает webpack-правило из `next.config.mjs`, поэтому импорт вида:

```ts
export { default as Truck } from './truck.svg'
```

становится React-компонентом.

Затем `createIconGroup` получает namespace экспортов, например `Outlined`, и создаёт объект компонентов:

```tsx
export const IconOutlined = createIconGroup(Outlined, 'Outlined')
```

Каждое свойство объекта становится иконкой:

```tsx
IconOutlined.Truck
IconOutlined.Mountain
```

`createSvgIcon` внутри оборачивает SVG в Ant `Icon`, поэтому итоговый компонент ведёт себя как обычная Ant-иконка.

## URL-импорт SVG

Если SVG нужен именно как URL, а не как inline-компонент, используйте `?url`.

```ts
import truckUrl from './truck.svg?url'
```
