import { AdFlowLogo, AdFlowWordmark } from '@/components/auth/adflow-logo'
import { FeatureItem, features } from '@/components/auth/feature-item'
import { BillboardIllustration } from '@/components/auth/billboard-illustration'
import { LoginForm } from '@/components/auth/login-form'

export function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — 48% */}
      <div className="hidden lg:flex lg:w-[48%] bg-[#0B1020] relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 65% 70%, rgba(37,99,235,0.06) 0%, transparent 50%)',
        }} />

        <div className="relative z-10 flex flex-col p-12 xl:p-14 w-full h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <AdFlowLogo variant="light" size="lg" />
            <AdFlowWordmark variant="light" />
          </div>

          {/* Title */}
          <h1 className="text-[30px] xl:text-[34px] font-bold text-white leading-[1.15] tracking-tight mb-4">
            Gestión integral de<br />publicidad exterior
          </h1>
          <p className="text-[14px] text-[#9CA3AF] leading-relaxed max-w-[320px] mb-10">
            Controla activos, cotizaciones, reservas, campañas y órdenes de trabajo desde un solo lugar.
          </p>

          {/* Features */}
          <div className="space-y-6 mb-auto">
            {features.map((f, i) => (
              <FeatureItem key={i} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>

          {/* Illustration */}
          <div className="mt-6">
            <BillboardIllustration />
          </div>

          {/* Copyright */}
          <p className="text-[12px] text-[#4B5563] mt-6">
            &copy; 2026 AdFlow. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right panel — 52% */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-[#F3F4F6]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-12">
            <AdFlowLogo variant="dark" size="md" />
            <AdFlowWordmark variant="dark" />
          </div>

          {/* Heading */}
          <h2 className="text-[28px] font-bold text-[#111827] tracking-tight">Iniciar sesión</h2>
          <p className="text-[14px] text-[#2563EB] mt-2 mb-10">
            Ingresa tus credenciales para continuar
          </p>

          {/* Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
