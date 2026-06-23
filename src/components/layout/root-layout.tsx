import { Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getUser, logout } from '@/lib/auth'
import { useEffect } from 'react'

const navItems = [
  { to: '/' as const, label: 'Dashboard', icon: DashboardIcon },
  { to: '/assets' as const, label: 'Activos', icon: AssetsIcon },
  { to: '/clientes' as const, label: 'Clientes', icon: ClientsIcon },
  { to: '/cotizaciones' as const, label: 'Cotizaciones', icon: QuotationsIcon },
  { to: '/reservas' as const, label: 'Reservas', icon: ReservationsIcon },
  { to: '/campanas' as const, label: 'Campañas', icon: CampaignsIcon },
  { to: '/ordenes' as const, label: 'Órdenes', icon: WorkOrdersIcon },
]

export function RootLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    retry: false,
  })

  const isLoginPage = location.pathname === '/login'
  const isAuthenticated = !!user && !isError

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      navigate({ to: '/login' })
    }
    if (!isLoading && isAuthenticated && isLoginPage) {
      navigate({ to: '/' })
    }
  }, [isLoading, isAuthenticated, isLoginPage, navigate])

  const handleLogout = async () => {
    await logout()
    queryClient.clear()
    navigate({ to: '/login' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isLoginPage) return <Outlet />
  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200/80 flex flex-col fixed h-full z-30">
        <div className="h-14 flex items-center px-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-[11px] tracking-tight">AF</span>
            </div>
            <span className="font-semibold text-gray-900 text-[15px]">AdFlow</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon active={isActive} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-[11px] font-semibold text-gray-600">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-1 text-[12px] text-gray-400 hover:text-gray-600 text-left px-2.5 py-1 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

// Icons
function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-gray-700' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function AssetsIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-gray-700' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function ClientsIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-gray-700' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function QuotationsIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-gray-700' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ReservationsIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-gray-700' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function CampaignsIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-gray-700' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  )
}

function WorkOrdersIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-gray-700' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}
