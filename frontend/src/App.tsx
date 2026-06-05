import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import { useMe } from "@/features/auth/api/useMe";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { MarketPlacePage } from "./features/marketplace/pages/MarketPlace";
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useMe();
  // useMe sets Zustand inside its queryFn, so by the time isLoading flips to
  // false the store is already populated — no useEffect needed here.

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/marketplace" element={<MarketPlacePage />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  );
}

export default App;
