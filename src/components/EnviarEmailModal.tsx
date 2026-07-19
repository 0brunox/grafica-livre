import { useEffect, useState } from 'react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { Button, Field, Modal, inputClass } from './ui'

// Garante que uma Promise que trava não deixe o botão preso em "Enviando...".
function comTimeout<T>(p: Promise<T>, ms: number, msg: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
  ])
}

// Escapa HTML e converte quebras de linha em <br> para o corpo do e-mail.
function textoParaHtml(texto: string): string {
  const escapado = texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1e293b;line-height:1.5">${escapado.replace(/\n/g, '<br>')}</div>`
}

export default function EnviarEmailModal({
  open,
  onClose,
  destinatarioInicial,
  assuntoInicial,
  mensagemInicial,
  nomeArquivo,
  gerarPdfBase64,
  remetenteNome,
  replyTo,
}: {
  open: boolean
  onClose: () => void
  destinatarioInicial: string
  assuntoInicial: string
  mensagemInicial: string
  nomeArquivo: string
  gerarPdfBase64: () => Promise<string>
  remetenteNome?: string
  replyTo?: string
}) {
  const { enviarEmailDocumento } = useData()
  const { showToast } = useToast()
  const [para, setPara] = useState(destinatarioInicial)
  const [assunto, setAssunto] = useState(assuntoInicial)
  const [mensagem, setMensagem] = useState(mensagemInicial)
  const [busy, setBusy] = useState(false)

  // Reinicia os campos toda vez que o modal abre para um documento diferente.
  useEffect(() => {
    if (open) {
      setPara(destinatarioInicial)
      setAssunto(assuntoInicial)
      setMensagem(mensagemInicial)
    }
  }, [open, destinatarioInicial, assuntoInicial, mensagemInicial])

  const enviar = async () => {
    if (!para.trim()) {
      showToast('Informe o e-mail do destinatário.', 'error')
      return
    }
    setBusy(true)
    try {
      const pdfBase64 = await comTimeout(
        gerarPdfBase64(),
        30000,
        'Não consegui gerar o PDF (tempo esgotado). Tente baixar o PDF pelo botão para ver se abre.',
      )
      await comTimeout(
        enviarEmailDocumento({
          para: para.trim(),
          assunto: assunto.trim() || nomeArquivo,
          html: textoParaHtml(mensagem),
          pdfBase64,
          nomeArquivo,
          remetenteNome,
          replyTo,
        }),
        30000,
        'O servidor de e-mail não respondeu a tempo. Confira o deploy da função e a chave do Resend.',
      )
      showToast('E-mail enviado!')
      onClose()
    } catch (e) {
      showToast(e instanceof Error ? e.message : String(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title="Enviar por e-mail" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <Field label="Para">
          <input
            type="email"
            multiple
            className={inputClass}
            value={para}
            onChange={(e) => setPara(e.target.value)}
            placeholder="cliente@exemplo.com, outro@exemplo.com"
          />
          <span className="text-xs text-slate-400">
            Vários e-mails? Separe por vírgula.
          </span>
        </Field>
        <Field label="Assunto">
          <input
            className={inputClass}
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
          />
        </Field>
        <Field label="Mensagem">
          <textarea
            className={`${inputClass} min-h-32`}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />
        </Field>
        <p className="text-xs text-slate-400">
          O PDF ({nomeArquivo}) vai anexado automaticamente.
        </p>
        <div className="mt-1 flex justify-end gap-2">
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={busy} onClick={enviar}>
            {busy ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
