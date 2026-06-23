export function BillboardIllustration() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm opacity-60">
      {/* Ground plane */}
      <path d="M0 180L200 160L400 180V200H0V180Z" fill="#1e293b" opacity="0.5" />

      {/* Billboard structure */}
      <rect x="140" y="50" width="120" height="70" rx="3" fill="#334155" stroke="#475569" strokeWidth="1" />
      <rect x="145" y="55" width="110" height="60" rx="2" fill="url(#billboard-screen)" />

      {/* Billboard pole */}
      <rect x="196" y="120" width="8" height="45" fill="#475569" />
      <rect x="190" y="162" width="20" height="4" rx="1" fill="#475569" />

      {/* Screen content abstraction */}
      <rect x="155" y="65" width="40" height="6" rx="1" fill="#60a5fa" opacity="0.8" />
      <rect x="155" y="76" width="60" height="4" rx="1" fill="#94a3b8" opacity="0.5" />
      <rect x="155" y="84" width="50" height="4" rx="1" fill="#94a3b8" opacity="0.3" />
      <rect x="155" y="96" width="30" height="10" rx="2" fill="#3b82f6" opacity="0.6" />

      {/* Buildings background */}
      <rect x="30" y="100" width="40" height="65" rx="2" fill="#1e293b" />
      <rect x="35" y="108" width="8" height="6" rx="1" fill="#334155" />
      <rect x="48" y="108" width="8" height="6" rx="1" fill="#334155" />
      <rect x="35" y="120" width="8" height="6" rx="1" fill="#334155" />
      <rect x="48" y="120" width="8" height="6" rx="1" fill="#475569" />
      <rect x="35" y="132" width="8" height="6" rx="1" fill="#334155" />
      <rect x="48" y="132" width="8" height="6" rx="1" fill="#334155" />

      <rect x="80" y="120" width="35" height="45" rx="2" fill="#1e293b" />
      <rect x="85" y="126" width="6" height="5" rx="1" fill="#334155" />
      <rect x="95" y="126" width="6" height="5" rx="1" fill="#475569" />
      <rect x="85" y="136" width="6" height="5" rx="1" fill="#334155" />
      <rect x="95" y="136" width="6" height="5" rx="1" fill="#334155" />

      <rect x="300" y="90" width="45" height="75" rx="2" fill="#1e293b" />
      <rect x="305" y="98" width="8" height="6" rx="1" fill="#334155" />
      <rect x="318" y="98" width="8" height="6" rx="1" fill="#475569" />
      <rect x="305" y="110" width="8" height="6" rx="1" fill="#334155" />
      <rect x="318" y="110" width="8" height="6" rx="1" fill="#334155" />
      <rect x="305" y="122" width="8" height="6" rx="1" fill="#334155" />
      <rect x="318" y="122" width="8" height="6" rx="1" fill="#475569" />
      <rect x="305" y="134" width="8" height="6" rx="1" fill="#334155" />

      <rect x="355" y="110" width="30" height="55" rx="2" fill="#1e293b" />
      <rect x="360" y="116" width="6" height="5" rx="1" fill="#334155" />
      <rect x="370" y="116" width="6" height="5" rx="1" fill="#334155" />

      {/* Road markings */}
      <rect x="80" y="174" width="20" height="2" rx="1" fill="#475569" opacity="0.5" />
      <rect x="130" y="172" width="20" height="2" rx="1" fill="#475569" opacity="0.5" />
      <rect x="250" y="172" width="20" height="2" rx="1" fill="#475569" opacity="0.5" />
      <rect x="310" y="174" width="20" height="2" rx="1" fill="#475569" opacity="0.5" />

      {/* Signal dots */}
      <circle cx="280" cy="155" r="3" fill="#60a5fa" opacity="0.4" />
      <circle cx="120" cy="148" r="2" fill="#34d399" opacity="0.4" />

      <defs>
        <linearGradient id="billboard-screen" x1="145" y1="55" x2="255" y2="115" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e293b" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
      </defs>
    </svg>
  )
}
