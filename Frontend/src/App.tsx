import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "@/components/auth/RequireAuth";
import RequirePendingSurplus from "@/components/auth/RequirePendingSurplus";
import AppLayout from "@/components/layout/AppLayout";
import { FoodLoopProvider } from "@/context/FoodLoopContext";
import Dashboard from "@/pages/Dashboard";
import Impact from "@/pages/Impact";
import Login from "@/pages/Login";
import Matching from "@/pages/Matching";
import Rescue from "@/pages/Rescue";
import Signup from "@/pages/Signup";
import Surplus from "@/pages/Surplus";

/**
 * App shell — Backend services + WebMCP are wired through FoodLoopProvider.
 * Matching is gated until the owner logs pending surplus.
 */
export default function App() {
  useEffect(() => {
    document.title = "FoodLoop — Surplus Rescue";
  }, []);

  return (
    <FoodLoopProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/surplus" element={<Surplus />} />
            <Route
              path="/matching"
              element={
                <RequirePendingSurplus>
                  <Matching />
                </RequirePendingSurplus>
              }
            />
            <Route path="/rescue" element={<Rescue />} />
            <Route path="/impact" element={<Impact />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </FoodLoopProvider>
  );
}
