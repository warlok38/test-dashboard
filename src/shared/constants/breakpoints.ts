export const BREAKPOINTS = {
  mobileMax: 767,
  tabletMin: 768,
  tabletMax: 1023,
  mediumMin: 1024,
  mediumMax: 1439,
  largeMin: 1440
} as const

export const mediaQueries = {
  mobile: `(max-width: ${BREAKPOINTS.mobileMax}px)`,
  tablet: `(min-width: ${BREAKPOINTS.tabletMin}px) and (max-width: ${BREAKPOINTS.tabletMax}px)`,
  medium: `(min-width: ${BREAKPOINTS.mediumMin}px) and (max-width: ${BREAKPOINTS.mediumMax}px)`,
  large: `(min-width: ${BREAKPOINTS.largeMin}px)`
} as const
