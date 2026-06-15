export const BREAKPOINTS = {
  mobileMax: 767,
  tabletMin: 768,
  tabletMax: 1023,
  largeMin: 1024
} as const

export const mediaQueries = {
  mobile: `(max-width: ${BREAKPOINTS.mobileMax}px)`,
  tablet: `(min-width: ${BREAKPOINTS.tabletMin}px) and (max-width: ${BREAKPOINTS.tabletMax}px)`,
  large: `(min-width: ${BREAKPOINTS.largeMin}px)`
} as const
