import { Navigate, Outlet } from "react-router-dom";
import { useFoodLoop } from "@/context/FoodLoopContext";

/** Guard restaurant workspace routes — send guests to login. */
export default function RequireAuth() {
  const { isAuthenticated, authReady } = useFoodLoop();

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
