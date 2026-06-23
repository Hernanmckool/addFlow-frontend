import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { login } from '@/lib/auth'

export function LoginForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('admin@adflow.io')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-[13px] font-medium text-[#374151] mb-2">
          Email
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[52px] pl-12 pr-4 bg-white border border-[#E5E7EB] rounded-[12px] text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            placeholder="tu@empresa.com"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-[13px] font-medium text-[#374151] mb-2">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[52px] pl-12 pr-12 bg-white border border-[#E5E7EB] rounded-[12px] text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[12px] px-4 py-3">
          <p className="text-red-600 text-[13px]">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-[52px] bg-[#111827] text-white rounded-[12px] text-[15px] font-semibold hover:bg-[#1F2937] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Ingresando...
          </span>
        ) : (
          'Continuar'
        )}
      </button>

      {/* Demo */}
      <p className="text-[13px] text-center pt-1">
        <span className="text-[#6B7280]">Demo: </span>
        <span className="text-[#2563EB]">admin@adflow.io</span>
        <span className="text-[#6B7280]"> / </span>
        <span className="text-[#2563EB]">password</span>
      </p>
    </form>
  )
}
