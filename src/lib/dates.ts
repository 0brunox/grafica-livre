/** yyyy-mm-dd de hoje (fuso local) */
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** "yyyy-mm-dd" -> "dd/mm/yyyy" (sem problemas de fuso) */
export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return '-'
  const [y, m, d] = iso.split('T')[0].split('-')
  if (!y || !m || !d) return '-'
  return `${d}/${m}/${y}`
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function isPast(iso: string): boolean {
  return iso < todayISO()
}

/** Diferença em dias entre a data e hoje (positivo = no futuro) */
export function daysUntil(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(y, m - 1, d).getTime()
  const [ty, tm, td] = todayISO().split('-').map(Number)
  const today = new Date(ty, tm - 1, td).getTime()
  return Math.round((target - today) / 86400000)
}

/** "2026-07" da data ISO */
export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', {
    month: 'short',
    year: '2-digit',
  })
}
