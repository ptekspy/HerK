import { forwardRef } from "react";
import { buttonVariants, type ButtonVariants } from "@ui/shared/button-styles";
import { cn } from "@herk/lib/classNames/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants;

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";