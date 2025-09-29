import { Card, CardContent } from "./card"
import { cn } from "../../lib/utils"
import { type LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
  className?: string
}

const colorVariants = {
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    icon: 'text-blue-500',
  },
  green: {
    gradient: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    icon: 'text-emerald-500',
  },
  yellow: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    icon: 'text-amber-500',
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/10',
    text: 'text-purple-600',
    icon: 'text-purple-500',
  },
  red: {
    gradient: 'from-red-500 to-rose-500',
    bg: 'bg-red-500/10',
    text: 'text-red-600',
    icon: 'text-red-500',
  },
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue', 
  className 
}: StatsCardProps) {
  const colors = colorVariants[color]
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer group",
      className
    )}>
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
        colors.gradient
      )} />
      
      {/* Decorative circles */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br opacity-10 group-hover:scale-110 transition-transform">
        <div className={cn("w-full h-full rounded-full bg-gradient-to-br", colors.gradient)} />
      </div>
      
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-foreground">
                {value.toLocaleString()}
              </p>
              {trend && (
                <div className={cn(
                  "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                  trend.isPositive 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-red-100 text-red-700"
                )}>
                  <span className="mr-1">
                    {trend.isPositive ? '↑' : '↓'}
                  </span>
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
          </div>
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
            colors.bg
          )}>
            <Icon className={cn("h-6 w-6", colors.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}