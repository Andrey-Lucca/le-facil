export type HeaderProps = {
  title?: string
  searchValue: string
  onSearchChange: (value: string) => void
  onOpenHistory?: () => void
  onOpenSettings?: () => void
}
