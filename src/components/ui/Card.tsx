import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "button";
}

export function Card({
  className = "",
  as: Component = "div",
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={`
        bg-white rounded-xl border border-slate-200 p-4
        ${Component === "button" ? "w-full text-left hover:bg-slate-50 transition-colors cursor-pointer" : ""}
        ${className}
      `}
      {...(props as HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Component>
  );
}
