import { Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getUser, logout } from '@/lib/auth'
import { useEffect } from 'react'

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  // Render login page without layout
  if (isLoginPage) {
    return <Outlet />
  }

  // If not authenticated and not on login, show nothing (redirect will happen)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-gray-900">AdFlow</h1>
            <div className="flex gap-4">
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-semibold [&.active]:text-gray-900">
                Dashboard
              </Link>
              <Link to="/assets" className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-semibold [&.active]:text-gray-900">
                Activos
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{user.role}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
