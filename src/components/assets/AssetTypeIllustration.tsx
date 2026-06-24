import { useId } from 'react'
import { resolveAssetKind, type AssetKind } from './assetMeta'

interface AssetTypeIllustrationProps {
  /** Free-text asset type name; used to resolve the illustration kind. */
  type?: string | null
  /** Explicit kind (overrides `type` when provided). */
  kind?: AssetKind
  className?: string
}

interface Palette {
  from: string
  to: string
  accent: string
}

// On-brand gradients per kind. These are decorative illustration colors
// (an unavoidable exception to using only the core UI tokens).
const PALETTE: Record<AssetKind, Palette> = {
  billboard: { from: '#3B82F6', to: '#2563EB', accent: '#DBEAFE' },
  screen: { from: '#8B5CF6', to: '#7C3AED', accent: '#EDE9FE' },
  mupi: { from: '#0EA5E9', to: '#0284C7', accent: '#E0F2FE' },
  indoor: { from: '#F59E0B', to: '#D97706', accent: '#FEF3C7' },
  generic: { from: '#64748B', to: '#475569', accent: '#E2E8F0' },
}

function Glyph({ kind, accent }: { kind: AssetKind; accent: string }) {
  const stroke = 'rgba(255,255,255,0.9)'
  switch (kind) {
    case 'billboard':
      return (
        <g>
          <rect x="118" y="66" width="164" height="84" rx="8" fill={accent} opacity="0.95" />
          <rect x="132" y="82" width="92" height="10" rx="5" fill={stroke} opacity="0.55" />
          <rect x="132" y="102" width="136" height="8" rx="4" fill={stroke} opacity="0.35" />
          <rect x="132" y="118" width="110" height="8" rx="4" fill={stroke} opacity="0.35" />
          <rect x="194" y="150" width="12" height="74" fill="#FFFFFF" opacity="0.5" />
          <rect x="168" y="220" width="64" height="8" rx="4" fill="#FFFFFF" opacity="0.35" />
        </g>
      )
    case 'screen':
      return (
        <g>
          <rect x="112" y="58" width="176" height="116" rx="14" fill={accent} opacity="0.95" />
          <rect x="126" y="72" width="148" height="88" rx="8" fill={stroke} opacity="0.25" />
          {[0, 1, 2, 3, 4].map((c) =>
            [0, 1, 2].map((r) => (
              <circle
                key={`${c}-${r}`}
                cx={146 + c * 28}
                cy={94 + r * 26}
                r="6"
                fill="#FFFFFF"
                opacity={0.35 + ((c + r) % 3) * 0.2}
              />
            )),
          )}
          <rect x="176" y="174" width="48" height="10" rx="5" fill="#FFFFFF" opacity="0.5" />
          <rect x="158" y="216" width="84" height="8" rx="4" fill="#FFFFFF" opacity="0.35" />
        </g>
      )
    case 'mupi':
      return (
        <g>
          <rect x="158" y="48" width="84" height="158" rx="12" fill={accent} opacity="0.95" />
          <rect x="170" y="62" width="60" height="118" rx="7" fill={stroke} opacity="0.3" />
          <rect x="170" y="62" width="60" height="44" rx="7" fill="#FFFFFF" opacity="0.35" />
          <rect x="150" y="206" width="100" height="9" rx="4" fill="#FFFFFF" opacity="0.4" />
        </g>
      )
    case 'indoor':
      return (
        <g>
          <rect x="74" y="44" width="252" height="170" rx="12" fill="none" stroke={stroke} strokeWidth="3" opacity="0.45" />
          <rect x="150" y="86" width="100" height="74" rx="6" fill={accent} opacity="0.95" />
          <rect x="162" y="100" width="76" height="8" rx="4" fill={stroke} opacity="0.5" />
          <rect x="162" y="116" width="56" height="8" rx="4" fill={stroke} opacity="0.4" />
          <line x1="74" y1="190" x2="326" y2="190" stroke={stroke} strokeWidth="3" opacity="0.3" />
        </g>
      )
    case 'generic':
    default:
      return (
        <g>
          <rect x="120" y="70" width="160" height="96" rx="10" fill={accent} opacity="0.95" />
          <path
            d="M200 92c-13 0-23 10-23 23 0 16 23 35 23 35s23-19 23-35c0-13-10-23-23-23z"
            fill="#FFFFFF"
            opacity="0.6"
          />
          <circle cx="200" cy="114" r="8" fill={PALETTE.generic.to} />
        </g>
      )
  }
}

export function AssetTypeIllustration({ type, kind, className }: AssetTypeIllustrationProps) {
  const resolved = kind ?? resolveAssetKind(type)
  const palette = PALETTE[resolved]
  const gradientId = useId()
  const glowId = useId()

  return (
    <svg
      className={className}
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Ilustración de ${type ?? 'activo publicitario'}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.from} />
          <stop offset="100%" stopColor={palette.to} />
        </linearGradient>
        <radialGradient id={glowId} cx="0.8" cy="0.2" r="0.8">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="400" height="250" fill={`url(#${gradientId})`} />
      <rect x="0" y="0" width="400" height="250" fill={`url(#${glowId})`} />
      <circle cx="338" cy="40" r="70" fill="#FFFFFF" opacity="0.06" />
      <circle cx="56" cy="226" r="52" fill="#FFFFFF" opacity="0.05" />
      <Glyph kind={resolved} accent={palette.accent} />
    </svg>
  )
}
