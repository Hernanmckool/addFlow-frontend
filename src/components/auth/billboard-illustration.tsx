/**
 * Isometric billboard + city illustration matching the approved mockup.
 * Color palette: #0B1020, #111827, #1F2937, #2563EB, #60A5FA
 */
export function BillboardIllustration() {
  return (
    <svg viewBox="0 0 460 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      {/* Ambient glow under billboard */}
      <ellipse cx="230" cy="230" rx="160" ry="50" fill="#2563EB" opacity="0.04" />

      {/* === BUILDINGS LEFT === */}
      <rect x="20" y="140" width="38" height="95" rx="3" fill="#111827" />
      <rect x="25" y="148" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="34" y="148" width="6" height="5" rx="1" fill="#2563EB" opacity="0.15" />
      <rect x="25" y="158" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="34" y="158" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="25" y="168" width="6" height="5" rx="1" fill="#2563EB" opacity="0.1" />
      <rect x="34" y="168" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="25" y="178" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="34" y="178" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="25" y="188" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="34" y="188" width="6" height="5" rx="1" fill="#2563EB" opacity="0.08" />

      <rect x="65" y="155" width="30" height="80" rx="3" fill="#111827" />
      <rect x="70" y="162" width="5" height="4" rx="1" fill="#1F2937" />
      <rect x="78" y="162" width="5" height="4" rx="1" fill="#2563EB" opacity="0.12" />
      <rect x="70" y="170" width="5" height="4" rx="1" fill="#1F2937" />
      <rect x="78" y="170" width="5" height="4" rx="1" fill="#1F2937" />
      <rect x="70" y="178" width="5" height="4" rx="1" fill="#2563EB" opacity="0.08" />
      <rect x="78" y="178" width="5" height="4" rx="1" fill="#1F2937" />

      <rect x="100" y="170" width="25" height="65" rx="3" fill="#111827" />
      <rect x="104" y="176" width="4" height="3" rx="1" fill="#1F2937" />
      <rect x="112" y="176" width="4" height="3" rx="1" fill="#1F2937" />
      <rect x="104" y="183" width="4" height="3" rx="1" fill="#2563EB" opacity="0.1" />

      {/* === BILLBOARD - MAIN ELEMENT === */}
      {/* Back depth */}
      <path d="M155 55L320 72V192L155 175V55Z" fill="#0B1020" />
      {/* Main frame */}
      <path d="M148 48L313 65V183L148 166V48Z" fill="#111827" stroke="#2563EB" strokeWidth="1.5" />
      {/* Inner screen */}
      <path d="M156 56L305 72V175L156 159V56Z" fill="#0B1020" />

      {/* Screen content - AF brand */}
      <g>
        {/* A */}
        <path d="M195 140L210 95H215L203 140H195Z" fill="white" opacity="0.85" />
        <path d="M212 95L227 140H220L212 95Z" fill="white" opacity="0.85" />
        <path d="M201 125H222" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        {/* Flow lines */}
        <rect x="225" y="97" width="22" height="6" rx="3" fill="#111827" />
        <rect x="222" y="108" width="26" height="6" rx="3" fill="#2563EB" />
        <rect x="219" y="119" width="22" height="6" rx="3" fill="#60A5FA" />
      </g>

      {/* Screen edge glow */}
      <path d="M156 56L305 72" stroke="#2563EB" strokeWidth="0.8" opacity="0.5" />

      {/* Right side panel */}
      <path d="M313 65L330 59V176L313 183V65Z" fill="#0B1020" stroke="#1F2937" strokeWidth="0.5" />
      {/* Top panel */}
      <path d="M148 48L165 42L330 59L313 65L148 48Z" fill="#111827" stroke="#1F2937" strokeWidth="0.5" />

      {/* Pole */}
      <rect x="222" y="183" width="8" height="45" fill="#111827" />
      <rect x="214" y="226" width="24" height="5" rx="2" fill="#1F2937" />

      {/* === BUILDINGS RIGHT === */}
      <rect x="340" y="125" width="40" height="110" rx="3" fill="#111827" />
      <rect x="345" y="133" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="355" y="133" width="6" height="5" rx="1" fill="#2563EB" opacity="0.12" />
      <rect x="345" y="143" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="355" y="143" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="345" y="153" width="6" height="5" rx="1" fill="#2563EB" opacity="0.08" />
      <rect x="355" y="153" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="345" y="163" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="355" y="163" width="6" height="5" rx="1" fill="#2563EB" opacity="0.1" />
      <rect x="345" y="173" width="6" height="5" rx="1" fill="#1F2937" />
      <rect x="355" y="173" width="6" height="5" rx="1" fill="#1F2937" />

      <rect x="385" y="145" width="32" height="90" rx="3" fill="#111827" />
      <rect x="390" y="152" width="5" height="4" rx="1" fill="#1F2937" />
      <rect x="399" y="152" width="5" height="4" rx="1" fill="#2563EB" opacity="0.1" />
      <rect x="390" y="160" width="5" height="4" rx="1" fill="#1F2937" />
      <rect x="399" y="160" width="5" height="4" rx="1" fill="#1F2937" />
      <rect x="390" y="168" width="5" height="4" rx="1" fill="#1F2937" />

      <rect x="422" y="160" width="25" height="75" rx="3" fill="#111827" />
      <rect x="426" y="167" width="4" height="3" rx="1" fill="#1F2937" />
      <rect x="434" y="167" width="4" height="3" rx="1" fill="#1F2937" />

      {/* === GROUND === */}
      <path d="M0 235L460 235V300H0V235Z" fill="#0B1020" />
      {/* Road markings */}
      <rect x="50" y="242" width="22" height="2" rx="1" fill="#1F2937" />
      <rect x="140" y="244" width="22" height="2" rx="1" fill="#1F2937" />
      <rect x="280" y="244" width="22" height="2" rx="1" fill="#1F2937" />
      <rect x="380" y="242" width="22" height="2" rx="1" fill="#1F2937" />

      {/* Accent dots (city lights) */}
      <circle cx="90" cy="225" r="2.5" fill="#2563EB" opacity="0.45" />
      <circle cx="130" cy="228" r="1.5" fill="#60A5FA" opacity="0.3" />
      <circle cx="350" cy="228" r="2" fill="#2563EB" opacity="0.35" />
      <circle cx="410" cy="225" r="1.5" fill="#60A5FA" opacity="0.25" />
      <circle cx="55" cy="230" r="1.5" fill="#2563EB" opacity="0.2" />

      {/* Pin markers on buildings (like in mockup) */}
      <g>
        <circle cx="40" cy="133" r="5" fill="#2563EB" />
        <circle cx="40" cy="133" r="2" fill="white" />
      </g>
      <g>
        <circle cx="80" cy="148" r="5" fill="#2563EB" />
        <circle cx="80" cy="148" r="2" fill="white" />
      </g>
      <g>
        <circle cx="360" cy="118" r="5" fill="#2563EB" />
        <circle cx="360" cy="118" r="2" fill="white" />
      </g>
      <g>
        <circle cx="400" cy="138" r="5" fill="#2563EB" />
        <circle cx="400" cy="138" r="2" fill="white" />
      </g>
    </svg>
  )
}
