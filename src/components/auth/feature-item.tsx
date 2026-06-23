import { Check } from 'lucide-react'

interface FeatureItemProps {
  text: string
}

export function FeatureItem({ text }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-blue-400" />
      </div>
      <span className="text-[14px] text-gray-300">{text}</span>
    </div>
  )
}
