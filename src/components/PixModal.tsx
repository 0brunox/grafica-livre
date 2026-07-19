import { useEffect, useState } from 'react'
import type { Empresa } from '../types'
import { Button, Modal } from './ui'
import { formatCents } from '../lib/money'
import { gerarPayloadPix, gerarQrPixDataUrl } from '../lib/pix'

/** Modal de cobrança via PIX: mostra o QR Code e o código copia-e-cola. */
export default function PixModal({
  open,
  onClose,
  empresa,
  valorCents,
  txid,
  titulo,
}: {
  open: boolean
  onClose: () => void
  empresa: Empresa
  valorCents: number
  txid: string
  titulo: string
}) {
  const [qr, setQr] = useState('')
  const [payload, setPayload] = useState('')
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!open || !empresa.chavePix) return
    const p = gerarPayloadPix({
      chave: empresa.chavePix,
      nomeRecebedor: empresa.nome,
      cidade: empresa.cidade,
      valorCents,
      txid,
    })
    setPayload(p)
    setCopiado(false)
    gerarQrPixDataUrl(p).then(setQr).catch(() => setQr(''))
  }, [open, empresa, valorCents, txid])

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(payload)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <Modal open={open} title={titulo} onClose={onClose}>
      {!empresa.chavePix ? (
        <p className="text-sm text-slate-600">
          Cadastre a <strong>chave PIX</strong> no Perfil da Empresa para gerar cobranças.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-slate-500">Valor</p>
          <p className="-mt-2 text-2xl font-bold text-slate-800">{formatCents(valorCents)}</p>
          {qr ? (
            <img
              src={qr}
              alt="QR Code PIX"
              className="h-56 w-56 rounded-lg border border-slate-200"
            />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-400">
              Gerando QR...
            </div>
          )}
          <div className="w-full">
            <p className="mb-1 text-xs font-medium text-slate-500">PIX copia e cola</p>
            <textarea
              readOnly
              value={payload}
              onFocus={(e) => e.target.select()}
              className="h-20 w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs text-slate-600"
            />
          </div>
          <Button onClick={copiar} className="w-full">
            {copiado ? '✓ Código copiado!' : 'Copiar código PIX'}
          </Button>
          <p className="text-center text-xs text-slate-400">
            Chave: {empresa.chavePix} — recebedor: {empresa.nome}
          </p>
        </div>
      )}
    </Modal>
  )
}
