import { AdFlowLogo, AdFlowWordmark } from '@/components/auth/adflow-logo'
import { FeatureItem, features } from '@/components/auth/feature-item'
import { LoginForm } from '@/components/auth/login-form'
import loginBg from '@/assets/login-bg.webp'

export function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — background image based */}
      <div
        className="hidden lg:flex lg:w-[48%] relative overflow-hidden"
        style={{
          backgroundColor: '#0B1020',
        }}
      >
        {/* Background illustration — positioned at bottom */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${loginBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020] via-[#0B1020]/80 to-transparent" />

        {/* Content over background */}
        <div className="relative z-10 flex flex-col p-12 xl:p-14 w-full h-full">
          {/* Logo */}
          <div className="flex items-center gap-3.5 mb-14">
            <AdFlowLogo variant="light" size="lg" />
            <AdFlowWordmark variant="light" />
          </div>

          {/* Title */}
          <h1 className="text-[32px] xl:text-[36px] font-bold text-white leading-[1.12] tracking-tight mb-5">
            Gestión integral de<br />publicidad exterior
          </h1>
          <p className="text-[14px] text-[#9CA3AF] leading-relaxed max-w-[320px] mb-12">
            Controla activos, cotizaciones, reservas, campañas y órdenes de trabajo desde un solo lugar.
          </p>

          {/* Features */}
          <div className="space-y-5">
            {features.map((f, i) => (
              <FeatureItem key={i} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>

          {/* Spacer to push copyright to bottom */}
          <div className="mt-auto" />

          {/* Copyright */}
          <p className="text-[12px] text-[#4B5563] mt-8">
            &copy; 2026 AdFlow. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right panel */}
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
