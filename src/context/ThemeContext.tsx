import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'
type ThemeMode = 'system' | Theme

interface ThemeContextType {
  theme: Theme
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
const STORAGE_KEY = 'theme_preference'
const LEGACY_KEY = 'theme'

const resolveSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const getStoredMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  const legacy = localStorage.getItem(LEGACY_KEY)
  if (legacy === 'light' || legacy === 'dark') return legacy
  return 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const initialMode = useMemo(() => getStoredMode(), [])
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode)
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    if (initialMode === 'system') return resolveSystemTheme()
    return initialMode
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (themeMode !== 'system') return
      setTheme(media.matches ? 'dark' : 'light')
    }

    if (themeMode === 'system') {
      handleChange()
      if (media.addEventListener) {
        media.addEventListener('change', handleChange)
        return () => media.removeEventListener('change', handleChange)
      }
      media.addListener(handleChange)
      return () => media.removeListener(handleChange)
    }

    return () => {}
  }, [themeMode])

  useEffect(() => {
    if (themeMode !== 'system') {
      setTheme(themeMode)
    }
  }, [themeMode])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, themeMode)
      localStorage.removeItem(LEGACY_KEY)
    }
  }, [theme, themeMode])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setThemeMode(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
