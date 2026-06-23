import { AdFlowLogo, AdFlowWordmark } from '@/components/auth/adflow-logo'
import { FeatureItem, features } from '@/components/auth/feature-item'
import { BillboardIllustration } from '@/components/auth/billboard-illustration'
import { LoginForm } from '@/components/auth/login-form'

export function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark blue */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#070d1a] relative overflow-hidden">
        {/* Subtle radial ambient light */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 60% 75%, rgba(30,64,175,0.07) 0%, transparent 55%)',
        }} />

        <div className="relative z-10 flex flex-col p-14 w-full">
          {/* Logo top */}
          <div className="flex items-center gap-3 mb-16">
            <AdFlowLogo variant="light" size="lg" />
            <AdFlowWordmark variant="light" />
          </div>

          {/* Title + description */}
          <div className="mb-10">
            <h1 className="text-[34px] font-bold text-white leading-[1.15] tracking-tight">
              Gestión integral de<br />publicidad exterior
            </h1>
            <p className="text-[15px] text-gray-400 mt-5 leading-relaxed max-w-[340px]">
              Controla activos, cotizaciones, reservas, campañas y órdenes de trabajo desde un solo lugar.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6 mb-auto">
            {features.map((f, i) => (
              <FeatureItem key={i} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>

          {/* Illustration */}
          <div className="mt-10">
            <BillboardIllustration />
          </div>

          {/* Copyright */}
          <p className="text-[12px] text-gray-700 mt-8">
            &copy; 2026 AdFlow. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right panel — white/light gray */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-[#f8f9fb]">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-12">
            <AdFlowLogo variant="dark" size="md" />
            <AdFlowWordmark variant="dark" />
          </div>

          {/* Heading */}
          <h2 className="text-[26px] font-bold text-gray-900 tracking-tight">Iniciar sesión</h2>
          <p className="text-[14px] text-blue-500 mt-1.5 mb-10">
            Ingresa tus credenciales para continuar
          </p>

          {/* Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
