import type { DocumentoItem } from '../types'

export interface Totais {
  subtotal: number // soma dos itens (base, sem imposto) — centavos
  impostos: number // soma do imposto por item — centavos
  total: number // subtotal + impostos + frete − desconto — centavos
}

/** Calcula os totais de um orçamento/fatura, com imposto por item e desconto. */
export function calcularTotais(
  itens: DocumentoItem[],
  frete: number,
  desconto: number,
): Totais {
  const subtotal = itens.reduce((s, i) => s + i.total, 0)
  const impostos = itens.reduce(
    (s, i) => s + Math.round((i.total * (i.impostoPct || 0)) / 100),
    0,
  )
  const total = subtotal + impostos + (frete || 0) - (desconto || 0)
  return { subtotal, impostos, total }
}
