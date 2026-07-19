import type { Fatura, Orcamento } from '../types'
import { useData } from '../context/DataContext'
import { Button, Modal } from './ui'
import { formatCents } from '../lib/money'
import { calcularTotais } from '../lib/documento'
import { addDays, formatDateBR } from '../lib/dates'

const FORMA_LABEL: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  transferencia: 'Transferência bancária',
  boleto: 'Boleto',
  cartao_credito: 'Cartão de crédito',
  cartao_debito: 'Cartão de débito',
}

/** Visualização em tela (sem PDF) de um orçamento ou fatura. */
export default function DocumentoView({
  open,
  onClose,
  doc,
  tipo,
  onBaixarPdf,
}: {
  open: boolean
  onClose: () => void
  doc: Orcamento | Fatura | null
  tipo: 'orcamento' | 'fatura'
  onBaixarPdf?: () => void
}) {
  const { db, clienteById } = useData()
  if (!doc) return null

  const empresa = db.empresa
  const cliente = clienteById(doc.clienteId)
  const totais = calcularTotais(doc.itens, doc.frete, doc.desconto)
  const temMedidas = doc.itens.some((i) => i.m2 > 0)
  const isFatura = tipo === 'fatura'
  const fatura = isFatura ? (doc as Fatura) : null
  const orcamento = !isFatura ? (doc as Orcamento) : null

  return (
    <Modal
      open={open}
      title={`${isFatura ? 'Fatura' : 'Orçamento'} ${doc.numero}`}
      onClose={onClose}
      wide
    >
      <div className="flex flex-col gap-5 text-sm text-slate-700">
        {/* Cabeçalho: empresa + tipo */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            {empresa.logoDataUrl && (
              <img src={empresa.logoDataUrl} alt="Logo" className="h-14 object-contain" />
            )}
            <div>
              <p className="text-base font-bold text-slate-800">{empresa.nome}</p>
              {empresa.cnpj && <p className="text-xs text-slate-500">CNPJ: {empresa.cnpj}</p>}
              {empresa.endereco && (
                <p className="text-xs text-slate-500">
                  {empresa.endereco}
                  {empresa.cidade ? ` — ${empresa.cidade}/${empresa.estado}` : ''}
                </p>
              )}
              <p className="text-xs text-slate-500">
                {[empresa.telefone, empresa.email].filter(Boolean).join('  •  ')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-700">
              {isFatura ? 'FATURA' : 'ORÇAMENTO'}
            </p>
            <p className="text-slate-500">{doc.numero}</p>
          </div>
        </div>

        {/* Cliente + datas */}
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Cliente</p>
            <p className="font-medium text-slate-800">{cliente?.nome ?? '—'}</p>
            {cliente?.documento && <p className="text-xs">CNPJ/CPF: {cliente.documento}</p>}
            {cliente?.telefone && <p className="text-xs">{cliente.telefone}</p>}
          </div>
          <div className="text-right text-xs text-slate-600">
            {orcamento && (
              <>
                <p>Data: {formatDateBR(orcamento.data)}</p>
                <p>Válido até: {formatDateBR(addDays(orcamento.data, orcamento.validadeDias))}</p>
                {orcamento.prazoEntrega && <p>Prazo de entrega: {orcamento.prazoEntrega}</p>}
              </>
            )}
            {fatura && (
              <>
                <p>Emissão: {formatDateBR(fatura.dataEmissao)}</p>
                <p>Vencimento: {formatDateBR(fatura.dataVencimento)}</p>
                <p>Pagamento: {FORMA_LABEL[fatura.formaPagamento] ?? fatura.formaPagamento}</p>
              </>
            )}
          </div>
        </div>

        {/* Itens */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-700 text-left text-xs uppercase text-white">
                <th className="px-2 py-1.5">Descrição</th>
                <th className="px-2 py-1.5 text-center">Qtd</th>
                {temMedidas && (
                  <>
                    <th className="px-2 py-1.5 text-center">Larg.</th>
                    <th className="px-2 py-1.5 text-center">Alt.</th>
                    <th className="px-2 py-1.5 text-center">m²</th>
                  </>
                )}
                <th className="px-2 py-1.5 text-right">V. unit.</th>
                <th className="px-2 py-1.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {doc.itens.map((it, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="whitespace-pre-line px-2 py-1.5">{it.descricao}</td>
                  <td className="px-2 py-1.5 text-center">{it.qtd}</td>
                  {temMedidas && (
                    <>
                      <td className="px-2 py-1.5 text-center">{it.largura ? it.largura.toFixed(2) : '-'}</td>
                      <td className="px-2 py-1.5 text-center">{it.altura ? it.altura.toFixed(2) : '-'}</td>
                      <td className="px-2 py-1.5 text-center">{it.m2 ? it.m2.toFixed(2) : '-'}</td>
                    </>
                  )}
                  <td className="px-2 py-1.5 text-right">{formatCents(it.valorUnit)}</td>
                  <td className="px-2 py-1.5 text-right font-medium">{formatCents(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totais */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs">
            <Linha label="Subtotal" valor={formatCents(totais.subtotal)} />
            {totais.impostos > 0 && <Linha label="Impostos" valor={formatCents(totais.impostos)} />}
            {doc.frete > 0 && <Linha label="Frete" valor={formatCents(doc.frete)} />}
            {doc.desconto > 0 && <Linha label="Desconto" valor={'- ' + formatCents(doc.desconto)} />}
            <div className="mt-1 flex justify-between border-t border-slate-300 pt-1 text-base font-bold text-blue-700">
              <span>Total</span>
              <span>{formatCents(totais.total)}</span>
            </div>
          </div>
        </div>

        {doc.observacoes && (
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Observações</p>
            <p className="whitespace-pre-line text-slate-600">{doc.observacoes}</p>
          </div>
        )}

        {doc.condicoesPagamento && (
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Condições de Pagamento</p>
            <p className="whitespace-pre-line text-slate-600">{doc.condicoesPagamento}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          {onBaixarPdf && (
            <Button variant="secondary" onClick={onBaixarPdf}>
              Baixar PDF
            </Button>
          )}
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </Modal>
  )
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between py-0.5 text-slate-600">
      <span>{label}</span>
      <span>{valor}</span>
    </div>
  )
}
