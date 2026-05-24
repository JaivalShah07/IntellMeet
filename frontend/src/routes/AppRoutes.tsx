import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import MeetingRoom from "../pages/MeetingRoom";
import MeetingsList from "../pages/MeetingsList";
import Analytics from "../pages/Analytics";
import AIInsights from "../pages/AIInsights";
import Kanban from "../pages/Kanban";
import TeamManagement from "../pages/TeamManagement";
import AcceptInvite from "../pages/AcceptInvite";

import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

function DashboardPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <DashboardPage>
            <Dashboard />
          </DashboardPage>
        }
      />
      <Route
        path="/analytics"
        element={
          <DashboardPage>
            <Analytics />
          </DashboardPage>
        }
      />
      <Route
        path="/insights"
        element={
          <DashboardPage>
            <AIInsights />
          </DashboardPage>
        }
      />
      <Route
        path="/kanban"
        element={
          <DashboardPage>
            <Kanban />
          </DashboardPage>
        }
      />
      <Route
        path="/meetings"
        element={
          <DashboardPage>
            <MeetingsList />
          </DashboardPage>
        }
      />
      <Route
        path="/team"
        element={
          <DashboardPage>
            <TeamManagement />
          </DashboardPage>
        }
      />
      <Route path="/invite/:token" element={<AcceptInvite />} />
      <Route
        path="/meeting"
        element={
          <ProtectedRoute>
            <MeetingRoom />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
