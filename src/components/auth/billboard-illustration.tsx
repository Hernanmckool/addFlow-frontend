/**
 * Isometric billboard illustration matching the approved mockup.
 * Shows a large digital billboard in a city setting with buildings,
 * rendered in blues matching the dark panel.
 */
export function BillboardIllustration() {
  return (
    <svg viewBox="0 0 440 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      {/* Background glow */}
      <ellipse cx="220" cy="200" rx="180" ry="60" fill="url(#glow)" />

      {/* Ground plane - isometric */}
      <path d="M20 220L220 250L420 220V270H20V220Z" fill="#0a1628" />

      {/* Far buildings - left cluster */}
      <rect x="30" y="130" width="30" height="90" rx="2" fill="#0d1b30" />
      <rect x="34" y="138" width="5" height="4" rx="1" fill="#162a46" />
      <rect x="42" y="138" width="5" height="4" rx="1" fill="#1a3556" />
      <rect x="34" y="148" width="5" height="4" rx="1" fill="#162a46" />
      <rect x="42" y="148" width="5" height="4" rx="1" fill="#162a46" />
      <rect x="34" y="158" width="5" height="4" rx="1" fill="#1a3556" />
      <rect x="42" y="158" width="5" height="4" rx="1" fill="#162a46" />
      <rect x="34" y="168" width="5" height="4" rx="1" fill="#162a46" />
      <rect x="42" y="168" width="5" height="4" rx="1" fill="#1a3556" />
      <rect x="34" y="178" width="5" height="4" rx="1" fill="#162a46" />
      <rect x="42" y="178" width="5" height="4" rx="1" fill="#162a46" />

      <rect x="65" y="145" width="25" height="75" rx="2" fill="#0d1b30" />
      <rect x="69" y="151" width="4" height="3" rx="1" fill="#162a46" />
      <rect x="76" y="151" width="4" height="3" rx="1" fill="#1a3556" />
      <rect x="69" y="159" width="4" height="3" rx="1" fill="#1a3556" />
      <rect x="76" y="159" width="4" height="3" rx="1" fill="#162a46" />
      <rect x="69" y="167" width="4" height="3" rx="1" fill="#162a46" />
      <rect x="76" y="167" width="4" height="3" rx="1" fill="#162a46" />

      <rect x="95" y="160" width="22" height="60" rx="2" fill="#0d1b30" />
      <rect x="99" y="165" width="4" height="3" rx="1" fill="#162a46" />
      <rect x="106" y="165" width="4" height="3" rx="1" fill="#1a3556" />

      {/* Billboard - main element, isometric perspective */}
      <g>
        {/* Back panel shadow */}
        <path d="M145 55L300 70V185L145 170V55Z" fill="#0a1628" />
        {/* Main screen frame */}
        <path d="M140 50L295 65V178L140 163V50Z" fill="#132240" stroke="#2563eb" strokeWidth="2" />
        {/* Screen inner */}
        <path d="M148 58L287 72V170L148 156V58Z" fill="#0c1a32" />

        {/* Screen content - large AF logo */}
        <g opacity="0.9">
          {/* A letter */}
          <path d="M190 130L205 90H210L200 130H190Z" fill="#e2e8f0" />
          <path d="M207 90L222 130H215L207 90Z" fill="#e2e8f0" />
          <path d="M196 118H216" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
          {/* Flow lines */}
          <rect x="220" y="92" width="20" height="5" rx="2.5" fill="#1d4ed8" />
          <rect x="217" y="102" width="24" height="5" rx="2.5" fill="#3b82f6" />
          <rect x="214" y="112" width="20" height="5" rx="2.5" fill="#93c5fd" />
        </g>

        {/* Screen edge lighting */}
        <path d="M148 58L287 72" stroke="#3b82f6" strokeWidth="0.5" opacity="0.6" />
        <path d="M148 156L287 170" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3" />

        {/* Side panel */}
        <path d="M295 65L310 60V173L295 178V65Z" fill="#091525" stroke="#1e40af" strokeWidth="0.5" />

        {/* Top panel */}
        <path d="M140 50L155 45L310 60L295 65L140 50Z" fill="#0f1f38" stroke="#1e40af" strokeWidth="0.5" />
      </g>

      {/* Billboard pole */}
      <rect x="210" y="178" width="8" height="42" fill="#0f1f38" />
      <rect x="202" y="218" width="24" height="5" rx="2" fill="#162a46" />

      {/* Right buildings */}
      <rect x="320" y="120" width="35" height="100" rx="2" fill="#0d1b30" />
      <rect x="324" y="128" width="6" height="5" rx="1" fill="#162a46" />
      <rect x="334" y="128" width="6" height="5" rx="1" fill="#1a3556" />
      <rect x="324" y="138" width="6" height="5" rx="1" fill="#162a46" />
      <rect x="334" y="138" width="6" height="5" rx="1" fill="#162a46" />
      <rect x="324" y="148" width="6" height="5" rx="1" fill="#1a3556" />
      <rect x="334" y="148" width="6" height="5" rx="1" fill="#162a46" />
      <rect x="324" y="158" width="6" height="5" rx="1" fill="#162a46" />
      <rect x="334" y="158" width="6" height="5" rx="1" fill="#1a3556" />
      <rect x="324" y="168" width="6" height="5" rx="1" fill="#162a46" />
      <rect x="334" y="168" width="6" height="5" rx="1" fill="#162a46" />

      <rect x="360" y="140" width="28" height="80" rx="2" fill="#0d1b30" />
      <rect x="364" y="146" width="5" height="4" rx="1" fill="#162a46" />
      <rect x="373" y="146" width="5" height="4" rx="1" fill="#1a3556" />
      <rect x="364" y="154" width="5" height="4" rx="1" fill="#162a46" />
      <rect x="373" y="154" width="5" height="4" rx="1" fill="#162a46" />
      <rect x="364" y="162" width="5" height="4" rx="1" fill="#1a3556" />

      <rect x="393" y="155" width="25" height="65" rx="2" fill="#0d1b30" />
      <rect x="397" y="161" width="4" height="3" rx="1" fill="#162a46" />
      <rect x="405" y="161" width="4" height="3" rx="1" fill="#162a46" />

      {/* Road markings */}
      <rect x="60" y="230" width="18" height="2" rx="1" fill="#162a46" opacity="0.7" />
      <rect x="130" y="234" width="18" height="2" rx="1" fill="#162a46" opacity="0.7" />
      <rect x="270" y="234" width="18" height="2" rx="1" fill="#162a46" opacity="0.7" />
      <rect x="350" y="230" width="18" height="2" rx="1" fill="#162a46" opacity="0.7" />

      {/* Ambient light dots */}
      <circle cx="110" cy="205" r="2.5" fill="#3b82f6" opacity="0.4" />
      <circle cx="340" cy="210" r="2" fill="#60a5fa" opacity="0.3" />
      <circle cx="75" cy="215" r="1.5" fill="#2563eb" opacity="0.25" />
      <circle cx="380" cy="215" r="1.5" fill="#3b82f6" opacity="0.2" />

      <defs>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
          <stop stopColor="#1e40af" stopOpacity="0.08" />
          <stop offset="1" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}
