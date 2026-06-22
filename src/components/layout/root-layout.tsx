import { Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getUser, logout } from '@/lib/auth'
import { useEffect, useState } from 'react'

export function RootLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    queryClient.clear()
    navigate({ to: '/login' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Cargando AdFlow...</p>
        </div>
      </div>
    )
  }

  if (isLoginPage) {
    return <Outlet />
  }

  if (!isAuthenticated) {
    return null
  }

  const navLinks = [
    { to: '/' as const, label: 'Dashboard' },
    { to: '/assets' as const, label: 'Activos' },
    { to: '/clientes' as const, label: 'Clientes' },
    { to: '/cotizaciones' as const, label: 'Cotizaciones' },
    { to: '/reservas' as const, label: 'Reservas' },
    { to: '/campanas' as const, label: 'Campañas' },
    { to: '/ordenes' as const, label: 'OTs' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">AF</span>
                </div>
                <span className="text-lg font-bold text-gray-900 hidden sm:inline">AdFlow</span>
              </Link>
              <div className="hidden md:flex gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors [&.active]:bg-blue-50 [&.active]:text-blue-700 [&.active]:font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">{user.name.charAt(0)}</span>
                </div>
                <span className="text-sm text-gray-700">{user.name}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors px-2 py-1"
              >
                Salir
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-md hover:bg-gray-100"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block text-sm px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 [&.active]:bg-blue-50 [&.active]:text-blue-700 [&.active]:font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
