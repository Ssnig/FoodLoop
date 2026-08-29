import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const variants = cva("inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border bg-background hover:bg-secondary",
      ghost: "hover:bg-secondary"
    },
    size: { default: "h-11 px-5", sm: "h-9 px-4", lg: "h-12 px-6" }
  },
  defaultVariants: { variant: "default", size: "default" }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> { asChild?: boolean }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(variants({ variant, size, className }))} {...props} />;
});
Button.displayName = "Button";
