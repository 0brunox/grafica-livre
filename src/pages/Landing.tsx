import { Link } from 'react-router-dom'
import dashboardShot from '../assets/screens/dashboard.webp'

// Ajuste para a URL real do repositório após publicar no GitHub
const GITHUB_URL = 'https://github.com/0brunox/grafica-livre'
import orcamentosShot from '../assets/screens/orcamentos.webp'
import faturasShot from '../assets/screens/faturas.webp'

function BrowserFrame({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800 shadow-2xl shadow-blue-950/40">
      <div className="flex items-center gap-1.5 border-b border-slate-700 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        <span className="ml-3 hidden flex-1 rounded-md bg-slate-700/70 px-3 py-1 text-xs text-slate-400 sm:block">
          graficalivre.app
        </span>
      </div>
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        width={1440}
        height={900}
        className="block w-full"
      />
    </div>
  )
}

function FeatureCard({ icon, titulo, texto }: { icon: React.ReactNode; titulo: string; texto: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold">{titulo}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{texto}</p>
    </div>
  )
}

const iconProps = {
  width: 20,
  height: 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const FEATURES = [
  {
    titulo: 'Orçamentos profissionais',
    texto:
      'Monte orçamentos com cálculo automático de R$/m², gere PDF com a sua marca e envie por WhatsApp ou e-mail em segundos.',
    icon: (
      <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M9 13h6M9 17h4" />
      </svg>
    ),
  },
  {
    titulo: 'Faturas e cobrança',
    texto:
      'Converta orçamento aprovado em fatura com um clique, receba por PIX com QR code e acompanhe pagamentos parciais.',
    icon: (
      <svg {...iconProps} viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20M6 15h4" />
      </svg>
    ),
  },
  {
    titulo: 'Produção em kanban',
    texto:
      'Acompanhe cada pedido da arte à entrega: impressão, acabamento e pronto — com alerta de prazo em cada card.',
    icon: (
      <svg {...iconProps} viewBox="0 0 24 24">
        <rect x="3" y="3" width="5" height="18" rx="1" />
        <rect x="10" y="3" width="5" height="12" rx="1" />
        <rect x="17" y="3" width="5" height="8" rx="1" />
      </svg>
    ),
  },
  {
    titulo: 'Contas a pagar e receber',
    texto:
      'Fluxo de caixa sem surpresa: vencimentos de fornecedores e faturas em aberto reunidos num só painel.',
    icon: (
      <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5" />
      </svg>
    ),
  },
  {
    titulo: 'Clientes e itens',
    texto:
      'Cadastro completo de clientes com vários e-mails, e tabela de itens com preço por m² ou por unidade.',
    icon: (
      <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    titulo: 'Relatórios e indicadores',
    texto:
      'Indicadores do mês, gráficos de recebimentos × despesas e relatórios para acompanhar a saúde da gráfica.',
    icon: (
      <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 5-6" />
      </svg>
    ),
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-bold">
            Gráfica <span className="text-blue-400">Livre</span>
          </span>
          <div className="flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-slate-300 hover:text-white"
            >
              GitHub
            </a>
            <Link
              to="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:pt-20">
        <p className="mx-auto mb-4 w-fit rounded-full border border-emerald-700/60 bg-emerald-900/30 px-4 py-1 text-xs font-medium text-emerald-300">
          100% gratuito e open source
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          Gestão completa para a sua <span className="text-blue-400">gráfica</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          Orçamentos, faturas, produção e financeiro em um só lugar. Gratuito, de código
          aberto e em português — do orçamento à entrega.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Entrar no sistema
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800"
          >
            Ver no GitHub
          </a>
        </div>
        <div className="mx-auto mt-14 max-w-5xl animate-[fade-up_0.7s_ease-out_both]">
          <BrowserFrame
            src={dashboardShot}
            alt="Dashboard do Gráfica Livre com indicadores do mês, gráfico de recebimentos e despesas e orçamentos recentes"
            eager
          />
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="border-t border-slate-800 bg-slate-950/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Tudo que a sua gráfica precisa</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
            Menos planilha, menos papel: o pedido inteiro dentro de um sistema só.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.titulo} icon={f.icon} titulo={f.titulo} texto={f.texto} />
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold">Orçamentos que viram faturas em um clique</h3>
              <p className="mt-3 leading-relaxed text-slate-400">
                Crie o orçamento com medidas e preço por m², envie por WhatsApp e, quando o
                cliente aprovar, fature sem redigitar nada. Status de pendente, aprovado,
                faturado ou recusado sempre à vista.
              </p>
            </div>
            <BrowserFrame
              src={orcamentosShot}
              alt="Tela de orçamentos com lista de clientes, status e ações de faturar, PDF e WhatsApp"
            />
          </div>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="lg:order-2">
              <h3 className="text-2xl font-bold">Cobrança organizada, do PIX ao boleto</h3>
              <p className="mt-3 leading-relaxed text-slate-400">
                Cada fatura mostra emissão, vencimento e quanto já foi pago. Registre
                recebimentos parciais, cobre por PIX com QR code e imprima a guia de remessa
                para o entregador na mesma tela.
              </p>
            </div>
            <div className="lg:order-1">
              <BrowserFrame
                src={faturasShot}
                alt="Tela de faturas com status paga, parcial e pendente e ações de receber e emitir guia"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-slate-800 py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-bold">Pronto para organizar a sua gráfica?</h2>
          <p className="mt-3 text-slate-400">
            Entre agora e leve orçamentos, produção e financeiro para o mesmo lugar.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Entrar no sistema
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        Gráfica Livre — gestão open source para gráficas, sob licença MIT ·{' '}
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white hover:underline">
          GitHub
        </a>{' '}
        · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
