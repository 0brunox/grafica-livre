import { onlyDigits } from './validation'

export interface EnderecoViaCep {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
}

export async function buscarCep(cep: string): Promise<EnderecoViaCep | null> {
  const d = onlyDigits(cep)
  if (d.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${d}/json/`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.erro) return null
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      localidade: data.localidade || '',
      uf: data.uf || '',
    }
  } catch {
    return null
  }
}
