import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { login } from '@/lib/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('admin@adflow.io')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      setTimeout(() => navigate({ to: '/' }), 100)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response
        setError(response?.data?.message || 'Credenciales incorrectas')
      } else {
        setError('Error de conexión con el servidor')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-8">
            <span className="text-gray-900 font-bold text-sm">AF</span>
          </div>
          <h2 className="text-3xl font-semibold text-white leading-tight">
            Gestión integral de publicidad exterior
          </h2>
          <p className="text-gray-400 mt-4 text-[15px] leading-relaxed">
            Controla activos, cotizaciones, reservas, campañas y órdenes de trabajo desde un solo lugar.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-semibold text-xs">AF</span>
            </div>
          </div>

          <h1 className="text-xl font-semibold text-gray-900">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 mt-1 mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-gray-700 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow placeholder:text-gray-400"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-gray-700 mb-1.5">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                <p className="text-red-600 text-[13px]">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-lg text-[14px] font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                'Continuar'
              )}
            </button>
          </form>

          <p className="mt-8 text-[12px] text-gray-400 text-center">
            Demo: admin@adflow.io / password
          </p>
        </div>
      </div>
    </div>
  )
}
