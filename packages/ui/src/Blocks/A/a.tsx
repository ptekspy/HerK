import NextLink, { type LinkProps } from "next/link";
import { forwardRef } from "react";
import { buttonVariants, type ButtonVariants } from "@ui/shared/button-styles";
import { cn } from "@herk/lib/classNames/cn";

type Props = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonVariants;

export const A = forwardRef<HTMLAnchorElement, Props>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <NextLink
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

A.displayName = "A";