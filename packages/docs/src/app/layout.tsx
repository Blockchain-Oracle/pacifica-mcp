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
      width="22"
      height="22"
      viewBox="0 0 32 32"
      fill="none"
    >
      <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke="#22d3ee" strokeWidth="1.8" fill="none"/>
      <path d="M7 16 Q9.75 10.5 12.5 16 Q15.25 21.5 18 16 Q20.75 10.5 23.5 16" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <circle cx="7" cy="16" r="1.8" fill="#22d3ee"/>
      <circle cx="23.5" cy="16" r="1.8" fill="#22d3ee"/>
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
      <Head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </Head>
      <body>
        <Layout
          navbar={
            <Navbar
              logo={logo}
              projectLink="https://github.com/Blockchain-Oracle/pacifica-mcp"
            />
          }
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/Blockchain-Oracle/pacifica-mcp/tree/main/packages/docs"
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
