import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Field, inputClass } from '../components/ui'

type Mode = 'login' | 'reset'

export default function Login() {
  const { signIn, resetPassword } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      if (mode === 'login') {
        const err = await signIn(email, password)
        if (err) setError(traduz(err))
      } else {
        const err = await resetPassword(email)
        if (err) setError(traduz(err))
        else setInfo('Enviamos um link de recuperação para o seu e-mail.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="mb-1 text-center text-2xl font-bold text-slate-800">Gráfica Livre</h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          {mode === 'login' && 'Entre na sua conta'}
          {mode === 'reset' && 'Recuperar senha'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="E-mail">
            <input
              type="email"
              required
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          {mode !== 'reset' && (
            <Field label="Senha">
              <input
                type="password"
                required
                minLength={6}
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </Field>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-emerald-600">{info}</p>}

          <Button type="submit" disabled={busy}>
            {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Enviar link'}
          </Button>
        </form>

        <div className="mt-5 flex flex-col gap-1 text-center text-sm">
          {mode === 'login' && (
            <button className="text-blue-600 hover:underline" onClick={() => setMode('reset')}>
              Esqueci minha senha
            </button>
          )}
          {mode !== 'login' && (
            <button className="text-blue-600 hover:underline" onClick={() => setMode('login')}>
              ← Voltar para o login
            </button>
          )}
          <Link to="/" className="mt-2 text-slate-400 hover:text-slate-600 hover:underline">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}

function traduz(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.'
  if (msg.includes('Password should be')) return 'A senha deve ter pelo menos 6 caracteres.'
  return msg
}
