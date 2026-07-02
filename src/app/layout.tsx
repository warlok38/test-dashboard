import './globals.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { cookies } from 'next/headers'
import { Montserrat } from 'next/font/google'
import { THEME_STORAGE_KEY, isThemeMode, type ThemeMode } from '@/shared/theme/constants'
import { Providers } from './providers'
import { Layout } from '@/widgets'

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-montserrat',
  display: 'swap'
})

function getInitialThemeMode(): ThemeMode {
  const cookieTheme = cookies().get(THEME_STORAGE_KEY)?.value
  return isThemeMode(cookieTheme) ? cookieTheme : 'light'
}

function getThemeInitScript(initialMode: ThemeMode) {
  return `
    (function () {
      try {
        var storageKey = '${THEME_STORAGE_KEY}';
        var fallback = '${initialMode}';
        var stored = window.localStorage.getItem(storageKey);
        var mode = stored === 'dark' || stored === 'light' ? stored : fallback;
        document.documentElement.dataset.theme = mode;
        document.cookie = storageKey + '=' + mode + '; path=/; max-age=31536000; SameSite=Lax';
      } catch (error) {
        document.documentElement.dataset.theme = '${initialMode}';
      }
    })();
  `
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialThemeMode = getInitialThemeMode()

  return (
    <html
      lang="ru"
      className={montserrat.variable}
      data-theme={initialThemeMode}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript(initialThemeMode) }} />
      </head>
      <body className={montserrat.className}>
        <AntdRegistry>
          <Providers initialThemeMode={initialThemeMode}>
            <Layout>{children}</Layout>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  )
}
