import { clsx } from "clsx";

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="max-w-6xl mx-auto px-4">{children}</div>;
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 shadow-sm">{children}</div>;
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="p-4 border-b border-neutral-800">
      <div className="text-lg font-semibold">{title}</div>
      {subtitle ? <div className="text-sm text-neutral-400 mt-1">{subtitle}</div> : null}
    </div>
  );
}

export function Button({
  children,
  href,
  variant = "primary",
  type = "button",
  className,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "ghost" | "social";
  type?: "button" | "submit";
  className?: string;
}) {
  const cls = clsx(
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition",
    variant === "primary" && "bg-melbet-yellow text-black hover:opacity-90",
    variant === "ghost" && "border border-neutral-800 bg-neutral-950/50 text-white hover:bg-neutral-900",
    variant === "social" && "border",
    className
  );
  if (href) return <a className={cls} href={href}>{children}</a>;
  return <button className={cls} type={type}>{children}</button>;
}

export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-950/40 px-2 py-1 text-xs text-neutral-200">{children}</span>;
}
