import { Layout } from "antd"
import type { ReactNode } from "react"
import { Sidebar } from "../Sidebar/Sidebar"
import { HeaderSearch } from "../HeaderSearch/HeaderSearch"

type AppLayoutProps = {
  children: ReactNode
  searchValue: string
  onSearchChange: (value: string) => void
}

export function AppLayout({ children, searchValue, onSearchChange }: AppLayoutProps) {
  return (
    <Layout className="app-shell">
      <Sidebar />
      <Layout className="app-main-layout">
        <HeaderSearch searchValue={searchValue} onSearchChange={onSearchChange} />
        <Layout.Content className="app-content">{children}</Layout.Content>
      </Layout>
    </Layout>
  )
}
