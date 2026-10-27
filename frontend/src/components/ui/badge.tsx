import * as React from "react"
import { type VariantProps } from "class-variance-authority" // cva import is no longer needed here

import { cn } from '../../lib/utils'
import { badgeVariants } from "./badge.variants"

// const badgeVariants = cva( ... ) // Removed local definition

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge } // Removed badgeVariants from export
