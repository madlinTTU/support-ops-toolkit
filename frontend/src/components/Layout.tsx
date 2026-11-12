import { NavLink, Outlet } from 'react-router'
import { Vitals } from '@/components/Vitals'

function navStyle({ isActive }: { isActive: boolean }): string {
  const base = 'block rounded-md px-3 py-2 text-sm font-medium transition-colors'
  return `${base} ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
}

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-midnight p-5 text-white">
        <h1 className="px-3 text-lg font-semibold">Support Ops</h1>
        <nav className="mt-6 space-y-1">
          <NavLink to="/" end className={navStyle}>
            Queue
          </NavLink>
          <NavLink to="/kb-candidates" className={navStyle}>
            Knowledge base
          </NavLink>
          <NavLink to="/stats" className={navStyle}>
            Statistics
          </NavLink>
        </nav>
        <div className="mt-auto border-t border-white/10 px-3 pt-6">
          <Vitals />
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
