import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { OnboardingOwner } from "./pages/OnboardingOwner";
import { Home } from "./pages/Home";
import { Members } from "./pages/Members";
import { MemberDetail } from "./pages/MemberDetail";
import { MemberWorkout } from "./pages/MemberWorkout";
import { Attendance } from "./pages/Attendance";
import { Plans } from "./pages/Plans";
import { Trainers } from "./pages/Trainers";
import { Classes } from "./pages/Classes";
import { Payments } from "./pages/Payments";
import { Reports } from "./pages/Reports";
import { Notifications } from "./pages/Notifications";
import { Support } from "./pages/Support";
import { Settings } from "./pages/Settings";

function Gate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, gym, loading, needsOnboarding } = useAuth();

  if (loading) return <p className="loading">Loading...</p>;
  if (!isAuthenticated) return <Login />;
  if (needsOnboarding || !gym) return <OnboardingOwner />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/members" element={<Members />} />
              <Route path="/members/:id" element={<MemberDetail />} />
              <Route path="/members/:id/workout" element={<MemberWorkout />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/trainers" element={<Trainers />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/support" element={<Support />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Gate>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
