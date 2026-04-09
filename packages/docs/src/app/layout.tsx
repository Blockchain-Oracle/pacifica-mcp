import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './globals.css'

export const metadata = {
  title: {
    template: '%s - Pacifica MCP',
    default: 'Pacifica MCP',
  },
  description:
    'Pacifica MCP — AI-native trading tools for the #1 Solana perps DEX',
  applicationName: 'Pacifica MCP',
}

const logo = (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h4l3-9 4 18 3-9h4" />
    </svg>
    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Pacifica MCP</span>
  </div>
)

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pageMap = await getPageMap()

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="P" />
      <body>
        <Layout
          navbar={
            <Navbar
              logo={logo}
              projectLink="https://github.com/pacifica-fi/pacifica-mcp"
            />
          }
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/pacifica-fi/pacifica-mcp/tree/main/packages/docs"
          editLink="Edit this page on GitHub"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          footer={
            <Footer>
              {`\u00A9 ${new Date().getFullYear()} Pacifica MCP \u2014 AI-native trading on Solana`}
            </Footer>
          }
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
