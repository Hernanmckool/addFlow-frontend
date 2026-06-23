import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { login } from '@/lib/auth'
import { AppInput } from '@/design-system/components/AppInput'
import { AppButton } from '@/design-system/components/AppButton'

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
      <AppInput
        id="email"
        type="email"
        label="Email"
        icon={User}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@empresa.com"
        required
      />

      <AppInput
        id="password"
        type={showPassword ? 'text' : 'password'}
        label="Contraseña"
        icon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        }
      />

      {error && (
        <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-[12px] px-4 py-3">
          <p className="text-[#EF4444] text-[13px]">{error}</p>
        </div>
      )}

      <AppButton type="submit" fullWidth loading={loading}>
        Continuar
      </AppButton>

      <p className="text-[13px] text-center">
        <span className="text-[#6B7280]">Demo: </span>
        <span className="text-[#2563EB]">admin@adflow.io</span>
        <span className="text-[#6B7280]"> / </span>
        <span className="text-[#2563EB]">password</span>
      </p>
    </form>
  )
}
