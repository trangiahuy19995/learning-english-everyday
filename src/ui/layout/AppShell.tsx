import { BarChart3, BookOpen, Headphones, Home, Library } from 'lucide-react'
import type { ReactNode } from 'react'
import { navigate, type Route } from '@/navigation'
import { cx } from '../theme'

const NAV: { key: string; label: string; icon: typeof Home; route: Route; match: Route['name'][] }[] = [
  { key: 'home', label: 'Trang chủ', icon: Home, route: { name: 'home' }, match: ['home'] },
  { key: 'learn', label: 'Học', icon: BookOpen, route: { name: 'setup' }, match: ['setup', 'session'] },
  { key: 'listen', label: 'Nghe', icon: Headphones, route: { name: 'playlist' }, match: ['playlist'] },
  { key: 'decks', label: 'Bộ từ', icon: Library, route: { name: 'decks' }, match: ['decks', 'deck', 'phrase'] },
  { key: 'stats', label: 'Thống kê', icon: BarChart3, route: { name: 'stats' }, match: ['stats'] },
]

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex size-10 items-center justify-center rounded-2xl bg-grass text-lg font-black text-white shadow-[0_3px_0_var(--color-grass-dark)]">
        Aa
        <span className="absolute -right-1 -bottom-1 size-4 rounded-full border-2 border-white bg-sun" />
      </div>
      <div className="leading-tight">
        <p className="text-lg font-black tracking-tight">Cụm Từ</p>
        <p className="text-[11px] font-bold tracking-wider text-ink-muted uppercase">Anh – Việt</p>
      </div>
    </div>
  )
}

export function AppShell({ route, children }: { route: Route; children: ReactNode }) {
  const isActive = (m: Route['name'][]) => m.includes(route.name)
  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-8 border-r-2 border-line bg-white px-4 py-6 md:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="flex flex-col gap-1.5">
          {NAV.map((n) => (
            <button
              key={n.key}
              type="button"
              onClick={() => navigate(n.route)}
              aria-current={isActive(n.match) ? 'page' : undefined}
              className={cx(
                'flex h-12 items-center gap-3 rounded-2xl border-2 px-3 text-left font-extrabold tracking-wide uppercase text-sm transition-colors',
                isActive(n.match)
                  ? 'border-sky/50 bg-sky-soft text-sky-dark'
                  : 'border-transparent text-ink-soft hover:bg-canvas',
              )}
            >
              <n.icon className="size-5" strokeWidth={2.5} />
              {n.label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 pb-24 md:pb-0">
        <header className="flex items-center justify-between px-5 pt-5 md:hidden">
          <Logo />
        </header>
        <main className="mx-auto w-full max-w-5xl px-5 py-6 md:px-10 md:py-10">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t-2 border-line bg-white px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        {NAV.map((n) => (
          <button
            key={n.key}
            type="button"
            onClick={() => navigate(n.route)}
            aria-current={isActive(n.match) ? 'page' : undefined}
            className={cx(
              'flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-extrabold',
              isActive(n.match) ? 'text-sky-dark' : 'text-ink-muted',
            )}
          >
            <span className={cx('flex h-8 w-12 items-center justify-center rounded-xl', isActive(n.match) && 'bg-sky-soft')}>
              <n.icon className="size-5" strokeWidth={2.5} />
            </span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-base text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
