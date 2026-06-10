import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
}

/**
 * Primary CTA — dark glossy gradient pill (per Figma).
 * 32px tall, 12px text, gradient #2C2C2C → #151515, layered shadows.
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, Props>(
  ({ children, icon, className = "", ...rest }, ref) => (
    <button
      ref={ref}
      {...rest}
      className={[
        "inline-flex items-center justify-center gap-2 h-8 px-3 rounded-[10px]",
        "text-[12px] font-medium leading-5 text-white",
        "border border-[#EBEBEB]",
        "transition-[transform,filter] duration-150 active:scale-[0.98] hover:brightness-110",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      style={{
        background: "linear-gradient(191.83deg, #2C2C2C 1.79%, #151515 122.22%)",
        boxShadow:
          "0px 0px 6px -1px rgba(0,0,0,0.07), 0px 2px 2px -1px rgba(0,0,0,0.08), inset 0px -2px 2px rgba(21,22,44,0.10), inset 0px 2px 2px rgba(255,255,255,0.29)",
        letterSpacing: "-0.150391px",
        textShadow: "0px 4px 4px rgba(0,0,0,0.10)",
      }}
    >
      {icon}
      {children}
    </button>
  ),
);
PrimaryButton.displayName = "PrimaryButton";
