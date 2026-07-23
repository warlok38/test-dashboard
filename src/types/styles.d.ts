declare module '*.css'

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.svg' {
  import type { FC, SVGProps } from 'react'

  const content: FC<SVGProps<SVGSVGElement>>
  export default content
}

declare module '*.svg?url' {
  const content: string
  export default content
}
