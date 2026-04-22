import { createContext, useEffect, useMemo, useState } from 'react'

const THEME_KEY = 'ems_theme'

export const ThemeContext = createContext(null)

const getInitialTheme = () => {
	if (typeof window === 'undefined') {
		return 'dark'
	}

	const savedTheme = window.localStorage.getItem(THEME_KEY)
	if (savedTheme === 'light' || savedTheme === 'dark') {
		return savedTheme
	}

	return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(getInitialTheme)

	useEffect(() => {
		const root = document.documentElement
		root.dataset.theme = theme
		root.style.colorScheme = theme
		window.localStorage.setItem(THEME_KEY, theme)
	}, [theme])

	const value = useMemo(
		() => ({
			theme,
			setTheme,
			isDark: theme === 'dark',
			isLight: theme === 'light',
		}),
		[theme],
	)

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}