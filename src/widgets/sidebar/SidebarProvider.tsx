'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'

import { useScreen } from '@/shared/hooks/useScreen'

type SidebarContextValue = {
  isCollapsed: boolean
  isMobileOpen: boolean
  isSmallScreen: boolean
  isTabletScreen: boolean
  isMediumScreen: boolean
  isLargeScreen: boolean
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

type SidebarProviderProps = {
  children: ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const { isSmallScreen, isTabletScreen, isMediumScreen, isLargeScreen } = useScreen()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const wasTabletScreen = useRef(false)

  useEffect(() => {
    if (!isSmallScreen) {
      setIsMobileOpen(false)
    }
  }, [isSmallScreen])

  useEffect(() => {
    if (isTabletScreen && !wasTabletScreen.current) {
      setIsCollapsed(true)
    }

    wasTabletScreen.current = isTabletScreen
  }, [isTabletScreen])

  const openMobileSidebar = useCallback(() => {
    setIsMobileOpen(true)
  }, [])

  const closeMobileSidebar = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((current) => !current)
  }, [])

  const value = useMemo(
    (): SidebarContextValue => ({
      isCollapsed,
      isMobileOpen,
      isSmallScreen,
      isTabletScreen,
      isMediumScreen,
      isLargeScreen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleCollapsed
    }),
    [
      closeMobileSidebar,
      isCollapsed,
      isLargeScreen,
      isMediumScreen,
      isMobileOpen,
      isSmallScreen,
      isTabletScreen,
      openMobileSidebar,
      toggleCollapsed
    ]
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }

  return context
}
