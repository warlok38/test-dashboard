import { useCallback, useEffect, useRef, useState } from 'react'

const HEADER_HIDE_SCROLL_THRESHOLD = 36
const HEADER_TOP_REVEAL_OFFSET = 8
const MOBILE_HEADER_MEDIA_QUERY = '(max-width: 767px)'

export function useHeaderVisibility(isMobileFilterOpen: boolean) {
  const headerRef = useRef<HTMLElement>(null)
  const isHeaderHiddenRef = useRef(false)
  const isMobileFilterOpenRef = useRef(false)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)

  const updateHeaderHidden = useCallback((nextIsHidden: boolean) => {
    if (isHeaderHiddenRef.current === nextIsHidden) {
      return
    }

    isHeaderHiddenRef.current = nextIsHidden
    setIsHeaderHidden(nextIsHidden)
  }, [])

  useEffect(() => {
    isMobileFilterOpenRef.current = isMobileFilterOpen

    if (isMobileFilterOpen) {
      updateHeaderHidden(false)
    }
  }, [isMobileFilterOpen, updateHeaderHidden])

  useEffect(() => {
    const header = headerRef.current
    const scrollContainer = header?.closest<HTMLElement>('[data-main-content-scroll]')

    if (!scrollContainer) {
      return undefined
    }

    const mobileMediaQuery = window.matchMedia(MOBILE_HEADER_MEDIA_QUERY)
    let lastScrollTop = Math.round(scrollContainer.scrollTop)
    let accumulatedDelta = 0
    let animationFrameId: number | null = null

    const handleScroll = () => {
      animationFrameId = null

      if (!mobileMediaQuery.matches) {
        accumulatedDelta = 0
        lastScrollTop = Math.round(scrollContainer.scrollTop)
        updateHeaderHidden(false)
        return
      }

      const currentScrollTop = Math.round(scrollContainer.scrollTop)
      const delta = currentScrollTop - lastScrollTop

      if (isMobileFilterOpenRef.current) {
        accumulatedDelta = 0
        lastScrollTop = currentScrollTop
        updateHeaderHidden(false)
        return
      }

      if (currentScrollTop <= HEADER_TOP_REVEAL_OFFSET) {
        accumulatedDelta = 0
        lastScrollTop = currentScrollTop
        updateHeaderHidden(false)
        return
      }

      if (delta === 0) {
        return
      }

      if ((delta > 0 && accumulatedDelta < 0) || (delta < 0 && accumulatedDelta > 0)) {
        accumulatedDelta = 0
      }

      accumulatedDelta += delta

      if (
        delta > 0 &&
        accumulatedDelta > HEADER_HIDE_SCROLL_THRESHOLD &&
        !isHeaderHiddenRef.current
      ) {
        accumulatedDelta = 0
        updateHeaderHidden(true)
      }

      if (
        delta < 0 &&
        Math.abs(accumulatedDelta) > HEADER_HIDE_SCROLL_THRESHOLD &&
        isHeaderHiddenRef.current
      ) {
        accumulatedDelta = 0
        updateHeaderHidden(false)
      }

      lastScrollTop = currentScrollTop
    }

    const requestScrollUpdate = () => {
      if (animationFrameId !== null) {
        return
      }

      animationFrameId = window.requestAnimationFrame(handleScroll)
    }

    const handleViewportChange = () => {
      accumulatedDelta = 0
      lastScrollTop = Math.round(scrollContainer.scrollTop)

      if (!mobileMediaQuery.matches) {
        updateHeaderHidden(false)
      }
    }

    scrollContainer.addEventListener('scroll', requestScrollUpdate, { passive: true })
    mobileMediaQuery.addEventListener('change', handleViewportChange)

    return () => {
      scrollContainer.removeEventListener('scroll', requestScrollUpdate)
      mobileMediaQuery.removeEventListener('change', handleViewportChange)

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [updateHeaderHidden])

  return { headerRef, isHeaderHidden }
}
