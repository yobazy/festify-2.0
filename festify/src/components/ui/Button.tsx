import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap",
    "transition-[background-color,color,border-color,transform] duration-150",
    "active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        solid: "bg-paper text-ink hover:bg-white",
        outline: "border border-line-strong text-paper hover:bg-ink-2 hover:border-paper",
        ghost: "text-smoke hover:text-paper hover:bg-ink-2",
        signal: "bg-signal text-signal-ink hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
