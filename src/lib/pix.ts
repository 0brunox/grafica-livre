import QRCode from 'qrcode'

// Gera o "BR Code" (payload PIX copia-e-cola) no padrão EMV do Banco Central,
// 100% no navegador — sem custo e sem API. Referência: Manual de Padrões
// para Iniciação do PIX (arranjo BR.GOV.BCB.PIX).

/** Remove acentos e caracteres fora do ASCII imprimível exigido pelo padrão. */
function sanitize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // acentos (combining diacritics)
    .replace(/[^\x20-\x7E]/g, '') // não-ASCII
    .toUpperCase()
    .trim()
}

/** Monta um campo EMV: id (2) + tamanho (2, zero-padded) + valor. */
function campo(id: string, valor: string): string {
  const tam = valor.length.toString().padStart(2, '0')
  return `${id}${tam}${valor}`
}

/** CRC16-CCITT (polinômio 0x1021, inicial 0xFFFF) — 4 hex maiúsculos. */
export function crc16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export interface DadosPix {
  chave: string
  nomeRecebedor: string
  cidade: string
  valorCents: number
  /** identificador da transação (ex.: número da fatura); sem espaços, ≤25 chars */
  txid?: string
}

export function gerarPayloadPix({
  chave,
  nomeRecebedor,
  cidade,
  valorCents,
  txid,
}: DadosPix): string {
  const nome = sanitize(nomeRecebedor).slice(0, 25) || 'RECEBEDOR'
  const cidadeSan = sanitize(cidade).slice(0, 15) || 'BRASIL'
  const txidSan = (sanitize(txid ?? '').replace(/[^A-Z0-9]/g, '') || '***').slice(0, 25)
  const valor = (valorCents / 100).toFixed(2)

  // Merchant Account Information (id 26): GUI + chave PIX
  const mai = campo('00', 'BR.GOV.BCB.PIX') + campo('01', chave.trim())

  const semCrc =
    campo('00', '01') + // Payload Format Indicator
    campo('01', '12') + // Point of Initiation: 12 = QR reutilizável com valor
    campo('26', mai) +
    campo('52', '0000') + // Merchant Category Code
    campo('53', '986') + // moeda BRL
    campo('54', valor) +
    campo('58', 'BR') +
    campo('59', nome) +
    campo('60', cidadeSan) +
    campo('62', campo('05', txidSan)) +
    '6304' // id + tamanho do CRC, valor calculado a seguir

  return semCrc + crc16(semCrc)
}

/** Retorna o QR code do payload como data URL (PNG). */
export function gerarQrPixDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320,
  })
}
