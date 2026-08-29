import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useFoodLoop } from "@/context/FoodLoopContext";

/** Blocks Matching until the owner has at least one pending surplus item. */
export default function RequirePendingSurplus({ children }: { children: ReactNode }) {
  const { hasPendingSurplus, authReady } = useFoodLoop();

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading kitchen…
      </div>
    );
  }

  if (!hasPendingSurplus) {
    return <Navigate to="/surplus" replace />;
  }

  return children;
}
