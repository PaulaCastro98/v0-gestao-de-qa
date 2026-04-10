import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      style={{
        backgroundColor: 'var(--color-muted)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-foreground)',
      }}
      {...props}
    />
  )
}

export { Input }
