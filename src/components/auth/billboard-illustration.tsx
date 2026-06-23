export function BillboardIllustration() {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs">
      {/* Billboard */}
      <path d="M100 40L220 55V140L100 125V40Z" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.2" />
      <path d="M220 55L248 47V132L220 140V55Z" fill="#0f2744" stroke="#3b82f6" strokeWidth="0.5" />
      <path d="M100 40L128 32L248 47L220 55L100 40Z" fill="#1a3352" stroke="#3b82f6" strokeWidth="0.5" />
      {/* Screen AF */}
      <path d="M130 65L190 72V112L130 105V65Z" fill="rgba(59,130,246,0.1)" />
      <text x="147" y="96" fill="#3b82f6" fontSize="22" fontWeight="bold" fontFamily="sans-serif">AF</text>
      {/* Pole */}
      <rect x="156" y="138" width="5" height="35" fill="#1e293b" />
      <rect x="150" y="171" width="18" height="3" rx="1" fill="#334155" />
      {/* Buildings left */}
      <rect x="10" y="120" width="35" height="55" rx="2" fill="#0f172a" />
      <rect x="14" y="126" width="6" height="5" rx="1" fill="#1e293b" />
      <rect x="24" y="126" width="6" height="5" rx="1" fill="rgba(59,130,246,0.12)" />
      <rect x="14" y="136" width="6" height="5" rx="1" fill="#1e293b" />
      <rect x="24" y="136" width="6" height="5" rx="1" fill="#1e293b" />
      <rect x="14" y="146" width="6" height="5" rx="1" fill="rgba(59,130,246,0.08)" />
      <rect x="24" y="146" width="6" height="5" rx="1" fill="#1e293b" />
      <rect x="50" y="135" width="28" height="40" rx="2" fill="#0f172a" />
      <rect x="54" y="140" width="5" height="4" rx="1" fill="#1e293b" />
      <rect x="62" y="140" width="5" height="4" rx="1" fill="rgba(59,130,246,0.1)" />
      <rect x="54" y="148" width="5" height="4" rx="1" fill="#1e293b" />
      {/* Buildings right */}
      <rect x="230" y="110" width="38" height="65" rx="2" fill="#0f172a" />
      <rect x="234" y="116" width="6" height="5" rx="1" fill="#1e293b" />
      <rect x="244" y="116" width="6" height="5" rx="1" fill="rgba(59,130,246,0.1)" />
      <rect x="234" y="126" width="6" height="5" rx="1" fill="#1e293b" />
      <rect x="244" y="126" width="6" height="5" rx="1" fill="#1e293b" />
      <rect x="234" y="136" width="6" height="5" rx="1" fill="rgba(59,130,246,0.08)" />
      <rect x="275" y="130" width="30" height="45" rx="2" fill="#0f172a" />
      <rect x="279" y="136" width="5" height="4" rx="1" fill="#1e293b" />
      <rect x="288" y="136" width="5" height="4" rx="1" fill="#1e293b" />
      {/* Ground */}
      <path d="M0 175L320 175V200H0V175Z" fill="#080c14" />
      <rect x="50" y="180" width="25" height="2" rx="1" fill="#1e293b" />
      <rect x="140" y="180" width="25" height="2" rx="1" fill="#1e293b" />
      <rect x="240" y="180" width="25" height="2" rx="1" fill="#1e293b" />
      {/* Lights */}
      <circle cx="85" cy="160" r="2" fill="#3b82f6" opacity="0.5" />
      <circle cx="270" cy="168" r="1.5" fill="#60a5fa" opacity="0.3" />
    </svg>
  )
}
