import type { Cliente, Empresa, Fatura, Orcamento } from '../types'
import { formatCents } from './money'
import { addDays, daysUntil, formatDateBR } from './dates'
import { onlyDigits } from './validation'

/** Normaliza telefone BR para o formato do wa.me: 55 + DDD + número (só dígitos). */
export function normalizarTelefone(telefone: string): string {
  let d = onlyDigits(telefone)
  if (!d) return ''
  // Remove zeros de operadora à esquerda
  d = d.replace(/^0+/, '')
  // Se não começar com 55 e tiver 10-11 dígitos (DDD + número), prefixa o Brasil
  if (!d.startsWith('55') && (d.length === 10 || d.length === 11)) {
    d = '55' + d
  }
  return d
}

/** Monta o link wa.me com a mensagem já codificada. Retorna null sem telefone válido. */
export function waLink(telefone: string, mensagem: string): string | null {
  const num = normalizarTelefone(telefone)
  if (num.length < 12) return null // 55 + 10 dígitos no mínimo
  return `https://wa.me/${num}?text=${encodeURIComponent(mensagem)}`
}

/** Se o cliente tem telefone utilizável no WhatsApp. */
export function temWhatsapp(cliente: Cliente | undefined): boolean {
  return Boolean(cliente && normalizarTelefone(cliente.telefone).length >= 12)
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] || 'tudo bem'
}

export function msgOrcamento(
  orcamento: Orcamento,
  cliente: Cliente | undefined,
  empresa: Empresa,
): string {
  const validade = formatDateBR(addDays(orcamento.data, orcamento.validadeDias))
  const linhas = [
    `Olá, ${primeiroNome(cliente?.nome ?? '')}! 👋`,
    ``,
    `Segue o orçamento *${orcamento.numero}* da ${empresa.nome}:`,
    ``,
    `💰 Total: *${formatCents(orcamento.total)}*`,
    `📅 Válido até: ${validade}`,
  ]
  if (orcamento.prazoEntrega) linhas.push(`🚚 Prazo de entrega: ${orcamento.prazoEntrega}`)
  linhas.push(``, `Qualquer dúvida, estou à disposição. Obrigado!`)
  return linhas.join('\n')
}

export function msgCobranca(
  fatura: Fatura,
  cliente: Cliente | undefined,
  empresa: Empresa,
  saldoCents: number,
  payloadPix?: string,
): string {
  const dias = daysUntil(fatura.dataVencimento)
  const situacao =
    dias < 0
      ? `venceu em ${formatDateBR(fatura.dataVencimento)} (${-dias} dia(s) em atraso)`
      : dias === 0
        ? `vence *hoje* (${formatDateBR(fatura.dataVencimento)})`
        : `vence em ${formatDateBR(fatura.dataVencimento)}`
  const linhas = [
    `Olá, ${primeiroNome(cliente?.nome ?? '')}! 😊`,
    ``,
    `Passando para lembrar da fatura *${fatura.numero}* da ${empresa.nome}.`,
    ``,
    `💰 Valor em aberto: *${formatCents(saldoCents)}*`,
    `📅 ${situacao.charAt(0).toUpperCase() + situacao.slice(1)}`,
  ]
  if (payloadPix) {
    linhas.push(
      ``,
      `Para facilitar, segue o *PIX copia e cola*:`,
      payloadPix,
    )
  } else if (empresa.chavePix) {
    linhas.push(``, `Chave PIX para pagamento: ${empresa.chavePix}`)
  }
  linhas.push(``, `Assim que efetuar, é só me avisar. Obrigado! 🙏`)
  return linhas.join('\n')
}
