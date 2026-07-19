// Supabase Edge Function `enviar-email` — envia orçamentos/faturas por e-mail
// com o PDF anexado, usando a API do Resend (https://resend.com).
//
// A chave do Resend NUNCA vai para o navegador: fica como secret do Supabase
// (RESEND_API_KEY). O navegador chama esta função autenticado pelo JWT.
//
// Secrets necessários (supabase secrets set ...):
//   RESEND_API_KEY=re_xxxxx
//   EMAIL_REMETENTE=orcamentos@seudominio.com.br   (opcional; padrão onboarding@resend.dev)
//
// Obs.: para enviar a QUALQUER destinatário é preciso verificar um domínio no
// Resend e apontar EMAIL_REMETENTE para um e-mail desse domínio. Sem domínio
// verificado, o Resend só entrega para o e-mail dono da conta (modo teste).
//
// Deploy: supabase functions deploy enviar-email

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

interface RequestBody {
  para: string
  assunto: string
  html: string
  pdfBase64: string
  nomeArquivo: string
  replyTo?: string
  remetenteNome?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ erro: 'Método não permitido' }, 405)

  // 1) Autentica o chamador pelo JWT do Supabase
  const authHeader = req.headers.get('Authorization') ?? ''
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user) return json({ erro: 'Não autorizado' }, 401)

  // 2) Config do Resend
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) return json({ erro: 'RESEND_API_KEY não configurado' }, 500)
  const remetenteEmail = Deno.env.get('EMAIL_REMETENTE') ?? 'onboarding@resend.dev'

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return json({ erro: 'JSON inválido' }, 400)
  }
  if (!body.para || !body.assunto || !body.pdfBase64) {
    return json({ erro: 'Informe para, assunto e o PDF.' }, 400)
  }

  // Aceita vários destinatários separados por vírgula/ponto e vírgula.
  const destinatarios = body.para
    .split(/[,;]/)
    .map((e) => e.trim())
    .filter(Boolean)
  if (destinatarios.length === 0) {
    return json({ erro: 'Informe ao menos um destinatário válido.' }, 400)
  }

  const from = body.remetenteNome
    ? `${body.remetenteNome} <${remetenteEmail}>`
    : remetenteEmail

  let resendRes: Response
  try {
    resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: destinatarios,
        subject: body.assunto,
        html: body.html || body.assunto,
        reply_to: body.replyTo || undefined,
        attachments: [{ filename: body.nomeArquivo || 'documento.pdf', content: body.pdfBase64 }],
      }),
    })
  } catch (e) {
    return json({ erro: 'Falha ao contatar o Resend', detalhe: String(e) }, 502)
  }

  const texto = await resendRes.text()
  let data: unknown
  try {
    data = texto ? JSON.parse(texto) : null
  } catch {
    data = { raw: texto }
  }
  if (!resendRes.ok) {
    const msg = (data as { message?: string })?.message || 'Falha no envio do e-mail'
    // Sempre 200 na função; o resultado real vai no corpo da resposta.
    return json({ ok: false, erro: msg, httpStatus: resendRes.status, data })
  }
  return json({ ok: true, data })
})
