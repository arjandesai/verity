import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "icon";
  /** When true, renders its single child element with the button's classes merged on, instead
   *  of wrapping it in a <button> - mirrors shadcn's asChild pattern for e.g. wrapping a <Link>. */
  asChild?: boolean;
}

const VARIANT_CLASS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  destructive: "btn-destructive",
  outline: "btn-outline",
  ghost: "btn-ghost",
  link: "btn-link",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, children, ...props }, ref) => {
    const classes = cn(
      "btn",
      VARIANT_CLASS[variant],
      size === "sm" && "btn-sm",
      size === "icon" && "btn-icon",
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(classes, (children as React.ReactElement<any>).props?.className),
      });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
