import { useEffect, useState } from 'react'
import { mediaQueries } from '../constants'

type ScreenState = {
  isSmallScreen: boolean
  isTabletScreen: boolean
  isMediumScreen: boolean
  isLargeScreen: boolean
}

const getDefaultState = (): ScreenState => ({
  isSmallScreen: false,
  isTabletScreen: false,
  isMediumScreen: false,
  isLargeScreen: false
})

const getCurrentState = (): ScreenState => {
  if (typeof window === 'undefined') {
    return getDefaultState()
  }

  return {
    isSmallScreen: window.matchMedia(mediaQueries.mobile).matches,
    isTabletScreen: window.matchMedia(mediaQueries.tablet).matches,
    isMediumScreen: window.matchMedia(mediaQueries.medium).matches,
    isLargeScreen: window.matchMedia(mediaQueries.large).matches
  }
}

export const useScreen = (): ScreenState => {
  const [screen, setScreen] = useState<ScreenState>(getCurrentState)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mobileQuery = window.matchMedia(mediaQueries.mobile)
    const tabletQuery = window.matchMedia(mediaQueries.tablet)
    const mediumQuery = window.matchMedia(mediaQueries.medium)
    const largeQuery = window.matchMedia(mediaQueries.large)

    const updateScreen = () => {
      setScreen({
        isSmallScreen: mobileQuery.matches,
        isTabletScreen: tabletQuery.matches,
        isMediumScreen: mediumQuery.matches,
        isLargeScreen: largeQuery.matches
      })
    }

    updateScreen()
    mobileQuery.addEventListener('change', updateScreen)
    tabletQuery.addEventListener('change', updateScreen)
    mediumQuery.addEventListener('change', updateScreen)
    largeQuery.addEventListener('change', updateScreen)

    return () => {
      mobileQuery.removeEventListener('change', updateScreen)
      tabletQuery.removeEventListener('change', updateScreen)
      mediumQuery.removeEventListener('change', updateScreen)
      largeQuery.removeEventListener('change', updateScreen)
    }
  }, [])

  return screen
}
