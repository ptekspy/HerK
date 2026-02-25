import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-xl text-sm font-medium",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        text: [
          "bg-transparent",
          "text-zinc-900 dark:text-zinc-100",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        ],
        contained: [
          "bg-zinc-900 text-white",
          "hover:bg-zinc-800",
          "dark:bg-zinc-100 dark:text-zinc-900",
          "dark:hover:bg-zinc-200",
        ],
        outlined: [
          "border border-zinc-300 dark:border-zinc-700",
          "bg-transparent",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        ],
        shadow: [
          "bg-white dark:bg-zinc-900",
          "shadow-md hover:shadow-lg",
          "border border-zinc-200 dark:border-zinc-800",
        ],
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "contained",
      size: "md",
    },
  }
);

export type ButtonVariants = Parameters<
  typeof buttonVariants
>[0];