import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700',
    secondary: 'bg-blue-600/10 text-blue-600 border border-blue-200/50 hover:bg-blue-600/20',
    destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20',
    outline: 'text-slate-600 border border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-slate-50',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${variants[variant]} ${className || ''}`}
      {...props}
    />
  )
}

export { Badge }
