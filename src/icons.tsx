import { Brain, BriefcaseBusiness, Heart, HeartPulse, House, Sprout, TreePalm, Users, Wallet, type LucideIcon, type LucideProps } from 'lucide-react'
import { SPHERES, type SphereId } from './data.ts'

const SPHERE_ICONS: Record<SphereId, LucideIcon> = {
  health: HeartPulse,
  mind: Brain,
  career: BriefcaseBusiness,
  money: Wallet,
  love: Heart,
  family: Users,
  fun: TreePalm,
  growth: Sprout,
  home: House,
}

const colors = Object.fromEntries(SPHERES.map((s) => [s.id, s.color])) as Record<SphereId, string>

/** A sphere's icon in its own colour. Decorative: the name is always written next to it. */
export function SphereIcon({ id, size = 20, ...rest }: { id: SphereId } & LucideProps) {
  const Icon = SPHERE_ICONS[id]
  return <Icon size={size} color={colors[id]} strokeWidth={2.2} {...rest} />
}
