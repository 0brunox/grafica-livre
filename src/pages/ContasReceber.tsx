import { useMemo, useState } from 'react'
import type { Fatura } from '../types'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import {
  Button, Card, DataTable, EmptyState, Modal, PageHeader, StatusBadge,
} from '../components/ui'
import PixModal from '../components/PixModal'
import { ReceberForm } from './Faturas'
import { formatCents } from '../lib/money'
import { daysUntil, formatDateBR } from '../lib/dates'
import { gerarPayloadPix } from '../lib/pix'
import { msgCobranca, temWhatsapp, waLink } from '../lib/whatsapp'

export default function ContasReceber() {
  const {
    db, clienteById, valorPago, faturaStatusEfetivo,
    registrarPagamento, deletePagamento, pagamentosDaFatura,
  } = useData()
  const { showToast } = useToast()
  const [recebendo, setRecebendo] = useState<Fatura | null>(null)
  const [pixFatura, setPixFatura] = useState<Fatura | null>(null)

  const cobrarWhatsapp = (f: Fatura) => {
    const cliente = clienteById(f.clienteId)
    const saldo = f.total - valorPago(f.id)
    let payload: string | undefined
    if (db.empresa.chavePix && saldo > 0) {
      payload = gerarPayloadPix({
        chave: db.empresa.chavePix,
        nomeRecebedor: db.empresa.nome,
        cidade: db.empresa.cidade,
        valorCents: saldo,
        txid: f.numero,
      })
    }
    const link = waLink(cliente?.telefone ?? '', msgCobranca(f, cliente, db.empresa, saldo, payload))
    if (link) window.open(link, '_blank')
    else showToast('Cliente sem telefone válido para WhatsApp.', 'error')
  }

  const abertas = useMemo(
    () =>
      db.faturas
        .filter((f) => f.status !== 'paga' && f.status !== 'cancelada')
        .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento)),
    [db.faturas],
  )

  const totalAberto = abertas.reduce((s, f) => s + (f.total - valorPago(f.id)), 0)
  const vencidas = abertas.filter((f) => faturaStatusEfetivo(f) === 'atrasada')
  const totalVencido = vencidas.reduce((s, f) => s + (f.total - valorPago(f.id)), 0)
  const proximos7 = abertas.filter((f) => {
    const d = daysUntil(f.dataVencimento)
    return d >= 0 && d <= 7
  })

  // Cobranças de hoje: vencidas ou vencendo hoje, com cliente no WhatsApp
  const cobrancasHoje = abertas.filter(
    (f) => daysUntil(f.dataVencimento) <= 0 && temWhatsapp(clienteById(f.clienteId)),
  )

  return (
    <div>
      <PageHeader title="Contas a Receber" subtitle="Faturas em aberto, por vencimento" />

      {cobrancasHoje.length > 0 && (
        <Card className="mb-5 border-l-4 border-l-amber-400">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              📣 Cobranças para enviar hoje
            </h3>
            <span className="text-xs text-slate-400">{cobrancasHoje.length} cliente(s)</span>
          </div>
          <div className="flex flex-col gap-2">
            {cobrancasHoje.map((f) => {
              const dias = daysUntil(f.dataVencimento)
              return (
                <div
                  key={f.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                >
                  <div className="text-sm">
                    <span className="font-medium">{clienteById(f.clienteId)?.nome}</span>
                    <span className="text-slate-400"> — {f.numero}</span>
                    <span className="ml-2 font-semibold text-amber-700">
                      {formatCents(f.total - valorPago(f.id))}
                    </span>
                    <span className="ml-2 text-xs text-red-500">
                      {dias < 0 ? `${-dias}d em atraso` : 'vence hoje'}
                    </span>
                  </div>
                  <Button small variant="success" onClick={() => cobrarWhatsapp(f)}>
                    Cobrar no WhatsApp
                  </Button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Total em aberto</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{formatCents(totalAberto)}</p>
          <p className="text-xs text-slate-400">{abertas.length} fatura(s)</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-red-500">Vencidas</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{formatCents(totalVencido)}</p>
          <p className="text-xs text-slate-400">{vencidas.length} fatura(s)</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-amber-600">Vencem em 7 dias</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {formatCents(proximos7.reduce((s, f) => s + (f.total - valorPago(f.id)), 0))}
          </p>
          <p className="text-xs text-slate-400">{proximos7.length} fatura(s)</p>
        </Card>
      </div>

      <Card>
        <DataTable
          rows={abertas}
          empty={
            <EmptyState
              icon="✅"
              title="Nenhuma conta a receber"
              hint="Todas as faturas estão pagas."
            />
          }
          columns={[
            {
              key: 'numero',
              header: 'Fatura',
              render: (f) => <span className="font-medium">{f.numero}</span>,
            },
            {
              key: 'cliente',
              header: 'Cliente',
              sortValue: (f) => clienteById(f.clienteId)?.nome.toLowerCase() ?? '',
              render: (f) => clienteById(f.clienteId)?.nome ?? '—',
            },
            {
              key: 'vencimento',
              header: 'Vencimento',
              sortValue: (f) => f.dataVencimento,
              render: (f) => {
                const dias = daysUntil(f.dataVencimento)
                return (
                  <div>
                    {formatDateBR(f.dataVencimento)}
                    <p className={`text-xs ${dias < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {dias < 0
                        ? `${-dias} dia(s) em atraso`
                        : dias === 0
                          ? 'vence hoje'
                          : `em ${dias} dia(s)`}
                    </p>
                  </div>
                )
              },
            },
            {
              key: 'saldo',
              header: 'Saldo devido',
              sortValue: (f) => f.total - valorPago(f.id),
              className: 'text-right',
              render: (f) => (
                <span className="font-semibold">{formatCents(f.total - valorPago(f.id))}</span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (f) => <StatusBadge status={faturaStatusEfetivo(f)} />,
            },
            {
              key: 'acoes',
              header: '',
              className: 'text-right whitespace-nowrap',
              render: (f) => (
                <div className="flex justify-end gap-1.5">
                  {db.empresa.chavePix && (
                    <Button small variant="secondary" onClick={() => setPixFatura(f)}>
                      PIX
                    </Button>
                  )}
                  {temWhatsapp(clienteById(f.clienteId)) && (
                    <Button small variant="secondary" onClick={() => cobrarWhatsapp(f)}>
                      Cobrar
                    </Button>
                  )}
                  <Button small variant="success" onClick={() => setRecebendo(f)}>
                    Receber
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={recebendo !== null}
        title={`Receber — Fatura ${recebendo?.numero ?? ''}`}
        onClose={() => setRecebendo(null)}
      >
        {recebendo && (
          <ReceberForm
            fatura={recebendo}
            valorPago={valorPago(recebendo.id)}
            pagamentos={pagamentosDaFatura(recebendo.id)}
            onRegistrar={async (p) => {
              await registrarPagamento(p)
              showToast('Pagamento registrado!')
              setRecebendo(null)
            }}
            onDeletePagamento={async (id) => {
              await deletePagamento(id)
              showToast('Pagamento removido.')
              setRecebendo(null)
            }}
          />
        )}
      </Modal>

      <PixModal
        open={pixFatura !== null}
        onClose={() => setPixFatura(null)}
        empresa={db.empresa}
        valorCents={pixFatura ? pixFatura.total - valorPago(pixFatura.id) : 0}
        txid={pixFatura?.numero ?? ''}
        titulo={`Cobrar via PIX — ${pixFatura?.numero ?? ''}`}
      />
    </div>
  )
}
