import { useEffect, useState } from 'react'
import { mediaQueries } from '../constants'

type ScreenState = {
  isSmallScreen: boolean
  isMediumScreen: boolean
  isLargeScreen: boolean
}

const getDefaultState = (): ScreenState => ({
  isSmallScreen: false,
  isMediumScreen: false,
  isLargeScreen: false
})

const getCurrentState = (): ScreenState => {
  if (typeof window === 'undefined') {
    return getDefaultState()
  }

  return {
    isSmallScreen: window.matchMedia(mediaQueries.mobile).matches,
    isMediumScreen: window.matchMedia(mediaQueries.tablet).matches,
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
    const largeQuery = window.matchMedia(mediaQueries.large)

    const updateScreen = () => {
      setScreen({
        isSmallScreen: mobileQuery.matches,
        isMediumScreen: tabletQuery.matches,
        isLargeScreen: largeQuery.matches
      })
    }

    updateScreen()
    mobileQuery.addEventListener('change', updateScreen)
    tabletQuery.addEventListener('change', updateScreen)
    largeQuery.addEventListener('change', updateScreen)

    return () => {
      mobileQuery.removeEventListener('change', updateScreen)
      tabletQuery.removeEventListener('change', updateScreen)
      largeQuery.removeEventListener('change', updateScreen)
    }
  }, [])

  return screen
}
