import { useMemo, useState } from 'react'
import type { Cliente } from '../types'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { Button, Modal, inputClass } from './ui'
import { ClienteFormFields, novoCliente } from '../pages/Clientes'

/** Select de cliente com botão "+ Novo" e cadastro rápido embutido.
 *  Reutilizado em Orçamentos e Faturas. */
export default function ClienteSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (clienteId: string) => void
}) {
  const { db, saveCliente } = useData()
  const { showToast } = useToast()
  const [novo, setNovo] = useState<Cliente | null>(null)

  const clientesOrdenados = useMemo(
    () => [...db.clientes].sort((a, b) => a.nome.localeCompare(b.nome)),
    [db.clientes],
  )

  return (
    <>
      <div className="flex gap-1.5">
        <select
          className={`${inputClass} flex-1`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— Selecione —</option>
          {clientesOrdenados.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <Button type="button" variant="success" small onClick={() => setNovo(novoCliente())}>
          + Novo
        </Button>
      </div>

      <Modal open={novo !== null} title="Novo cliente" onClose={() => setNovo(null)}>
        {novo && (
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              await saveCliente(novo)
              showToast('Cliente criado e selecionado!')
              onChange(novo.id)
              setNovo(null)
            }}
          >
            <ClienteFormFields cliente={novo} onChange={setNovo} />
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setNovo(null)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar cliente</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
