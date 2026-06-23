import { AdFlowLogo, AdFlowWordmark } from '@/components/auth/adflow-logo'
import { FeatureItem, features } from '@/components/auth/feature-item'
import { BillboardIllustration } from '@/components/auth/billboard-illustration'
import { LoginForm } from '@/components/auth/login-form'

export function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0b1120] relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.06) 0%, transparent 60%)',
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <AdFlowLogo variant="light" size="lg" />
            <AdFlowWordmark variant="light" />
          </div>

          {/* Content */}
          <div>
            <h1 className="text-[32px] font-bold text-white leading-[1.2] mb-4">
              Gestión integral de<br />publicidad exterior
            </h1>
            <p className="text-[15px] text-gray-400 leading-relaxed max-w-sm mb-10">
              Controla activos, cotizaciones, reservas, campañas y órdenes de trabajo desde un solo lugar.
            </p>

            <div className="space-y-5">
              {features.map((f, i) => (
                <FeatureItem key={i} icon={f.icon} title={f.title} description={f.description} />
              ))}
            </div>
          </div>

          {/* Illustration + Footer */}
          <div>
            <div className="flex justify-center mb-6">
              <BillboardIllustration />
            </div>
            <p className="text-[12px] text-gray-600">
              &copy; 2026 AdFlow. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <AdFlowLogo variant="dark" size="md" />
            <AdFlowWordmark variant="dark" />
          </div>

          <h2 className="text-[24px] font-semibold text-gray-900">Iniciar sesión</h2>
          <p className="text-[14px] text-blue-500 mt-1 mb-8">
            Ingresa tus credenciales para continuar
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
