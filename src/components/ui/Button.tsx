import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-white/90",
        outline: "border border-white/10 bg-transparent text-white/60 hover:bg-white/5 hover:text-white",
        secondary: "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5",
        ghost: "text-white/40 hover:bg-white/5 hover:text-white",
        link: "text-white/40 underline-offset-4 hover:underline hover:text-white",
        danger: "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/10",
      },
      size: {
        default: "h-11 px-8 py-2",
        sm: "h-9 px-4 py-1 text-xs",
        lg: "h-14 px-12 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
