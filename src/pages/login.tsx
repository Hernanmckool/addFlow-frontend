import { AdFlowLogo, AdFlowWordmark } from '@/components/auth/adflow-logo'
import { FeatureItem } from '@/components/auth/feature-item'
import { BillboardIllustration } from '@/components/auth/billboard-illustration'
import { LoginForm } from '@/components/auth/login-form'

export function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top: Logo */}
          <div className="flex items-center gap-3">
            <AdFlowLogo variant="light" size="md" />
            <AdFlowWordmark variant="light" />
          </div>

          {/* Middle: Content */}
          <div className="max-w-md">
            <h1 className="text-[28px] font-semibold text-white leading-tight">
              Gestión integral de publicidad exterior
            </h1>
            <p className="text-[15px] text-gray-400 mt-4 leading-relaxed">
              Controla activos, cotizaciones, reservas, campañas y órdenes de trabajo desde un solo lugar.
            </p>

            <div className="mt-8 space-y-3.5">
              <FeatureItem text="Inventario en tiempo real" />
              <FeatureItem text="Reservas sin conflictos" />
              <FeatureItem text="Campañas centralizadas" />
              <FeatureItem text="Evidencias desde campo" />
            </div>
          </div>

          {/* Bottom: Illustration */}
          <div className="mt-8">
            <BillboardIllustration />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <AdFlowLogo variant="dark" size="md" />
            <AdFlowWordmark variant="dark" />
          </div>

          <h2 className="text-[22px] font-semibold text-gray-900">Iniciar sesión</h2>
          <p className="text-[14px] text-gray-500 mt-1 mb-8">
            Ingresa tus credenciales para continuar
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
