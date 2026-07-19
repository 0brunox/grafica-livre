import { onlyDigits } from './validation'

// Consulta dados cadastrais de um CNPJ na BrasilAPI (base da Receita Federal).
// Gratuita, sem token e com CORS liberado — pode ser chamada do navegador.

export interface DadosCnpj {
  razaoSocial: string
  nomeFantasia: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  telefone: string
  email: string
}

export async function buscarCnpj(cnpj: string): Promise<DadosCnpj | null> {
  const d = onlyDigits(cnpj)
  if (d.length !== 14) return null
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${d}`)
    if (!res.ok) return null
    const data = await res.json()
    return {
      razaoSocial: data.razao_social || '',
      nomeFantasia: data.nome_fantasia || '',
      cep: data.cep ? onlyDigits(String(data.cep)) : '',
      logradouro: data.logradouro || '',
      numero: data.numero ? String(data.numero) : '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      municipio: data.municipio || '',
      uf: data.uf || '',
      telefone: data.ddd_telefone_1 ? onlyDigits(String(data.ddd_telefone_1)) : '',
      email: data.email || '',
    }
  } catch {
    return null
  }
}
