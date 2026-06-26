import type { ReactNode } from "react"

type SummaryCardProps = {
  icon: ReactNode
  label: string
  value: string
  color: string
}

export function SummaryCard({ icon, label, value, color }: SummaryCardProps) {
  return (
    <article className="summary-card">
      <div className="summary-card-top">
        <span className="summary-icon">{icon}</span>
        <span className="summary-swatch" style={{ background: color }} />
      </div>
      <span className="summary-label">{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
