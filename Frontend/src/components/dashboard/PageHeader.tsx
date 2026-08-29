import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
