import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        // Text uses the `-on-tint` tokens, not the base colour: the base is
        // tuned for fills and icons and fails AA as small text on its own tint.
        success: "border-transparent bg-success/12 text-success-on-tint",
        warning: "border-transparent bg-warning/15 text-warning-on-tint",
        info: "border-transparent bg-info/12 text-info-on-tint",
        destructive:
          "border-transparent bg-destructive/12 text-destructive-on-tint",
        brand:
          "border-primary/20 bg-primary/8 text-brand-violet-on-tint dark:bg-primary/12",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
