import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[transform,box-shadow,background-color,color,border-color] duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08),0_10px_28px_-12px_var(--primary)] hover:brightness-110 hover:shadow-[0_1px_2px_rgba(0,0,0,0.08),0_16px_38px_-14px_var(--primary)]",
        gradient:
          "text-white shadow-[0_10px_34px_-12px_var(--brand-violet)] bg-[linear-gradient(100deg,var(--brand-violet),color-mix(in_oklab,var(--brand-violet)_80%,var(--brand-rose))_58%,var(--cta-gradient-end))] bg-[length:200%_auto] hover:bg-[position:100%_center] hover:shadow-[0_16px_44px_-14px_var(--brand-violet)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-transparent",
        outline:
          "border border-border bg-background/60 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:border-foreground/15",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        subtle: "bg-muted/70 text-foreground hover:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-110 shadow-[0_10px_28px_-14px_var(--destructive)]",
        link: "text-primary underline-offset-4 hover:underline rounded-md",
      },
      size: {
        sm: "h-9 px-4 text-[0.8125rem]",
        default: "h-11 px-6",
        lg: "h-13 px-8 text-base",
        xl: "h-14 px-9 text-base",
        icon: "size-10",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
