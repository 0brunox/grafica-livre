// Valores monetários circulam pelo app como centavos (inteiros).

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/** centavos -> reais como número decimal (ex.: 15050 -> 150.5). */
export function centsToReais(cents: number): number {
  return Math.round(cents) / 100
}

/** "1.234,56" | "1234.56" | "1234" -> centavos */
export function parseMoney(input: string): number {
  const s = input.trim().replace(/[R$\s]/g, '')
  if (!s) return 0
  // Formato brasileiro: vírgula como separador decimal
  const normalized = s.includes(',')
    ? s.replace(/\./g, '').replace(',', '.')
    : s
  const value = parseFloat(normalized)
  if (isNaN(value)) return 0
  return Math.round(value * 100)
}

/** centavos -> "1.234,56" (sem símbolo, para inputs) */
export function centsToInput(cents: number): string {
  if (!cents) return ''
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** reais (float legado) -> centavos */
export function reaisToCents(reais: number | undefined | null): number {
  return Math.round((reais || 0) * 100)
}
