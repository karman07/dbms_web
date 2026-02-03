import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-blue-700 text-white hover:bg-blue-800',
    secondary: 'bg-blue-200 text-blue-900 hover:bg-blue-300',
    destructive: 'bg-red-500 text-slate-50 hover:bg-red-500/80',
    outline: 'text-blue-800 border-2 border-blue-500',
    success: 'bg-green-500 text-white hover:bg-green-500/80',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${variants[variant]} ${className || ''}`}
      {...props}
    />
  )
}

export { Badge }
