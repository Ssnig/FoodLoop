import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[1.35rem] border border-border/80 bg-card text-card-foreground shadow-[0_12px_40px_-18px_hsl(152_40%_20%/0.28)]",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 p-6 pb-3", className)} {...props} />
);

export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("font-display text-xl font-semibold tracking-tight", className)} {...props} />
);

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-3", className)} {...props} />
);
